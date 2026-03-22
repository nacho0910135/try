import { Offer } from "../models/Offer.js";
import { Property } from "../models/Property.js";
import { ApiError } from "../utils/apiError.js";
import { buildPagination } from "../utils/pagination.js";

export const offerService = {
  async create(payload, user) {
    const property = await Property.findById(payload.propertyId).populate("owner", "name email phone");

    if (!property || property.status !== "published") {
      throw new ApiError(404, "Propiedad no encontrada");
    }

    if (property.marketStatus !== "available") {
      throw new ApiError(400, "Esta propiedad no esta recibiendo ofertas en este momento");
    }

    if (user?._id && property.owner?._id?.toString() === user._id.toString()) {
      throw new ApiError(400, "No puedes enviar una oferta a tu propia propiedad");
    }

    const offer = await Offer.create({
      property: property._id,
      fromUser: user?._id,
      toUser: property.owner._id,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      amount: payload.amount,
      currency: payload.currency || property.currency,
      message: payload.message,
      source: payload.source || "property-page"
    });

    await Property.updateOne({ _id: property._id }, { $inc: { "engagement.offers": 1 } });

    return Offer.findById(offer._id)
      .populate("property", "title slug businessType propertyType price currency address")
      .populate("fromUser", "name email role");
  },

  async listReceived(user, query) {
    const pagination = buildPagination(query.page, query.limit);
    const filter = { toUser: user._id };

    if (query.status) {
      filter.status = query.status;
    }

    const [items, total] = await Promise.all([
      Offer.find(filter)
        .populate("property", "title slug businessType propertyType price currency photos address marketStatus")
        .populate("fromUser", "name email role")
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Offer.countDocuments(filter)
    ]);

    return {
      items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.max(Math.ceil(total / pagination.limit), 1)
      }
    };
  },

  async listSent(user, query) {
    const pagination = buildPagination(query.page, query.limit);
    const filter = { fromUser: user._id };

    if (query.status) {
      filter.status = query.status;
    }

    const [items, total] = await Promise.all([
      Offer.find(filter)
        .populate("property", "title slug businessType propertyType price currency photos address marketStatus")
        .populate("toUser", "name email phone role")
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Offer.countDocuments(filter)
    ]);

    return {
      items,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.max(Math.ceil(total / pagination.limit), 1)
      }
    };
  },

  async updateStatus(offerId, user, status) {
    const offer = await Offer.findById(offerId);

    if (!offer) {
      throw new ApiError(404, "Oferta no encontrada");
    }

    if (offer.toUser.toString() !== user._id.toString() && user.role !== "admin") {
      throw new ApiError(403, "No tienes acceso a esta oferta");
    }

    offer.status = status;
    await offer.save();

    return offer;
  }
};
