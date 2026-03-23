import { verifyToken } from "../utils/jwt.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/User.js";

const extractToken = (authorizationHeader = "") => {
  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.replace("Bearer ", "").trim();
};

const normalizeLegacyUserRole = async (user) => {
  if (!user || user.role !== "user") {
    return user;
  }

  user.role = "owner";
  await user.save();
  return user;
};

export const requireAuth = async (req, _res, next) => {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub);

    if (!user || !user.isActive) {
      throw new ApiError(401, "Session is no longer valid");
    }

    req.user = await normalizeLegacyUserRole(user);
    next();
  } catch (error) {
    next(error instanceof ApiError ? error : new ApiError(401, "Invalid authentication token"));
  }
};

export const optionalAuth = async (req, _res, next) => {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return next();
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub);

    if (user?.isActive) {
      req.user = await normalizeLegacyUserRole(user);
    }

    next();
  } catch (_error) {
    next();
  }
};

export const authorize = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Authentication required"));
  }

  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, "You do not have access to this resource"));
  }

  return next();
};
