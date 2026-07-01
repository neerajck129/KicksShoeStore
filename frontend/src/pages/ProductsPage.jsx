// src/pages/ProductsPage.jsx
import { useState, useMemo, useEffect, useCallback } from "react";
import axios from "axios";
import ProductModal from "../components/ProductModal";

const API    = import.meta.env.VITE_API_URL || "http://localhost:5000";
const COLORS = ["#1e3a5f", "#3b1a1a", "#1a1a3b", "#1a3b2a"];

const CATEGORIES = [
  { value: "all",    label: "All"    },
  { value: "men",    label: "Men"    },
  { value: "women",  label: "Women"  },
  { value: "kids",   label: "Kids"   },
  { value: "unisex", label: "Unisex" },
];

// ── Single product card ───────────────────────────────────────────────────────
function ProductCard({ product, index, onOpenModal }) {
  const bg         = COLORS[index % COLORS.length];
  const sizes      = product.sizes || [];
  const totalStock = sizes.reduce((s, sz) => s + sz.stock, 0);
  const isOOS      = sizes.length > 0 && totalStock === 0;
  const availSizes = sizes.filter(sz => sz.stock > 0);

  return (
    <div
      onClick={() => onOpenModal(product)}
      className="group bg-[#111] border border-white/8 rounded-xl overflow-hidden
                 cursor-pointer hover:border-white/20 hover:shadow-xl
                 hover:shadow-black/40 transition-all duration-300"
    >
      {/* Image area */}
      <div className="relative h-48 flex items-center justify-center overflow-hidden"
           style={{ background: bg }}>

        {/* Badges */}
        {product.tag && (
          <span className="absolute top-2 left-2 z-10 bg-[#ff4f1f] text-white
                           text-[9px] font-black tracking-widest px-2 py-0.5 rounded-sm">
            {product.tag}
          </span>
        )}

        {isOOS && (
          <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center">
            <span className="bg-red-500 text-white text-[10px] font-black uppercase
                             tracking-widest px-3 py-1 rounded-sm">
              Out of Stock
            </span>
          </div>
        )}

        <img
          src={product.image}
          alt={product.name}
          onError={e => (e.target.src = "https://via.placeholder.com/150/1e3a5f/white?text=KIKS")}
          className="h-32 object-contain transition-transform duration-300
                     group-hover:scale-105 group-hover:-translate-y-1"
          style={{ filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.5))" }}
        />
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-white/30 text-[9px] uppercase tracking-widest mb-0.5">
          {product.brand}
        </p>
        <h3 className="text-white font-['Bebas_Neue'] text-lg tracking-wide leading-tight truncate">
          {product.name}
        </h3>

        {/* Available sizes preview */}
        {availSizes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5 mb-2">
            {availSizes.slice(0, 4).map(sz => (
              <span key={sz.size}
                className="text-[8px] font-black text-white/40 border border-white/10
                           px-1 py-0.5 rounded-sm">
                {sz.size.replace("UK ", "")}
              </span>
            ))}
            {availSizes.length > 4 && (
              <span className="text-[8px] font-black text-white/25">
                +{availSizes.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-1 mb-3">
          <span className="font-['Bebas_Neue'] text-lg text-[#ff4f1f]">
            ₹{Number(product.price).toLocaleString()}
          </span>
          {isOOS
            ? <span className="text-[9px] font-black uppercase text-red-400/70">OOS</span>
            : <span className="text-[9px] text-white/25">{availSizes.length} sizes</span>
          }
        </div>

        {/* CTA — always opens modal */}
        <button
          onClick={e => { e.stopPropagation(); onOpenModal(product); }}
          disabled={isOOS}
          className="w-full py-2 text-[10px] font-black uppercase tracking-widest
                     rounded-sm transition-all duration-200 disabled:cursor-not-allowed"
          style={{
            background: isOOS ? "#222" : "#ff4f1f",
            color: isOOS ? "rgba(255,255,255,0.2)" : "#fff",
          }}
        >
          {isOOS ? "Out of Stock" : "Select Size & Add"}
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function ProductsPage({ currentPage, setCurrentPage }) {
  const [products,     setProducts]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [category,     setCategory]     = useState("all");
  const [search,       setSearch]       = useState("");
  const [brand,        setBrand]        = useState("All Brands");
  const [maxPrice,     setMaxPrice]     = useState(99999);
  const [sort,         setSort]         = useState("default");
  const [modalProduct, setModalProduct] = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/api/products`);
      const formatted = data.map((p, i) => ({
        ...p,
        id:  p._id,
        bg:  COLORS[i % COLORS.length],
        tag: i % 4 === 0 ? "NEW" : i % 5 === 0 ? "HOT" : "",
      }));
      setProducts(formatted);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Derived ────────────────────────────────────────────────────────────────
  const highestPrice = Math.max(...products.map(p => p.price || 0), 1000);
  const BRANDS = ["All Brands", ...new Set(products.map(p => p.brand).filter(Boolean))];

  const filtered = useMemo(() => {
    let r = products;
    if (category !== "all")         r = r.filter(p => p.category === category);
    if (search.trim())              r = r.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    if (brand !== "All Brands")     r = r.filter(p => p.brand === brand);
    r = r.filter(p => Number(p.price) <= maxPrice);
    if (sort === "price-asc")       r = [...r].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") r = [...r].sort((a, b) => b.price - a.price);
    return r;
  }, [products, category, search, brand, maxPrice, sort]);

  const clearAll = () => {
    setCategory("all");
    setBrand("All Brands");
    setMaxPrice(highestPrice);
    setSearch("");
    setSort("default");
  };

  if (loading) return (
    <div className="bg-[#0a0a0a] min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#ff4f1f] border-t-transparent rounded-full animate-spin" />
        <p className="text-white/30 text-[10px] tracking-[4px] uppercase">Loading Products</p>
      </div>
    </div>
  );

  return (
    <div className="bg-[#0a0a0a] min-h-screen pt-16">

      {/* Product modal */}
      {modalProduct && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(null)}
        />
      )}

      <div className="max-w-7xl mx-auto px-5 py-8 flex gap-8">

        {/* ── Sidebar ───────────────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-52 flex-shrink-0 gap-6">

          {/* Category */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
              Category
            </p>
            <div className="space-y-1">
              {CATEGORIES.map(c => (
                <button key={c.value} onClick={() => setCategory(c.value)}
                  className={`w-full text-left px-3 py-2 rounded-sm text-sm font-body
                              transition-colors
                              ${category === c.value
                                ? "bg-[#ff4f1f]/10 text-[#ff4f1f] font-bold"
                                : "text-white/40 hover:text-white hover:bg-white/5"}`}>
                  {c.label}
                  <span className="float-right text-[10px] text-white/20">
                    {c.value === "all"
                      ? products.length
                      : products.filter(p => p.category === c.value).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
              Brand
            </p>
            <div className="space-y-1">
              {BRANDS.map(b => (
                <button key={b} onClick={() => setBrand(b)}
                  className={`w-full text-left px-3 py-2 rounded-sm text-sm font-body
                              transition-colors truncate
                              ${brand === b
                                ? "bg-[#ff4f1f]/10 text-[#ff4f1f] font-bold"
                                : "text-white/40 hover:text-white hover:bg-white/5"}`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Price range */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
              Max Price
            </p>
            <p className="text-[#ff4f1f] font-['Bebas_Neue'] text-xl mb-2">
              ₹{maxPrice >= 99999 ? "Any" : maxPrice.toLocaleString()}
            </p>
            <input type="range" min="0" max={highestPrice}
              value={Math.min(maxPrice, highestPrice)}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#ff4f1f]" />
          </div>

          {/* Sort */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
              Sort By
            </p>
            <select value={sort} onChange={e => setSort(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white/60 text-sm
                         px-3 py-2 rounded-sm focus:outline-none focus:border-[#ff4f1f]
                         cursor-pointer"
              style={{ background: "#1a1a1a" }}>
              <option value="default">Default</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>

          <button onClick={clearAll}
            className="text-[10px] font-black uppercase tracking-widest text-[#ff4f1f]/60
                       hover:text-[#ff4f1f] transition-colors text-left">
            Clear All Filters ×
          </button>
        </aside>

        {/* ── Main ──────────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Top bar */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
                   width="13" height="13" fill="none" stroke="currentColor"
                   strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full bg-white/5 border border-white/10 text-white text-sm
                           pl-9 pr-4 py-2.5 rounded-sm placeholder-white/20
                           focus:outline-none focus:border-[#ff4f1f] transition-colors" />
            </div>
            <p className="text-white/30 text-sm font-body flex-shrink-0">
              {filtered.length} products
            </p>
          </div>

          {/* Mobile category pills */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 lg:hidden scrollbar-hide">
            {CATEGORIES.map(c => (
              <button key={c.value} onClick={() => setCategory(c.value)}
                className={`flex-shrink-0 px-3 py-1.5 text-[11px] font-black uppercase
                            tracking-widest rounded-sm border transition-colors
                            ${category === c.value
                              ? "bg-[#ff4f1f] text-white border-[#ff4f1f]"
                              : "border-white/15 text-white/50 hover:border-white/30"}`}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <p className="text-white/20 font-['Bebas_Neue'] text-3xl uppercase tracking-widest mb-2">
                No Products Found
              </p>
              <button onClick={clearAll}
                className="text-[#ff4f1f] text-xs font-black uppercase tracking-widest">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((p, i) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  index={i}
                  onOpenModal={setModalProduct}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}