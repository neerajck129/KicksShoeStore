import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ShoeCard from "../components/ShoeCard.jsx";
import { featured, mens, womens, kids } from "../data/shoes.js";

gsap.registerPlugin(ScrollTrigger);

// Hero shoe image with SVG fallback
function HeroShoe({ accent }) {
  const [imgError, setImgError] = useState(false);
  if (!imgError) {
    return (
      <img
        src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&h=400&fit=crop&auto=format"
        alt="Featured Shoe"
        onError={() => setImgError(true)}
        className="w-full drop-shadow-2xl"
        style={{ filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.6))" }}
      />
    );
  }
  return (
    <svg width="100%" viewBox="0 0 520 260" fill="none" className="drop-shadow-2xl">
      <ellipse cx="220" cy="236" rx="195" ry="18" fill="rgba(0,0,0,0.3)" />
      <path d="M35,195 Q55,168 95,158 L330,148 Q395,142 440,124 L468,116 Q488,110 485,128 L468,144 Q440,162 368,172 L95,188 Q55,193 35,195Z" fill={accent} opacity="0.97" />
      <path d="M330,148 L375,90 L412,84 L405,108 L348,132Z" fill="rgba(255,255,255,0.2)" />
      {[145, 180, 215, 255, 295].map((x, i) => (
        <circle key={i} cx={x} cy={155 + i * 2} r="4" fill="rgba(255,255,255,0.3)" />
      ))}
    </svg>
  );
}

// Section heading component
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

// Category Banner
function CategoryBanner({ title, subtitle, accent, bg, darkMode, emoji }) {
  const ref = useRef(null);
  const hoverRef = useRef(null);

  const onEnter = () => {
    gsap.to(hoverRef.current, { scale: 1.05, duration: 0.5, ease: "power2.out" });
  };
  const onLeave = () => {
    gsap.to(hoverRef.current, { scale: 1, duration: 0.4, ease: "power2.inOut" });
  };

  return (
    <div
      ref={ref}
      className="category-banner relative overflow-hidden cursor-pointer rounded-sm"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ background: bg, minHeight: 180 }}
    >
      {/* Glow */}
      <div
        className="absolute inset-0 opacity-30 blur-3xl"
        style={{ background: `radial-gradient(circle at 30% 50%, ${accent}, transparent 60%)` }}
      />
      <div ref={hoverRef} className="relative z-10 p-8 h-full flex flex-col justify-between">
        <div className="text-4xl mb-4">{emoji}</div>
        <div>
          <h3 className="font-['Bebas_Neue'] text-4xl tracking-wider text-white leading-none mb-1">
            {title}
          </h3>
          <p className="text-xs text-white/50 tracking-widest uppercase mb-4">{subtitle}</p>
          <button
            className="text-xs font-black tracking-[3px] uppercase px-4 py-2 border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-200"
          >
            Shop →
          </button>
        </div>
      </div>
      {/* Decorative accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px]"
        style={{ background: accent }}
      />
    </div>
  );
}

export default function LandingPage({ darkMode }) {
  const heroRef      = useRef(null);
  const heroTextRef  = useRef(null);
  const heroShoeRef  = useRef(null);

  const bg           = darkMode ? "bg-[#0e0e0e]" : "bg-[#f2f0eb]";
  const textPrimary  = darkMode ? "text-white" : "text-[#1c1c1c]";
  const textMuted    = darkMode ? "text-white/40" : "text-black/40";
  const sectionBg    = darkMode ? "bg-[#111]" : "bg-white";
  const altSectionBg = darkMode ? "bg-[#0e0e0e]" : "bg-[#f7f5f0]";

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance timeline
      const tl = gsap.timeline({ delay: 0.1 });
      tl.fromTo(".hero-badge",        { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.5, ease: "power2.out" })
        .fromTo(".hero-h1 .line1",    { opacity: 0, y: 60 },  { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.2")
        .fromTo(".hero-h1 .line2",    { opacity: 0, y: 60 },  { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.5")
        .fromTo(".hero-h1 .line3",    { opacity: 0, y: 60 },  { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.5")
        .fromTo(".hero-desc",         { opacity: 0, y: 20 },  { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.3")
        .fromTo(".hero-btns",         { opacity: 0, y: 20 },  { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.3")
        .fromTo(heroShoeRef.current,  { opacity: 0, x: 60, rotate: 3 }, { opacity: 1, x: 0, rotate: 0, duration: 1, ease: "power3.out" }, "-=0.8")
        .fromTo(".hero-stats .stat-item", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: "power2.out" }, "-=0.4");

      // Parallax on hero shoe
      gsap.to(heroShoeRef.current, {
        yPercent: -20,
        ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1.5 },
      });

      // Parallax on hero text
      gsap.to(heroTextRef.current, {
        yPercent: 12,
        ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1 },
      });

      // Section heading reveal
      gsap.utils.toArray(".section-head").forEach((el) => {
        gsap.fromTo(el,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 85%", toggleActions: "play none none none" } }
        );
      });

      // Cards stagger reveal
      gsap.utils.toArray(".cards-grid").forEach((grid) => {
        const cards = grid.querySelectorAll(".shoe-card-wrap");
        gsap.fromTo(cards,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.1, ease: "power2.out",
            scrollTrigger: { trigger: grid, start: "top 85%", toggleActions: "play none none none" } }
        );
      });

      // Category banners
      gsap.utils.toArray(".category-banner").forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, x: i % 2 === 0 ? -40 : 40 },
          { opacity: 1, x: 0, duration: 0.65, ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 88%", toggleActions: "play none none none" } }
        );
      });

      // Marquee ticker
      gsap.to(".ticker-inner", {
        x: "-50%",
        duration: 18,
        ease: "none",
        repeat: -1,
      });

      // Stats counter animation
      gsap.utils.toArray(".count-up").forEach((el) => {
        const target = parseInt(el.dataset.target);
        gsap.fromTo({ val: 0 }, { val: target },
          {
            duration: 1.5,
            ease: "power2.out",
            onUpdate: function () { el.textContent = Math.round(this.targets()[0].val).toLocaleString(); },
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          }
        );
      });

    });

    return () => ctx.revert();
  }, [darkMode]);

  return (
    <div className={`${bg} min-h-screen overflow-x-hidden`}>

      {/* ===== HERO =====
          FIX: The section starts at top:0 (behind the fixed header).
          The header is h-14 (56px) + 2px pinline = 58px total.
          We use min-h-screen and flex items-center so content is vertically centred.
          The inner grid uses pt-[72px] so text clears the header with breathing room.
      */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          background: darkMode
            ? "linear-gradient(135deg, #0e0e0e 0%, #1a1006 100%)"
            : "linear-gradient(135deg, #f2f0eb 0%, #e8e0d0 100%)"
        }}
      >
        {/* Background geometric */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute -top-20 -right-20 w-[600px] h-[600px] rounded-full opacity-[0.06]"
            style={{ background: "#ff4f1f" }}
          />
          <div
            className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full opacity-[0.04]"
            style={{ background: "#ff4f1f" }}
          />
          {/* Grid lines */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke={darkMode ? "white" : "black"} strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* KEY FIX: pt-[72px] ensures content sits below the 58px header with extra breathing room */}
        <div className="max-w-7xl mx-auto px-6 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-[72px] pb-16">

          {/* Hero Text */}
          <div ref={heroTextRef} className="relative z-10">
            <div className="hero-badge inline-flex items-center gap-2 border border-[#ff4f1f]/40 bg-[#ff4f1f]/10 px-4 py-2 rounded-sm mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff4f1f] animate-pulse" />
              <span className="text-[11px] font-bold tracking-[3px] uppercase text-[#ff4f1f]">New Drops</span>
            </div>

            <h1 className="hero-h1 font-['Bebas_Neue'] leading-[0.92] mb-6">
              <span className={`line1 block text-[72px] md:text-[96px] lg:text-[108px] tracking-wider ${textPrimary}`}>RUN</span>
              <span className="line2 block text-[72px] md:text-[96px] lg:text-[108px] tracking-wider text-[#ff4f1f]">DIFFERENT</span>
              <span className={`line3 block text-[72px] md:text-[96px] lg:text-[108px] tracking-wider ${textPrimary}`}>NOW.</span>
            </h1>

            <p className={`hero-desc text-sm leading-relaxed max-w-sm mb-8 ${textMuted}`}>
              Engineered for speed. Built for style. The new collection blurs the line between the track and the streets.
            </p>

            <div className="hero-btns flex flex-wrap items-center gap-4">
              <button className="bg-[#ff4f1f] text-white text-xs font-black px-8 py-4 tracking-[3px] uppercase hover:bg-[#e04010] transition-all duration-200 hover:scale-105 active:scale-95">
                Shop the Drop →
              </button>
              <button className={`text-xs font-black px-6 py-4 tracking-[3px] uppercase border transition-all duration-200 hover:border-[#ff4f1f] hover:text-[#ff4f1f]
                ${darkMode ? "border-white/20 text-white/60" : "border-black/20 text-black/50"}`}>
                View Lookbook
              </button>
            </div>

            {/* Stats */}
            <div className="hero-stats flex items-center gap-8 mt-12 pt-8 border-t"
              style={{ borderColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)" }}>
              {[
                { label: "Styles",           target: 240,   suffix: "+" },
                { label: "Happy Customers",  target: 58000, suffix: "+" },
                { label: "Countries",        target: 42,    suffix: ""  },
              ].map(({ label, target, suffix }) => (
                <div key={label} className="stat-item">
                  <div className={`font-['Bebas_Neue'] text-3xl tracking-wider ${textPrimary}`}>
                    <span className="count-up" data-target={target}>0</span>{suffix}
                  </div>
                  <div className={`text-[10px] tracking-[2px] uppercase ${textMuted}`}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Shoe */}
          <div ref={heroShoeRef} className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="w-80 h-80 rounded-full opacity-20 blur-3xl"
                style={{ background: "#ff4f1f" }}
              />
            </div>
            <div className="relative z-10 w-full max-w-lg">
              <HeroShoe accent="#ff4f1f" />
            </div>
            {/* Floating price tag */}
            <div className="absolute top-4 right-4 md:right-0 bg-[#ff4f1f] text-white px-4 py-3 z-20">
              <div className="font-['Bebas_Neue'] text-2xl tracking-wider">From $169</div>
              <div className="text-[10px] tracking-widest opacity-80">Free shipping</div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 ${textMuted}`}>
          <span className="text-[10px] tracking-[3px] uppercase">Scroll</span>
          <div className="w-px h-10 bg-current opacity-30 animate-pulse" />
        </div>
      </section>

      {/* ===== TICKER ===== */}
      <div className="bg-[#ff4f1f] py-3 overflow-hidden">
        <div className="ticker-inner flex whitespace-nowrap">
          {Array(8).fill("FREE SHIPPING ON ORDERS $100+ · NEW DROP SS2025 · LIMITED COLLABS · SHOP NOW · ").map((t, i) => (
            <span key={i} className="text-white text-[11px] font-black tracking-[4px] uppercase mx-8">{t}</span>
          ))}
        </div>
      </div>

      {/* ===== FEATURED ===== */}
      <section className={`${sectionBg} py-20`}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionHead label="Editor's Pick" title="Featured Drops" accent="#ff4f1f" darkMode={darkMode} />
          <div className="cards-grid grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featured.map((shoe) => (
              <div key={shoe.id} className="shoe-card-wrap">
                <ShoeCard shoe={shoe} darkMode={darkMode} variant="featured" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CATEGORY BANNERS ===== */}
      <section className={`${altSectionBg} py-20`}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionHead label="Browse by" title="Collections" accent="#ff4f1f" darkMode={darkMode} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CategoryBanner
              title="Men's"
              subtitle="240+ styles · Updated weekly"
              accent="#ff4f1f"
              bg="#1c1c1c"
              darkMode={darkMode}
              emoji="👟"
            />
            <CategoryBanner
              title="Women's"
              subtitle="180+ styles · Exclusive drops"
              accent="#e040fb"
              bg="#1a0a2e"
              darkMode={darkMode}
              emoji="✨"
            />
            <CategoryBanner
              title="Kids'"
              subtitle="120+ styles · Built to last"
              accent="#f59e0b"
              bg="#1a0f04"
              darkMode={darkMode}
              emoji="🚀"
            />
          </div>
        </div>
      </section>

      {/* ===== PROMO BANNER ===== */}
      <section
        className="py-24 relative overflow-hidden"
        style={{ background: darkMode ? "#110800" : "#1c1c1c" }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-20 top-0 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "#ff4f1f" }} />
          <div className="absolute -right-20 bottom-0 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "#ff4f1f" }} />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <p className="text-[11px] tracking-[5px] uppercase text-[#ff4f1f] font-bold mb-4">Limited Time</p>
          <h2 className="font-['Bebas_Neue'] text-[80px] md:text-[120px] tracking-wider text-white leading-none mb-6">
            UP TO 40% OFF
          </h2>
          <p className="text-white/50 text-sm tracking-widest mb-10 max-w-md mx-auto">
            Shop the end-of-season sale. Limited stock. Free returns on all orders.
          </p>
          <button className="bg-[#ff4f1f] text-white text-sm font-black px-12 py-4 tracking-[4px] uppercase hover:bg-white hover:text-[#ff4f1f] transition-all duration-300">
            Shop Sale →
          </button>
        </div>
      </section>

      {/* ===== MEN'S COLLECTION ===== */}
      <section className={`${sectionBg} py-20`}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionHead label="For Him" title="Men's Collection" accent="#ff4f1f" darkMode={darkMode} />
          <div className="cards-grid grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {mens.map((shoe) => (
              <div key={shoe.id} className="shoe-card-wrap">
                <ShoeCard shoe={{ ...shoe, category: "men" }} darkMode={darkMode} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WOMEN'S COLLECTION ===== */}
      <section className={`${altSectionBg} py-20`}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionHead label="For Her" title="Women's Collection" accent="#e040fb" darkMode={darkMode} />
          <div className="cards-grid grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {womens.map((shoe) => (
              <div key={shoe.id} className="shoe-card-wrap">
                <ShoeCard shoe={{ ...shoe, category: "women" }} darkMode={darkMode} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== KIDS COLLECTION ===== */}
      <section className={`${sectionBg} py-20`}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionHead label="Little Runners" title="Kids' Collection" accent="#f59e0b" darkMode={darkMode} />
          <div className="cards-grid grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {kids.map((shoe) => (
              <div key={shoe.id} className="shoe-card-wrap">
                <ShoeCard shoe={{ ...shoe, category: "kids" }} darkMode={darkMode} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY US ===== */}
      <section className={`${altSectionBg} py-20`}>
        <div className="max-w-7xl mx-auto px-6">
          <SectionHead label="The KIKS Promise" title="Why Choose Us" accent="#ff4f1f" darkMode={darkMode} />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { icon: "🚀", title: "48hr Delivery",  desc: "Fast tracked shipping to your door, anywhere in the country." },
              { icon: "↩",  title: "Free Returns",   desc: "Not the right fit? Returns are always free, no questions asked." },
              { icon: "✅", title: "Authentic Only", desc: "100% genuine products, direct from brand partners worldwide." },
              { icon: "🎯", title: "Expert Curation",desc: "Every drop hand-picked by our style team. Nothing generic." },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className={`p-6 border rounded-sm section-head group hover:border-[#ff4f1f] transition-colors duration-300
                  ${darkMode ? "border-white/8 bg-[#161616]" : "border-black/8 bg-white"}`}
              >
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className={`font-['Bebas_Neue'] text-xl tracking-wider mb-2 group-hover:text-[#ff4f1f] transition-colors ${textPrimary}`}>
                  {title}
                </h3>
                <p className={`text-xs leading-relaxed ${textMuted}`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}