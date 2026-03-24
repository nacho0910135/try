import crypto from "crypto";
import { primaryFrontendUrl } from "../config/env.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/apiError.js";
import { generateToken } from "../utils/jwt.js";
import { mailService } from "./mailService.js";
import { notificationService } from "./notificationService.js";

const buildAuthPayload = (user) => ({
  user,
  token: generateToken({
    sub: user._id.toString(),
    role: user.role
  })
});

const normalizeCommercialRole = async (user) => {
  if (!user || user.role !== "user") {
    return user;
  }

  user.role = "owner";
  await user.save();
  return user;
};

export const authService = {
  async register(payload) {
    const existingUser = await User.findOne({ email: payload.email.toLowerCase() });

    if (existingUser) {
      throw new ApiError(409, "An account with that email already exists");
    }

    const user = await User.create({
      ...payload,
      role:
        !payload.role || payload.role === "admin" || payload.role === "user"
          ? "owner"
          : payload.role,
      email: payload.email.toLowerCase()
    });

    return buildAuthPayload(user);
  },

  async login({ email, password }) {
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, "Invalid email or password");
    }

    if (!user.isActive) {
      throw new ApiError(403, "This account is inactive");
    }

    const normalizedUser = await normalizeCommercialRole(user);
    const sanitizedUser = await User.findById(normalizedUser._id);
    return buildAuthPayload(sanitizedUser);
  },

  async getCurrentUser(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    return normalizeCommercialRole(user);
  },

  async updateProfile(userId, payload) {
    const user = await User.findById(userId).select("+password");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (payload.name !== undefined) user.name = payload.name;
    if (payload.phone !== undefined) user.phone = payload.phone;
    if (payload.avatar !== undefined) user.avatar = payload.avatar;
    if (payload.password) user.password = payload.password;

    await user.save();

    return User.findById(user._id);
  },

  async requestPasswordReset(email) {
    if (!mailService.isConfigured()) {
      throw new ApiError(503, "Password recovery is temporarily unavailable");
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+passwordResetToken +passwordResetExpires"
    );

    if (!user) {
      return {
        message:
          "If the email exists, we will send password recovery instructions."
      };
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${primaryFrontendUrl.replace(/\/$/, "")}/reset-password?token=${resetToken}`;
    const emailResult = await notificationService.sendPasswordReset({
      user,
      resetUrl
    });

    if (!emailResult.delivered) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      throw new ApiError(503, "Password recovery is temporarily unavailable");
    }

    return {
      message:
        "If the email exists, we will send password recovery instructions."
    };
  },

  async resetPassword({ token, password }) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() }
    }).select("+password +passwordResetToken +passwordResetExpires");

    if (!user) {
      throw new ApiError(400, "Reset token is invalid or expired");
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    const sanitizedUser = await User.findById(user._id);
    return buildAuthPayload(sanitizedUser);
  }
};
