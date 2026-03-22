import mongoose from "mongoose";
import { CURRENCIES, OFFER_SOURCES, OFFER_STATUSES } from "../constants/enums.js";

const offerSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      enum: CURRENCIES,
      required: true
    },
    message: {
      type: String,
      trim: true,
      default: ""
    },
    source: {
      type: String,
      enum: OFFER_SOURCES,
      default: "property-page"
    },
    status: {
      type: String,
      enum: OFFER_STATUSES,
      default: "new"
    }
  },
  { timestamps: true }
);

offerSchema.index({ toUser: 1, createdAt: -1 });
offerSchema.index({ fromUser: 1, createdAt: -1 });
offerSchema.index({ property: 1, createdAt: -1 });

export const Offer = mongoose.model("Offer", offerSchema);
