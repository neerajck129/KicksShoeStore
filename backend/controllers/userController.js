import mongoose from "mongoose";
import User from "../models/User.js";

// ── Helper: format join date ──────────────────────────────────────────────────
const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day:   "numeric",
    year:  "numeric",
  });

// ── GET /api/users/admin/customers ────────────────────────────────────────────
// Returns all non-admin users enriched with order count + total spent.
// Requires: admin JWT (enforced in route middleware)
export const getAllCustomers = async (_req, res, next) => {
  try {
    // 1. Fetch every non-admin user (exclude password)
    const users = await User.find({ role: "user" })
      .select("-password")
      .lean();

    // Shape response to match the frontend's expected fields
    // orders + spent will be real numbers once you add an Order model
    const customers = users.map((u) => ({
      id:     String(u._id),
      name:   u.name,
      email:  u.email,
      phone:  u.phone  || "",
      city:   u.city   || "",
      joined: formatDate(u.createdAt),
      orders: 0,
      spent:  0,
      status: u.status ?? "active",
    }));

    res.json({ success: true, customers });
  } catch (err) {
    next(err);
  }
};

// ── PATCH /api/users/admin/customers/:id/toggle-block ────────────────────────
// Toggles a user's status between "blocked" and "active".
// Requires: admin JWT
export const toggleBlockUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    if (user.role === "admin") {
      return res.status(403).json({ success: false, message: "Cannot block an admin" });
    }

    user.status = user.status === "blocked" ? "active" : "blocked";
    await user.save();

    res.json({
      success: true,
      message: `User ${user.status === "blocked" ? "blocked" : "unblocked"} successfully`,
      status:  user.status,
    });
  } catch (err) {
    next(err);
  }
};