import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ShoeCard from "../components/ShoeCard.jsx";
import { featured, mens, womens, kids } from "../data/shoes.js";

gsap.registerPlugin(ScrollTrigger);

// Reuse same SectionHead pattern from LandingPage
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

// Filter pill button
function FilterPill({ label, active, accent, darkMode, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-[11px] font-black tracking-[2px] uppercase transition-all duration-200
                  border rounded-sm
                  ${active
                    ? "bg-[#ff4f1f] text-white border-[#ff4f1f]"
                    : darkMode
                      ? "border-white/15 text-white/50 hover:border-white/30 hover:text-white"
                      : "border-black/15 text-black/45 hover:border-black/25 hover:text-black"}`}
    >
      {label}
    </button>
  );
}

const ALL_SHOES = [
  ...featured.map(s => ({ ...s, tag: "Featured" })),
  ...mens.map(s => ({ ...s, tag: "Men" })),
  ...womens.map(s => ({ ...s, tag: "Women" })),
  ...kids.map(s => ({ ...s, tag: "Kids" })),
];

const FILTERS = ["All", "Featured", "Men", "Women", "Kids"];

const SORT_OPTIONS = ["Newest", "Price: Low–High", "Price: High–Low", "Popular"];

export default function NewArrivalsPage({ darkMode }) {
  const heroRef     = useRef(null);
  const [filter, setFilter]   = useState("All");
  const [sort, setSort]       = useState("Newest");
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);

  const bg          = darkMode ? "bg-[#0e0e0e]" : "bg-[#f2f0eb]";
  const textPrimary = darkMode ? "text-white" : "text-[#1c1c1c]";
  const textMuted   = darkMode ? "text-white/40" : "text-black/40";
  const sectionBg   = darkMode ? "bg-[#111]" : "bg-white";

  const filtered = ALL_SHOES.filter(s => filter === "All" || s.tag === filter);

  // Close sort dropdown on outside click
  useEffect(() => {
    const fn = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance
      const tl = gsap.timeline({ delay: 0.1 });
      tl.fromTo(".na-badge",   { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" })
        .fromTo(".na-title",   { opacity: 0, y: 50  }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.2")
        .fromTo(".na-desc",    { opacity: 0, y: 20  }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.3")
        .fromTo(".na-filters", { opacity: 0, y: 16  }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, "-=0.2");

      // Parallax hero bg text
      gsap.to(".na-bg-text", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1.5 },
      });

      // Section head reveals
      gsap.utils.toArray(".section-head").forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" } }
        );
      });

      // Cards stagger
      gsap.utils.toArray(".cards-grid").forEach((grid) => {
        const cards = grid.querySelectorAll(".shoe-card-wrap");
        gsap.fromTo(cards,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: "power2.out",
            scrollTrigger: { trigger: grid, start: "top 85%", toggleActions: "play none none none" } }
        );
      });

      // Ticker
      gsap.to(".na-ticker-inner", {
        x: "-50%", duration: 20, ease: "none", repeat: -1,
      });
    });

    return () => ctx.revert();
  }, [darkMode, filter]);

  return (
    <div className={`${bg} min-h-screen overflow-x-hidden`}>

      {/* ===== HERO ===== */}
      <section
        ref={heroRef}
        className="relative min-h-[55vh] flex items-center overflow-hidden"
        style={{
          background: darkMode
            ? "linear-gradient(135deg, #0e0e0e 0%, #1a0a06 100%)"
            : "linear-gradient(135deg, #f2f0eb 0%, #e8e0d0 100%)",
        }}
      >
        {/* Background circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-[500px] h-[500px] rounded-full opacity-[0.05]"
               style={{ background: "#ff4f1f" }} />
          <div className="absolute bottom-0 left-1/3 w-[300px] h-[300px] rounded-full opacity-[0.04]"
               style={{ background: "#ff4f1f" }} />
          {/* Grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-na" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke={darkMode ? "white" : "black"} strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-na)" />
          </svg>
          {/* Huge BG text */}
          <div className={`na-bg-text absolute -bottom-4 left-0 right-0 text-center pointer-events-none select-none
                           font-['Bebas_Neue'] text-[160px] md:text-[220px] tracking-widest leading-none
                           ${darkMode ? "text-white/[0.03]" : "text-black/[0.04]"}`}>
            NEW
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full pt-[88px] pb-16 relative z-10">
          <div className="na-badge inline-flex items-center gap-2 border border-[#ff4f1f]/40
                          bg-[#ff4f1f]/10 px-4 py-2 rounded-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff4f1f] animate-pulse" />
            <span className="text-[11px] font-bold tracking-[3px] uppercase text-[#ff4f1f]">
              Just Landed
            </span>
          </div>

          <h1 className={`na-title font-['Bebas_Neue'] text-[72px] md:text-[100px] lg:text-[120px]
                          tracking-wider leading-[0.9] mb-6 ${textPrimary}`}>
            NEW<br />
            <span className="text-[#ff4f1f]">ARRIVALS</span>
          </h1>

          <p className={`na-desc text-sm leading-relaxed max-w-md mb-8 ${textMuted}`}>
            The freshest drops, updated weekly. Be the first to own what's new.
          </p>

          {/* Filter pills */}
          <div className="na-filters flex flex-wrap items-center gap-2">
            {FILTERS.map(f => (
              <FilterPill
                key={f}
                label={f}
                active={filter === f}
                darkMode={darkMode}
                onClick={() => setFilter(f)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ===== TICKER ===== */}
      <div className="bg-[#ff4f1f] py-3 overflow-hidden">
        <div className="na-ticker-inner flex whitespace-nowrap">
          {Array(8).fill("JUST DROPPED · LIMITED STOCK · FREE SHIPPING $100+ · NEW WEEKLY · SHOP NOW · ").map((t, i) => (
            <span key={i} className="text-white text-[11px] font-black tracking-[4px] uppercase mx-8">{t}</span>
          ))}
        </div>
      </div>

      {/* ===== PRODUCTS GRID ===== */}
      <section className={`${sectionBg} py-20`}>
        <div className="max-w-7xl mx-auto px-6">

          {/* Sort + count bar */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-[11px] tracking-[4px] uppercase mb-1 font-bold text-[#ff4f1f]">
                {filter === "All" ? "All Styles" : filter}
              </p>
              <h2 className={`font-['Bebas_Neue'] text-4xl md:text-5xl tracking-wider leading-none ${textPrimary}`}>
                New Arrivals
              </h2>
            </div>

            {/* Sort dropdown */}
            <div className="relative hidden md:block" ref={sortRef}>
              <button
                onClick={() => setSortOpen(o => !o)}
                className={`flex items-center gap-2 px-4 py-2.5 border text-xs font-bold
                            tracking-[2px] uppercase transition-all duration-200
                            ${darkMode
                              ? "border-white/15 text-white/55 hover:border-white/30 hover:text-white"
                              : "border-black/15 text-black/45 hover:border-black/25 hover:text-black"}`}
              >
                {sort}
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5"
                     viewBox="0 0 24 24"
                     className={`transition-transform duration-200 ${sortOpen ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {sortOpen && (
                <div className={`absolute right-0 top-12 w-48 border shadow-xl z-50 overflow-hidden
                                 ${darkMode ? "bg-[#141414] border-white/[0.07]" : "bg-white border-black/[0.07]"}`}>
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt}
                      onClick={() => { setSort(opt); setSortOpen(false); }}
                      className={`w-full text-left px-4 py-3 text-xs font-bold tracking-[2px] uppercase
                                  transition-colors duration-150 hover:bg-[#ff4f1f]/[0.07] hover:text-[#ff4f1f]
                                  ${sort === opt ? "text-[#ff4f1f]" : darkMode ? "text-white/55" : "text-black/50"}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Result count */}
          <p className={`text-[11px] tracking-[3px] uppercase mb-8 ${textMuted}`}>
            {filtered.length} styles found
          </p>

          <div className="cards-grid grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {filtered.map((shoe) => (
              <div key={shoe.id} className="shoe-card-wrap">
                <ShoeCard shoe={shoe} darkMode={darkMode} variant="featured" />
              </div>
            ))}
          </div>

          {/* Load more */}
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

      {/* ===== WHY SHOP NEW ===== */}
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
          <p className="text-[11px] tracking-[5px] uppercase text-[#ff4f1f] font-bold mb-4">
            Stay Ahead
          </p>
          <h2 className="font-['Bebas_Neue'] text-[60px] md:text-[100px] tracking-wider text-white leading-none mb-6">
            UPDATED EVERY WEEK
          </h2>
          <p className="text-white/50 text-sm tracking-widest mb-10 max-w-md mx-auto">
            New drops land every Monday. Subscribe and never miss a release.
          </p>
          <button className="bg-[#ff4f1f] text-white text-sm font-black px-12 py-4 tracking-[4px] uppercase
                             hover:bg-white hover:text-[#ff4f1f] transition-all duration-300">
            Notify Me →
          </button>
        </div>
      </section>
    </div>
  );
}