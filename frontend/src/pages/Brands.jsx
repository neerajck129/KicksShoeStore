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

// Brand card with hover glow
function BrandCard({ name, count, accent, logo, darkMode, active, onClick }) {
  const ref = useRef(null);
  const onEnter = () => {
    gsap.to(ref.current, { scale: 1.03, duration: 0.3, ease: "power2.out" });
  };
  const onLeave = () => {
    gsap.to(ref.current, { scale: 1, duration: 0.3, ease: "power2.inOut" });
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={`relative overflow-hidden rounded-sm p-6 text-left transition-all duration-200
                  border cursor-pointer w-full
                  ${active
                    ? "border-[#ff4f1f] bg-[#ff4f1f]/[0.06]"
                    : darkMode
                      ? "border-white/[0.07] bg-[#161616] hover:border-white/20"
                      : "border-black/[0.07] bg-white hover:border-black/20"}`}
    >
      {/* Glow on active */}
      {active && (
        <div className="absolute inset-0 opacity-10 blur-2xl pointer-events-none"
             style={{ background: `radial-gradient(circle at 30% 50%, #ff4f1f, transparent 60%)` }} />
      )}
      {/* Accent bottom line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[2px] transition-opacity duration-300"
        style={{ background: accent, opacity: active ? 1 : 0 }}
      />

      <div className="relative z-10">
        <div className="text-3xl mb-3">{logo}</div>
        <h3 className={`font-['Bebas_Neue'] text-2xl tracking-wider leading-none mb-1
                        ${active ? "text-[#ff4f1f]" : darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
          {name}
        </h3>
        <p className={`text-[10px] tracking-[2px] uppercase
                       ${darkMode ? "text-white/30" : "text-black/35"}`}>
          {count} styles
        </p>
      </div>
    </button>
  );
}

const BRANDS = [
  { name: "Nike",          count: 48, accent: "#ff4f1f", logo: "👟" },
  { name: "Adidas",        count: 36, accent: "#000",    logo: "🦶" },
  { name: "New Balance",   count: 28, accent: "#e31837", logo: "🏃" },
  { name: "Jordan",        count: 22, accent: "#e31837", logo: "🐐" },
  { name: "Puma",          count: 18, accent: "#ff0",    logo: "🐆" },
  { name: "Converse",      count: 14, accent: "#1c1c1c", logo: "⭐" },
  { name: "Vans",          count: 20, accent: "#ef3c3c", logo: "🛹" },
  { name: "Reebok",        count: 16, accent: "#0056A2", logo: "💪" },
];

const ALL_SHOES = [
  ...featured.map(s => ({ ...s })),
  ...mens.map(s => ({ ...s })),
  ...womens.map(s => ({ ...s })),
  ...kids.map(s => ({ ...s })),
];

export default function BrandsPage({ darkMode }) {
  const heroRef    = useRef(null);
  const [activeBrand, setActiveBrand] = useState(null);

  const bg          = darkMode ? "bg-[#0e0e0e]" : "bg-[#f2f0eb]";
  const textPrimary = darkMode ? "text-white" : "text-[#1c1c1c]";
  const textMuted   = darkMode ? "text-white/40" : "text-black/40";
  const sectionBg   = darkMode ? "bg-[#111]" : "bg-white";
  const altBg       = darkMode ? "bg-[#0e0e0e]" : "bg-[#f7f5f0]";

  // In a real app you'd filter by brand; here we show all shoes as a demo
  const displayShoes = ALL_SHOES.slice(0, 8);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.1 });
      tl.fromTo(".br-badge",  { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" })
        .fromTo(".br-title",  { opacity: 0, y: 50  }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.2")
        .fromTo(".br-desc",   { opacity: 0, y: 20  }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.3");

      gsap.to(".br-bg-text", {
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

      gsap.utils.toArray(".brand-card-wrap").forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.5, delay: i * 0.06, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" } }
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

      gsap.to(".br-ticker-inner", {
        x: "-50%", duration: 20, ease: "none", repeat: -1,
      });
    });

    return () => ctx.revert();
  }, [darkMode]);

  return (
    <div className={`${bg} min-h-screen overflow-x-hidden`}>

      {/* ===== HERO ===== */}
      <section
        ref={heroRef}
        className="relative min-h-[55vh] flex items-center overflow-hidden"
        style={{
          background: darkMode
            ? "linear-gradient(135deg, #0e0e0e 0%, #080a10 100%)"
            : "linear-gradient(135deg, #f2f0eb 0%, #e8e0d0 100%)",
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-[500px] h-[500px] rounded-full opacity-[0.05]"
               style={{ background: "#ff4f1f" }} />
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid-br" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke={darkMode ? "white" : "black"} strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-br)" />
          </svg>
          <div className={`br-bg-text absolute -bottom-4 left-0 right-0 text-center pointer-events-none
                           select-none font-['Bebas_Neue'] text-[130px] md:text-[190px] tracking-widest
                           leading-none ${darkMode ? "text-white/[0.03]" : "text-black/[0.04]"}`}>
            BRANDS
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 w-full pt-[88px] pb-16 relative z-10">
          <div className="br-badge inline-flex items-center gap-2 border border-[#ff4f1f]/40
                          bg-[#ff4f1f]/10 px-4 py-2 rounded-sm mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff4f1f] animate-pulse" />
            <span className="text-[11px] font-bold tracking-[3px] uppercase text-[#ff4f1f]">
              Official Partners
            </span>
          </div>

          <h1 className={`br-title font-['Bebas_Neue'] text-[72px] md:text-[100px] lg:text-[120px]
                          tracking-wider leading-[0.9] mb-6 ${textPrimary}`}>
            SHOP BY<br />
            <span className="text-[#ff4f1f]">BRAND</span>
          </h1>

          <p className={`br-desc text-sm leading-relaxed max-w-md ${textMuted}`}>
            100% authentic products from the world's most iconic footwear brands.
            Direct partnerships. No fakes. Ever.
          </p>
        </div>
      </section>

      {/* ===== TICKER ===== */}
      <div className="bg-[#ff4f1f] py-3 overflow-hidden">
        <div className="br-ticker-inner flex whitespace-nowrap">
          {Array(8).fill("NIKE · ADIDAS · NEW BALANCE · JORDAN · PUMA · CONVERSE · VANS · REEBOK · 100% AUTHENTIC · ").map((t, i) => (
            <span key={i} className="text-white text-[11px] font-black tracking-[4px] uppercase mx-8">{t}</span>
          ))}
        </div>
      </div>

      {/* ===== BRAND GRID ===== */}
      <section className={`${sectionBg} py-20`}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionHead label="Our Partners" title="All Brands" accent="#ff4f1f" darkMode={darkMode} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BRANDS.map((brand) => (
              <div key={brand.name} className="brand-card-wrap">
                <BrandCard
                  {...brand}
                  darkMode={darkMode}
                  active={activeBrand === brand.name}
                  onClick={() => setActiveBrand(activeBrand === brand.name ? null : brand.name)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS FOR SELECTED BRAND ===== */}
      <section className={`${altBg} py-20`}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionHead
            label={activeBrand ? `From ${activeBrand}` : "Featured"}
            title={activeBrand ? `${activeBrand} Collection` : "Featured Styles"}
            accent="#ff4f1f"
            darkMode={darkMode}
          />
          <div className="cards-grid grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {displayShoes.map((shoe) => (
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

      {/* ===== AUTHENTICITY PROMISE ===== */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: darkMode ? "#110800" : "#1c1c1c" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-20 top-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
               style={{ background: "#ff4f1f" }} />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "✅", title: "100% Authentic",  desc: "Every product verified by our quality team before dispatch." },
              { icon: "🤝", title: "Brand Direct",    desc: "Official partnerships with every brand we carry. Zero grey market." },
              { icon: "🔄", title: "Free Returns",    desc: "Not right? Return within 30 days, no questions asked." },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="font-['Bebas_Neue'] text-2xl tracking-wider text-white mb-2">{title}</h3>
                <p className="text-white/40 text-xs leading-relaxed tracking-wide">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}