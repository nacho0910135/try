import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDirectory = path.resolve(__dirname, "../../public/uploads/properties");

const sanitizeFileSegment = (value = "") =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

const saveBufferLocally = async (file, index) => {
  const title = file.originalname?.replace(/\.[^/.]+$/, "") || `propiedad-${index + 1}`;
  const extensionFromName = path.extname(file.originalname || "");
  const extensionFromMime = file.mimetype?.split("/")?.[1]?.split("+")?.[0] || "jpg";
  const extension = (extensionFromName || `.${extensionFromMime}`).toLowerCase();
  const safeName = sanitizeFileSegment(title) || `propiedad-${index + 1}`;
  const fileName = `${Date.now()}-${crypto.randomUUID()}-${safeName}${extension}`;
  const filePath = path.join(uploadsDirectory, fileName);

  await fs.mkdir(uploadsDirectory, { recursive: true });
  await fs.writeFile(filePath, file.buffer);

  return {
    url: `/uploads/properties/${fileName}`,
    publicId: null,
    isPrimary: index === 0,
    alt: title,
    width: undefined,
    height: undefined
  };
};

const uploadBufferToCloudinary = (file, index) => {
  const base64 = file.buffer.toString("base64");

  return cloudinary.uploader
    .upload(`data:${file.mimetype};base64,${base64}`, {
      folder: "alquiventascr/properties",
      resource_type: "image",
      use_filename: true,
      unique_filename: true,
      overwrite: false
    })
    .then((result) => ({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      isPrimary: index === 0,
      alt: file.originalname?.replace(/\.[^/.]+$/, "") || "Propiedad AlquiVentasCR"
    }));
};

export const uploadService = {
  async uploadImages(files = []) {
    if (!files.length) {
      return [];
    }

    if (!isCloudinaryConfigured) {
      return Promise.all(files.map((file, index) => saveBufferLocally(file, index)));
    }

    return Promise.all(files.map((file, index) => uploadBufferToCloudinary(file, index)));
  }
};
