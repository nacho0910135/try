import { Lead } from "../models/Lead.js";
import { Property } from "../models/Property.js";
import { ApiError } from "../utils/apiError.js";
import { buildPagination } from "../utils/pagination.js";
import { notificationService } from "./notificationService.js";

const startOfToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const buildCrmSummary = (items = []) => {
  const today = startOfToday();
  const staleThreshold = daysAgo(5);

  return {
    total: items.length,
    new: items.filter((item) => item.status === "new").length,
    contacted: items.filter((item) => item.status === "contacted").length,
    qualified: items.filter((item) => item.status === "qualified").length,
    closed: items.filter((item) => item.status === "closed").length,
    highPriority: items.filter((item) => item.priority === "high").length,
    dueFollowUps: items.filter(
      (item) => item.nextFollowUpAt && new Date(item.nextFollowUpAt) <= today
    ).length,
    stale: items.filter(
      (item) =>
        item.status !== "closed" &&
        new Date(item.lastContactedAt || item.createdAt) < staleThreshold
    ).length
  };
};

export const leadService = {
  async create(payload, user) {
    const property = await Property.findById(payload.propertyId).populate("owner", "name email phone");

    if (!property || property.status !== "published" || !property.isApproved) {
      throw new ApiError(404, "Property not found");
    }

    const lead = await Lead.create({
      property: property._id,
      fromUser: user?._id,
      toUser: property.owner._id,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      message: payload.message,
      source: payload.source || "property-page"
    });

    await Property.updateOne({ _id: property._id }, { $inc: { "engagement.leads": 1 } });

    try {
      await notificationService.sendLeadNotification({
        lead,
        property,
        recipient: property.owner
      });
    } catch (error) {
      console.error("Lead email notification failed", error);
    }

    return lead;
  },

  async listReceived(user, query) {
    const pagination = buildPagination(query.page, query.limit);
    const filter = { toUser: user._id };

    const [items, total, allItems] = await Promise.all([
      Lead.find(filter)
        .populate(
          "property",
          "title slug businessType propertyType price currency photos address marketStatus"
        )
        .populate("fromUser", "name email role")
        .sort({ createdAt: -1 })
        .skip(pagination.skip)
        .limit(pagination.limit),
      Lead.countDocuments(filter),
      Lead.find(filter).select("status priority nextFollowUpAt lastContactedAt createdAt")
    ]);

    return {
      items,
      summary: buildCrmSummary(allItems),
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
        .populate(
          "property",
          "title slug businessType propertyType price currency photos address marketStatus"
        )
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

  async update(leadId, user, payload) {
    const lead = await Lead.findById(leadId);

    if (!lead) {
      throw new ApiError(404, "Lead not found");
    }

    if (lead.toUser.toString() !== user._id.toString() && user.role !== "admin") {
      throw new ApiError(403, "You do not have access to this lead");
    }

    if (payload.status !== undefined) {
      lead.status = payload.status;
    }

    if (payload.priority !== undefined) {
      lead.priority = payload.priority;
    }

    if (payload.internalNote !== undefined) {
      lead.internalNote = payload.internalNote;
    }

    if (payload.nextFollowUpAt !== undefined) {
      lead.nextFollowUpAt = payload.nextFollowUpAt;
    }

    if (payload.lastContactedAt !== undefined) {
      lead.lastContactedAt = payload.lastContactedAt;
    }

    await lead.save();

    return Lead.findById(lead._id)
      .populate(
        "property",
        "title slug businessType propertyType price currency photos address marketStatus"
      )
      .populate("fromUser", "name email role")
      .populate("toUser", "name email phone role");
  }
};
