import { Lead } from "../models/Lead.js";
import { Property } from "../models/Property.js";
import { ApiError } from "../utils/apiError.js";
import { buildPagination } from "../utils/pagination.js";

export const leadService = {
  async create(payload, user) {
    const property = await Property.findById(payload.propertyId).populate("owner", "name email phone");

    if (!property || property.status !== "published" || !property.isApproved) {
      throw new ApiError(404, "Property not found");
    }

    return Lead.create({
      property: property._id,
      fromUser: user?._id,
      toUser: property.owner._id,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      message: payload.message,
      source: payload.source || "property-page"
    });
  },

  async listReceived(user, query) {
    const pagination = buildPagination(query.page, query.limit);
    const filter = { toUser: user._id };

    const [items, total] = await Promise.all([
      Lead.find(filter)
        .populate("property", "title slug businessType propertyType price currency photos address")
        .populate("fromUser", "name email role")
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Lead.countDocuments(filter)
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

    const [items, total] = await Promise.all([
      Lead.find(filter)
        .populate("property", "title slug businessType propertyType price currency photos address")
        .populate("toUser", "name email phone role")
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Lead.countDocuments(filter)
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

  async updateStatus(leadId, user, status) {
    const lead = await Lead.findById(leadId);

    if (!lead) {
      throw new ApiError(404, "Lead not found");
    }

    if (lead.toUser.toString() !== user._id.toString() && user.role !== "admin") {
      throw new ApiError(403, "You do not have access to this lead");
    }

    lead.status = status;
    await lead.save();

    return lead;
  }
};

