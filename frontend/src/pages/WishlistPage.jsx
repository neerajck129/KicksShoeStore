import { useEffect, useRef, useState } from "react";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyWishlist({ darkMode, setCurrentPage }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
      <div className="text-7xl mb-6">🤍</div>
      <h2 className={`font-['Bebas_Neue'] text-5xl tracking-wider mb-3
                      ${darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
        Your Wishlist is Empty
      </h2>
      <p className={`text-sm max-w-xs mb-8 leading-relaxed
                     ${darkMode ? "text-white/40" : "text-black/40"}`}>
        Save the styles you love and come back to them anytime.
      </p>
      <button
        onClick={() => setCurrentPage("products")}
        className="bg-[#ff4f1f] text-white text-xs font-black px-8 py-4
                   tracking-[3px] uppercase hover:bg-[#e04010]
                   transition-all duration-200 hover:scale-105 active:scale-95"
      >
        Browse Products →
      </button>
    </div>
  );
}

// ─── Wishlist Card ────────────────────────────────────────────────────────────
function WishlistCard({ product, darkMode, onRemove, onMoveToCart }) {
  const ref = useRef(null);
  const [removing, setRemoving] = useState(false);

  const handleRemove = () => {
    setRemoving(true);
    gsap.to(ref.current, {
      opacity: 0, x: -30, scale: 0.95, duration: 0.3, ease: "power2.in",
      onComplete: () => onRemove(product._id),
    });
  };

  const onEnter = () => gsap.to(ref.current, { y: -4, duration: 0.25, ease: "power2.out" });
  const onLeave = () => gsap.to(ref.current, { y: 0,  duration: 0.25, ease: "power2.inOut" });

  return (
    <div
      ref={ref}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`relative rounded-sm overflow-hidden border transition-colors duration-200 group
                  ${darkMode
                    ? "bg-[#161616] border-white/[0.07] hover:border-white/20"
                    : "bg-white border-black/[0.07] hover:border-black/20"}`}
    >
      {/* Remove button */}
      <button
        onClick={handleRemove}
        disabled={removing}
        className="absolute top-3 right-3 z-20 w-7 h-7 rounded-sm flex items-center justify-center
                   bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200"
      >
        <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>

      {/* Product image */}
      <div className={`relative overflow-hidden ${darkMode ? "bg-[#1c1c1c]" : "bg-[#f7f5f0]"}`}
           style={{ aspectRatio: "4/3" }}>
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={e => { e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop"; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">👟</div>
        )}

        {/* Heart icon overlay */}
        <div className="absolute bottom-3 left-3">
          <span className="text-[#ff4f1f] text-lg">❤️</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className={`text-[10px] tracking-[3px] uppercase font-bold mb-1
                       ${darkMode ? "text-white/30" : "text-black/30"}`}>
          {product.brand || "KIKS"}
        </p>
        <h3 className={`font-['Bebas_Neue'] text-xl tracking-wider leading-none mb-3
                        ${darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
          {product.name}
        </h3>

        <div className="flex items-center justify-between mb-4">
          <span className="text-[#ff4f1f] font-black text-lg">₹{product.price?.toLocaleString()}</span>
          {product.originalPrice && (
            <span className={`text-xs line-through ${darkMode ? "text-white/25" : "text-black/25"}`}>
              ₹{product.originalPrice?.toLocaleString()}
            </span>
          )}
        </div>

        <button
          onClick={() => onMoveToCart(product._id)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-[11px] font-black
                     tracking-[2px] uppercase border border-[#ff4f1f]/40 text-[#ff4f1f]
                     hover:bg-[#ff4f1f] hover:text-white transition-all duration-200 rounded-sm"
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          Move to Cart
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function WishlistPage({ darkMode, setCurrentPage }) {
  const heroRef = useRef(null);
  const [wishlist, setWishlist]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [toastMsg, setToastMsg]   = useState(null);

  const bg        = darkMode ? "bg-[#0e0e0e]" : "bg-[#f2f0eb]";
  const sectionBg = darkMode ? "bg-[#111]"    : "bg-white";

  // ── Fetch wishlist ──────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("http://localhost:5000/api/wishlist", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setWishlist(data);
      } catch (err) {
        setError("Failed to load wishlist. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  // ── GSAP entrance ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".wl-hero-content",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.1 }
      );
      gsap.utils.toArray(".wl-card").forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.5, delay: 0.1 + i * 0.08, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" } }
        );
      });
      gsap.to(".wl-ticker-inner", { x: "-50%", duration: 22, ease: "none", repeat: -1 });
    });
    return () => ctx.revert();
  }, [loading, wishlist]);

  // ── Remove from wishlist ────────────────────────────────────────────────────
  const handleRemove = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(prev => ({
        ...prev,
        products: prev.products.filter(p => p._id !== productId),
      }));
      showToast("Removed from wishlist");
    } catch {
      showToast("Failed to remove item", true);
    }
  };

  // ── Move to cart ────────────────────────────────────────────────────────────
  const handleMoveToCart = async (productId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/cart/add",
        { productId, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove from wishlist after moving
      await axios.delete(`http://localhost:5000/api/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(prev => ({
        ...prev,
        products: prev.products.filter(p => p._id !== productId),
      }));
      showToast("Moved to cart ✓");
    } catch {
      showToast("Failed to move to cart", true);
    }
  };

  // ── Toast helper ────────────────────────────────────────────────────────────
  const showToast = (msg, isError = false) => {
    setToastMsg({ msg, isError });
    setTimeout(() => setToastMsg(null), 2800);
  };

  const products = wishlist?.products || [];
  const count    = products.length;

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`${bg} min-h-screen flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-[#ff4f1f] border-t-transparent rounded-full animate-spin" />
          <p className={`text-xs tracking-[3px] uppercase ${darkMode ? "text-white/40" : "text-black/40"}`}>
            Loading Wishlist…
          </p>
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className={`${bg} min-h-screen flex items-center justify-center`}>
        <div className="text-center px-6">
          <div className="text-5xl mb-4">⚠️</div>
          <p className={`text-sm ${darkMode ? "text-white/50" : "text-black/50"}`}>{error}</p>
          <button onClick={() => window.location.reload()}
            className="mt-6 bg-[#ff4f1f] text-white text-xs font-black px-6 py-3 tracking-[3px] uppercase">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bg} min-h-screen overflow-x-hidden`}>

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toastMsg && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-sm
                         text-xs font-black tracking-[2px] uppercase shadow-xl flex items-center gap-2
                         transition-all duration-300
                         ${toastMsg.isError ? "bg-red-500 text-white" : "bg-green-500 text-white"}`}>
          {toastMsg.isError
            ? <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
            : <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
          }
          {toastMsg.msg}
        </div>
      )}

      {/* ===== HERO ===== */}
      <section
        ref={heroRef}
        className="relative overflow-hidden"
        style={{
          background: darkMode
            ? "linear-gradient(135deg, #0e0e0e 0%, #1a0600 100%)"
            : "linear-gradient(135deg, #f2f0eb 0%, #e8e0d0 100%)",
          minHeight: "40vh",
          display: "flex",
          alignItems: "center",
        }}
      >
        {/* BG decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-[400px] h-[400px] rounded-full opacity-[0.06]"
               style={{ background: "#ff4f1f" }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-wl" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke={darkMode ? "white" : "black"} strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-wl)" />
          </svg>
          <div className={`absolute -bottom-4 right-0 pointer-events-none select-none
                           font-['Bebas_Neue'] text-[120px] md:text-[180px] tracking-widest leading-none
                           ${darkMode ? "text-white/[0.025]" : "text-black/[0.035]"}`}>
            WISHLIST
          </div>
        </div>

        <div className="wl-hero-content max-w-7xl mx-auto px-6 w-full pt-[88px] pb-12 relative z-10">
          <div className="inline-flex items-center gap-2 border border-[#ff4f1f]/40
                          bg-[#ff4f1f]/10 px-4 py-2 rounded-sm mb-5">
            <span className="text-[#ff4f1f]">❤️</span>
            <span className="text-[11px] font-bold tracking-[3px] uppercase text-[#ff4f1f]">
              Saved Items
            </span>
          </div>

          <h1 className={`font-['Bebas_Neue'] text-[60px] md:text-[90px] tracking-wider
                          leading-[0.9] mb-3 ${darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
            MY <span className="text-[#ff4f1f]">WISHLIST</span>
          </h1>

          <p className={`text-sm leading-relaxed ${darkMode ? "text-white/40" : "text-black/40"}`}>
            {count > 0
              ? `${count} ${count === 1 ? "item" : "items"} saved — don't let them sell out.`
              : "Your saved styles will appear here."}
          </p>
        </div>
      </section>

      {/* ===== TICKER ===== */}
      <div className="bg-[#ff4f1f] py-3 overflow-hidden">
        <div className="wl-ticker-inner flex whitespace-nowrap">
          {Array(8).fill("❤️ YOUR WISHLIST · SAVED STYLES · FREE SHIPPING $100+ · MOVE TO CART · SHOP NOW · ").map((t, i) => (
            <span key={i} className="text-white text-[11px] font-black tracking-[4px] uppercase mx-8">{t}</span>
          ))}
        </div>
      </div>

      {/* ===== CONTENT ===== */}
      <section className={`${sectionBg} py-20`}>
        <div className="max-w-7xl mx-auto px-6">

          {count === 0 ? (
            <EmptyWishlist darkMode={darkMode} setCurrentPage={setCurrentPage} />
          ) : (
            <>
              {/* Top bar */}
              <div className="flex items-center justify-between mb-10">
                <div>
                  <p className="text-[11px] tracking-[4px] uppercase font-bold text-[#ff4f1f] mb-1">
                    Saved Styles
                  </p>
                  <h2 className={`font-['Bebas_Neue'] text-4xl md:text-5xl tracking-wider leading-none
                                  ${darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
                    {count} {count === 1 ? "Item" : "Items"}
                  </h2>
                </div>
                <button
                  onClick={() => setCurrentPage("products")}
                  className={`hidden md:flex items-center gap-2 text-xs font-bold tracking-[2px]
                              uppercase border-b pb-1 transition-colors hover:text-[#ff4f1f]
                              ${darkMode ? "text-white/40 border-white/15" : "text-black/40 border-black/15"}`}
                >
                  Continue Shopping →
                </button>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map((product) => (
                  <div key={product._id} className="wl-card">
                    <WishlistCard
                      product={product}
                      darkMode={darkMode}
                      onRemove={handleRemove}
                      onMoveToCart={handleMoveToCart}
                    />
                  </div>
                ))}
              </div>

              {/* Bottom CTA */}
              <div className="flex flex-col md:flex-row items-center justify-between
                              mt-14 pt-10 gap-4 border-t"
                   style={{ borderColor: darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)" }}>
                <p className={`text-xs tracking-wide ${darkMode ? "text-white/30" : "text-black/30"}`}>
                  Items in your wishlist are not reserved — add to cart to secure them.
                </p>
                <button
                  onClick={() => setCurrentPage("cart")}
                  className="bg-[#ff4f1f] text-white text-xs font-black px-8 py-4
                             tracking-[3px] uppercase hover:bg-[#e04010] transition-all
                             duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  View Cart →
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}