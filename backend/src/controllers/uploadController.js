import { uploadService } from "../services/uploadService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const uploadImages = asyncHandler(async (req, res) => {
  const items = await uploadService.uploadImages(req.files);
  res.status(201).json({ success: true, items });
});
