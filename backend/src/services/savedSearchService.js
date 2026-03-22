import { SavedSearch } from "../models/SavedSearch.js";
import { Property } from "../models/Property.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/apiError.js";
import { buildBoundsPolygon, normalizePolygonCoordinates } from "../utils/geo.js";
import { notificationService } from "./notificationService.js";

const businessTypeLabels = {
  sale: "Venta",
  rent: "Renta"
};

const propertyTypeLabels = {
  house: "Casa",
  apartment: "Apartamento",
  condominium: "Condominio",
  lot: "Lote",
  room: "Habitacion",
  commercial: "Comercial"
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildSavedSearchName = (payload = {}) => {
  const filters = payload.filters || {};
  const location = filters.district || filters.canton || filters.province || "";
  const parts = [
    businessTypeLabels[filters.businessType],
    propertyTypeLabels[filters.propertyType],
    location,
    filters.q ? `"${filters.q}"` : ""
  ].filter(Boolean);

  if (parts.length) {
    return parts.join(" - ");
  }

  return `Busqueda guardada ${new Date().toLocaleDateString("es-CR")}`;
};

const buildSavedSearchUrl = (savedSearch) => {
  const baseUrl = env.FRONTEND_URL.split(",")[0] || "http://localhost:3000";
  const params = new URLSearchParams();
  const filters = savedSearch.filters || {};

  Object.entries(filters).forEach(([key, value]) => {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      typeof value === "object"
    ) {
      return;
    }

    params.set(key, String(value));
  });

  return `${baseUrl}/search${params.toString() ? `?${params.toString()}` : ""}`;
};

export const buildSavedSearchFilter = (savedSearch) => {
  const filters = savedSearch.filters || {};
  const filter = {
    status: "published",
    isApproved: true,
    marketStatus: { $in: ["available", "reserved"] }
  };

  if (filters.q) {
    const regex = new RegExp(escapeRegex(filters.q), "i");
    filter.$or = [
      { title: regex },
      { description: regex },
      { "address.province": regex },
      { "address.canton": regex },
      { "address.district": regex },
      { "address.neighborhood": regex }
    ];
  }

  if (filters.businessType) filter.operationType = filters.businessType;
  if (filters.rentalArrangement) filter.rentalArrangement = filters.rentalArrangement;
  if (filters.propertyType) filter.propertyType = filters.propertyType;
  if (filters.currency) filter.currency = filters.currency;
  if (filters.marketStatus) filter.marketStatus = filters.marketStatus;
  if (filters.province) {
    filter["address.province"] = new RegExp(`^${escapeRegex(filters.province)}$`, "i");
  }
  if (filters.canton) {
    filter["address.canton"] = new RegExp(`^${escapeRegex(filters.canton)}$`, "i");
  }
  if (filters.district) {
    filter["address.district"] = new RegExp(`^${escapeRegex(filters.district)}$`, "i");
  }
  if (filters.featured !== undefined) filter.featured = filters.featured;
  if (filters.furnished !== undefined) filter.furnished = filters.furnished;
  if (filters.petsAllowed !== undefined) filter.petsAllowed = filters.petsAllowed;
  if (filters.depositRequired !== undefined) filter.depositRequired = filters.depositRequired;
  if (filters.privateRoom !== undefined) filter["roommateDetails.privateRoom"] = filters.privateRoom;
  if (filters.privateBathroom !== undefined) {
    filter["roommateDetails.privateBathroom"] = filters.privateBathroom;
  }
  if (filters.utilitiesIncluded !== undefined) {
    filter["roommateDetails.utilitiesIncluded"] = filters.utilitiesIncluded;
  }
  if (filters.studentFriendly !== undefined) {
    filter["roommateDetails.studentFriendly"] = filters.studentFriendly;
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    filter.price = {};
    if (filters.minPrice !== undefined) filter.price.$gte = Number(filters.minPrice);
    if (filters.maxPrice !== undefined) filter.price.$lte = Number(filters.maxPrice);
  }

  if (filters.bedrooms !== undefined) filter.bedrooms = { $gte: Number(filters.bedrooms) };
  if (filters.bathrooms !== undefined) filter.bathrooms = { $gte: Number(filters.bathrooms) };
  if (filters.parkingSpaces !== undefined) {
    filter.parkingSpaces = { $gte: Number(filters.parkingSpaces) };
  }

  if (savedSearch.mapArea?.coordinates?.length) {
    const polygon = normalizePolygonCoordinates(savedSearch.mapArea.coordinates[0]);
    if (polygon) {
      filter.location = {
        $geoWithin: {
          $geometry: {
            type: "Polygon",
            coordinates: [polygon]
          }
        }
      };
    }
  } else if (savedSearch.bounds) {
    filter.location = {
      $geoWithin: {
        $geometry: buildBoundsPolygon(savedSearch.bounds)
      }
    };
  } else if (filters.lat !== undefined && filters.lng !== undefined) {
    filter.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [Number(filters.lng), Number(filters.lat)]
        },
        $maxDistance: Number(filters.radiusKm || 20) * 1000
      }
    };
  }

  return filter;
};

export const buildAlertPreview = async (savedSearch) => {
  const filter = buildSavedSearchFilter(savedSearch);
  const lastViewedAt = savedSearch.lastViewedAt || savedSearch.createdAt;
  const lastAlertSentAt = savedSearch.lastAlertSentAt || savedSearch.createdAt;

  const [totalMatches, newMatches, emailMatches, recentMatches] = await Promise.all([
    Property.countDocuments(filter),
    Property.countDocuments({
      ...filter,
      createdAt: { $gt: lastViewedAt }
    }),
    Property.countDocuments({
      ...filter,
      createdAt: { $gt: lastAlertSentAt }
    }),
    Property.find(filter)
      .select("title slug price currency photos address marketStatus createdAt")
      .sort({ createdAt: -1, publishedAt: -1 })
      .limit(3)
      .lean()
  ]);

  return {
    totalMatches,
    newMatches,
    emailMatches,
    recentMatches
  };
};

export const savedSearchService = {
  async list(user) {
    const items = await SavedSearch.find({ user: user._id }).sort({ createdAt: -1 }).lean();

    const enriched = await Promise.all(
      items.map(async (item) => ({
        ...item,
        alertPreview: await buildAlertPreview(item)
      }))
    );

    return enriched;
  },

  async create(user, payload) {
    return SavedSearch.create({
      user: user._id,
      ...payload,
      name: payload.name?.trim() || buildSavedSearchName(payload)
    });
  },

  async update(user, searchId, payload) {
    const savedSearch = await SavedSearch.findOne({ _id: searchId, user: user._id });

    if (!savedSearch) {
      throw new ApiError(404, "Saved search not found");
    }

    Object.assign(savedSearch, payload);
    await savedSearch.save();

    const plain = savedSearch.toObject();
    return {
      ...plain,
      alertPreview: await buildAlertPreview(plain)
    };
  },

  async remove(user, searchId) {
    const deleted = await SavedSearch.findOneAndDelete({ _id: searchId, user: user._id });

    if (!deleted) {
      throw new ApiError(404, "Saved search not found");
    }

    return { success: true };
  },

  async sendAlertEmail(user, searchId) {
    const savedSearch = await SavedSearch.findOne({ _id: searchId, user: user._id });

    if (!savedSearch) {
      throw new ApiError(404, "Saved search not found");
    }

    const alertPreview = await buildAlertPreview(savedSearch);

    if (!alertPreview.totalMatches) {
      throw new ApiError(400, "Esta busqueda no tiene propiedades activas para enviar por correo.");
    }

    const emailResult = await notificationService.sendSavedSearchAlert({
      user,
      savedSearch,
      alertPreview,
      searchUrl: buildSavedSearchUrl(savedSearch)
    });

    if (emailResult.delivered) {
      savedSearch.lastAlertSentAt = new Date();
      await savedSearch.save();
    }

    return {
      savedSearchId: savedSearch._id,
      name: savedSearch.name,
      alertPreview,
      email: emailResult
    };
  },

  async dispatchDueAlerts(limit = 50) {
    const savedSearches = await SavedSearch.find({ alertsEnabled: true })
      .populate("user", "name email isActive")
      .sort({ updatedAt: -1 })
      .limit(limit);

    const results = [];

    for (const savedSearch of savedSearches) {
      if (!savedSearch.user?.isActive || !savedSearch.user?.email) {
        results.push({
          savedSearchId: savedSearch._id.toString(),
          name: savedSearch.name,
          status: "skipped",
          reason: "missing-user-email"
        });
        continue;
      }

      const alertPreview = await buildAlertPreview(savedSearch);

      if (!alertPreview.emailMatches) {
        results.push({
          savedSearchId: savedSearch._id.toString(),
          name: savedSearch.name,
          status: "skipped",
          reason: "no-new-matches"
        });
        continue;
      }

      const emailResult = await notificationService.sendSavedSearchAlert({
        user: savedSearch.user,
        savedSearch,
        alertPreview,
        searchUrl: buildSavedSearchUrl(savedSearch)
      });

      if (emailResult.delivered) {
        savedSearch.lastAlertSentAt = new Date();
        await savedSearch.save();
      }

      results.push({
        savedSearchId: savedSearch._id.toString(),
        name: savedSearch.name,
        status: emailResult.delivered ? "sent" : "unconfigured",
        matches: alertPreview.emailMatches
      });
    }

    return {
      processed: results.length,
      sent: results.filter((item) => item.status === "sent").length,
      unconfigured: results.filter((item) => item.status === "unconfigured").length,
      skipped: results.filter((item) => item.status === "skipped").length,
      results
    };
  }
};
