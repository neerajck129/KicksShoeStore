import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import Product from "./models/Product.js";

dotenv.config();
connectDB();

const products = [
  // 🔥 FEATURED
  {
    name: "APEX RUN PRO",
    price: 189,
    category: "featured",
    brand: "KIKS",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    stock: 10,
    description: "Premium running shoe"
  },
  {
    name: "URBAN GLIDE X",
    price: 149,
    category: "featured",
    brand: "KIKS",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773d3028",
    stock: 10,
    description: "Street sneaker"
  },
  {
    name: "CLOUDSTEP 4",
    price: 169,
    category: "featured",
    brand: "KIKS",
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb",
    stock: 10,
    description: "Comfort lifestyle shoe"
  },
  {
    name: "DASH ELITE",
    price: 219,
    category: "featured",
    brand: "KIKS",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a",
    stock: 10,
    description: "Elite performance shoe"
  },

  // 🔥 MEN
  {
    name: "STREET KING II",
    price: 159,
    category: "men",
    brand: "KIKS",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa",
    stock: 10,
    description: "Street style sneaker"
  },
  {
    name: "TRAIL BLAZER",
    price: 179,
    category: "men",
    brand: "KIKS",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    stock: 10,
    description: "Outdoor running shoe"
  },
  {
    name: "BLAZE MAX OG",
    price: 199,
    category: "men",
    brand: "KIKS",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773d3028",
    stock: 10,
    description: "Classic sneaker"
  },
  {
    name: "CEMENT LOW",
    price: 139,
    category: "men",
    brand: "KIKS",
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb",
    stock: 10,
    description: "Low-top casual shoe"
  },

  // 🔥 WOMEN
  {
    name: "PEARL DRIFT",
    price: 169,
    category: "women",
    brand: "KIKS",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a",
    stock: 10,
    description: "Elegant sneaker"
  },
  {
    name: "VELVET STRIDE",
    price: 149,
    category: "women",
    brand: "KIKS",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa",
    stock: 10,
    description: "Soft comfort shoe"
  },
  {
    name: "FLORA LITE",
    price: 129,
    category: "women",
    brand: "KIKS",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    stock: 10,
    description: "Lightweight sneaker"
  },
  {
    name: "AURA BOOST",
    price: 189,
    category: "women",
    brand: "KIKS",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773d3028",
    stock: 10,
    description: "Boost performance shoe"
  },

  // 🔥 KIDS
  {
    name: "MINI ROCKET",
    price: 79,
    category: "kids",
    brand: "KIKS",
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb",
    stock: 10,
    description: "Kids running shoe"
  },
  {
    name: "ASTRO JUMP",
    price: 89,
    category: "kids",
    brand: "KIKS",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a",
    stock: 10,
    description: "Jump sneaker"
  },
  {
    name: "BOLT JR",
    price: 69,
    category: "kids",
    brand: "KIKS",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa",
    stock: 10,
    description: "Sporty kids shoe"
  },
  {
    name: "GLOW RUNNER",
    price: 99,
    category: "kids",
    brand: "KIKS",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    stock: 10,
    description: "Glow style sneaker"
  }
];

const importData = async () => {
  try {
    await Product.deleteMany();
    await Product.insertMany(products);

    console.log("✅ ALL PRODUCTS IMPORTED");
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

importData();