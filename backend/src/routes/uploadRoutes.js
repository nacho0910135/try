import multer from "multer";
import { Router } from "express";
import { uploadImages } from "../controllers/uploadController.js";
import { authorize, requireAuth } from "../middlewares/authMiddleware.js";
import { uploadImagesLimiter } from "../middlewares/rateLimiters.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: 12,
    fileSize: 8 * 1024 * 1024
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      return callback(new Error("Only image uploads are allowed"));
    }

    return callback(null, true);
  }
});

export const uploadRoutes = Router();

uploadRoutes.use(requireAuth, authorize("agent", "owner", "admin"));
uploadRoutes.post("/images", uploadImagesLimiter, upload.array("images", 12), uploadImages);
