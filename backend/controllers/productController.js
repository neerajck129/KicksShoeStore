// backend/controllers/productController.js
import Product from "../models/Product.js";
import Order   from "../models/Order.js";

const UK_SIZES = [
  "UK 6","UK 6.5","UK 7","UK 7.5","UK 8","UK 8.5",
  "UK 9","UK 9.5","UK 10","UK 10.5","UK 11","UK 11.5","UK 12",
];

// ── Helper: parse sizes from request body ────────────────────────────────────
const parseSizes = (raw) => {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(s => UK_SIZES.includes(s.size))
      .map(s => ({ size: s.size, stock: Math.max(0, Number(s.stock) || 0) }));
  } catch {
    return [];
  }
};

// ── GET all products ──────────────────────────────────────────────────────────
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

// ── GET admin overview ────────────────────────────────────────────────────────
export const getAdminOverview = async (req, res) => {
  try {
    const allProducts = await Product.find().lean();

    const totalProducts = allProducts.length;

    // Low stock: any product where totalStock <= 5
    const lowStockProducts = allProducts
      .map(p => ({
        ...p,
        totalStock: (p.sizes || []).reduce((s, sz) => s + sz.stock, 0),
      }))
      .filter(p => p.totalStock <= 5)
      .sort((a, b) => a.totalStock - b.totalStock)
      .slice(0, 10);

    const lowStock = {
      count: lowStockProducts.length,
      items: lowStockProducts.map(p => ({
        id:       p._id,
        name:     p.name,
        category: p.category,
        stock:    p.totalStock,
        sizes:    p.sizes || [],
      })),
    };

    // Category breakdown
    const catMap = {};
    allProducts.forEach(p => {
      const cat = p.category || "Uncategorized";
      catMap[cat] = (catMap[cat] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(catMap)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);

    // Top products by inventory value (price x totalStock)
    const maxValue = Math.max(
      1,
      ...allProducts.map(p =>
        p.price * (p.sizes || []).reduce((s, sz) => s + sz.stock, 0)
      )
    );

    const topProducts = allProducts
      .map(p => {
        const stock = (p.sizes || []).reduce((s, sz) => s + sz.stock, 0);
        const value = p.price * stock;
        return {
          name:     p.name,
          category: p.category,
          stock,
          price:    p.price,
          value,
          pct:      Math.round((value / maxValue) * 100),
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // Customer count
    const { default: User } = await import("../models/User.js");
    const totalCustomers = await User.countDocuments({ role: "user" });

    // ── Order stats ──────────────────────────────────────────────────────────
    const allOrders = await Order.find().lean();

    const totalOrders = allOrders.length;

    // Revenue = sum of `total` on paid/processing/shipped/delivered orders
    const PAID_STATUSES = ["paid", "processing", "shipped", "delivered"];
    const totalRevenue  = allOrders
      .filter(o => PAID_STATUSES.includes(o.status))
      .reduce((sum, o) => sum + (o.total || 0), 0);

    // Orders by status (for a mini breakdown)
    const ordersByStatus = allOrders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    // 5 most recent orders with just the fields Overview needs
    const recentOrders = await Order
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .lean();

    const recentOrdersSummary = recentOrders.map(o => ({
      id:         o._id,
      status:     o.status,
      total:      o.total,
      itemCount:  (o.items || []).length,
      createdAt:  o.createdAt,
      userName:   o.user?.name  || "Guest",
      userEmail:  o.user?.email || "",
    }));

    res.json({
      totalProducts,
      totalCustomers,
      lowStock,
      categoryBreakdown,
      topProducts,
      // order stats
      totalOrders,
      totalRevenue,
      ordersByStatus,
      recentOrders: recentOrdersSummary,
    });
  } catch (err) {
    console.error("Overview error:", err);
    res.status(500).json({ message: "Overview fetch failed" });
  }
};

// ── ADD product ───────────────────────────────────────────────────────────────
export const addProduct = async (req, res) => {
  try {
    const { name, price, category, brand, description, sizes: rawSizes } = req.body;
    const image = req.file ? req.file.path : "";
    const sizes = parseSizes(rawSizes);

    const product = await Product.create({
      name,
      price:       Number(price),
      category,
      brand,
      description,
      image,
      sizes,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("addProduct error:", err);
    res.status(500).json({ message: "Failed to add product" });
  }
};

// ── UPDATE product ────────────────────────────────────────────────────────────
export const updateProduct = async (req, res) => {
  try {
    const { name, price, category, brand, description, sizes: rawSizes } = req.body;
    const sizes = parseSizes(rawSizes);

    const updateData = {
      name,
      price:       Number(price),
      category,
      brand,
      description,
      sizes,
    };
    if (req.file) updateData.image = req.file.path;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    console.error("updateProduct error:", err);
    res.status(500).json({ message: "Failed to update product" });
  }
};

// ── DELETE product ────────────────────────────────────────────────────────────
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch {
    res.status(500).json({ message: "Failed to delete product" });
  }
};