import express from "express";
import { getAllCustomers, toggleBlockUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

// Inline admin guard — checks the userId set by protect() against DB role
const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access only" });
    }
    next();
  } catch {
    res.status(500).json({ success: false, message: "Auth check failed" });
  }
};

const router = express.Router();

router.get(  "/admin/customers",                  protect, adminOnly, getAllCustomers);
router.patch("/admin/customers/:id/toggle-block", protect, adminOnly, toggleBlockUser);

export default router;