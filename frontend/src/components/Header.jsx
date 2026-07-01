import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useAuth } from "../context/Authcontext";

const NAV_LINKS = [
  { label: "Home",         page: "home"         },
  { label: "Products",     page: "products"     },
  { label: "New Arrivals", page: "new-arrivals"  },
  { label: "Best Sellers", page: "best-sellers"  },
  { label: "Brands",       page: "brands"        },
  { label: "Offers",       page: "offers", hot: true },
];

const AVATAR_COLORS = ["#ff4f1f","#f97316","#8b5cf6","#06b6d4","#10b981","#ec4899"];
const getAvatarColor = (email = "") =>
  AVATAR_COLORS[email.charCodeAt(0) % AVATAR_COLORS.length];

// ── Tiny count badge shared by icons ──────────────────────────────────────────
function CountBadge({ count }) {
  if (!count || count < 1) return null;
  return (
    <span
      className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5
                 bg-[#ff4f1f] rounded-full text-white text-[8px] font-black
                 flex items-center justify-center leading-none shadow-sm
                 shadow-[#ff4f1f]/40 ring-1 ring-[#0e0e0e]"
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

export default function Header({ darkMode, toggleDark, setCurrentPage }) {
  const { user, isLoggedIn, logOut } = useAuth();

  const [scrolled,      setScrolled]      = useState(false);
  const [menuOpen,      setMenuOpen]      = useState(false);
  const [avatarOpen,    setAvatarOpen]    = useState(false);
  const [activeLink,    setActiveLink]    = useState("home");
  const [cartCount,     setCartCount]     = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [ordersCount,   setOrdersCount]   = useState(0);

  const logoRef     = useRef(null);
  const navRef      = useRef(null);
  const rightRef    = useRef(null);
  const drawerRef   = useRef(null);
  const dropdownRef = useRef(null);

  // ── Read all counts from localStorage + listen for updates ───────────────
  useEffect(() => {
    const read = () => {
      try {
        setCartCount(parseInt(localStorage.getItem("cartCount")     || "0"));
        setWishlistCount(parseInt(localStorage.getItem("wishlistCount") || "0"));
        setOrdersCount(parseInt(localStorage.getItem("ordersCount")   || "0"));
      } catch { /* ignore */ }
    };
    read();
    window.addEventListener("storage",         read);
    window.addEventListener("cartUpdated",      read);
    window.addEventListener("wishlistUpdated",  read);
    window.addEventListener("ordersUpdated",    read);
    return () => {
      window.removeEventListener("storage",         read);
      window.removeEventListener("cartUpdated",     read);
      window.removeEventListener("wishlistUpdated", read);
      window.removeEventListener("ordersUpdated",   read);
    };
  }, []);

  // ── Entrance animation ────────────────────────────────────────────────────
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(logoRef.current,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.6, delay: 0.15 })
      .fromTo(navRef.current?.children ?? [],
        { opacity: 0, y: -12 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.07 }, "-=0.3")
      .fromTo(rightRef.current,
        { opacity: 0, x: 18 },
        { opacity: 1, x: 0, duration: 0.5 }, "-=0.35");
  }, []);

  // ── Scroll ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // ── Mobile drawer animation ───────────────────────────────────────────────
  useEffect(() => {
    if (menuOpen && drawerRef.current) {
      gsap.fromTo(drawerRef.current,
        { opacity: 0, y: -10 },
        { opacity: 1, y: 0, duration: 0.25, ease: "power2.out" });
    }
  }, [menuOpen]);

  // ── Dropdown animation ────────────────────────────────────────────────────
  useEffect(() => {
    if (avatarOpen && dropdownRef.current) {
      gsap.fromTo(dropdownRef.current,
        { opacity: 0, y: -8, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" });
    }
  }, [avatarOpen]);

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.parentElement?.contains(e.target))
        setAvatarOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const navigate = (page) => {
    setCurrentPage?.(page);
    setActiveLink(page);
    setMenuOpen(false);
    setAvatarOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("cartCount");
    localStorage.removeItem("wishlistCount");
    localStorage.removeItem("ordersCount");
    setCartCount(0);
    setWishlistCount(0);
    setOrdersCount(0);
    setAvatarOpen(false);
    logOut();
    navigate("home");
  };

  // ── User helpers ──────────────────────────────────────────────────────────
  const displayName = user?.name || user?.displayName || "Account";
  const email       = user?.email || "";
  const isAdmin     = user?.role === "admin";
  const initials    = displayName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  const avatarBg    = getAvatarColor(email);
  const photoURL    = user?.photoURL || user?.avatar || null;

  // ── Header bg ─────────────────────────────────────────────────────────────
  const headerBg = scrolled
    ? darkMode
      ? "bg-[#0e0e0e] backdrop-blur-xl shadow-lg shadow-black/40 border-b border-white/[0.06]"
      : "bg-[#f2f0eb] backdrop-blur-xl shadow-lg shadow-black/[0.08] border-b border-black/[0.07]"
    : darkMode
      ? "bg-[#0e0e0e]/90 backdrop-blur-md"
      : "bg-[#f2f0eb]/90 backdrop-blur-md";

  const iconBtn = darkMode
    ? "border-white/[0.12] text-white/60 hover:border-white/30 hover:text-white bg-white/[0.03] hover:bg-white/[0.07]"
    : "border-black/[0.10] text-black/50 hover:border-black/25 hover:text-black bg-black/[0.02] hover:bg-black/[0.05]";

  const activeIconBtn = "border-[#ff4f1f]/60 text-[#ff4f1f] bg-[#ff4f1f]/[0.08]";

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerBg}`}
        style={{ WebkitBackdropFilter: "blur(12px)" }}
      >
        {/* Orange pinline */}
        <div
          className="h-[2px] w-full"
          style={{
            background: "linear-gradient(90deg, transparent 0%, #ff4f1f 30%, #ff8c5a 50%, #ff4f1f 70%, transparent 100%)",
            opacity: 0.7,
          }}
        />

        <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between gap-4">

          {/* ── Logo ──────────────────────────────────────────────────────── */}
          <div
            ref={logoRef}
            onClick={() => navigate("home")}
            className="flex items-center gap-0.5 cursor-pointer flex-shrink-0 group"
          >
            <span className={`font-display text-2xl tracking-[0.1em] leading-none
                              transition-all duration-200 group-hover:opacity-70
                              ${darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
              KIKS
            </span>
            <span className="font-display text-2xl text-[#ff4f1f] leading-none">.</span>
          </div>

          {/* ── Desktop Nav ───────────────────────────────────────────────── */}
          <nav ref={navRef} className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {NAV_LINKS.map(({ label, page, hot }) => (
              <button
                key={label}
                onClick={() => navigate(page)}
                className={`relative px-3 py-2 text-[11px] font-bold tracking-[2px]
                            uppercase font-body rounded-lg transition-all duration-200 group
                            ${hot
                              ? "text-[#ff4f1f]"
                              : activeLink === page
                                ? darkMode ? "text-white" : "text-[#1c1c1c]"
                                : darkMode
                                  ? "text-white/55 hover:text-white hover:bg-white/[0.06]"
                                  : "text-black/48 hover:text-[#1c1c1c] hover:bg-black/[0.05]"}`}
              >
                {label}
                {hot && (
                  <span className="absolute -top-0.5 -right-1 text-[8px] leading-none select-none">🔥</span>
                )}
                <span
                  className={`absolute bottom-1 left-3 right-3 h-[1.5px] rounded-full bg-[#ff4f1f]
                               transition-transform duration-200 origin-left
                               ${activeLink === page ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                />
              </button>
            ))}
          </nav>

          {/* ── Right cluster ─────────────────────────────────────────────── */}
          <div ref={rightRef} className="flex items-center gap-1.5 flex-shrink-0">

            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              title={darkMode ? "Light mode" : "Dark mode"}
              className={`w-8 h-8 rounded-lg border flex items-center justify-center
                          transition-all duration-200 hover:scale-105 ${iconBtn}`}
            >
              {darkMode ? (
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              )}
            </button>

            {/* Search */}
            <button
              title="Search"
              className={`hidden sm:flex w-8 h-8 rounded-lg border items-center justify-center
                          transition-all duration-200 hover:scale-105 ${iconBtn}`}
            >
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
            </button>

            {/* ── Orders icon (header) ──────────────────────────────────── */}
            {isLoggedIn && !isAdmin && (
              <button
                onClick={() => navigate("orders")}
                title="My Orders"
                className={`w-8 h-8 rounded-lg border flex items-center justify-center
                            transition-all duration-200 hover:scale-105 relative
                            ${activeLink === "orders" ? activeIconBtn : `${iconBtn} hover:border-[#ff4f1f]/50 hover:text-[#ff4f1f]`}`}
              >
                {/* Package / box icon */}
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
                <CountBadge count={ordersCount} />
              </button>
            )}

            {/* ── Wishlist icon ─────────────────────────────────────────── */}
            {isLoggedIn && !isAdmin && (
              <button
                onClick={() => navigate("wishlist")}
                title="Wishlist"
                className={`w-8 h-8 rounded-lg border flex items-center justify-center
                            transition-all duration-200 hover:scale-105 relative
                            ${activeLink === "wishlist" ? activeIconBtn : `${iconBtn} hover:border-[#ff4f1f]/50 hover:text-[#ff4f1f]`}`}
              >
                <svg
                  width="14" height="14" fill={activeLink === "wishlist" ? "#ff4f1f" : "none"}
                  stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
                <CountBadge count={wishlistCount} />
              </button>
            )}

            {/* ── Cart icon ─────────────────────────────────────────────── */}
            {isLoggedIn && !isAdmin && (
              <button
                onClick={() => navigate("cart")}
                title="Cart"
                className={`w-8 h-8 rounded-lg border flex items-center justify-center
                            transition-all duration-200 hover:scale-105 relative
                            ${activeLink === "cart" ? activeIconBtn : `${iconBtn} hover:border-[#ff4f1f]/50 hover:text-[#ff4f1f]`}`}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                <CountBadge count={cartCount} />
              </button>
            )}

            {/* ── Auth ──────────────────────────────────────────────────── */}
            {isLoggedIn ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setAvatarOpen(o => !o)}
                  className="flex items-center gap-2 group ml-0.5 px-1 py-0.5 rounded-xl
                             transition-all duration-200 hover:bg-white/[0.06]"
                >
                  <div className="relative">
                    {photoURL ? (
                      <img src={photoURL} alt={displayName}
                        className="w-8 h-8 rounded-lg object-cover ring-2 ring-transparent
                                   group-hover:ring-[#ff4f1f]/60 transition-all duration-200" />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center
                                    text-white text-[11px] font-black font-body
                                    ring-2 ring-transparent group-hover:ring-[#ff4f1f]/60
                                    transition-all duration-200"
                        style={{ background: avatarBg }}
                      >
                        {initials}
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5
                                     bg-green-500 rounded-full border-2 border-[#0e0e0e]" />
                  </div>

                  <div className="hidden lg:flex flex-col items-start leading-none">
                    <span className={`text-[11px] font-bold font-body max-w-[64px] truncate
                                      ${darkMode ? "text-white/85" : "text-[#1c1c1c]/80"}`}>
                      {displayName.split(" ")[0]}
                    </span>
                    <span className={`text-[9px] font-body mt-0.5
                                      ${isAdmin ? "text-[#ff4f1f]" : darkMode ? "text-white/30" : "text-black/35"}`}>
                      {isAdmin ? "Admin" : "Member"}
                    </span>
                  </div>

                  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5"
                       viewBox="0 0 24 24"
                       className={`transition-transform duration-200 flex-shrink-0
                                   ${avatarOpen ? "rotate-180" : ""}
                                   ${darkMode ? "text-white/25" : "text-black/25"}`}>
                    <path d="M6 9l6 6 6-6"/>
                  </svg>
                </button>

                {/* ── Dropdown ─────────────────────────────────────────── */}
                {avatarOpen && (
                  <div
                    ref={dropdownRef}
                    className={`absolute right-0 top-12 w-60 rounded-2xl border shadow-2xl
                                overflow-hidden z-50
                                ${darkMode
                                  ? "bg-[#141414] border-white/[0.07] shadow-black/70"
                                  : "bg-white border-black/[0.07] shadow-black/12"}`}
                  >
                    {/* User info */}
                    <div
                      className="px-4 py-4"
                      style={{
                        background: darkMode
                          ? "linear-gradient(135deg,rgba(255,79,31,0.14) 0%,transparent 70%)"
                          : "linear-gradient(135deg,rgba(255,79,31,0.07) 0%,transparent 70%)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {photoURL ? (
                          <img src={photoURL} alt=""
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center
                                        text-white text-sm font-black font-body flex-shrink-0"
                            style={{ background: avatarBg }}
                          >
                            {initials}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className={`text-sm font-black font-body truncate
                                         ${darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
                            {displayName}
                          </p>
                          <p className={`text-[10px] font-body truncate mt-0.5
                                         ${darkMode ? "text-white/35" : "text-black/40"}`}>
                            {email}
                          </p>
                          <span className={`inline-block text-[8px] font-black uppercase
                                            tracking-[0.12em] px-1.5 py-0.5 rounded-md mt-1
                                            ${isAdmin
                                              ? "bg-[#ff4f1f]/18 text-[#ff4f1f]"
                                              : darkMode
                                                ? "bg-white/8 text-white/35"
                                                : "bg-black/6 text-black/40"}`}>
                            {isAdmin ? "⚡ Admin" : "✦ Member"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={`h-px ${darkMode ? "bg-white/[0.05]" : "bg-black/[0.05]"}`} />

                    {/* Menu items */}
                    <div className="py-2 px-2">
                      {!isAdmin ? (
                        [
                          { label: "My Orders", page: "orders",   icon: "📦", desc: "Track your purchases", count: ordersCount   },
                          { label: "Wishlist",  page: "wishlist", icon: "❤️",  desc: "Saved items",          count: wishlistCount },
                          { label: "Cart",      page: "cart",     icon: "🛒",  desc: "Your bag",             count: cartCount     },
                          { label: "Settings",  page: "settings", icon: "⚙️",  desc: "Account preferences",  count: 0            },
                        ].map(({ label, page, icon, desc, count }) => (
                          <button
                            key={label}
                            onClick={() => navigate(page)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                        text-xs font-body transition-all duration-150 group
                                        hover:bg-[#ff4f1f]/[0.07]
                                        ${activeLink === page ? "bg-[#ff4f1f]/[0.05]" : ""}`}
                          >
                            <span className="text-base flex-shrink-0">{icon}</span>
                            <div className="text-left min-w-0 flex-1">
                              <p className={`font-bold leading-none transition-colors group-hover:text-[#ff4f1f]
                                             ${activeLink === page ? "text-[#ff4f1f]"
                                               : darkMode ? "text-white/80" : "text-black/70"}`}>
                                {label}
                              </p>
                              <p className={`text-[10px] mt-0.5
                                             ${darkMode ? "text-white/25" : "text-black/30"}`}>
                                {desc}
                              </p>
                            </div>
                            {count > 0 ? (
                              <span className="min-w-[20px] h-5 px-1.5 bg-[#ff4f1f] rounded-full
                                               text-white text-[9px] font-black flex items-center
                                               justify-center flex-shrink-0">
                                {count > 9 ? "9+" : count}
                              </span>
                            ) : (
                              <svg width="10" height="10" fill="none" stroke="currentColor"
                                   strokeWidth="2.5" viewBox="0 0 24 24"
                                   className="flex-shrink-0 opacity-0 group-hover:opacity-35 transition-opacity">
                                <path d="M9 18l6-6-6-6"/>
                              </svg>
                            )}
                          </button>
                        ))
                      ) : (
                        <button onClick={() => navigate("admin")}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl
                                     bg-[#ff4f1f]/[0.08] hover:bg-[#ff4f1f]/[0.15]
                                     transition-all duration-150 group">
                          <span className="text-base flex-shrink-0">🛠️</span>
                          <div className="text-left flex-1">
                            <p className="font-bold text-[#ff4f1f] text-xs leading-none">Admin Dashboard</p>
                            <p className={`text-[10px] mt-0.5 ${darkMode ? "text-white/25" : "text-black/30"}`}>
                              Manage store & orders
                            </p>
                          </div>
                          <svg width="10" height="10" fill="none" stroke="#ff4f1f"
                               strokeWidth="2.5" viewBox="0 0 24 24" className="flex-shrink-0">
                            <path d="M9 18l6-6-6-6"/>
                          </svg>
                        </button>
                      )}
                    </div>

                    <div className={`h-px mx-3 ${darkMode ? "bg-white/[0.05]" : "bg-black/[0.05]"}`} />

                    <div className="py-2 px-2">
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                   text-xs font-body text-red-400
                                   hover:bg-red-500/[0.07] transition-all duration-150 group">
                        <svg width="14" height="14" fill="none" stroke="currentColor"
                             strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                          <polyline points="16 17 21 12 16 7"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        <span className="font-bold group-hover:text-red-300 transition-colors">
                          Sign Out
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("login")}
                className="hidden md:flex items-center gap-1.5 ml-0.5
                           bg-[#ff4f1f] text-white text-[11px] font-black uppercase
                           tracking-[0.15em] font-body px-4 py-2 rounded-lg
                           hover:bg-[#e04010] active:scale-95
                           transition-all duration-200 shadow-md shadow-[#ff4f1f]/25"
              >
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Login
              </button>
            )}

            {/* ── Hamburger ─────────────────────────────────────────────── */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="md:hidden flex flex-col items-center justify-center w-8 h-8 gap-[5px]"
              aria-label="Toggle menu"
            >
              <span className={`block h-[1.5px] rounded-full transition-all duration-300 origin-center
                                ${darkMode ? "bg-white" : "bg-[#1c1c1c]"}
                                ${menuOpen ? "w-5 rotate-45 translate-y-[6.5px]" : "w-5"}`} />
              <span className={`block h-[1.5px] rounded-full transition-all duration-300
                                ${darkMode ? "bg-white" : "bg-[#1c1c1c]"}
                                ${menuOpen ? "w-4 opacity-0 scale-x-0" : "w-4"}`} />
              <span className={`block h-[1.5px] rounded-full transition-all duration-300 origin-center
                                ${darkMode ? "bg-white" : "bg-[#1c1c1c]"}
                                ${menuOpen ? "w-5 -rotate-45 -translate-y-[6.5px]" : "w-5"}`} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ─────────────────────────────────────────────────── */}
      {menuOpen && (
        <div
          ref={drawerRef}
          className={`fixed top-[calc(3.5rem+2px)] left-0 right-0 z-40 md:hidden border-b
                      ${darkMode
                        ? "bg-[#0e0e0e]/98 border-white/[0.07] backdrop-blur-xl"
                        : "bg-[#f2f0eb]/98 border-black/[0.07] backdrop-blur-xl"}`}
        >
          <div className="px-4 pt-2 pb-1">
            {NAV_LINKS.map(({ label, page, hot }) => (
              <button key={label} onClick={() => navigate(page)}
                className={`w-full text-left py-3 text-sm font-bold tracking-[2px] uppercase
                            font-body border-b flex items-center justify-between
                            transition-colors duration-150
                            ${darkMode ? "border-white/[0.05]" : "border-black/[0.05]"}
                            ${hot ? "text-[#ff4f1f]"
                              : activeLink === page ? "text-[#ff4f1f]"
                              : darkMode ? "text-white/60 hover:text-white"
                              : "text-black/52 hover:text-[#1c1c1c]"}`}>
                {label}
                {hot && <span className="text-sm">🔥</span>}
              </button>
            ))}
            {isLoggedIn && isAdmin && (
              <button onClick={() => navigate("admin")}
                className={`w-full text-left py-3 text-sm font-bold tracking-[2px] uppercase
                            font-body border-b text-[#ff4f1f]
                            ${darkMode ? "border-white/[0.05]" : "border-black/[0.05]"}`}>
                🛠️ Admin
              </button>
            )}
          </div>

          <div className="px-4 py-4">
            {isLoggedIn ? (
              <div className="space-y-3">
                {/* User card */}
                <div className="flex items-center gap-3 p-3 rounded-xl"
                     style={{ background: "rgba(255,79,31,0.07)", border: "1px solid rgba(255,79,31,0.14)" }}>
                  {photoURL ? (
                    <img src={photoURL} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center
                                    text-white text-sm font-black font-body flex-shrink-0"
                         style={{ background: avatarBg }}>{initials}</div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-black font-body truncate ${darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
                      {displayName}
                    </p>
                    <p className={`text-[10px] font-body truncate ${darkMode ? "text-white/35" : "text-black/40"}`}>
                      {email}
                    </p>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest
                                   px-2 py-1 rounded-md bg-[#ff4f1f]/15 text-[#ff4f1f] flex-shrink-0">
                    {isAdmin ? "Admin" : "Member"}
                  </span>
                </div>

                {/* Quick links grid — now 5 items including Orders */}
                {!isAdmin && (
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Orders",   page: "orders",   icon: "📦", badge: ordersCount   },
                      { label: "Wishlist", page: "wishlist", icon: "❤️",  badge: wishlistCount  },
                      { label: "Cart",     page: "cart",     icon: "🛒",  badge: cartCount      },
                      { label: "Settings", page: "settings", icon: "⚙️",  badge: 0             },
                    ].map(({ label, page, icon, badge }) => (
                      <button key={label} onClick={() => navigate(page)}
                        className={`relative flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs
                                    font-bold font-body border transition-all duration-200
                                    hover:border-[#ff4f1f]/30 hover:text-[#ff4f1f]
                                    ${activeLink === page
                                      ? "border-[#ff4f1f]/40 text-[#ff4f1f] bg-[#ff4f1f]/[0.06]"
                                      : darkMode
                                        ? "bg-white/[0.04] border-white/[0.07] text-white/55"
                                        : "bg-black/[0.03] border-black/[0.07] text-black/50"}`}>
                        <span className="text-lg leading-none">{icon}</span>
                        <span className="tracking-widest uppercase text-[9px]">{label}</span>
                        {badge > 0 && (
                          <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5
                                           bg-[#ff4f1f] rounded-full text-white text-[8px] font-black
                                           flex items-center justify-center ring-1 ring-[#0e0e0e]">
                            {badge > 9 ? "9+" : badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Sign out */}
                <button onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2
                             border border-red-500/20 text-red-400 text-xs font-black
                             uppercase tracking-widest font-body py-3 rounded-xl
                             hover:bg-red-500/[0.07] transition-colors">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => navigate("login")}
                  className="flex-1 bg-[#ff4f1f] text-white font-black text-xs uppercase
                             tracking-widest font-body py-3 rounded-xl shadow-md shadow-[#ff4f1f]/20
                             hover:bg-[#e04010] transition-colors flex items-center justify-center gap-2">
                  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Login
                </button>
                <button onClick={() => navigate("login")}
                  className={`flex-1 border font-black text-xs uppercase tracking-widest
                              font-body py-3 rounded-xl transition-colors
                              ${darkMode
                                ? "border-white/15 text-white/55 hover:border-white/30 hover:text-white"
                                : "border-black/15 text-black/45 hover:border-black/25 hover:text-black"}`}>
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}