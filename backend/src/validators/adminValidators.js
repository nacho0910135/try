import { z } from "zod";
import { PROPERTY_STATUSES, USER_ROLES, VERIFICATION_STATUSES } from "../constants/enums.js";
import {
  booleanField,
  integerField,
  objectIdSchema
} from "./common.js";

export const listAdminUsersSchema = z.object({
  query: z.object({
    page: integerField(),
    limit: integerField(),
    q: z.string().optional(),
    role: z.enum(USER_ROLES).optional(),
    isActive: booleanField()
  })
});

export const listAdminPropertiesSchema = z.object({
  query: z.object({
    page: integerField(),
    limit: integerField(),
    q: z.string().optional(),
    status: z.enum(PROPERTY_STATUSES).optional(),
    isApproved: booleanField()
  })
});

export const moderatePropertySchema = z.object({
  params: z.object({
    propertyId: objectIdSchema
  }),
  body: z.object({
    isApproved: z.boolean().optional(),
    featured: z.boolean().optional(),
    status: z.enum(PROPERTY_STATUSES).optional(),
    moderationNote: z.string().max(300).optional()
  })
});

export const updateUserStatusSchema = z.object({
  params: z.object({
    userId: objectIdSchema
  }),
  body: z.object({
    isActive: z.boolean()
  })
});

export const updateUserVerificationSchema = z.object({
  params: z.object({
    userId: objectIdSchema
  }),
  body: z.object({
    status: z.enum(VERIFICATION_STATUSES.filter((status) => status !== "not-requested")),
    reviewNote: z.string().max(300).optional()
  })
});

export const analyticsPropertySchema = z.object({
  params: z.object({
    propertyId: objectIdSchema
  })
});
