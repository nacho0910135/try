import { Favorite } from "../models/Favorite.js";
import { Lead } from "../models/Lead.js";
import { Property } from "../models/Property.js";
import { SavedSearch } from "../models/SavedSearch.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { buildPagination } from "../utils/pagination.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const adminService = {
  async listUsers(query) {
    const pagination = buildPagination(query.page, query.limit);
    const filter = {};

    if (query.role) filter.role = query.role;
    if (query.isActive !== undefined) filter.isActive = query.isActive;
    if (query.q) {
      const regex = new RegExp(escapeRegex(query.q), "i");
      filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
    }

    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit),
      User.countDocuments(filter)
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

  async listProperties(query) {
    const pagination = buildPagination(query.page, query.limit);
    const filter = {};

    if (query.status) filter.status = query.status;
    if (query.isApproved !== undefined) filter.isApproved = query.isApproved;
    if (query.q) {
      const regex = new RegExp(escapeRegex(query.q), "i");
      filter.$or = [
        { title: regex },
        { "address.province": regex },
        { "address.canton": regex },
        { "address.district": regex }
      ];
    }

    const [items, total] = await Promise.all([
      Property.find(filter)
        .populate("owner", "name email role phone")
        .sort({ createdAt: -1 })
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

  async moderateProperty(propertyId, adminUser, payload) {
    const property = await Property.findById(propertyId);

    if (!property) {
      throw new ApiError(404, "Property not found");
    }

    if (payload.isApproved !== undefined) {
      property.isApproved = payload.isApproved;
      property.approvedBy = payload.isApproved ? adminUser._id : undefined;
      property.approvedAt = payload.isApproved ? new Date() : undefined;

      if (payload.isApproved && property.status === "published" && !property.publishedAt) {
        property.publishedAt = new Date();
      }
    }

    if (payload.featured !== undefined) property.featured = payload.featured;
    if (payload.status) property.status = payload.status;
    if (payload.moderationNote !== undefined) property.moderationNote = payload.moderationNote;

    await property.save();

    return Property.findById(property._id).populate("owner", "name email role phone");
  },

  async updateUserStatus(userId, payload) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    user.isActive = payload.isActive;
    await user.save();

    return user;
  },

  async getMetrics() {
    const [users, properties, published, pendingApproval, featured, leads, favorites, savedSearches] =
      await Promise.all([
        User.countDocuments(),
        Property.countDocuments(),
        Property.countDocuments({ status: "published", isApproved: true }),
        Property.countDocuments({ isApproved: false, status: { $in: ["draft", "published", "paused"] } }),
        Property.countDocuments({ featured: true }),
        Lead.countDocuments(),
        Favorite.countDocuments(),
        SavedSearch.countDocuments()
      ]);

    return {
      users,
      properties,
      published,
      pendingApproval,
      featured,
      leads,
      favorites,
      savedSearches
    };
  }
};

