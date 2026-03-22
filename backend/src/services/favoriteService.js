import { Favorite } from "../models/Favorite.js";
import { Property } from "../models/Property.js";
import { ApiError } from "../utils/apiError.js";

const isPubliclyVisibleProperty = (property) =>
  Boolean(property) &&
  property.status === "published" &&
  property.isApproved &&
  (property.marketStatus || "available") !== "inactive";

export const favoriteService = {
  async list(user) {
    const favorites = await Favorite.find({ user: user._id })
      .populate({
        path: "property",
        populate: {
          path: "owner",
          select: "name phone avatar role"
        }
      })
      .sort({ createdAt: -1 });

    return favorites.filter((favorite) => isPubliclyVisibleProperty(favorite.property));
  },

  async add(user, propertyId) {
    const property = await Property.findById(propertyId);

    if (!isPubliclyVisibleProperty(property)) {
      throw new ApiError(404, "Property not found");
    }

    const existing = await Favorite.findOne({ user: user._id, property: propertyId });

    if (!existing) {
      await Favorite.create({ user: user._id, property: propertyId });
      await Property.updateOne({ _id: propertyId }, { $inc: { "engagement.favorites": 1 } });
    }

    return { success: true };
  },

  async remove(user, propertyId) {
    const deleted = await Favorite.findOneAndDelete({ user: user._id, property: propertyId });

    if (deleted) {
      await Property.updateOne(
        { _id: propertyId },
        { $inc: { "engagement.favorites": -1 } }
      );
    }

    return { success: true };
  }
};
