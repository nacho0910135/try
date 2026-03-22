import { uploadService } from "../services/uploadService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const uploadImages = asyncHandler(async (req, res) => {
  const items = await uploadService.uploadImages(req.files);
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const normalizedItems = items.map((item) => ({
    ...item,
    url: item.url?.startsWith("http") || item.url?.startsWith("data:")
      ? item.url
      : `${baseUrl}${item.url}`
  }));

  res.status(201).json({ success: true, items: normalizedItems });
});
