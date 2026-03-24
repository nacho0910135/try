import { z } from "zod";
import {
  BOOST_METRIC_EVENTS,
  BUSINESS_TYPES,
  CURRENCIES,
  MARKET_STATUSES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  RENTAL_ARRANGEMENTS,
  ROOMMATE_GENDER_PREFERENCES
} from "../constants/enums.js";
import {
  booleanField,
  integerField,
  jsonField,
  numberField,
  objectIdSchema,
  urlLikeSchema
} from "./common.js";

const photoSchema = z.object({
  url: urlLikeSchema,
  publicId: z.string().optional().nullable(),
  isPrimary: z.boolean().optional(),
  alt: z.string().optional(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable()
});

const mediaSchema = z.object({
  type: z.enum(["image", "video"]),
  url: urlLikeSchema,
  thumbnailUrl: urlLikeSchema.optional(),
  publicId: z.string().optional().nullable(),
  provider: z.string().optional(),
  mimeType: z.string().optional(),
  alt: z.string().optional(),
  isPrimary: z.boolean().optional(),
  order: z.number().optional(),
  width: z.number().optional().nullable(),
  height: z.number().optional().nullable(),
  durationSeconds: z.number().optional()
});

const serviceDistancesSchema = z
  .object({
    hospitalKm: z.number().int().nonnegative().optional(),
    schoolKm: z.number().int().nonnegative().optional(),
    highSchoolKm: z.number().int().nonnegative().optional()
  })
  .optional();

const propertyBodySchema = z.object({
  title: z.string().min(10).max(160),
  description: z.string().min(10).max(5000),
  businessType: z.enum(BUSINESS_TYPES),
  operationType: z.enum(BUSINESS_TYPES).optional(),
  rentalArrangement: z.enum(RENTAL_ARRANGEMENTS).optional(),
  propertyType: z.enum(PROPERTY_TYPES),
  price: z.number().nonnegative(),
  finalPrice: z
    .preprocess(
      (value) => (value === null || value === undefined || value === "" ? undefined : value),
      z.number().nonnegative().optional()
    ),
  currency: z.enum(CURRENCIES),
  bedrooms: z.number().int().nonnegative().default(0),
  bathrooms: z.number().int().nonnegative().default(0),
  parkingSpaces: z.number().int().nonnegative().default(0),
  constructionArea: z.number().nonnegative().default(0),
  landArea: z.number().nonnegative().default(0),
  lotArea: z.number().nonnegative().default(0),
  furnished: z.boolean().default(false),
  petsAllowed: z.boolean().default(false),
  depositRequired: z.boolean().default(false),
  featured: z.boolean().optional(),
  amenities: z.array(z.string()).default([]),
  photos: z.array(photoSchema).default([]),
  media: z.array(mediaSchema).default([]),
  location: z.object({
    lng: z.number().min(-180).max(180),
    lat: z.number().min(-90).max(90)
  }),
  address: z.object({
    province: z.string().min(2).max(120),
    canton: z.string().min(2).max(120),
    district: z.string().min(2).max(120),
    neighborhood: z.string().max(120).optional().default(""),
    exactAddress: z.string().max(240).optional().default(""),
    hideExactLocation: z.boolean().default(false)
  }),
  addressText: z.string().max(240).optional(),
  sellerInfo: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().trim().optional(),
      role: z.string().optional()
    })
    .optional(),
  serviceDistances: serviceDistancesSchema,
  roommateDetails: z
    .object({
      privateRoom: z.boolean().optional(),
      privateBathroom: z.boolean().optional(),
      utilitiesIncluded: z.boolean().optional(),
      studentFriendly: z.boolean().optional(),
      availableRooms: z.number().int().nonnegative().optional(),
      currentRoommates: z.number().int().nonnegative().optional(),
      maxRoommates: z.number().int().nonnegative().optional(),
      genderPreference: z.enum(ROOMMATE_GENDER_PREFERENCES).optional(),
      sharedAreas: z.array(z.string()).optional()
    })
    .optional(),
  status: z.enum(PROPERTY_STATUSES).default("draft"),
  marketStatus: z.enum(MARKET_STATUSES).default("available")
});

export const createPropertySchema = z.object({
  body: propertyBodySchema
});

export const updatePropertySchema = z.object({
  params: z.object({
    propertyId: objectIdSchema
  }),
  body: propertyBodySchema.partial()
});

export const propertyIdSchema = z.object({
  params: z.object({
    propertyId: objectIdSchema
  })
});

export const propertySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(3)
  })
});

export const propertyStatusSchema = z.object({
  params: z.object({
    propertyId: objectIdSchema
  }),
  body: z.object({
    status: z.enum(PROPERTY_STATUSES)
  })
});

export const propertyFeaturedSchema = z.object({
  params: z.object({
    propertyId: objectIdSchema
  }),
  body: z.object({
    featured: z.boolean()
  })
});

export const propertyBoostMetricSchema = z.object({
  params: z.object({
    propertyId: objectIdSchema
  }),
  body: z.object({
    metric: z.enum(BOOST_METRIC_EVENTS)
  })
});

export const listPropertiesSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    businessType: z.enum(BUSINESS_TYPES).optional(),
    rentalArrangement: z.enum(RENTAL_ARRANGEMENTS).optional(),
    propertyType: z.enum(PROPERTY_TYPES).optional(),
    currency: z.enum(CURRENCIES).optional(),
    minPrice: numberField(),
    maxPrice: numberField(),
    bedrooms: integerField(),
    bathrooms: integerField(),
    parkingSpaces: integerField(),
    minConstructionArea: numberField(),
    maxConstructionArea: numberField(),
    minLotArea: numberField(),
    maxLotArea: numberField(),
    furnished: booleanField(),
    petsAllowed: booleanField(),
    depositRequired: booleanField(),
    featured: booleanField(),
    recent: booleanField(),
    marketStatus: z.enum(MARKET_STATUSES).optional(),
    privateRoom: booleanField(),
    privateBathroom: booleanField(),
    utilitiesIncluded: booleanField(),
    studentFriendly: booleanField(),
    province: z.string().optional(),
    canton: z.string().optional(),
    district: z.string().optional(),
    lat: numberField(),
    lng: numberField(),
    radiusKm: numberField(),
    bounds: jsonField(),
    polygon: jsonField(),
    page: integerField(),
    limit: integerField(),
    sort: z.enum(["relevance", "recent", "price-asc", "price-desc", "distance"]).optional()
  })
});

export const zoneSeoSchema = z.object({
  query: z.object({
    province: z.string().min(2).optional(),
    canton: z.string().min(2).optional(),
    district: z.string().min(2).optional(),
    limit: integerField()
  })
});
