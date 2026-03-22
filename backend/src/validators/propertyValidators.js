import { z } from "zod";
import {
  BUSINESS_TYPES,
  CURRENCIES,
  PROPERTY_STATUSES,
  PROPERTY_TYPES
} from "../constants/enums.js";
import {
  booleanField,
  integerField,
  jsonField,
  numberField,
  objectIdSchema
} from "./common.js";

const photoSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional().nullable(),
  isPrimary: z.boolean().optional(),
  alt: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional()
});

const propertyBodySchema = z.object({
  title: z.string().min(10).max(160),
  description: z.string().min(40).max(5000),
  businessType: z.enum(BUSINESS_TYPES),
  propertyType: z.enum(PROPERTY_TYPES),
  price: z.number().nonnegative(),
  currency: z.enum(CURRENCIES),
  bedrooms: z.number().int().nonnegative().default(0),
  bathrooms: z.number().int().nonnegative().default(0),
  parkingSpaces: z.number().int().nonnegative().default(0),
  constructionArea: z.number().nonnegative().default(0),
  lotArea: z.number().nonnegative().default(0),
  furnished: z.boolean().default(false),
  petsAllowed: z.boolean().default(false),
  featured: z.boolean().optional(),
  amenities: z.array(z.string()).default([]),
  photos: z.array(photoSchema).default([]),
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
  status: z.enum(PROPERTY_STATUSES).default("draft")
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

export const listPropertiesSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    businessType: z.enum(BUSINESS_TYPES).optional(),
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
    featured: booleanField(),
    recent: booleanField(),
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
    sort: z.enum(["relevance", "recent", "price-asc", "price-desc"]).optional()
  })
});

