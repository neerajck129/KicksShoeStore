// backend/routes/productRoutes.js
import express from "express";
import {
  getProducts,
  getAdminOverview,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinary.js";
import User from "../models/User.js";

const router = express.Router();

// ── inline adminOnly (as per project pattern) ─────────────────────────────────
const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (!user || user.role !== "admin")
      return res.status(403).json({ success: false, message: "Admin access only" });
    next();
  } catch {
    res.status(500).json({ success: false, message: "Auth check failed" });
  }
};

// ── Routes ────────────────────────────────────────────────────────────────────
// ⚠️  /admin/overview MUST come before /:id  — "admin" would be treated as an ID otherwise
router.get("/admin/overview", protect, adminOnly, getAdminOverview);

router.get("/", getProducts);

// upload.single("image") parses the multipart body and uploads the file to Cloudinary
// req.file.path will contain the resulting Cloudinary URL
router.post("/",      protect, adminOnly, upload.single("image"), addProduct);
router.put("/:id",    protect, adminOnly, upload.single("image"), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;