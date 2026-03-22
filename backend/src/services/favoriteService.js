import { Favorite } from "../models/Favorite.js";
import { Property } from "../models/Property.js";
import { ApiError } from "../utils/apiError.js";

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

    return favorites.filter((favorite) => favorite.property);
  },

  async add(user, propertyId) {
    const property = await Property.findById(propertyId);

    if (!property || property.status !== "published" || !property.isApproved) {
      throw new ApiError(404, "Property not found");
    }

    await Favorite.findOneAndUpdate(
      { user: user._id, property: propertyId },
      { user: user._id, property: propertyId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return { success: true };
  },

  async remove(user, propertyId) {
    await Favorite.findOneAndDelete({ user: user._id, property: propertyId });
    return { success: true };
  }
};

