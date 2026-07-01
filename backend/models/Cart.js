// backend/models/Cart.js
import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
      size:     { type: String, default: "" },  // e.g. "UK 8"
    }
  ]
});

export default mongoose.model("Cart", cartSchema);