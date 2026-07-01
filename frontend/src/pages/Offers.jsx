import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ShoeCard from "../components/ShoeCard.jsx";
import { featured, mens, womens, kids } from "../data/shoes.js";

gsap.registerPlugin(ScrollTrigger);

// ─── Section Heading ──────────────────────────────────────────────────────────
function SectionHead({ label, title, accent, darkMode }) {
  return (
    <div className="flex items-end justify-between mb-10 section-head">
      <div>
        <p className="text-[11px] tracking-[4px] uppercase mb-2 font-bold" style={{ color: accent }}>
          {label}
        </p>
        <h2
          className="font-['Bebas_Neue'] text-5xl md:text-6xl tracking-wider leading-none"
          style={{ color: darkMode ? "#fff" : "#1c1c1c" }}
        >
          {title}
        </h2>
      </div>
      <a
        href="#"
        className="hidden md:flex items-center gap-2 text-xs font-bold tracking-widest uppercase border-b pb-1 transition-colors hover:text-[#ff4f1f]"
        style={{
          color: darkMode ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
          borderColor: darkMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)",
        }}
      >
        View All <span>→</span>
      </a>
    </div>
  );
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function Countdown({ endsAt }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, endsAt - Date.now());
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  const pad = (n) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center gap-2">
      {[{ val: timeLeft.h, label: "HRS" }, { val: timeLeft.m, label: "MIN" }, { val: timeLeft.s, label: "SEC" }].map(({ val, label }, i) => (
        <div key={label} className="flex items-center gap-2">
          <div className="text-center">
            <div className="font-['Bebas_Neue'] text-3xl tracking-wider leading-none text-white">
              {pad(val)}
            </div>
            <div className="text-[8px] tracking-[2px] uppercase text-white/30">{label}</div>
          </div>
          {i < 2 && <span className="text-[#ff4f1f] font-black text-xl leading-none mb-3">:</span>}
        </div>
      ))}
    </div>
  );
}

// ─── Coupon Modal ─────────────────────────────────────────────────────────────
function CouponModal({ deal, darkMode, onClose }) {
  const modalRef   = useRef(null);
  const overlayRef = useRef(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    gsap.fromTo(overlayRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.25, ease: "power2.out" }
    );
    gsap.fromTo(modalRef.current,
      { opacity: 0, y: 40, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "power3.out" }
    );
  }, []);

  const handleClose = () => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.2 });
    gsap.to(modalRef.current,   { opacity: 0, y: 20, scale: 0.97, duration: 0.2, onComplete: onClose });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(deal.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) handleClose(); }}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
    >
      <div
        ref={modalRef}
        className={`relative w-full max-w-md rounded-sm overflow-hidden shadow-2xl
                    ${darkMode ? "bg-[#141414] border border-white/[0.07]" : "bg-white border border-black/[0.07]"}`}
      >
        {/* Glow */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
             style={{ background: `radial-gradient(circle at 50% 0%, ${deal.accent}, transparent 60%)` }} />

        {/* Accent top line */}
        <div className="h-[3px] w-full" style={{ background: deal.accent }} />

        {/* Close */}
        <button
          onClick={handleClose}
          className={`absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center
                      transition-all duration-200 hover:scale-110 z-10
                      ${darkMode ? "bg-white/[0.06] text-white/50 hover:text-white" : "bg-black/[0.05] text-black/40 hover:text-black"}`}
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="text-5xl mb-4">{deal.emoji}</div>
          <p className="text-[11px] tracking-[4px] uppercase font-bold mb-1" style={{ color: deal.accent }}>
            {deal.subtitle}
          </p>
          <h2 className={`font-['Bebas_Neue'] text-4xl tracking-wider leading-none mb-1
                          ${darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
            {deal.title}
          </h2>
          <p className={`text-xs leading-relaxed mb-6 ${darkMode ? "text-white/40" : "text-black/45"}`}>
            {deal.codeDesc}
          </p>

          <div className={`h-px mb-6 ${darkMode ? "bg-white/[0.07]" : "bg-black/[0.07]"}`} />

          {/* Coupon code */}
          <p className={`text-[10px] tracking-[3px] uppercase font-bold mb-3
                         ${darkMode ? "text-white/35" : "text-black/35"}`}>
            Your Coupon Code
          </p>

          <div
            className="flex items-center justify-between gap-3 p-4 rounded-sm mb-2 border-2 border-dashed"
            style={{
              borderColor: deal.accent + "55",
              background: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
            }}
          >
            <span
              className="font-['Bebas_Neue'] text-3xl tracking-[6px] leading-none select-all"
              style={{ color: deal.accent }}
            >
              {deal.code}
            </span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 text-[11px] font-black tracking-[2px]
                          uppercase transition-all duration-200 rounded-sm flex-shrink-0 text-white
                          ${copied ? "bg-green-500" : ""}`}
              style={!copied ? { background: deal.accent } : {}}
            >
              {copied ? (
                <>
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>

          <p className={`text-[10px] tracking-wide mb-6 ${darkMode ? "text-white/25" : "text-black/30"}`}>
            * Minimum order ${deal.minOrder}. Paste this code at checkout to apply discount.
          </p>

          {/* How to use */}
          <div className={`rounded-sm p-4 mb-6
                           ${darkMode ? "bg-white/[0.04] border border-white/[0.06]" : "bg-black/[0.03] border border-black/[0.06]"}`}>
            <p className={`text-[10px] tracking-[3px] uppercase font-black mb-3
                           ${darkMode ? "text-white/35" : "text-black/35"}`}>
              How to use
            </p>
            {[
              "Add your items to the cart",
              "Go to checkout / payment",
              `Paste code "${deal.code}" in the coupon field`,
              "Discount applies automatically ✓",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3 mb-2 last:mb-0">
                <span
                  className="w-5 h-5 rounded-sm flex items-center justify-center text-white
                             text-[10px] font-black flex-shrink-0 mt-0.5"
                  style={{ background: deal.accent }}
                >
                  {i + 1}
                </span>
                <p className={`text-xs leading-relaxed ${darkMode ? "text-white/55" : "text-black/55"}`}>
                  {step}
                </p>
              </div>
            ))}
          </div>

          {/* Countdown inside modal */}
          <div className={`rounded-sm p-4 flex items-center justify-between
                           ${darkMode ? "bg-[#0e0e0e]" : "bg-[#1c1c1c]"}`}>
            <p className="text-[10px] tracking-[3px] uppercase text-white/40">Offer expires in</p>
            <Countdown endsAt={Date.now() + deal.endsIn * 60 * 1000} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Deal Banner Card ─────────────────────────────────────────────────────────
function DealBanner({ deal, darkMode, onShopDeal }) {
  const ref      = useRef(null);
  const hoverRef = useRef(null);
  const endsAt   = useRef(Date.now() + deal.endsIn * 60 * 1000).current;

  const onEnter = () => gsap.to(hoverRef.current, { scale: 1.03, duration: 0.4, ease: "power2.out" });
  const onLeave = () => gsap.to(hoverRef.current, { scale: 1,    duration: 0.35, ease: "power2.inOut" });

  return (
    <div
      ref={ref}
      className="deal-banner relative overflow-hidden rounded-sm cursor-pointer"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ background: deal.bg, minHeight: 220 }}
    >
      <div className="absolute inset-0 opacity-25 blur-3xl"
           style={{ background: `radial-gradient(circle at 25% 50%, ${deal.accent}, transparent 55%)` }} />

      <div ref={hoverRef} className="relative z-10 p-8 h-full flex flex-col justify-between">
        <div>
          <div className="text-4xl mb-3">{deal.emoji}</div>
          <p className="text-[10px] tracking-[3px] uppercase text-white/50 mb-1">{deal.subtitle}</p>
          <h3 className="font-['Bebas_Neue'] text-4xl md:text-5xl tracking-wider text-white leading-none mb-3">
            {deal.title}
          </h3>
          <div
            className="inline-block font-['Bebas_Neue'] text-3xl tracking-wider px-3 py-1 rounded-sm"
            style={{ background: deal.accent, color: "#fff" }}
          >
            {deal.discount}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-[10px] tracking-[2px] uppercase text-white/40 mb-2">Ends in</p>
          <Countdown endsAt={endsAt} />
          <button
            onClick={() => onShopDeal(deal)}
            className="mt-4 text-xs font-black tracking-[3px] uppercase px-5 py-2.5
                       border border-white/30 text-white hover:bg-white hover:text-black
                       transition-all duration-200 flex items-center gap-2"
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M2 10h20"/>
            </svg>
            Get Coupon →
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: deal.accent }} />
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const DEALS = [
  {
    title: "Flash Sale",    subtitle: "Limited Time",     discount: "Up to 40% OFF",
    accent: "#ff4f1f",      bg: "#1c1c1c",                emoji: "⚡",
    endsIn: 180,            code: "KIKS40",
    codeDesc: "40% off your entire order. Valid on all styles.",
    minOrder: 100,
  },
  {
    title: "Bundle & Save", subtitle: "Buy 2 Get 1 Free", discount: "3 FOR 2",
    accent: "#8b5cf6",      bg: "#120a2e",                emoji: "🎁",
    endsIn: 360,            code: "KIKSBUNDLE",
    codeDesc: "Buy any 2 pairs, get the cheapest one free.",
    minOrder: 200,
  },
  {
    title: "Clearance",     subtitle: "End of Season",    discount: "From $49",
    accent: "#f59e0b",      bg: "#1a0f04",                emoji: "🏷️",
    endsIn: 720,            code: "KIKSCLR",
    codeDesc: "Extra 20% off already reduced clearance items.",
    minOrder: 49,
  },
];

const OFFER_TAGS = ["All Offers", "Flash Sale", "Bundle", "Clearance", "Members Only"];

const ALL_SHOES = [
  ...featured.map(s => ({ ...s })),
  ...mens.map(s => ({ ...s })),
  ...womens.map(s => ({ ...s })),
  ...kids.map(s => ({ ...s })),
];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function OffersPage({ darkMode }) {
  const heroRef = useRef(null);
  const [tag, setTag]           = useState("All Offers");
  const [activeDeal, setActiveDeal] = useState(null);

  const bg          = darkMode ? "bg-[#0e0e0e]" : "bg-[#f2f0eb]";
  const textPrimary = darkMode ? "text-white" : "text-[#1c1c1c]";
  const textMuted   = darkMode ? "text-white/40" : "text-black/40";
  const sectionBg   = darkMode ? "bg-[#111]" : "bg-white";
  const altBg       = darkMode ? "bg-[#0e0e0e]" : "bg-[#f7f5f0]";

  const saleShoes = ALL_SHOES.slice(0, 8).map(s => ({
    ...s,
    originalPrice: Math.round(s.price * 1.3),
  }));

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 });
      tl.fromTo(".of-badge",   { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" })
        .fromTo(".of-title",   { opacity: 0, y: 50  }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.2")
        .fromTo(".of-desc",    { opacity: 0, y: 20  }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.3")
        .fromTo(".of-tags",    { opacity: 0, y: 16  }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, "-=0.2");

      gsap.to(".of-bg-text", {
        yPercent: 30, ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1.5 },
      });

      gsap.utils.toArray(".section-head").forEach((el) => {
        gsap.fromTo(el, { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" } });
      });

      gsap.utils.toArray(".deal-banner").forEach((el, i) => {
        gsap.fromTo(el, { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, delay: i * 0.1, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" } });
      });

      gsap.utils.toArray(".cards-grid").forEach((grid) => {
        const cards = grid.querySelectorAll(".shoe-card-wrap");
        gsap.fromTo(cards, { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: "power2.out",
            scrollTrigger: { trigger: grid, start: "top 85%", toggleActions: "play none none none" } });
      });

      gsap.to(".of-ticker-inner", { x: "-50%", duration: 18, ease: "none", repeat: -1 });
    });

    return () => ctx.revert();
  }, [darkMode]);

  return (
    <div className={`${bg} min-h-screen overflow-x-hidden`}>

      {/* ===== COUPON MODAL ===== */}
      {activeDeal && (
        <CouponModal
          deal={activeDeal}
          darkMode={darkMode}
          onClose={() => setActiveDeal(null)}
        />
      )}

      {/* ===== HERO ===== */}
      <section
        ref={heroRef}
        className="relative min-h-[55vh] flex items-center overflow-hidden"
        style={{
          background: darkMode
            ? "linear-gradient(135deg, #0e0e0e 0%, #1a0600 100%)"
            : "linear-gradient(135deg, #f2f0eb 0%, #e8e0d0 100%)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-[500px] h-[500px] rounded-full opacity-[0.08]"
               style={{ background: "#ff4f1f" }} />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full opacity-[0.05]"
               style={{ background: "#ff4f1f" }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-of" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke={darkMode ? "white" : "black"} strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-of)" />
          </svg>
          <div className={`of-bg-text absolute -bottom-4 left-0 right-0 text-center pointer-events-none
                           select-none font-['Bebas_Neue'] text-[130px] md:text-[190px] tracking-widest
                           leading-none ${darkMode ? "text-white/[0.03]" : "text-black/[0.04]"}`}>
            DEALS
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full pt-[88px] pb-16 relative z-10">
          <div className="of-badge inline-flex items-center gap-2 border border-[#ff4f1f]/40
                          bg-[#ff4f1f]/10 px-4 py-2 rounded-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff4f1f] animate-pulse" />
            <span className="text-[11px] font-bold tracking-[3px] uppercase text-[#ff4f1f]">
              🔥 Hot Deals
            </span>
          </div>

          <h1 className={`of-title font-['Bebas_Neue'] text-[72px] md:text-[100px] lg:text-[120px]
                          tracking-wider leading-[0.9] mb-6 ${textPrimary}`}>
            EXCLUSIVE<br />
            <span className="text-[#ff4f1f]">OFFERS</span>
          </h1>

          <p className={`of-desc text-sm leading-relaxed max-w-md mb-8 ${textMuted}`}>
            Flash sales, bundles, clearance and member-only deals. Move fast — these won't last.
          </p>

          <div className="of-tags flex flex-wrap items-center gap-2">
            {OFFER_TAGS.map(t => (
              <button
                key={t}
                onClick={() => setTag(t)}
                className={`px-4 py-2 text-[11px] font-black tracking-[2px] uppercase
                            transition-all duration-200 border rounded-sm
                            ${tag === t
                              ? "bg-[#ff4f1f] text-white border-[#ff4f1f]"
                              : darkMode
                                ? "border-white/15 text-white/50 hover:border-white/30 hover:text-white"
                                : "border-black/15 text-black/45 hover:border-black/25 hover:text-black"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TICKER ===== */}
      <div className="bg-[#ff4f1f] py-3 overflow-hidden">
        <div className="of-ticker-inner flex whitespace-nowrap">
          {Array(8).fill("⚡ FLASH SALE · FREE SHIPPING $100+ · BUY 2 GET 1 FREE · UP TO 40% OFF · LIMITED TIME · ").map((t, i) => (
            <span key={i} className="text-white text-[11px] font-black tracking-[4px] uppercase mx-8">{t}</span>
          ))}
        </div>
      </div>

      {/* ===== DEAL BANNERS ===== */}
      <section className={`${sectionBg} py-20`}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionHead label="Limited Time" title="Active Deals" accent="#ff4f1f" darkMode={darkMode} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {DEALS.map((deal) => (
              <DealBanner
                key={deal.title}
                deal={deal}
                darkMode={darkMode}
                onShopDeal={setActiveDeal}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== PROMO BANNER ===== */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: darkMode ? "#110800" : "#1c1c1c" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-20 top-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
               style={{ background: "#ff4f1f" }} />
          <div className="absolute -right-20 bottom-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
               style={{ background: "#ff4f1f" }} />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <p className="text-[11px] tracking-[5px] uppercase text-[#ff4f1f] font-bold mb-4">Members Only</p>
          <h2 className="font-['Bebas_Neue'] text-[60px] md:text-[100px] tracking-wider text-white leading-none mb-4">
            EXTRA 15% OFF
          </h2>
          <p className="text-white/50 text-sm tracking-widest mb-10 max-w-sm mx-auto">
            Sign in or create a free account to unlock exclusive member pricing on every order.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button className="bg-[#ff4f1f] text-white text-sm font-black px-10 py-4
                               tracking-[4px] uppercase hover:bg-white hover:text-[#ff4f1f]
                               transition-all duration-300">
              Join Free →
            </button>
            <button className="border border-white/25 text-white/70 text-sm font-black px-10 py-4
                               tracking-[4px] uppercase hover:border-white/50 hover:text-white
                               transition-all duration-300">
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ===== ON SALE PRODUCTS ===== */}
      <section className={`${altBg} py-20`}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionHead label="Discounted Styles" title="On Sale Now" accent="#ff4f1f" darkMode={darkMode} />
          <div className="cards-grid grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {saleShoes.map((shoe) => (
              <div key={shoe.id} className="shoe-card-wrap relative">
                <div className="absolute top-3 right-3 z-20 bg-[#ff4f1f] text-white
                                text-[10px] font-black tracking-[2px] uppercase px-2 py-1 rounded-sm">
                  Sale
                </div>
                <ShoeCard shoe={shoe} darkMode={darkMode} />
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-14">
            <button
              className={`px-12 py-4 border text-xs font-black tracking-[3px] uppercase
                          transition-all duration-200 hover:border-[#ff4f1f] hover:text-[#ff4f1f]
                          ${darkMode ? "border-white/20 text-white/50" : "border-black/20 text-black/45"}`}
            >
              Load More →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}