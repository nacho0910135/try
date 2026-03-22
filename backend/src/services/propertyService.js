import { Property } from "../models/Property.js";
import { proximityService } from "./proximityService.js";
import { ApiError } from "../utils/apiError.js";
import { buildBoundsPolygon, normalizePolygonCoordinates } from "../utils/geo.js";
import { buildPagination } from "../utils/pagination.js";
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

const buildSort = (sort) => {
  switch (sort) {
    case "price-asc":
      return { price: 1, featured: -1 };
    case "price-desc":
      return { price: -1, featured: -1 };
    case "recent":
      return { featured: -1, publishedAt: -1, createdAt: -1 };
    case "distance":
      return {};
    default:
      return { featured: -1, publishedAt: -1, createdAt: -1 };
  }
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
  if (query.marketStatus) {
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

const pushPriceHistorySnapshot = (property, user, note) => {
  property.priceHistory.push({
    price: property.price,
    finalPrice: property.finalPrice,
    marketStatus: property.marketStatus,
    note,
    changedBy: user?._id
  });
};

const makePropertyPublicWhenPublished = (property, user) => {
  if (property.status !== "published") {
    return;
  }

  property.isApproved = true;
  property.approvedAt = property.approvedAt || new Date();
  property.approvedBy = property.approvedBy || user._id;
  property.publishedAt = property.publishedAt || new Date();
};

export const propertyService = {
  async list(query) {
    const pagination = buildPagination(query.page, query.limit);
    const filter = buildFilterQuery(query);
    const sort = buildSort(query.sort);

    const [items, total] = await Promise.all([
      Property.find(filter)
        .populate("owner", "name phone avatar role")
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit),
      Property.countDocuments(filter)
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

  async listFeatured(limit = 6) {
    return Property.find({
      ...buildPublicFilter(),
      featured: true
    })
      .populate("owner", "name phone avatar role")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit);
  },

  async getBySlug(slug, user) {
    const property = await Property.findOne({ slug }).populate("owner", "name phone avatar role");

    if (!property) {
      throw new ApiError(404, "Property not found");
    }

    const canView = property.isApproved && property.status === "published";

    if (!canView && !isOwnerOrAdmin(property, user)) {
      throw new ApiError(404, "Property not found");
    }

    if (canView) {
      await Property.updateOne(
        { _id: property._id },
        { $inc: { views: 1, "engagement.views": 1 } }
      );
      property.views += 1;
    }

    return property;
  },

  async getManageProperty(propertyId, user) {
    const property = await Property.findById(propertyId).populate("owner", "name phone avatar role");

    if (!property) {
      throw new ApiError(404, "Property not found");
    }

    if (!isOwnerOrAdmin(property, user)) {
      throw new ApiError(403, "You do not have access to this property");
    }

    return property;
  },

  async listMine(user) {
    return Property.find({ owner: user._id }).sort({ updatedAt: -1, createdAt: -1 });
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
    const serviceStubs = proximityService.buildDefaultStubs();
    normalized.nearestHospital = payload.nearestHospital || serviceStubs.nearestHospital;
    normalized.nearestSchool = payload.nearestSchool || serviceStubs.nearestSchool;
    normalized.nearestHighSchool = payload.nearestHighSchool || serviceStubs.nearestHighSchool;
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

    makePropertyPublicWhenPublished(normalized, user);

    const property = await Property.create(normalized);
    return Property.findById(property._id).populate("owner", "name phone avatar role");
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

    makePropertyPublicWhenPublished(property, user);

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

    return Property.findById(property._id).populate("owner", "name phone avatar role");
  },

  async updateStatus(propertyId, user, status) {
    const property = await getPropertyOrThrow(propertyId);

    if (!isOwnerOrAdmin(property, user)) {
      throw new ApiError(403, "You do not have access to this property");
    }

    property.status = status;
    makePropertyPublicWhenPublished(property, user);

    if (status === "published" && property.isApproved && !property.publishedAt) {
      property.publishedAt = new Date();
    }

    await property.save();
    return property;
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
