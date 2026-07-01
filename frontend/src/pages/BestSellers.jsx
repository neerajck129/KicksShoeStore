import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ShoeCard from "../components/ShoeCard.jsx";
import { featured, mens, womens, kids } from "../data/shoes.js";

gsap.registerPlugin(ScrollTrigger);

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

// Rank badge shown on top sellers
function RankBadge({ rank }) {
  const colors = ["#ff4f1f", "#f97316", "#f59e0b"];
  const bg = colors[rank - 1] || "rgba(255,255,255,0.15)";
  return (
    <div
      className="absolute top-3 left-3 z-20 w-7 h-7 rounded-sm flex items-center justify-center
                 text-white text-[11px] font-black"
      style={{ background: bg }}
    >
      #{rank}
    </div>
  );
}

// Top 3 podium card
function PodiumCard({ shoe, rank, darkMode }) {
  const ref = useRef(null);
  const onEnter = () => gsap.to(ref.current, { y: -6, duration: 0.3, ease: "power2.out" });
  const onLeave = () => gsap.to(ref.current, { y: 0,  duration: 0.3, ease: "power2.inOut" });

  return (
    <div
      ref={ref}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`relative overflow-hidden rounded-sm cursor-pointer
                  ${rank === 1 ? "md:col-span-2" : ""}`}
      style={{
        background: darkMode
          ? "linear-gradient(135deg, #1a1a1a 0%, #111 100%)"
          : "linear-gradient(135deg, #fff 0%, #f7f5f0 100%)",
        border: rank === 1
          ? "1.5px solid rgba(255,79,31,0.4)"
          : darkMode ? "1px solid rgba(255,255,255,0.06)" : "1px solid rgba(0,0,0,0.07)",
      }}
    >
      {rank === 1 && (
        <div className="absolute inset-0 opacity-[0.06]"
             style={{ background: "radial-gradient(circle at 70% 50%, #ff4f1f, transparent 60%)" }} />
      )}
      <div className="relative z-10 p-6">
        <div className="flex items-start justify-between mb-4">
          <RankBadge rank={rank} />
          <span className={`text-[10px] font-black tracking-[3px] uppercase px-3 py-1 rounded-sm
                            ${rank === 1
                              ? "bg-[#ff4f1f]/15 text-[#ff4f1f]"
                              : darkMode ? "bg-white/8 text-white/40" : "bg-black/6 text-black/35"}`}>
            {rank === 1 ? "🏆 Top Pick" : rank === 2 ? "🥈 Runner Up" : "🥉 Fan Fave"}
          </span>
        </div>
        <div className="flex gap-6 items-center">
          <img
            src={shoe.image || `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop`}
            alt={shoe.name}
            className="w-28 h-20 object-cover rounded-sm flex-shrink-0"
            onError={e => { e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=200&fit=crop"; }}
          />
          <div>
            <p className={`text-[11px] tracking-[3px] uppercase mb-1 font-bold
                           ${darkMode ? "text-white/35" : "text-black/35"}`}>
              {shoe.brand || "KIKS"}
            </p>
            <h3 className={`font-['Bebas_Neue'] text-2xl tracking-wider leading-none mb-2
                            ${darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
              {shoe.name}
            </h3>
            <p className="text-[#ff4f1f] font-black text-lg">${shoe.price}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const ALL_SHOES = [
  ...featured.map(s => ({ ...s, tag: "Featured" })),
  ...mens.map(s => ({ ...s, tag: "Men" })),
  ...womens.map(s => ({ ...s, tag: "Women" })),
  ...kids.map(s => ({ ...s, tag: "Kids" })),
];

const FILTERS = ["All", "Men", "Women", "Kids"];

export default function BestSellersPage({ darkMode }) {
  const heroRef  = useRef(null);
  const [filter, setFilter] = useState("All");

  const bg          = darkMode ? "bg-[#0e0e0e]" : "bg-[#f2f0eb]";
  const textPrimary = darkMode ? "text-white" : "text-[#1c1c1c]";
  const textMuted   = darkMode ? "text-white/40" : "text-black/40";
  const sectionBg   = darkMode ? "bg-[#111]" : "bg-white";
  const altBg       = darkMode ? "bg-[#0e0e0e]" : "bg-[#f7f5f0]";

  const filtered = ALL_SHOES.filter(s => filter === "All" || s.tag === filter);
  const topThree = filtered.slice(0, 3);
  const rest     = filtered.slice(3);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 });
      tl.fromTo(".bs-badge",   { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" })
        .fromTo(".bs-title",   { opacity: 0, y: 50  }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.2")
        .fromTo(".bs-desc",    { opacity: 0, y: 20  }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.3")
        .fromTo(".bs-filters", { opacity: 0, y: 16  }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out"}, "-=0.2");

      gsap.to(".bs-bg-text", {
        yPercent: 30, ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1.5 },
      });

      gsap.utils.toArray(".section-head").forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" } }
        );
      });

      gsap.utils.toArray(".cards-grid").forEach((grid) => {
        const cards = grid.querySelectorAll(".shoe-card-wrap");
        gsap.fromTo(cards,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: "power2.out",
            scrollTrigger: { trigger: grid, start: "top 85%", toggleActions: "play none none none" } }
        );
      });

      gsap.utils.toArray(".podium-card").forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, delay: i * 0.1, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" } }
        );
      });

      gsap.to(".bs-ticker-inner", {
        x: "-50%", duration: 22, ease: "none", repeat: -1,
      });

      // Count-up stats
      gsap.utils.toArray(".count-up").forEach((el) => {
        const target = parseInt(el.dataset.target);
        gsap.fromTo({ val: 0 }, { val: target }, {
          duration: 1.5, ease: "power2.out",
          onUpdate: function () { el.textContent = Math.round(this.targets()[0].val).toLocaleString(); },
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
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
            ? "linear-gradient(135deg, #0e0e0e 0%, #0a0a1a 100%)"
            : "linear-gradient(135deg, #f2f0eb 0%, #e8e0d0 100%)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-[500px] h-[500px] rounded-full opacity-[0.05]"
               style={{ background: "#ff4f1f" }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-bs" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke={darkMode ? "white" : "black"} strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-bs)" />
          </svg>
          <div className={`bs-bg-text absolute -bottom-4 left-0 right-0 text-center pointer-events-none
                           select-none font-['Bebas_Neue'] text-[140px] md:text-[200px] tracking-widest
                           leading-none ${darkMode ? "text-white/[0.03]" : "text-black/[0.04]"}`}>
            BEST
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full pt-[88px] pb-16 relative z-10">
          <div className="bs-badge inline-flex items-center gap-2 border border-[#ff4f1f]/40
                          bg-[#ff4f1f]/10 px-4 py-2 rounded-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff4f1f] animate-pulse" />
            <span className="text-[11px] font-bold tracking-[3px] uppercase text-[#ff4f1f]">
              Customer Favourites
            </span>
          </div>

          <h1 className={`bs-title font-['Bebas_Neue'] text-[72px] md:text-[100px] lg:text-[120px]
                          tracking-wider leading-[0.9] mb-6 ${textPrimary}`}>
            BEST<br />
            <span className="text-[#ff4f1f]">SELLERS</span>
          </h1>

          <p className={`bs-desc text-sm leading-relaxed max-w-md mb-8 ${textMuted}`}>
            The styles our customers keep coming back for. Proven quality, unbeatable style.
          </p>

          {/* Filter pills */}
          <div className="bs-filters flex flex-wrap items-center gap-2">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-[11px] font-black tracking-[2px] uppercase
                            transition-all duration-200 border rounded-sm
                            ${filter === f
                              ? "bg-[#ff4f1f] text-white border-[#ff4f1f]"
                              : darkMode
                                ? "border-white/15 text-white/50 hover:border-white/30 hover:text-white"
                                : "border-black/15 text-black/45 hover:border-black/25 hover:text-black"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== TICKER ===== */}
      <div className="bg-[#ff4f1f] py-3 overflow-hidden">
        <div className="bs-ticker-inner flex whitespace-nowrap">
          {Array(8).fill("TOP RATED · CUSTOMER FAVOURITES · FREE SHIPPING $100+ · AUTHENTIC ONLY · SHOP NOW · ").map((t, i) => (
            <span key={i} className="text-white text-[11px] font-black tracking-[4px] uppercase mx-8">{t}</span>
          ))}
        </div>
      </div>

      {/* ===== PODIUM — TOP 3 ===== */}
      <section className={`${sectionBg} py-20`}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionHead label="Community Voted" title="Top 3 Picks" accent="#ff4f1f" darkMode={darkMode} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {topThree.map((shoe, i) => (
              <div key={shoe.id} className={`podium-card ${i === 0 ? "md:col-span-1" : ""}`}>
                <PodiumCard shoe={shoe} rank={i + 1} darkMode={darkMode} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== STATS STRIP ===== */}
      <div
        className="py-12 border-y"
        style={{
          background: darkMode ? "#0a0a0a" : "#1c1c1c",
          borderColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.1)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Units Sold",       target: 12400, suffix: "+" },
              { label: "5-Star Reviews",   target: 3800,  suffix: "+" },
              { label: "Repeat Customers", target: 68,    suffix: "%" },
              { label: "Brands Stocked",   target: 24,    suffix: ""  },
            ].map(({ label, target, suffix }) => (
              <div key={label}>
                <div className="font-['Bebas_Neue'] text-4xl tracking-wider text-[#ff4f1f]">
                  <span className="count-up" data-target={target}>0</span>{suffix}
                </div>
                <div className="text-[10px] tracking-[2px] uppercase text-white/40 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== ALL BEST SELLERS ===== */}
      <section className={`${altBg} py-20`}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionHead label="All-Time Favourites" title="Full Collection" accent="#ff4f1f" darkMode={darkMode} />
          <div className="cards-grid grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {rest.map((shoe) => (
              <div key={shoe.id} className="shoe-card-wrap">
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