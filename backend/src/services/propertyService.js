import { Property } from "../models/Property.js";
import { ApiError } from "../utils/apiError.js";
import { buildBoundsPolygon, normalizePolygonCoordinates } from "../utils/geo.js";
import { analyzeListingModeration } from "../utils/listingModeration.js";
import { buildPagination } from "../utils/pagination.js";
import { enrichPropertyCollection, enrichPropertyForClient } from "../utils/propertyInsights.js";
import { createSlug } from "../utils/slug.js";

const ownerIdFromProperty = (property) =>
  property?.owner?._id?.toString?.() || property?.owner?.toString?.();

const isOwnerOrAdmin = (property, user) =>
  user && (user.role === "admin" || ownerIdFromProperty(property) === user._id.toString());

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const makePrimaryPhotoSet = (photos = []) => {
  if (!photos.length) {
    return [];
  }

  const hasPrimary = photos.some((photo) => photo.isPrimary);

  return photos.map((photo, index) => ({
    ...photo,
    isPrimary: hasPrimary ? Boolean(photo.isPrimary) : index === 0
  }));
};

const buildPublicFilter = () => ({
  status: "published",
  isApproved: true,
  marketStatus: { $in: ["available", "reserved"] }
});

const getPublicMarketStatuses = () => ["available", "reserved"];

const isPubliclyVisibleProperty = (property) =>
  Boolean(property?.isApproved) &&
  property?.status === "published" &&
  (property?.marketStatus || "available") !== "inactive";

const buildSort = (sort, query = {}) => {
  if (!sort && query.lat !== undefined && query.lng !== undefined) {
    return {};
  }

  switch (sort) {
    case "price-asc":
      return { price: 1, featured: -1 };
    case "price-desc":
      return { price: -1, featured: -1 };
    case "recent":
      return { featured: -1, publishedAt: -1, createdAt: -1 };
    case "distance":
      return query.lat !== undefined && query.lng !== undefined
        ? {}
        : { featured: -1, publishedAt: -1, createdAt: -1 };
    default:
      return { featured: -1, publishedAt: -1, createdAt: -1 };
  }
};

const buildZoneFilter = ({ province, canton, district }) => {
  const filter = buildPublicFilter();

  if (province) {
    filter["address.province"] = new RegExp(`^${escapeRegex(province)}$`, "i");
  }

  if (canton) {
    filter["address.canton"] = new RegExp(`^${escapeRegex(canton)}$`, "i");
  }

  if (district) {
    filter["address.district"] = new RegExp(`^${escapeRegex(district)}$`, "i");
  }

  return filter;
};

const buildZoneLabel = ({ province, canton, district }) => {
  if (district && canton && province) {
    return `${district}, ${canton}, ${province}`;
  }

  if (canton && province) {
    return `${canton}, ${province}`;
  }

  return province || "Costa Rica";
};

const buildZoneLevel = ({ province, canton, district }) => {
  if (district) return "district";
  if (canton) return "canton";
  if (province) return "province";
  return "country";
};

const buildZoneSearchPath = ({ province, canton, district }) => {
  const params = new URLSearchParams();

  if (province) params.set("province", province);
  if (canton) params.set("canton", canton);
  if (district) params.set("district", district);

  const query = params.toString();
  return query ? `/search?${query}` : "/search";
};

const buildFilterQuery = (query) => {
  const filter = buildPublicFilter();

  if (query.q) {
    const regex = new RegExp(escapeRegex(query.q), "i");
    filter.$or = [
      { title: regex },
      { description: regex },
      { "address.province": regex },
      { "address.canton": regex },
      { "address.district": regex },
      { "address.neighborhood": regex }
    ];
  }

  if (query.businessType) filter.operationType = query.businessType;
  if (query.rentalArrangement) filter.rentalArrangement = query.rentalArrangement;
  if (query.propertyType) filter.propertyType = query.propertyType;
  if (query.currency) filter.currency = query.currency;
  if (query.marketStatus && query.marketStatus !== "inactive") {
    filter.marketStatus = query.marketStatus;
  }
  if (query.province) filter["address.province"] = new RegExp(`^${escapeRegex(query.province)}$`, "i");
  if (query.canton) filter["address.canton"] = new RegExp(`^${escapeRegex(query.canton)}$`, "i");
  if (query.district) filter["address.district"] = new RegExp(`^${escapeRegex(query.district)}$`, "i");
  if (query.featured !== undefined) filter.featured = query.featured;
  if (query.furnished !== undefined) filter.furnished = query.furnished;
  if (query.petsAllowed !== undefined) filter.petsAllowed = query.petsAllowed;
  if (query.depositRequired !== undefined) filter.depositRequired = query.depositRequired;
  if (query.privateRoom !== undefined) {
    filter["roommateDetails.privateRoom"] = query.privateRoom;
  }
  if (query.privateBathroom !== undefined) {
    filter["roommateDetails.privateBathroom"] = query.privateBathroom;
  }
  if (query.utilitiesIncluded !== undefined) {
    filter["roommateDetails.utilitiesIncluded"] = query.utilitiesIncluded;
  }
  if (query.studentFriendly !== undefined) {
    filter["roommateDetails.studentFriendly"] = query.studentFriendly;
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    filter.price = {};
    if (query.minPrice !== undefined) filter.price.$gte = query.minPrice;
    if (query.maxPrice !== undefined) filter.price.$lte = query.maxPrice;
  }

  if (query.bedrooms !== undefined) filter.bedrooms = { $gte: query.bedrooms };
  if (query.bathrooms !== undefined) filter.bathrooms = { $gte: query.bathrooms };
  if (query.parkingSpaces !== undefined) filter.parkingSpaces = { $gte: query.parkingSpaces };

  if (query.minConstructionArea !== undefined || query.maxConstructionArea !== undefined) {
    filter.constructionArea = {};
    if (query.minConstructionArea !== undefined) filter.constructionArea.$gte = query.minConstructionArea;
    if (query.maxConstructionArea !== undefined) filter.constructionArea.$lte = query.maxConstructionArea;
  }

  if (query.minLotArea !== undefined || query.maxLotArea !== undefined) {
    filter.lotArea = {};
    if (query.minLotArea !== undefined) filter.lotArea.$gte = query.minLotArea;
    if (query.maxLotArea !== undefined) filter.lotArea.$lte = query.maxLotArea;
  }

  if (query.recent) {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - 21);
    filter.createdAt = { $gte: threshold };
  }

  if (query.polygon) {
    const polygon = normalizePolygonCoordinates(query.polygon);

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
  } else if (query.bounds) {
    filter.location = {
      $geoWithin: {
        $geometry: buildBoundsPolygon(query.bounds)
      }
    };
  } else if (query.lat !== undefined && query.lng !== undefined) {
    filter.location = {
      $near: {
        $geometry: {
          type: "Point",
          coordinates: [query.lng, query.lat]
        },
        $maxDistance: (query.radiusKm || 20) * 1000
      }
    };
  }

  return filter;
};

const normalizeMediaPayload = (payload = {}) => {
  if (payload.media?.length) {
    const normalizedMedia = payload.media
      .map((item, index) => ({
        order: index,
        ...item,
        isPrimary: item.isPrimary ?? index === 0
      }))
      .sort((first, second) => (first.order || 0) - (second.order || 0));

    const photos = normalizedMedia
      .filter((item) => item.type === "image")
      .map((item, index) => ({
        url: item.url,
        publicId: item.publicId,
        isPrimary: item.isPrimary ?? index === 0,
        alt: item.alt,
        width: item.width,
        height: item.height
      }));

    return {
      media: normalizedMedia,
      photos: makePrimaryPhotoSet(photos)
    };
  }

  if (payload.photos?.length) {
    const photos = makePrimaryPhotoSet(payload.photos);

    return {
      photos,
      media: photos.map((item, index) => ({
        type: "image",
        url: item.url,
        publicId: item.publicId,
        isPrimary: item.isPrimary,
        order: index,
        alt: item.alt,
        width: item.width,
        height: item.height
      }))
    };
  }

  return {};
};

const normalizePropertyPayload = (payload = {}, currentProperty = null) => {
  const normalized = { ...payload };
  const nextBusinessType =
    payload.businessType ??
    payload.operationType ??
    currentProperty?.businessType ??
    currentProperty?.operationType;
  const nextPropertyType = payload.propertyType ?? currentProperty?.propertyType;
  const nextRentalArrangement =
    nextBusinessType === "rent"
      ? payload.rentalArrangement ??
        currentProperty?.rentalArrangement ??
        (nextPropertyType === "room" ? "roommate" : "full-property")
      : "full-property";

  if (payload.location) {
    normalized.location = {
      type: "Point",
      coordinates: [payload.location.lng, payload.location.lat]
    };
  }

  const normalizedMedia = normalizeMediaPayload(payload);

  if (Object.keys(normalizedMedia).length) {
    normalized.media = normalizedMedia.media;
    normalized.photos = normalizedMedia.photos;
  }

  normalized.operationType = nextBusinessType;
  normalized.businessType = nextBusinessType;
  normalized.rentalArrangement = nextRentalArrangement;
  normalized.depositRequired =
    nextBusinessType === "rent"
      ? Boolean(payload.depositRequired ?? currentProperty?.depositRequired)
      : false;
  normalized.landArea =
    payload.landArea ?? payload.lotArea ?? currentProperty?.landArea ?? currentProperty?.lotArea ?? 0;
  normalized.lotArea =
    payload.lotArea ?? payload.landArea ?? currentProperty?.lotArea ?? currentProperty?.landArea ?? 0;
  normalized.addressText =
    payload.addressText ??
    payload.address?.exactAddress ??
    currentProperty?.addressText ??
    currentProperty?.address?.exactAddress ??
    "";

  if (nextBusinessType === "rent" && (nextRentalArrangement === "roommate" || nextPropertyType === "room")) {
    normalized.roommateDetails = {
      privateRoom: Boolean(
        payload.roommateDetails?.privateRoom ??
          currentProperty?.roommateDetails?.privateRoom ??
          nextPropertyType === "room"
      ),
      privateBathroom: Boolean(
        payload.roommateDetails?.privateBathroom ?? currentProperty?.roommateDetails?.privateBathroom
      ),
      utilitiesIncluded: Boolean(
        payload.roommateDetails?.utilitiesIncluded ??
          currentProperty?.roommateDetails?.utilitiesIncluded
      ),
      studentFriendly: Boolean(
        payload.roommateDetails?.studentFriendly ?? currentProperty?.roommateDetails?.studentFriendly
      ),
      availableRooms: Number(
        payload.roommateDetails?.availableRooms ?? currentProperty?.roommateDetails?.availableRooms ?? 1
      ),
      currentRoommates: Number(
        payload.roommateDetails?.currentRoommates ??
          currentProperty?.roommateDetails?.currentRoommates ??
          0
      ),
      maxRoommates: Number(
        payload.roommateDetails?.maxRoommates ?? currentProperty?.roommateDetails?.maxRoommates ?? 0
      ),
      genderPreference:
        payload.roommateDetails?.genderPreference ||
        currentProperty?.roommateDetails?.genderPreference ||
        "any",
      sharedAreas:
        payload.roommateDetails?.sharedAreas ?? currentProperty?.roommateDetails?.sharedAreas ?? []
    };
  } else if (currentProperty) {
    normalized.roommateDetails = undefined;
  }

  return normalized;
};

const ensureUniqueSlug = async (title, canton, excludePropertyId) => {
  const baseSlug = createSlug(`${title}-${canton || ""}`) || `property-${Date.now()}`;
  let slug = baseSlug;
  let counter = 1;

  while (
    await Property.exists({
      slug,
      ...(excludePropertyId ? { _id: { $ne: excludePropertyId } } : {})
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
};

const getPropertyOrThrow = async (propertyId) => {
  const property = await Property.findById(propertyId);

  if (!property) {
    throw new ApiError(404, "Property not found");
  }

  return property;
};

const findPotentialDuplicates = (ownerId, candidate, excludePropertyId) => {
  const filter = {
    owner: ownerId,
    _id: excludePropertyId ? { $ne: excludePropertyId } : { $exists: true },
    status: { $in: ["draft", "published", "paused"] },
    propertyType: candidate.propertyType,
    businessType: candidate.businessType,
    "address.province": candidate.address?.province
  };

  if (candidate.address?.canton) {
    filter["address.canton"] = candidate.address.canton;
  }

  return Property.find(filter)
    .select(
      "title slug description price propertyType businessType bedrooms bathrooms constructionArea lotArea landArea photos location address"
    )
    .sort({ updatedAt: -1 })
    .limit(15)
    .lean();
};

const buildModerationSignalsForPayload = async (payload, ownerId, excludePropertyId) => {
  const candidate = {
    ...payload,
    photos: payload.photos || [],
    location: payload.location || { coordinates: [] }
  };
  const existingListings = await findPotentialDuplicates(ownerId, candidate, excludePropertyId);

  return analyzeListingModeration(candidate, existingListings);
};

const pushPriceHistorySnapshot = (property, user, note) => {
  property.priceHistory.push({
    price: property.price,
    finalPrice: property.finalPrice,
    marketStatus: property.marketStatus,
    note,
    changedBy: user?._id
  });
};

const syncPublicationMetadata = (property) => {
  if (
    property.status !== "published" ||
    !property.isApproved ||
    (property.marketStatus || "available") === "inactive"
  ) {
    return;
  }

  property.publishedAt = property.publishedAt || new Date();
};

export const propertyService = {
  async list(query) {
    const pagination = buildPagination(query.page, query.limit);
    const filter = buildFilterQuery(query);
    const sort = buildSort(query.sort, query);

    const [items, total] = await Promise.all([
      Property.find(filter)
        .populate("owner", "name phone avatar role verification")
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit),
      Property.countDocuments(filter)
    ]);

    return {
      items: enrichPropertyCollection(items),
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.max(Math.ceil(total / pagination.limit), 1)
      }
    };
  },

  async listFeatured(limit = 6) {
    const items = await Property.find({
      ...buildPublicFilter(),
      featured: true
    })
      .populate("owner", "name phone avatar role verification")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit);

    return enrichPropertyCollection(items);
  },

  async getZoneSeoData(query) {
    const limit = Math.min(Math.max(Number(query.limit || 9), 3), 18);
    const zone = {
      province: query.province || "",
      canton: query.canton || "",
      district: query.district || ""
    };
    const filter = buildZoneFilter(zone);

    const [items, total, saleCount, rentCount, featuredCount, propertyTypeBreakdown, currencyBreakdown] =
      await Promise.all([
        Property.find(filter)
          .populate("owner", "name phone avatar role verification")
          .sort({ featured: -1, publishedAt: -1, createdAt: -1 })
          .limit(limit),
        Property.countDocuments(filter),
        Property.countDocuments({ ...filter, operationType: "sale" }),
        Property.countDocuments({ ...filter, operationType: "rent" }),
        Property.countDocuments({ ...filter, featured: true }),
        Property.aggregate([
          { $match: filter },
          { $group: { _id: "$propertyType", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 6 }
        ]),
        Property.aggregate([
          { $match: filter },
          {
            $group: {
              _id: "$currency",
              averagePrice: { $avg: "$price" },
              minPrice: { $min: "$price" },
              maxPrice: { $max: "$price" }
            }
          }
        ])
      ]);

    return {
      zone: {
        ...zone,
        label: buildZoneLabel(zone),
        level: buildZoneLevel(zone),
        searchPath: buildZoneSearchPath(zone)
      },
      summary: {
        totalListings: total,
        saleListings: saleCount,
        rentListings: rentCount,
        featuredListings: featuredCount,
        propertyTypes: propertyTypeBreakdown.map((item) => ({
          type: item._id,
          count: item.count
        })),
        pricesByCurrency: currencyBreakdown.map((item) => ({
          currency: item._id,
          averagePrice: Math.round(item.averagePrice || 0),
          minPrice: Math.round(item.minPrice || 0),
          maxPrice: Math.round(item.maxPrice || 0)
        }))
      },
      items: enrichPropertyCollection(items)
    };
  },

  async getBySlug(slug, user) {
    const property = await Property.findOne({ slug }).populate(
      "owner",
      "name phone avatar role verification"
    );

    if (!property) {
      throw new ApiError(404, "Property not found");
    }

    const canView = isPubliclyVisibleProperty(property);

    if (!canView && !isOwnerOrAdmin(property, user)) {
      throw new ApiError(404, "Property not found");
    }

    if (canView) {
      await Property.updateOne(
        { _id: property._id },
        { $inc: { views: 1, "engagement.views": 1 } }
      );
      property.views += 1;
      property.engagement = {
        ...(property.engagement?.toObject ? property.engagement.toObject() : property.engagement),
        views: Number(property.engagement?.views || 0) + 1
      };
    }

    return enrichPropertyForClient(property);
  },

  async getManageProperty(propertyId, user) {
    const property = await Property.findById(propertyId).populate(
      "owner",
      "name phone avatar role verification"
    );

    if (!property) {
      throw new ApiError(404, "Property not found");
    }

    if (!isOwnerOrAdmin(property, user)) {
      throw new ApiError(403, "You do not have access to this property");
    }

    return enrichPropertyForClient(property);
  },

  async listMine(user) {
    const items = await Property.find({ owner: user._id })
      .populate("owner", "name phone avatar role verification")
      .sort({ updatedAt: -1, createdAt: -1 });
    return enrichPropertyCollection(items);
  },

  async create(user, payload) {
    const normalized = normalizePropertyPayload(payload);
    normalized.owner = user._id;
    normalized.status = normalized.status || "published";
    normalized.slug = await ensureUniqueSlug(payload.title, payload.address?.canton);
    normalized.sellerInfo = payload.sellerInfo || {
      name: user.name,
      phone: user.phone,
      email: user.email,
      role: user.role
    };
    normalized.priceHistory = [
      {
        price: normalized.price,
        finalPrice: normalized.finalPrice,
        marketStatus: normalized.marketStatus || "available",
        note: "created",
        changedBy: user._id
      }
    ];

    if (user.role === "admin") {
      normalized.isApproved = true;
      normalized.approvedBy = user._id;
      normalized.approvedAt = new Date();
    } else {
      normalized.featured = false;
    }

    normalized.moderationSignals = await buildModerationSignalsForPayload(normalized, user._id);

    syncPublicationMetadata(normalized);

    const property = await Property.create(normalized);
    const created = await Property.findById(property._id).populate(
      "owner",
      "name phone avatar role verification"
    );
    return enrichPropertyForClient(created);
  },

  async update(propertyId, user, payload) {
    const property = await getPropertyOrThrow(propertyId);

    if (!isOwnerOrAdmin(property, user)) {
      throw new ApiError(403, "You do not have access to this property");
    }

    const previousPrice = property.price;
    const previousFinalPrice = property.finalPrice;
    const previousMarketStatus = property.marketStatus;
    const normalized = normalizePropertyPayload(payload, property);

    if (user.role !== "admin") {
      delete normalized.featured;
      delete normalized.isApproved;
      delete normalized.approvedBy;
      delete normalized.approvedAt;
      delete normalized.moderationNote;
    }

    Object.assign(property, normalized);

    property.moderationSignals = await buildModerationSignalsForPayload(
      property.toObject(),
      property.owner,
      property._id
    );

    syncPublicationMetadata(property);

    if (payload.title || payload.address?.canton) {
      property.slug = await ensureUniqueSlug(
        payload.title || property.title,
        payload.address?.canton || property.address.canton,
        property._id
      );
    }

    if (property.status === "published" && property.isApproved && !property.publishedAt) {
      property.publishedAt = new Date();
    }

    if (
      previousPrice !== property.price ||
      previousFinalPrice !== property.finalPrice ||
      previousMarketStatus !== property.marketStatus
    ) {
      pushPriceHistorySnapshot(property, user, "updated");
    }

    await property.save();

    const updated = await Property.findById(property._id).populate(
      "owner",
      "name phone avatar role verification"
    );
    return enrichPropertyForClient(updated);
  },

  async updateStatus(propertyId, user, status) {
    const property = await getPropertyOrThrow(propertyId);

    if (!isOwnerOrAdmin(property, user)) {
      throw new ApiError(403, "You do not have access to this property");
    }

    if (status === "sold") {
      property.status = "published";
      property.marketStatus = "sold";
    } else if (status === "rented") {
      property.status = "published";
      property.marketStatus = "rented";
    } else {
      property.status = status;
    }

    syncPublicationMetadata(property);

    if (status === "published" && property.isApproved && !property.publishedAt) {
      property.publishedAt = new Date();
    }

    await property.save();
    return enrichPropertyForClient(property);
  },

  async updateFeatured(propertyId, user, featured) {
    const property = await getPropertyOrThrow(propertyId);

    if (!isOwnerOrAdmin(property, user)) {
      throw new ApiError(403, "You do not have access to this property");
    }

    if (!featured) {
      property.featured = false;
      await property.save();
      return enrichPropertyForClient(property);
    }

    if (
      property.status !== "published" ||
      !property.isApproved ||
      !["available", "reserved"].includes(property.marketStatus || "available")
    ) {
      throw new ApiError(
        400,
        "Solo puedes destacar publicaciones aprobadas, publicadas y disponibles o reservadas."
      );
    }

    property.featured = true;
    await property.save();
    return enrichPropertyForClient(property);
  },

  async remove(propertyId, user) {
    const property = await getPropertyOrThrow(propertyId);

    if (!isOwnerOrAdmin(property, user)) {
      throw new ApiError(403, "You do not have access to this property");
    }

    property.status = "paused";
    if (property.marketStatus === "available") {
      property.marketStatus = "inactive";
    }
    pushPriceHistorySnapshot(property, user, "archived");
    await property.save();
  }
};
