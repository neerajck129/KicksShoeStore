// backend/controllers/cartController.js
import Cart from "../models/Cart.js";

// ── Add to cart ───────────────────────────────────────────────────────────────
export const addToCart = async (req, res) => {
  try {
    const { productId, size = "" } = req.body;
    let cart = await Cart.findOne({ user: req.user });

    if (!cart) {
      cart = await Cart.create({
        user:  req.user,
        items: [{ product: productId, quantity: 1, size }],
      });
    } else {
      // Match by both product AND size — UK 8 and UK 9 are separate line items
      const item = cart.items.find(
        (i) => i.product.toString() === productId && i.size === size
      );
      if (item) {
        item.quantity += 1;
      } else {
        cart.items.push({ product: productId, quantity: 1, size });
      }
      await cart.save();
    }

    await cart.populate("items.product");
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to add item", error: err.message });
  }
};

// ── Get cart ──────────────────────────────────────────────────────────────────
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user }).populate("items.product");
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cart", error: err.message });
  }
};

// ── Update quantity ───────────────────────────────────────────────────────────
export const updateCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, size = "" } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ user: req.user });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.product.toString() === productId && i.size === size
    );
    if (!item) return res.status(404).json({ message: "Item not in cart" });

    item.quantity = quantity;
    await cart.save();
    await cart.populate("items.product");
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to update quantity", error: err.message });
  }
};

// ── Remove item ───────────────────────────────────────────────────────────────
export const removeCartItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const size = req.query.size || "";

    const cart = await Cart.findOne({ user: req.user });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const before = cart.items.length;
    cart.items = cart.items.filter(
      (i) => !(i.product.toString() === productId && i.size === size)
    );

    if (cart.items.length === before) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    await cart.save();
    await cart.populate("items.product");
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to remove item", error: err.message });
  }
};