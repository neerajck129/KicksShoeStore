// backend/models/Product.js
import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema({
  size:  { type: String, required: true }, // "UK 6", "UK 6.5", etc.
  stock: { type: Number, default: 0, min: 0 },
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true },
    price:       { type: Number, required: true },
    category:    { type: String },
    brand:       { type: String },
    image:       { type: String },
    description: { type: String },

    // ── Sizes with individual stock ──────────────────────────────────────────
    sizes: {
      type:    [sizeSchema],
      default: [],
    },

    // ── Computed helpers (kept for backward compat, auto-derived on save) ────
    // totalStock  → sum of all size stocks
    // isOutOfStock → true when every size has stock === 0
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// Virtual: total stock across all sizes
productSchema.virtual("totalStock").get(function () {
  return this.sizes.reduce((sum, s) => sum + (s.stock || 0), 0);
});

// Virtual: true when every size is 0 (or no sizes defined)
productSchema.virtual("isOutOfStock").get(function () {
  if (!this.sizes.length) return true;
  return this.sizes.every(s => s.stock === 0);
});

export default mongoose.model("Product", productSchema);