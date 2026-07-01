// backend/routes/orderRoutes.js
import express from "express";
import {
  createOrder,
  verifyPayment,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

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

// User routes
router.post("/create",              protect,              createOrder);
router.post("/verify",              protect,              verifyPayment);
router.get ("/my",                  protect,              getMyOrders);

// Admin routes
router.get ("/admin/all",           protect, adminOnly,   getAllOrders);
router.patch("/admin/:id/status",   protect, adminOnly,   updateOrderStatus);

export default router;