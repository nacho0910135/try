import { Favorite } from "../models/Favorite.js";
import { Lead } from "../models/Lead.js";
import { Property } from "../models/Property.js";
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
  isApproved: true
});

const buildSort = (sort) => {
  switch (sort) {
    case "price-asc":
      return { price: 1, featured: -1 };
    case "price-desc":
      return { price: -1, featured: -1 };
    case "recent":
      return { featured: -1, publishedAt: -1, createdAt: -1 };
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

  if (query.businessType) filter.businessType = query.businessType;
  if (query.propertyType) filter.propertyType = query.propertyType;
  if (query.currency) filter.currency = query.currency;
  if (query.province) filter["address.province"] = new RegExp(`^${escapeRegex(query.province)}$`, "i");
  if (query.canton) filter["address.canton"] = new RegExp(`^${escapeRegex(query.canton)}$`, "i");
  if (query.district) filter["address.district"] = new RegExp(`^${escapeRegex(query.district)}$`, "i");
  if (query.featured !== undefined) filter.featured = query.featured;
  if (query.furnished !== undefined) filter.furnished = query.furnished;
  if (query.petsAllowed !== undefined) filter.petsAllowed = query.petsAllowed;

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

const normalizePropertyPayload = (payload = {}) => {
  const normalized = { ...payload };

  if (payload.location) {
    normalized.location = {
      type: "Point",
      coordinates: [payload.location.lng, payload.location.lat]
    };
  }

  if (payload.photos) {
    normalized.photos = makePrimaryPhotoSet(payload.photos);
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
      await Property.updateOne({ _id: property._id }, { $inc: { views: 1 } });
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
    normalized.slug = await ensureUniqueSlug(payload.title, payload.address?.canton);

    if (user.role === "admin") {
      normalized.isApproved = true;
      normalized.approvedBy = user._id;
      normalized.approvedAt = new Date();
    } else {
      normalized.featured = false;
    }

    const property = await Property.create(normalized);
    return Property.findById(property._id).populate("owner", "name phone avatar role");
  },

  async update(propertyId, user, payload) {
    const property = await getPropertyOrThrow(propertyId);

    if (!isOwnerOrAdmin(property, user)) {
      throw new ApiError(403, "You do not have access to this property");
    }

    const normalized = normalizePropertyPayload(payload);

    if (user.role !== "admin") {
      delete normalized.featured;
      delete normalized.isApproved;
      delete normalized.approvedBy;
      delete normalized.approvedAt;
      delete normalized.moderationNote;
    }

    Object.assign(property, normalized);

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

    await property.save();

    return Property.findById(property._id).populate("owner", "name phone avatar role");
  },

  async updateStatus(propertyId, user, status) {
    const property = await getPropertyOrThrow(propertyId);

    if (!isOwnerOrAdmin(property, user)) {
      throw new ApiError(403, "You do not have access to this property");
    }

    property.status = status;

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

    await Promise.all([
      Favorite.deleteMany({ property: property._id }),
      Lead.deleteMany({ property: property._id }),
      property.deleteOne()
    ]);
  }
};
