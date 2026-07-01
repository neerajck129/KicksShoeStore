import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add",          protect, addToCart);
router.get("/",              protect, getCart);
router.put("/:productId",    protect, updateCartItem);   // ← NEW
router.delete("/:productId", protect, removeCartItem);   // ← NEW

export default router;