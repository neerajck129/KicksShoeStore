// src/components/ProductModal.jsx  (customer-facing)
import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const COLOR_OPTIONS = [
  { bg: "#e8e8e8", name: "White / White" },
  { bg: "#1a1a1a", name: "Black / Black" },
  { bg: "#1e3a5f", name: "Navy / White"  },
  { bg: "#3b1a1a", name: "Red / Black"   },
  { bg: "#2d4a1e", name: "Olive / White" },
];

const TABS = ["Details", "Specs", "Shipping"];

export default function ProductModal({ product, onClose }) {
  const [activeImg,     setActiveImg]     = useState(0);
  const [selectedSize,  setSelectedSize]  = useState(null);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].name);
  const [activeTab,     setActiveTab]     = useState("Details");
  const [wishlisted,    setWishlisted]    = useState(false);
  const [cartAdded,     setCartAdded]     = useState(false);
  const [sizeError,     setSizeError]     = useState(false);

  if (!product) return null;

  const productSizes  = product.sizes || [];
  const hasSizes      = productSizes.length > 0;
  const totalStock    = productSizes.reduce((s, sz) => s + sz.stock, 0);
  const isGlobalOOS   = hasSizes && totalStock === 0;

  const selectedSizeData = productSizes.find(s => s.size === selectedSize);
  const selectedStock    = selectedSizeData?.stock ?? 0;
  const selectedSizeOOS  = selectedSize && selectedStock === 0;

  const images = product.images?.length
    ? product.images
    : [product.image, product.image, product.image, product.image];

  const handleAddToCart = async () => {
    if (hasSizes && !selectedSize) {
      setSizeError(true);
      setTimeout(() => setSizeError(false), 2500);
      return;
    }
    if (selectedSizeOOS) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) { setSizeError(true); return; }
      await axios.post(
        `${API}/api/cart/add`,
        { productId: product._id, size: selectedSize || "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartAdded(true);
      const count = parseInt(localStorage.getItem("cartCount") || "0") + 1;
      localStorage.setItem("cartCount", count);
      window.dispatchEvent(new Event("cartUpdated"));
      setTimeout(() => setCartAdded(false), 1800);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWishlist = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.post(
        `${API}/api/wishlist/toggle`,
        { productId: product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setWishlisted(w => !w);
      const wc = parseInt(localStorage.getItem("wishlistCount") || "0");
      localStorage.setItem("wishlistCount", wishlisted ? wc - 1 : wc + 1);
      window.dispatchEvent(new Event("wishlistUpdated"));
    } catch (err) {
      console.error(err);
    }
  };

  const cartBtnDisabled = isGlobalOOS || selectedSizeOOS;
  const cartBtnLabel = isGlobalOOS ? "OUT OF STOCK"
    : !selectedSize && hasSizes ? "SELECT A SIZE"
    : selectedSizeOOS ? "SIZE OUT OF STOCK"
    : cartAdded ? "ADDED TO CART!"
    : "ADD TO CART";
  const cartBtnBg = isGlobalOOS || selectedSizeOOS ? "#333"
    : cartAdded ? "#22c55e"
    : sizeError ? "#ef4444"
    : "#ff4f1f";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-[860px] bg-[#111] border border-white/8
                      rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 max-h-[90vh]">

        <button onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center
                     rounded-full bg-[#1a1a1a] border border-white/8 text-white/50
                     hover:border-white hover:text-white transition-all">✕</button>

        {/* LEFT */}
        <div className="bg-[#0f0f0f] border-r border-white/8 p-6 flex flex-col gap-4">
          <div className="relative rounded-xl overflow-hidden flex items-center justify-center h-64"
               style={{ background: product.bg || "#1e3a5f" }}>
            {product.tag && (
              <span className="absolute top-3 left-3 bg-[#ff4f1f] text-white text-[10px]
                               font-black tracking-widest px-2 py-1 rounded">
                {product.tag.toUpperCase()}
              </span>
            )}
            {isGlobalOOS && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                <span className="bg-red-500 text-white text-xs font-black uppercase tracking-widest px-4 py-2 rounded-sm">
                  Out of Stock
                </span>
              </div>
            )}
            <img src={images[activeImg] || product.image} alt={product.name}
                 onError={e => (e.target.src = "https://via.placeholder.com/200x120/1e3a5f/white?text=KIKS")}
                 className="h-48 object-contain transition-transform duration-300 hover:scale-105 hover:-translate-y-1"
                 style={{ filter: "drop-shadow(0 12px 32px rgba(0,0,0,0.6))" }} />
          </div>

          <div className="grid grid-cols-4 gap-2">
            {images.slice(0, 4).map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)}
                className={`h-16 rounded-lg flex items-center justify-center border transition-all
                            ${activeImg === i ? "border-[#ff4f1f] bg-[#1a1a1a]" : "border-white/8 bg-[#1a1a1a] hover:border-[#ff4f1f]/60"}`}>
                <img src={img} alt={`view-${i}`} onError={e => (e.target.style.display = "none")}
                     className="h-10 object-contain" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))" }} />
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {["Free shipping","7-day returns","Authentic"].map(t => (
              <span key={t} className="flex items-center gap-1.5 text-[11px] text-white/50
                                       bg-[#1a1a1a] border border-white/8 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff4f1f] inline-block" />{t}
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="p-6 flex flex-col gap-4 overflow-y-auto">
          <div>
            <p className="text-[11px] tracking-[3px] uppercase text-[#ff4f1f] mb-1">
              {product.brand} · {product.category}
            </p>
            <h2 className="font-['Bebas_Neue'] text-4xl tracking-wide leading-none text-white">
              {product.name}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-['Bebas_Neue'] text-3xl text-[#ff4f1f]">
              ₹{Number(product.price).toLocaleString()}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-white/40 line-through">₹{product.originalPrice}</span>
            )}
            <div className="h-4 w-px bg-white/10" />
            <span className="text-amber-400 text-sm">★★★★★</span>
            <span className="text-white/40 text-xs">4.8 (240)</span>
          </div>

          <div className="h-px bg-white/8" />

          <div>
            <p className="text-[11px] tracking-[2px] uppercase text-white/50 mb-2">
              Color — <span className="text-white">{selectedColor}</span>
            </p>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map(c => (
                <button key={c.name} onClick={() => setSelectedColor(c.name)} title={c.name}
                  className={`w-6 h-6 rounded-full border-2 transition-all
                              ${selectedColor === c.name ? "border-white scale-110" : "border-transparent hover:scale-110"}`}
                  style={{ background: c.bg }} />
              ))}
            </div>
          </div>

          {/* SIZE SELECTOR */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className={`text-[11px] tracking-[2px] uppercase font-bold transition-colors
                             ${sizeError ? "text-red-400" : "text-white/50"}`}>
                {sizeError
                  ? "⚠ Please select a size first"
                  : hasSizes && !selectedSize
                    ? "Select Size (UK) — required"
                    : "Select Size (UK)"}
              </p>
              <button className="text-[11px] tracking-widest text-[#ff4f1f] uppercase">Size Guide</button>
            </div>

            {hasSizes ? (
              <div className="grid grid-cols-5 gap-1.5">
                {productSizes.map(({ size, stock }) => {
                  const oos      = stock === 0;
                  const selected = selectedSize === size;
                  const low      = !oos && stock <= 3;
                  return (
                    <button key={size} disabled={oos}
                      onClick={() => { setSelectedSize(size); setSizeError(false); }}
                      title={oos ? "Out of stock" : `${stock} left`}
                      className={`relative py-2 text-xs rounded-md border transition-all
                                  ${oos
                                    ? "opacity-40 line-through text-white/40 border-white/8 cursor-not-allowed bg-red-500/5"
                                    : selected
                                      ? "bg-[#ff4f1f] border-[#ff4f1f] text-white font-bold"
                                      : sizeError
                                        ? "border-red-400/50 text-white/60 bg-[#1a1a1a] hover:border-[#ff4f1f]"
                                        : "bg-[#1a1a1a] border-white/8 text-white/50 hover:border-[#ff4f1f] hover:text-white"}`}>
                      {size.replace("UK ", "")}
                      {low && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400
                                         rounded-full border border-[#111]" title={`Only ${stock} left`} />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-white/30 text-xs">No sizes available</p>
            )}

            {selectedSize && selectedSizeData && (
              <div className="mt-2 space-y-1">
                <div className="h-0.5 bg-[#222] rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff4f1f] rounded-full transition-all duration-500"
                       style={{ width: `${Math.min((selectedStock / 15) * 100, 100)}%` }} />
                </div>
                <p className="text-[11px] text-white/40">
                  {selectedStock === 0
                    ? <span className="text-red-400 font-bold">Out of stock in {selectedSize}</span>
                    : selectedStock <= 3
                      ? <span>Only <span className="text-amber-400 font-bold">{selectedStock} pairs left</span> in {selectedSize}</span>
                      : <span className="text-green-400/70">{selectedStock} pairs available in {selectedSize}</span>}
                </p>
              </div>
            )}
          </div>

          <div className="h-px bg-white/8" />

          <div>
            <div className="flex border-b border-white/8 mb-3">
              {TABS.map(t => (
                <button key={t} onClick={() => setActiveTab(t)}
                  className={`text-[11px] tracking-widest uppercase px-3 py-2 border-b-2 transition-all
                              ${activeTab === t ? "text-white border-[#ff4f1f]" : "text-white/40 border-transparent hover:text-white/70"}`}>
                  {t}
                </button>
              ))}
            </div>
            {activeTab === "Details" && (
              <p className="text-xs text-white/50 leading-relaxed">
                {product.description || "Premium footwear engineered for the streets. Layered upper, oversized branding, and a stacked sole celebrate sport and self-expression."}
              </p>
            )}
            {activeTab === "Specs" && (
              <div className="grid grid-cols-2 gap-x-4 text-xs">
                {[["Material","Full-grain leather"],["Sole","Rubber cupsole"],["Closure","Lace-up"],["Total Stock",`${totalStock} units`]].map(([k,v]) => (
                  <div key={k} className="flex justify-between py-1.5 border-b border-white/8">
                    <span className="text-white/40">{k}</span>
                    <span className="text-white">{v}</span>
                  </div>
                ))}
              </div>
            )}
            {activeTab === "Shipping" && (
              <p className="text-xs text-white/50 leading-relaxed">
                Free standard delivery (3–5 days) on orders above ₹999. Express delivery (1–2 days) for ₹199. Easy 7-day returns on unworn shoes in original packaging.
              </p>
            )}
          </div>

          <div className="flex gap-2 mt-auto pt-2">
            <button onClick={handleWishlist}
              className={`px-4 py-3 rounded-lg border text-base transition-all
                          ${wishlisted
                            ? "border-rose-500 text-rose-500 bg-rose-500/10"
                            : "border-white/8 text-white/40 bg-[#1a1a1a] hover:border-rose-500 hover:text-rose-500"}`}>
              {wishlisted ? "♥" : "♡"}
            </button>
            <button onClick={handleAddToCart} disabled={cartBtnDisabled}
              className={`flex-1 py-3 rounded-lg font-['Bebas_Neue'] text-lg tracking-[3px]
                          transition-all duration-200
                          ${sizeError ? "animate-pulse" : ""}
                          ${cartBtnDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
              style={{ background: cartBtnBg, color: "#fff" }}>
              {cartBtnLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}