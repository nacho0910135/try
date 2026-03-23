import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";
import {
  SUBSCRIPTION_PLAN_NAMES,
  SUBSCRIPTION_STATUSES,
  USER_ROLES,
  VERIFICATION_STATUSES,
  VERIFICATION_TYPES
} from "../constants/enums.js";
import { buildDefaultSubscriptionForRole, COMMERCIAL_PLAN_CONFIG } from "../constants/plans.js";

const subscriptionSchema = new mongoose.Schema(
  {
    plan: {
      type: String,
      enum: SUBSCRIPTION_PLAN_NAMES,
      default: "free"
    },
    status: {
      type: String,
      enum: SUBSCRIPTION_STATUSES,
      default: "active"
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly"
    },
    monthlyPrice: {
      type: Number,
      default: 0
    },
    propertyLimit: {
      type: Number,
      default: 1
    },
    promotedSlots: {
      type: Number,
      default: 0
    },
    stripeCustomerId: {
      type: String,
      default: ""
    },
    stripeSubscriptionId: {
      type: String,
      default: ""
    },
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    },
    startedAt: Date,
    trialEndsAt: Date
  },
  { _id: false }
);

const verificationSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: VERIFICATION_STATUSES,
      default: "not-requested"
    },
    requestedType: {
      type: String,
      enum: VERIFICATION_TYPES,
      default: "identity"
    },
    requestedBadge: {
      type: String,
      default: ""
    },
    requestNote: {
      type: String,
      default: ""
    },
    requestedAt: Date,
    reviewedAt: Date,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reviewNote: {
      type: String,
      default: ""
    },
    verifiedAt: Date
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    phone: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "owner"
    },
    avatar: {
      type: String,
      default: ""
    },
    isActive: {
      type: Boolean,
      default: true
    },
    subscription: {
      type: subscriptionSchema,
      default: undefined
    },
    verification: {
      type: verificationSchema,
      default: undefined
    },
    passwordResetToken: {
      type: String,
      select: false
    },
    passwordResetExpires: {
      type: Date,
      select: false
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        return ret;
      }
    }
  }
);

userSchema.pre("validate", function applyCommercialDefaults(next) {
  const fallback = buildDefaultSubscriptionForRole(this.role);
  const planId = this.subscription?.plan || fallback.plan;
  const plan = COMMERCIAL_PLAN_CONFIG[planId] || COMMERCIAL_PLAN_CONFIG.free;

  this.subscription = {
    ...fallback,
    ...this.subscription,
    plan: plan.id,
    monthlyPrice: this.subscription?.monthlyPrice ?? plan.monthlyPrice,
    propertyLimit: this.subscription?.propertyLimit ?? plan.propertyLimit,
    promotedSlots: this.subscription?.promotedSlots ?? plan.promotedSlots
  };

  return next();
});

userSchema.pre("validate", function applyVerificationDefaults(next) {
  this.verification = {
    status: "not-requested",
    requestedType: "identity",
    requestedBadge: "",
    requestNote: "",
    reviewNote: "",
    ...this.verification
  };

  return next();
});

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function createPasswordResetToken() {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  this.passwordResetToken = hashedToken;
  this.passwordResetExpires = Date.now() + 1000 * 60 * 30;

  return resetToken;
};

export const User = mongoose.model("User", userSchema);
