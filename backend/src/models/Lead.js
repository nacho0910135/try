import mongoose from "mongoose";
import { LEAD_PRIORITIES, LEAD_SOURCES, LEAD_STATUSES } from "../constants/enums.js";

const leadSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    source: {
      type: String,
      enum: LEAD_SOURCES,
      default: "property-page"
    },
    status: {
      type: String,
      enum: LEAD_STATUSES,
      default: "new"
    },
    priority: {
      type: String,
      enum: LEAD_PRIORITIES,
      default: "medium"
    },
    internalNote: {
      type: String,
      trim: true,
      maxlength: 2000
    },
    nextFollowUpAt: {
      type: Date
    },
    lastContactedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

leadSchema.index({ toUser: 1, createdAt: -1 });
leadSchema.index({ fromUser: 1, createdAt: -1 });

export const Lead = mongoose.model("Lead", leadSchema);
