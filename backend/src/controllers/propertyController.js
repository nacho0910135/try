import { propertyService } from "../services/propertyService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const listProperties = asyncHandler(async (req, res) => {
  const data = await propertyService.list(req.query);
  res.json({ success: true, ...data });
});

export const listFeaturedProperties = asyncHandler(async (_req, res) => {
  const items = await propertyService.listFeatured();
  res.json({ success: true, items });
});

export const getPropertyBySlug = asyncHandler(async (req, res) => {
  const property = await propertyService.getBySlug(req.params.slug, req.user);
  res.json({ success: true, property });
});

export const getManageProperty = asyncHandler(async (req, res) => {
  const property = await propertyService.getManageProperty(req.params.propertyId, req.user);
  res.json({ success: true, property });
});

export const listMyProperties = asyncHandler(async (req, res) => {
  const items = await propertyService.listMine(req.user);
  res.json({ success: true, items });
});

export const createProperty = asyncHandler(async (req, res) => {
  const property = await propertyService.create(req.user, req.body);
  res.status(201).json({ success: true, property });
});

export const updateProperty = asyncHandler(async (req, res) => {
  const property = await propertyService.update(req.params.propertyId, req.user, req.body);
  res.json({ success: true, property });
});

export const updatePropertyStatus = asyncHandler(async (req, res) => {
  const property = await propertyService.updateStatus(
    req.params.propertyId,
    req.user,
    req.body.status
  );

  res.json({ success: true, property });
});

export const updatePropertyFeatured = asyncHandler(async (req, res) => {
  const property = await propertyService.updateFeatured(
    req.params.propertyId,
    req.user,
    req.body.featured
  );

  res.json({ success: true, property });
});

export const deleteProperty = asyncHandler(async (req, res) => {
  await propertyService.remove(req.params.propertyId, req.user);
  res.json({ success: true, message: "Property deleted" });
});
