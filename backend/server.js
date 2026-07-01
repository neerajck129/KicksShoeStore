import dotenv from "dotenv";
dotenv.config();

// 🚨 REMOVE these two lines — never log secrets to console
// console.log("KEY:", process.env.RAZORPAY_KEY_ID);
// console.log("SECRET:", process.env.RAZORPAY_KEY_SECRET);

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

connectDB();

const app = express();

// ── Allowed Origins ──────────────────────────────────────────────────────────
const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map(o => o.trim())
  : ["http://localhost:5173", "http://localhost:5174"];

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: 78888${origin} is not allowed`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart",     cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/users",    userRoutes);
app.use("/api/orders",   orderRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/", (_req, res) => res.send("KIKS API Running 🚀"));

// ── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) =>
  res.status(404).json({ success: false, message: "Route not found" })
);

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("❌", err.message);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
