import { Property } from "../models/Property.js";
import { Payment } from "../models/Payment.js";
import { primaryFrontendUrl, env } from "../config/env.js";
import { resolveEffectiveSubscription } from "../constants/plans.js";
import { ApiError } from "../utils/apiError.js";
import { paypalService } from "./paypalService.js";

const getFrontendBaseUrl = () => primaryFrontendUrl;

const toMoney = (value) => Number(Number(value || 0).toFixed(2));

const parseSuggestedDonations = () =>
  String(env.PAYPAL_DONATION_SUGGESTIONS || "5,10,25")
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0)
    .map((item) => toMoney(item));

const getBoostConfig = () => ({
  enabled: paypalService.isConfigured(),
  price: toMoney(env.PAYPAL_BOOST_PRICE || 7),
  currency: env.PAYPAL_DEFAULT_CURRENCY || "USD"
});

const getDonationConfig = () => ({
  enabled: paypalService.isConfigured(),
  minAmount: toMoney(env.PAYPAL_DONATION_MIN || 5),
  suggestedAmounts: parseSuggestedDonations(),
  currency: env.PAYPAL_DEFAULT_CURRENCY || "USD"
});

const getApprovalUrl = (order) =>
  order?.links?.find?.((link) => ["approve", "payer-action"].includes(link.rel))?.href || "";

const buildAbsoluteFrontendUrl = (path) => new URL(path, `${getFrontendBaseUrl()}/`).toString();

const buildSuccessPath = (payment) => {
  if (payment.kind === "boost") {
    return `/dashboard/properties?paypal=boost-success&propertyId=${payment.property}`;
  }

  return "/donate?paypal=donation-success";
};

const buildErrorPath = (payment) => {
  if (payment.kind === "boost") {
    return "/dashboard/properties?paypal=boost-error";
  }

  return "/donate?paypal=donation-error";
};

const buildCancelPath = (kind) => {
  if (kind === "boost") {
    return "/dashboard/properties?paypal=boost-cancelled";
  }

  return "/donate?paypal=donation-cancelled";
};

const ensurePayPalConfigured = () => {
  if (!paypalService.isConfigured()) {
    throw new ApiError(503, "PayPal no esta configurado todavia.");
  }
};

const ensureBoostableProperty = (property) => {
  if (!property) {
    throw new ApiError(404, "No encontramos la propiedad para activar el boost.");
  }

  if (property.featured) {
    throw new ApiError(400, "Esta propiedad ya tiene boost activo.");
  }

  if (
    property.status !== "published" ||
    !["available", "reserved"].includes(property.marketStatus || "available")
  ) {
    throw new ApiError(
      400,
      "Solo puedes impulsar publicaciones publicadas y disponibles o reservadas."
    );
  }
};

const formatPaymentResponse = (payment) => ({
  _id: payment._id,
  provider: payment.provider,
  kind: payment.kind,
  status: payment.status,
  amount: payment.amount,
  currency: payment.currency,
  orderId: payment.orderId,
  captureId: payment.captureId,
  property: payment.property
});

export const billingService = {
  getPublicStatus(user) {
    const subscription = resolveEffectiveSubscription(user);
    return {
      configured: paypalService.isConfigured(),
      provider: "paypal",
      environment: paypalService.getEnvironment(),
      webhookConfigured: false,
      hasStripeCustomer: false,
      hasActivePaidPlan: false,
      boost: getBoostConfig(),
      donations: getDonationConfig(),
      subscription
    };
  },

  async createCheckoutSession(_user, _payload) {
    throw new ApiError(
      503,
      "La venta de planes sigue desactivada. El checkout activo ahora mismo es PayPal para boosts y donaciones."
    );
  },

  async createPortalSession() {
    throw new ApiError(
      503,
      "El portal de planes sigue desactivado. Usa PayPal para boosts individuales."
    );
  },

  async handleWebhook() {
    return { received: true, ignored: true };
  },

  async createBoostOrder(user, payload) {
    ensurePayPalConfigured();

    const property = await Property.findById(payload.propertyId);

    if (!property) {
      throw new ApiError(404, "Property not found");
    }

    const ownerId = property.owner?.toString?.() || "";

    if (user.role !== "admin" && ownerId !== user._id.toString()) {
      throw new ApiError(403, "You do not have access to this property");
    }

    ensureBoostableProperty(property);

    const boost = getBoostConfig();
    const payment = await Payment.create({
      kind: "boost",
      status: "created",
      user: user._id,
      property: property._id,
      amount: boost.price,
      currency: boost.currency,
      note: `Boost para ${property.title}`
    });

    const order = await paypalService.createOrder({
      requestId: `boost-${payment._id}`,
      returnUrl: buildAbsoluteFrontendUrl("/checkout/paypal/return?kind=boost"),
      cancelUrl: buildAbsoluteFrontendUrl("/checkout/paypal/return?kind=boost&cancelled=1"),
      purchaseUnits: [
        {
          reference_id: `property-${property._id}`,
          custom_id: String(payment._id),
          invoice_id: `boost-${property._id}-${Date.now()}`,
          description: `Boost de visibilidad para ${property.title}`,
          amount: {
            currency_code: boost.currency,
            value: boost.price.toFixed(2)
          }
        }
      ]
    });

    const approvalUrl = getApprovalUrl(order);

    if (!approvalUrl) {
      throw new ApiError(502, "PayPal no devolvio una URL de aprobacion valida.");
    }

    payment.orderId = order.id;
    payment.approvalUrl = approvalUrl;
    payment.rawOrder = order;
    await payment.save();

    return {
      orderId: order.id,
      approvalUrl,
      amount: boost.price,
      currency: boost.currency,
      kind: "boost"
    };
  },

  async createDonationOrder(payload, user = null) {
    ensurePayPalConfigured();

    const donation = getDonationConfig();
    const amount = toMoney(payload.amount);

    if (amount < donation.minAmount) {
      throw new ApiError(
        400,
        `La donacion minima es ${donation.currency} ${donation.minAmount.toFixed(2)}.`
      );
    }

    const payment = await Payment.create({
      kind: "donation",
      status: "created",
      user: user?._id,
      amount,
      currency: donation.currency,
      donorName: payload.donorName || user?.name || "",
      note: payload.note || "Donacion voluntaria a BienesRaicesCR"
    });

    const order = await paypalService.createOrder({
      requestId: `donation-${payment._id}`,
      returnUrl: buildAbsoluteFrontendUrl("/checkout/paypal/return?kind=donation"),
      cancelUrl: buildAbsoluteFrontendUrl("/checkout/paypal/return?kind=donation&cancelled=1"),
      purchaseUnits: [
        {
          reference_id: `donation-${payment._id}`,
          custom_id: String(payment._id),
          invoice_id: `donation-${Date.now()}-${payment._id}`,
          description: "Donacion para BienesRaicesCR",
          amount: {
            currency_code: donation.currency,
            value: amount.toFixed(2)
          }
        }
      ]
    });

    const approvalUrl = getApprovalUrl(order);

    if (!approvalUrl) {
      throw new ApiError(502, "PayPal no devolvio una URL de aprobacion valida.");
    }

    payment.orderId = order.id;
    payment.approvalUrl = approvalUrl;
    payment.rawOrder = order;
    await payment.save();

    return {
      orderId: order.id,
      approvalUrl,
      amount,
      currency: donation.currency,
      kind: "donation"
    };
  },

  async capturePaypalOrder(orderId) {
    ensurePayPalConfigured();

    const payment = await Payment.findOne({ orderId });

    if (!payment) {
      throw new ApiError(404, "No encontramos el checkout de PayPal que intentas confirmar.");
    }

    if (payment.status === "completed") {
      return {
        payment: formatPaymentResponse(payment),
        redirectPath: buildSuccessPath(payment)
      };
    }

    const capture = await paypalService.captureOrder(orderId, `capture-${payment._id}`);
    const captureId =
      capture?.purchase_units?.[0]?.payments?.captures?.[0]?.id ||
      capture?.purchase_units?.[0]?.payments?.authorizations?.[0]?.id ||
      "";

    payment.status = capture.status === "COMPLETED" ? "completed" : "failed";
    payment.captureId = captureId;
    payment.payerEmail = capture?.payer?.email_address || "";
    payment.payerId = capture?.payer?.payer_id || "";
    payment.rawCapture = capture;
    await payment.save();

    if (payment.status !== "completed") {
      throw new ApiError(400, "PayPal no confirmo el pago correctamente.", {
        redirectPath: buildErrorPath(payment)
      });
    }

    if (payment.kind === "boost" && payment.property) {
      const property = await Property.findById(payment.property);

      if (property) {
        property.featured = true;
        await property.save();
      }
    }

    return {
      payment: formatPaymentResponse(payment),
      redirectPath: buildSuccessPath(payment)
    };
  },

  getCancelPath(kind = "donation") {
    return buildCancelPath(kind);
  }
};
