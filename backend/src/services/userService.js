import { Favorite } from "../models/Favorite.js";
import { Lead } from "../models/Lead.js";
import { Property } from "../models/Property.js";
import { SavedSearch } from "../models/SavedSearch.js";

export const userService = {
  async getDashboardSummary(user) {
    const [properties, leadsReceived, leadsSent, favorites, savedSearches] = await Promise.all([
      Property.countDocuments({ owner: user._id }),
      Lead.countDocuments({ toUser: user._id }),
      Lead.countDocuments({ fromUser: user._id }),
      Favorite.countDocuments({ user: user._id }),
      SavedSearch.countDocuments({ user: user._id })
    ]);

    return {
      properties,
      leadsReceived,
      leadsSent,
      favorites,
      savedSearches
    };
  }
};
