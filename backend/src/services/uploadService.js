import { cloudinary, isCloudinaryConfigured } from "../config/cloudinary.js";

const makePlaceholderPhoto = (file, index) => {
  const title = encodeURIComponent(file.originalname?.replace(/\.[^/.]+$/, "") || `propiedad-${index + 1}`);

  return {
    url: `https://placehold.co/1200x800/png?text=${title}`,
    publicId: null,
    isPrimary: index === 0,
    alt: file.originalname?.replace(/\.[^/.]+$/, "") || "Propiedad Costa Rica"
  };
};

const uploadBufferToCloudinary = (file, index) => {
  const base64 = file.buffer.toString("base64");

  return cloudinary.uploader
    .upload(`data:${file.mimetype};base64,${base64}`, {
      folder: "casa-cr/properties",
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
      alt: file.originalname?.replace(/\.[^/.]+$/, "") || "Propiedad Costa Rica"
    }));
};

export const uploadService = {
  async uploadImages(files = []) {
    if (!files.length) {
      return [];
    }

    if (!isCloudinaryConfigured) {
      return files.map((file, index) => makePlaceholderPhoto(file, index));
    }

    return Promise.all(files.map((file, index) => uploadBufferToCloudinary(file, index)));
  }
};
