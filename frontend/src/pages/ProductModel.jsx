// backend/config/cloudinary.js
// ─────────────────────────────────────────────────────────────────────────────
// Setup:
//   npm install cloudinary multer multer-storage-cloudinary
//
// Add to your .env:
//   CLOUDINARY_CLOUD_NAME=your_cloud_name
//   CLOUDINARY_API_KEY=your_api_key
//   CLOUDINARY_API_SECRET=your_api_secret
// ─────────────────────────────────────────────────────────────────────────────

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         "kiks-products",          // folder name in your Cloudinary dashboard
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 800, crop: "limit", quality: "auto" }],
  },
});

export const upload = multer({ storage });     // use as: upload.single("image")
export default cloudinary;