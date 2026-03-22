import mongoose from "mongoose";

const savedSearchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    filters: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    mapArea: {
      type: {
        type: String,
        enum: ["Polygon"],
        required: false
      },
      coordinates: {
        type: [[[Number]]],
        required: false
      }
    },
    bounds: {
      west: Number,
      south: Number,
      east: Number,
      north: Number
    },
    alertsEnabled: {
      type: Boolean,
      default: false
    },
    lastViewedAt: {
      type: Date
    },
    lastAlertSentAt: {
      type: Date
    }
  },
  { timestamps: true }
);

export const SavedSearch = mongoose.model("SavedSearch", savedSearchSchema);
