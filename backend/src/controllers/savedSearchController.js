import { savedSearchService } from "../services/savedSearchService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listSavedSearches = asyncHandler(async (req, res) => {
  const items = await savedSearchService.list(req.user);
  res.json({ success: true, items });
});

export const createSavedSearch = asyncHandler(async (req, res) => {
  const item = await savedSearchService.create(req.user, req.body);
  res.status(201).json({ success: true, item });
});

export const updateSavedSearch = asyncHandler(async (req, res) => {
  const item = await savedSearchService.update(req.user, req.params.searchId, req.body);
  res.json({ success: true, item });
});

export const sendSavedSearchAlert = asyncHandler(async (req, res) => {
  const result = await savedSearchService.sendAlertEmail(req.user, req.params.searchId);
  res.json({ success: true, result });
});

export const deleteSavedSearch = asyncHandler(async (req, res) => {
  await savedSearchService.remove(req.user, req.params.searchId);
  res.json({ success: true, message: "Saved search removed" });
});
