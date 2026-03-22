import { Favorite } from "../models/Favorite.js";
import { Lead } from "../models/Lead.js";
import { Offer } from "../models/Offer.js";
import { Property } from "../models/Property.js";
import { SavedSearch } from "../models/SavedSearch.js";
import { User } from "../models/User.js";
import { getCommercialPlanCatalog, resolveEffectiveSubscription } from "../constants/plans.js";
import { enrichPropertyCollection } from "../utils/propertyInsights.js";
import { ApiError } from "../utils/apiError.js";

const leadStatusLabels = {
  new: "Nuevo",
  contacted: "Contactado",
  qualified: "Calificado",
  closed: "Cerrado"
};

const offerStatusLabels = {
  new: "Nueva",
  reviewing: "En revision",
  negotiating: "Negociando",
  accepted: "Aceptada",
  rejected: "Rechazada",
  closed: "Cerrada"
};

const verificationTypeLabels = {
  identity: "Cuenta verificada",
  owner: "Propietario verificado",
  "agent-license": "Agente verificado",
  broker: "Broker verificado"
};

const sumBy = (items, selector) =>
  items.reduce((total, item) => total + Number(selector(item) || 0), 0);

const percent = (numerator, denominator) =>
  denominator ? Number(((numerator / denominator) * 100).toFixed(1)) : 0;

const getMonthKey = (date) => {
  const value = new Date(date);
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;
};

const getLastMonths = (count = 6) => {
  const months = [];
  const base = new Date();
  base.setUTCDate(1);
  base.setUTCHours(0, 0, 0, 0);

  for (let index = count - 1; index >= 0; index -= 1) {
    const monthDate = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() - index, 1));
    months.push({
      key: getMonthKey(monthDate),
      label: monthDate.toLocaleDateString("es-CR", { month: "short" })
    });
  }

  return months;
};

const buildStatusSeries = (counts, labels) =>
  Object.entries(labels).map(([status, label]) => ({
    status,
    label,
    value: counts[status] || 0
  }));

const buildProvincePerformance = (properties) => {
  const groups = new Map();

  properties.forEach((property) => {
    const province = property.address?.province || "Costa Rica";
    const current = groups.get(province) || {
      label: province,
      listings: 0,
      views: 0,
      leads: 0,
      offers: 0,
      averagePrice: 0,
      _priceTotal: 0
    };

    current.listings += 1;
    current.views += Number(property.views || property.engagement?.views || 0);
    current.leads += Number(property.engagement?.leads || 0);
    current.offers += Number(property.engagement?.offers || 0);
    current._priceTotal += Number(property.price || 0);
    current.averagePrice = current._priceTotal / current.listings;

    groups.set(province, current);
  });

  return [...groups.values()]
    .map(({ _priceTotal, ...item }) => item)
    .sort((first, second) => second.leads + second.offers - (first.leads + first.offers))
    .slice(0, 6);
};

const buildTrustCoverage = (properties) => {
  const total = Math.max(properties.length, 1);
  const count = (predicate) => properties.filter(predicate).length;

  return [
    {
      label: "Verificadas",
      value: Number(((count((item) => item.isApproved) / total) * 100).toFixed(1)),
      subtitle: `${count((item) => item.isApproved)} de ${properties.length} con aprobacion`
    },
    {
      label: "Galeria completa",
      value: Number(
        (
          (count((item) => Number(item.trustProfile?.photosCount || 0) >= 5) / total) *
          100
        ).toFixed(1)
      ),
      subtitle: `${count((item) => Number(item.trustProfile?.photosCount || 0) >= 5)} publicaciones con 5+ fotos`
    },
    {
      label: "Contacto directo",
      value: Number(
        (
          (count(
            (item) =>
              item.sellerInfo?.phone || item.sellerInfo?.email || item.owner?.phone || item.owner?.email
          ) / total) *
          100
        ).toFixed(1)
      ),
      subtitle: `${count(
        (item) => item.sellerInfo?.phone || item.sellerInfo?.email || item.owner?.phone || item.owner?.email
      )} publicaciones con contacto listo`
    },
    {
      label: "Con distancias",
      value: Number(
        (
          (count(
            (item) =>
              item.serviceDistances?.hospitalKm !== undefined ||
              item.serviceDistances?.schoolKm !== undefined ||
              item.serviceDistances?.highSchoolKm !== undefined
          ) / total) *
          100
        ).toFixed(1)
      ),
      subtitle: `${count(
        (item) =>
          item.serviceDistances?.hospitalKm !== undefined ||
          item.serviceDistances?.schoolKm !== undefined ||
          item.serviceDistances?.highSchoolKm !== undefined
      )} publicaciones con contexto de servicios`
    }
  ];
};

const buildOptimizationBoard = (properties) =>
  properties
    .map((property) => ({
      id: property._id?.toString(),
      label: property.title,
      slug: property.slug,
      value: Number(property.listingInsights?.completenessScore || 0),
      attentionLevel: property.listingInsights?.attentionLevel || "watch",
      subtitle:
        property.listingInsights?.actionItems?.[0] ||
        property.listingInsights?.strengths?.[0] ||
        "Sin acciones pendientes por ahora."
    }))
    .sort((first, second) => {
      const attentionWeight = {
        urgent: 0,
        watch: 1,
        healthy: 2
      };

      const attentionDelta =
        (attentionWeight[first.attentionLevel] ?? 1) - (attentionWeight[second.attentionLevel] ?? 1);

      if (attentionDelta !== 0) {
        return attentionDelta;
      }

      return first.value - second.value;
    })
    .slice(0, 6);

export const userService = {
  async getDashboardSummary(user) {
    const subscription = resolveEffectiveSubscription(user);
    const [properties, leadsReceived, leadsSent, favorites, savedSearches, offersReceived, offersSent, ownedProperties] = await Promise.all([
      Property.countDocuments({ owner: user._id }),
      Lead.countDocuments({ toUser: user._id }),
      Lead.countDocuments({ fromUser: user._id }),
      Favorite.countDocuments({ user: user._id }),
      SavedSearch.countDocuments({ user: user._id }),
      Offer.countDocuments({ toUser: user._id }),
      Offer.countDocuments({ fromUser: user._id }),
      Property.find({ owner: user._id }).select("status marketStatus featured views engagement").lean()
    ]);

    const activeProperties = ownedProperties.filter(
      (item) =>
        item.status === "published" &&
        ["available", "reserved"].includes(item.marketStatus || "available")
    ).length;
    const featuredProperties = ownedProperties.filter((item) => item.featured).length;
    const totalViews = sumBy(ownedProperties, (item) => item.views || item.engagement?.views);
    const totalLeadsOnListings = sumBy(ownedProperties, (item) => item.engagement?.leads);
    const totalOffersOnListings = sumBy(ownedProperties, (item) => item.engagement?.offers);

    return {
      properties,
      activeProperties,
      leadsReceived,
      leadsSent,
      offersReceived,
      offersSent,
      favorites,
      savedSearches,
      featuredProperties,
      totalViews,
      totalLeadsOnListings,
      totalOffersOnListings,
      conversionRate: percent(totalLeadsOnListings + totalOffersOnListings, totalViews),
      plan: subscription,
      verification: {
        ...(user.verification || {}),
        requestedBadge:
          user.verification?.requestedBadge ||
          verificationTypeLabels[user.verification?.requestedType] ||
          "Cuenta verificada"
      }
    };
  },

  async getCommercialOverview(user) {
    const subscription = resolveEffectiveSubscription(user);
    const months = getLastMonths(6);
    const fromDate = new Date();
    fromDate.setUTCDate(1);
    fromDate.setUTCMonth(fromDate.getUTCMonth() - 5);
    fromDate.setUTCHours(0, 0, 0, 0);

    const [ownedPropertiesRaw, leadsReceived, offersReceived, leadCounts, offerCounts, monthlyLeadCounts, monthlyOfferCounts, monthlyClosedCounts] =
      await Promise.all([
        Property.find({ owner: user._id })
          .select(
            "title slug address price currency propertyType businessType status marketStatus featured publishedAt soldAt rentedAt inactivatedAt views engagement photos media sellerInfo serviceDistances description isApproved analyticsSnapshot finalPrice createdAt constructionArea lotArea landArea address"
          )
          .lean(),
        Lead.find({ toUser: user._id }).sort({ createdAt: -1 }).limit(8).populate("property", "title slug").lean(),
        Offer.find({ toUser: user._id }).sort({ createdAt: -1 }).limit(8).populate("property", "title slug").lean(),
        Lead.aggregate([
          { $match: { toUser: user._id } },
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ]),
        Offer.aggregate([
          { $match: { toUser: user._id } },
          { $group: { _id: "$status", count: { $sum: 1 } } }
        ]),
        Lead.aggregate([
          { $match: { toUser: user._id, createdAt: { $gte: fromDate } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m", date: "$createdAt" }
              },
              count: { $sum: 1 }
            }
          }
        ]),
        Offer.aggregate([
          { $match: { toUser: user._id, createdAt: { $gte: fromDate } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m", date: "$createdAt" }
              },
              count: { $sum: 1 }
            }
          }
        ]),
        Property.aggregate([
          {
            $match: {
              owner: user._id,
              $or: [{ soldAt: { $gte: fromDate } }, { rentedAt: { $gte: fromDate } }]
            }
          },
          {
            $project: {
              closedAt: { $ifNull: ["$soldAt", "$rentedAt"] }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m", date: "$closedAt" }
              },
              count: { $sum: 1 }
            }
          }
        ])
      ]);

    const ownedProperties = enrichPropertyCollection(ownedPropertiesRaw);

    const leadCountMap = Object.fromEntries(leadCounts.map((item) => [item._id, item.count]));
    const offerCountMap = Object.fromEntries(offerCounts.map((item) => [item._id, item.count]));
    const monthlyLeadMap = Object.fromEntries(monthlyLeadCounts.map((item) => [item._id, item.count]));
    const monthlyOfferMap = Object.fromEntries(monthlyOfferCounts.map((item) => [item._id, item.count]));
    const monthlyClosedMap = Object.fromEntries(monthlyClosedCounts.map((item) => [item._id, item.count]));

    const listingPerformance = ownedProperties
      .map((property) => {
        const views = Number(property.views || property.engagement?.views || 0);
        const favorites = Number(property.engagement?.favorites || 0);
        const leads = Number(property.engagement?.leads || 0);
        const offers = Number(property.engagement?.offers || 0);
        const estimatedReach = property.featured
          ? Math.max(views * 7 + favorites * 14 + leads * 22 + offers * 28, views)
          : Math.max(views * 3 + favorites * 8, views);

        return {
          id: property._id?.toString(),
          title: property.title,
          slug: property.slug,
          label: property.title,
          province: property.address?.province || "Costa Rica",
          featured: Boolean(property.featured),
          price: property.price,
          currency: property.currency,
          marketStatus: property.marketStatus,
          views,
          favorites,
          leads,
          offers,
          estimatedReach,
          leadRate: percent(leads, views),
          offerRate: percent(offers, views),
          score: views + favorites * 8 + leads * 22 + offers * 28
        };
      })
      .sort((first, second) => second.score - first.score);

    const promotedListings = listingPerformance.filter((item) => item.featured);
    const adViews = sumBy(promotedListings, (item) => item.views);
    const adFavorites = sumBy(promotedListings, (item) => item.favorites);
    const adLeads = sumBy(promotedListings, (item) => item.leads);
    const adOffers = sumBy(promotedListings, (item) => item.offers);
    const estimatedReach = sumBy(promotedListings, (item) => item.estimatedReach);
    const totalViews = sumBy(listingPerformance, (item) => item.views);
    const totalLeads = sumBy(listingPerformance, (item) => item.leads);
    const totalOffers = sumBy(listingPerformance, (item) => item.offers);
    const activeListings = ownedProperties.filter(
      (item) =>
        item.status === "published" && ["available", "reserved"].includes(item.marketStatus || "available")
    ).length;

    const timeline = months.map((month) => ({
      label: month.label,
      leads: monthlyLeadMap[month.key] || 0,
      offers: monthlyOfferMap[month.key] || 0,
      closedDeals: monthlyClosedMap[month.key] || 0,
      value:
        (monthlyLeadMap[month.key] || 0) * 1.2 +
        (monthlyOfferMap[month.key] || 0) * 1.8 +
        (monthlyClosedMap[month.key] || 0) * 2.2
    }));

    const topPerformers = listingPerformance.slice(0, 6).map((item) => ({
      label: item.title,
      value: item.views,
      subtitle: `${item.leads} leads - ${item.offers} ofertas`
    }));
    const provincePerformance = buildProvincePerformance(ownedProperties).map((item) => ({
      label: item.label,
      value: item.leads + item.offers,
      subtitle: `${item.listings} propiedades - ${item.views} vistas`
    }));

    const actionableInsights = [];

    if (!promotedListings.length) {
      actionableInsights.push(
        "Aun no tienes propiedades destacadas. Activa al menos una para medir alcance y leads impulsados."
      );
    } else if (adLeads === 0) {
      actionableInsights.push(
        "Tus propiedades destacadas ya generan visibilidad, pero aun no convierten a leads. Revisa fotos principales y precio."
      );
    } else {
      actionableInsights.push(
        `Tus publicaciones destacadas concentran ${adLeads} leads y ${adOffers} ofertas. Ese es tu canal premium mas rentable ahora mismo.`
      );
    }

    if (listingPerformance[0]) {
      actionableInsights.push(
        `${listingPerformance[0].title} es tu propiedad con mejor traccion: ${listingPerformance[0].views} vistas, ${listingPerformance[0].leads} leads y ${listingPerformance[0].offers} ofertas.`
      );
    }

    if (provincePerformance[0]) {
      actionableInsights.push(
        `${provincePerformance[0].label} es tu zona mas activa por interaccion comercial dentro de la plataforma.`
      );
    }

    const optimizationBoard = buildOptimizationBoard(ownedProperties);
    const trustCoverage = buildTrustCoverage(ownedProperties);

    if (optimizationBoard[0]?.attentionLevel === "urgent") {
      actionableInsights.push(
        `Prioriza ${optimizationBoard[0].label}: ${optimizationBoard[0].subtitle}`
      );
    }

    return {
      plan: subscription,
      availablePlans: getCommercialPlanCatalog(),
      summary: {
        activeListings,
        totalListings: ownedProperties.length,
        totalViews,
        totalLeads,
        totalOffers,
        leadConversionRate: percent(totalLeads, totalViews),
        offerConversionRate: percent(totalOffers, totalViews)
      },
      leadFunnel: buildStatusSeries(leadCountMap, leadStatusLabels),
      offerFunnel: buildStatusSeries(offerCountMap, offerStatusLabels),
      adPerformance: {
        promotedListings: promotedListings.length,
        promotedSlots: subscription.promotedSlots,
        estimatedReach,
        views: adViews,
        favorites: adFavorites,
        leads: adLeads,
        offers: adOffers,
        ctr: percent(adViews, estimatedReach),
        leadRate: percent(adLeads, adViews),
        offerRate: percent(adOffers, adViews)
      },
      timeline,
      topPerformers,
      provincePerformance,
      listingPerformance: listingPerformance.slice(0, 12),
      trustCoverage,
      optimizationBoard,
      recentLeads: leadsReceived,
      recentOffers: offersReceived,
      actionableInsights
    };
  },

  async requestVerification(user, payload) {
    const currentUser = await User.findById(user._id);

    if (!currentUser) {
      throw new ApiError(404, "User not found");
    }

    currentUser.verification = {
      ...(currentUser.verification || {}),
      status: "pending",
      requestedType: payload.requestedType,
      requestedBadge: verificationTypeLabels[payload.requestedType] || "Cuenta verificada",
      requestNote: payload.requestNote || "",
      requestedAt: new Date(),
      reviewedAt: undefined,
      reviewedBy: undefined,
      reviewNote: "",
      verifiedAt: currentUser.verification?.verifiedAt
    };

    await currentUser.save();

    return currentUser;
  }
};
