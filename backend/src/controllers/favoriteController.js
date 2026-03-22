import { favoriteService } from "../services/favoriteService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listFavorites = asyncHandler(async (req, res) => {
  const items = await favoriteService.list(req.user);
  res.json({ success: true, items });
});

export const addFavorite = asyncHandler(async (req, res) => {
  const result = await favoriteService.add(req.user, req.params.propertyId);
  res.status(201).json({ success: true, ...result });
});

export const removeFavorite = asyncHandler(async (req, res) => {
  const result = await favoriteService.remove(req.user, req.params.propertyId);
  res.json({ success: true, ...result });
});

