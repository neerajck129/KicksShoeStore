// backend/controllers/orderController.js
import Razorpay from "razorpay";
import crypto   from "crypto";
import Order    from "../models/Order.js";
import Cart     from "../models/Cart.js";
import Product  from "../models/Product.js";

// Lazy-init so env vars are available when first called, not at module load
let _razorpay = null;
const getRazorpay = () => {
  if (!_razorpay) {
    _razorpay = new Razorpay({
      key_id:     process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return _razorpay;
};

// ── POST /api/orders/create ───────────────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const { address, subtotal, shippingCharge, discount, total, couponCode } = req.body;

    if (!address || !total)
      return res.status(400).json({ success: false, message: "Address and total are required" });

    const cart = await Cart.findOne({ user: req.user }).populate("items.product");
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ success: false, message: "Cart is empty" });

    const amountPaise   = Math.round(total * 100);
    const razorpayOrder = await getRazorpay().orders.create({
      amount:   amountPaise,
      currency: "INR",
      receipt:  `kiks_${Date.now()}`,
      notes:    { userId: String(req.user) },
    });

    const items = cart.items.map(i => ({
      product:  i.product._id,
      name:     i.product.name,
      image:    i.product.image,
      price:    i.product.price,
      size:     i.size || "",
      quantity: i.quantity,
    }));

    const order = await Order.create({
      user:            req.user,
      items,
      address,
      subtotal,
      shippingCharge:  shippingCharge || 0,
      discount:        discount       || 0,
      total,
      couponCode:      couponCode     || "",
      razorpayOrderId: razorpayOrder.id,
      status:          "pending",
    });

    res.json({
      success:   true,
      orderId:   razorpayOrder.id,
      amount:    amountPaise,
      currency:  "INR",
      dbOrderId: order._id,
      keyId:     process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
};

// ── POST /api/orders/verify ───────────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId } = req.body;

    const body     = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature)
      return res.status(400).json({ success: false, message: "Invalid payment signature" });

    // Update order — no populate needed, items are already snapshotted
    const order = await Order.findByIdAndUpdate(
      dbOrderId,
      {
        status:            "paid",
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt:            new Date(),
      },
      { new: true }
    );

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    // Reduce stock per size
    for (const item of order.items) {
      if (!item.product || !item.size) continue;
      await Product.updateOne(
        { _id: item.product, "sizes.size": item.size },
        { $inc: { "sizes.$.stock": -item.quantity } }
      );
    }

    // Clear cart
    await Cart.findOneAndUpdate({ user: req.user }, { $set: { items: [] } });

    // Dispatch cart cleared so header badge updates
    res.json({ success: true, order });
  } catch (err) {
    console.error("verifyPayment error:", err);
    res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

// ── GET /api/orders/my ────────────────────────────────────────────────────────
// Item fields (name, image, price, size, quantity) are stored as snapshots
// on the order document itself — no populate needed or wanted here.
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user })
      .sort({ createdAt: -1 })
      .lean();                     // plain JS objects, faster, no mongoose overhead
    res.json({ success: true, orders });
  } catch (err) {
    console.error("getMyOrders error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// ── GET /api/orders/admin/all  (admin) ────────────────────────────────────────
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email phone")
      .lean();
    res.json({ success: true, orders });
  } catch (err) {
    console.error("getAllOrders error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// ── PATCH /api/orders/admin/:id/status  (admin) ───────────────────────────────
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const VALID = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

    if (!VALID.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status" });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "name email");

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.json({ success: true, order });
  } catch (err) {
    console.error("updateOrderStatus error:", err);
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};