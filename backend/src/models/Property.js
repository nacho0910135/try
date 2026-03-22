import mongoose from "mongoose";
import {
  BUSINESS_TYPES,
  CURRENCIES,
  MARKET_STATUSES,
  MEDIA_TYPES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  RENTAL_ARRANGEMENTS,
  ROOMMATE_GENDER_PREFERENCES
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

const mediaSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: MEDIA_TYPES,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    thumbnailUrl: String,
    publicId: String,
    provider: {
      type: String,
      default: "cloudinary"
    },
    mimeType: String,
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    },
    width: Number,
    height: Number,
    durationSeconds: Number
  },
  { _id: false }
);

const nearbyPlaceSchema = new mongoose.Schema(
  {
    name: String,
    placeType: String,
    distanceKm: Number,
    travelMinutes: Number,
    dataSource: String,
    isStub: {
      type: Boolean,
      default: false
    },
    location: {
      type: {
        type: String,
        enum: ["Point"]
      },
      coordinates: {
        type: [Number],
        default: undefined
      }
    }
  },
  { _id: false }
);

const sellerInfoSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    email: String,
    role: String
  },
  { _id: false }
);

const analyticsSnapshotSchema = new mongoose.Schema(
  {
    pricePerSquareMeter: Number,
    comparableAveragePpsm: Number,
    marketScore: {
      type: String,
      enum: ["below-market", "in-range", "above-market"]
    },
    suggestedPriceMin: Number,
    suggestedPriceMax: Number,
    lastComputedAt: Date
  },
  { _id: false }
);

const priceHistorySchema = new mongoose.Schema(
  {
    price: Number,
    finalPrice: Number,
    marketStatus: {
      type: String,
      enum: MARKET_STATUSES
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    note: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { _id: false }
);

const engagementSchema = new mongoose.Schema(
  {
    views: {
      type: Number,
      default: 0
    },
    favorites: {
      type: Number,
      default: 0
    },
    leads: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const roommateDetailsSchema = new mongoose.Schema(
  {
    privateRoom: {
      type: Boolean,
      default: false
    },
    privateBathroom: {
      type: Boolean,
      default: false
    },
    utilitiesIncluded: {
      type: Boolean,
      default: false
    },
    studentFriendly: {
      type: Boolean,
      default: false
    },
    availableRooms: {
      type: Number,
      default: 1
    },
    currentRoommates: {
      type: Number,
      default: 0
    },
    maxRoommates: {
      type: Number,
      default: 0
    },
    genderPreference: {
      type: String,
      enum: ROOMMATE_GENDER_PREFERENCES,
      default: "any"
    },
    sharedAreas: {
      type: [String],
      default: []
    }
  },
  { _id: false }
);

const serviceDistancesSchema = new mongoose.Schema(
  {
    hospitalKm: {
      type: Number,
      min: 0
    },
    schoolKm: {
      type: Number,
      min: 0
    },
    highSchoolKm: {
      type: Number,
      min: 0
    }
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
    operationType: {
      type: String,
      enum: BUSINESS_TYPES
    },
    rentalArrangement: {
      type: String,
      enum: RENTAL_ARRANGEMENTS,
      default: "full-property"
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
    landArea: {
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
    depositRequired: {
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
    media: {
      type: [mediaSchema],
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
    addressText: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: PROPERTY_STATUSES,
      default: "draft"
    },
    marketStatus: {
      type: String,
      enum: MARKET_STATUSES,
      default: "available"
    },
    finalPrice: {
      type: Number,
      min: 0
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
    reservedAt: Date,
    soldAt: Date,
    rentedAt: Date,
    inactivatedAt: Date,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    sellerInfo: sellerInfoSchema,
    serviceDistances: serviceDistancesSchema,
    nearestHospital: nearbyPlaceSchema,
    nearestSchool: nearbyPlaceSchema,
    nearestHighSchool: nearbyPlaceSchema,
    analyticsSnapshot: analyticsSnapshotSchema,
    roommateDetails: roommateDetailsSchema,
    priceHistory: {
      type: [priceHistorySchema],
      default: []
    },
    engagement: {
      type: engagementSchema,
      default: () => ({})
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

propertySchema.pre("save", function syncDerivedFields(next) {
  if (!this.operationType) {
    this.operationType = this.businessType;
  }

  if (!this.businessType) {
    this.businessType = this.operationType;
  }

  if (!this.landArea && this.lotArea) {
    this.landArea = this.lotArea;
  }

  if (!this.lotArea && this.landArea) {
    this.lotArea = this.landArea;
  }

  if (!this.addressText && this.address?.exactAddress) {
    this.addressText = this.address.exactAddress;
  }

  if (
    !this.serviceDistances?.hospitalKm &&
    !this.serviceDistances?.schoolKm &&
    !this.serviceDistances?.highSchoolKm
  ) {
    this.serviceDistances = undefined;
  }

  if (this.status === "sold") {
    this.marketStatus = "sold";
    this.status = "published";
  }

  if (this.status === "rented") {
    this.marketStatus = "rented";
    this.status = "published";
  }

  if (this.businessType !== "rent") {
    this.rentalArrangement = "full-property";
    this.depositRequired = false;
  }

  if (
    this.businessType === "rent" &&
    this.propertyType === "room" &&
    !this.rentalArrangement
  ) {
    this.rentalArrangement = "roommate";
  }

  if (
    this.businessType !== "rent" ||
    (this.rentalArrangement !== "roommate" && this.propertyType !== "room")
  ) {
    this.roommateDetails = undefined;
  }

  if (this.status === "published" && this.isApproved && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  if (this.marketStatus === "reserved" && !this.reservedAt) {
    this.reservedAt = new Date();
  }

  if (this.marketStatus === "sold" && !this.soldAt) {
    this.soldAt = new Date();
  }

  if (this.marketStatus === "rented" && !this.rentedAt) {
    this.rentedAt = new Date();
  }

  if (this.marketStatus === "inactive" && !this.inactivatedAt) {
    this.inactivatedAt = new Date();
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
propertySchema.index({
  status: 1,
  marketStatus: 1,
  operationType: 1,
  isApproved: 1,
  featured: -1,
  publishedAt: -1
});
propertySchema.index({ soldAt: -1, rentedAt: -1 });
propertySchema.index({ slug: 1 });

export const Property = mongoose.model("Property", propertySchema);
