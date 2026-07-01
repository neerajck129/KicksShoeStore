// backend/models/Order.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  name:     { type: String, required: true },
  image:    { type: String },
  price:    { type: Number, required: true },
  size:     { type: String, default: "" },
  quantity: { type: Number, required: true, default: 1 },
}, { _id: false });

const addressSchema = new mongoose.Schema ({
  name:         String,
  phone:        String,
  altPhone:     String,
  line1:        String,
  line2:        String,
  landmark:     String,
  city:         String,
  state:        String,
  pincode:      String,
  country:      { type: String, default: "India" },
  instructions: String,
  type:         { type: String, default: "Home" },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user:              { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  items:             [orderItemSchema],
  address:           addressSchema,

  subtotal:          { type: Number, required: true },
  shippingCharge:    { type: Number, default: 0 },
  discount:          { type: Number, default: 0 },
  total:             { type: Number, required: true },

  couponCode:        { type: String, default: "" },

  // Razorpay
  razorpayOrderId:   { type: String, required: true },
  razorpayPaymentId: { type: String, default: "" },
  razorpaySignature: { type: String, default: "" },

  status: {
    type:    String,
    enum:    ["pending", "paid", "processing", "shipped", "delivered", "cancelled"],
    default: "pending",
  },

  paidAt: Date,
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);

