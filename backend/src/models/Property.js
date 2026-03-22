import mongoose from "mongoose";
import {
  BUSINESS_TYPES,
  CURRENCIES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES
} from "../constants/enums.js";
import { createSlug } from "../utils/slug.js";

const photoSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true
    },
    publicId: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    alt: String,
    width: Number,
    height: Number
  },
  { _id: false }
);

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    businessType: {
      type: String,
      enum: BUSINESS_TYPES,
      required: true
    },
    propertyType: {
      type: String,
      enum: PROPERTY_TYPES,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      enum: CURRENCIES,
      default: "USD"
    },
    bedrooms: {
      type: Number,
      default: 0
    },
    bathrooms: {
      type: Number,
      default: 0
    },
    parkingSpaces: {
      type: Number,
      default: 0
    },
    constructionArea: {
      type: Number,
      default: 0
    },
    lotArea: {
      type: Number,
      default: 0
    },
    furnished: {
      type: Boolean,
      default: false
    },
    petsAllowed: {
      type: Boolean,
      default: false
    },
    featured: {
      type: Boolean,
      default: false
    },
    amenities: {
      type: [String],
      default: []
    },
    photos: {
      type: [photoSchema],
      default: []
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: (value) => Array.isArray(value) && value.length === 2,
          message: "Location must include [longitude, latitude]"
        }
      }
    },
    address: {
      province: {
        type: String,
        required: true,
        trim: true
      },
      canton: {
        type: String,
        required: true,
        trim: true
      },
      district: {
        type: String,
        required: true,
        trim: true
      },
      neighborhood: {
        type: String,
        trim: true
      },
      exactAddress: {
        type: String,
        trim: true
      },
      hideExactLocation: {
        type: Boolean,
        default: false
      }
    },
    status: {
      type: String,
      enum: PROPERTY_STATUSES,
      default: "draft"
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    moderationNote: {
      type: String,
      default: ""
    },
    publishedAt: Date,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    approvedAt: Date,
    views: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true
    }
  }
);

propertySchema.pre("validate", function buildSlug(next) {
  if (!this.slug && this.title) {
    const slugSource = `${this.title}-${this.address?.canton || ""}`;
    this.slug = createSlug(slugSource);
  }

  return next();
});

propertySchema.pre("save", function syncPublicationDate(next) {
  if (this.status === "published" && this.isApproved && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  return next();
});

propertySchema.index({ location: "2dsphere" });
propertySchema.index({
  title: "text",
  description: "text",
  "address.province": "text",
  "address.canton": "text",
  "address.district": "text",
  "address.neighborhood": "text"
});
propertySchema.index({ status: 1, isApproved: 1, featured: -1, publishedAt: -1 });
propertySchema.index({ slug: 1 });

export const Property = mongoose.model("Property", propertySchema);

