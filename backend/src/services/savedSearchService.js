import { SavedSearch } from "../models/SavedSearch.js";
import { ApiError } from "../utils/apiError.js";

export const savedSearchService = {
  async list(user) {
    return SavedSearch.find({ user: user._id }).sort({ createdAt: -1 });
  },

  async create(user, payload) {
    return SavedSearch.create({
      user: user._id,
      ...payload
    });
  },

  async update(user, searchId, payload) {
    const savedSearch = await SavedSearch.findOne({ _id: searchId, user: user._id });

    if (!savedSearch) {
      throw new ApiError(404, "Saved search not found");
    }

    Object.assign(savedSearch, payload);
    await savedSearch.save();

    return savedSearch;
  },

  async remove(user, searchId) {
    const deleted = await SavedSearch.findOneAndDelete({ _id: searchId, user: user._id });

    if (!deleted) {
      throw new ApiError(404, "Saved search not found");
    }

    return { success: true };
  }
};

