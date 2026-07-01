import Wishlist from "../models/Wishlist.js";

export const toggleWishlist = async (req, res) => {
  const { productId } = req.body;

  let wishlist = await Wishlist.findOne({ user: req.user });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user,
      products: [productId]
    });
  } else {
    const exists = wishlist.products.includes(productId);

    if (exists) {
      wishlist.products = wishlist.products.filter(
        p => p.toString() !== productId
      );
    } else {
      wishlist.products.push(productId);
    }

    await wishlist.save();
  }

  res.json(wishlist);
};

export const getWishlist = async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user }).populate("products");
  res.json(wishlist);
};