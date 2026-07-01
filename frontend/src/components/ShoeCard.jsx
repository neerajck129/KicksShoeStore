import { useRef, useState } from "react";
import gsap from "gsap";

// Real shoe image with fallback SVG silhouette
function ShoeImage({ shoe, size = "md" }) {
  const [imgError, setImgError] = useState(false);
  const heightClass = size === "lg" ? "h-36" : size === "sm" ? "h-16" : "h-28";

  if (shoe.image && !imgError) {
    return (
      <img
        src={shoe.image}
        alt={shoe.name}
        onError={() => setImgError(true)}
        className={`${heightClass} w-full object-contain`}
        style={{ filter: "drop-shadow(0 10px 28px rgba(0,0,0,0.5))" }}
      />
    );
  }

  // Fallback SVG
  const w = size === "lg" ? 220 : size === "sm" ? 120 : 170;
  const h = size === "lg" ? 110 : size === "sm" ? 60 : 86;
  return (
    <svg width={w} height={h} viewBox="0 0 220 110" fill="none">
      <ellipse cx="90" cy="98" rx="82" ry="9" fill="rgba(0,0,0,0.25)" />
      <path d="M18,82 Q30,68 55,62 L148,57 Q178,53 198,44 L210,40 Q220,37 218,48 L208,58 Q190,70 155,76 L55,85 Q30,88 18,82Z" fill={shoe.accent} opacity="0.95" />
      <path d="M148,57 L168,35 L185,32 L180,44 L158,52Z" fill="rgba(255,255,255,0.15)" />
      {[70, 88, 106, 124].map((x, i) => (
        <circle key={i} cx={x} cy={62 + i * 1.5} r="2.5" fill="rgba(255,255,255,0.35)" />
      ))}
    </svg>
  );
}

export default function ShoeCard({ shoe, darkMode, variant = "default" }) {
  const cardRef = useRef(null);
  const imgRef = useRef(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [added, setAdded] = useState(false);

  const handleMouseEnter = () => {
    gsap.to(imgRef.current, { y: -8, scale: 1.06, duration: 0.4, ease: "power2.out" });
    gsap.to(cardRef.current, { y: -4, duration: 0.35, ease: "power2.out" });
  };

  const handleMouseLeave = () => {
    gsap.to(imgRef.current, { y: 0, scale: 1, duration: 0.45, ease: "power2.inOut" });
    gsap.to(cardRef.current, { y: 0, duration: 0.35, ease: "power2.inOut" });
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setAdded(true);
    gsap.fromTo(
      e.currentTarget,
      { scale: 0.92 },
      { scale: 1, duration: 0.3, ease: "back.out(2)" }
    );
    setTimeout(() => setAdded(false), 1800);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    setWishlisted(!wishlisted);
    gsap.fromTo(e.currentTarget, { scale: 0.7 }, { scale: 1, duration: 0.35, ease: "back.out(3)" });
  };

  const cardBg = darkMode ? "bg-[#161616]" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-[#1c1c1c]";
  const textMuted = darkMode ? "text-white/40" : "text-black/40";
  const borderCol = darkMode ? "border-white/8" : "border-black/8";

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative rounded-sm border cursor-pointer transition-shadow duration-300 overflow-hidden
        ${cardBg} ${borderCol}
        hover:shadow-2xl hover:shadow-black/20
        ${variant === "featured" ? "col-span-1" : ""}
      `}
    >
      {/* Badge */}
      {shoe.badge && (
        <div
          className="absolute top-3 left-3 z-10 text-[10px] font-black px-2 py-1 tracking-widest"
          style={{ background: shoe.accent, color: "#fff" }}
        >
          {shoe.badge || shoe.tag?.toUpperCase()}
        </div>
      )}
      {shoe.tag && !shoe.badge && (
        <div className="absolute top-3 left-3 z-10 text-[10px] font-black px-2 py-1 tracking-widest bg-[#ff4f1f] text-white">
          {shoe.tag.toUpperCase()}
        </div>
      )}

      {/* Wishlist */}
      <button
        onClick={handleWishlist}
        className={`absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full border transition-all
          ${wishlisted ? "bg-[#ff4f1f] border-[#ff4f1f] text-white" : `${darkMode ? "bg-black/30 border-white/10 text-white/40" : "bg-white/70 border-black/10 text-black/40"} hover:border-[#ff4f1f] hover:text-[#ff4f1f]`}`}
      >
        <span className="text-sm">{wishlisted ? "♥" : "♡"}</span>
      </button>

      {/* Shoe Image Area */}
      <div
        className="relative flex items-center justify-center py-8 px-6 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${shoe.color} 0%, ${shoe.color}cc 100%)` }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 opacity-20 blur-2xl"
          style={{ background: `radial-gradient(circle at 60% 50%, ${shoe.accent}, transparent 70%)` }}
        />
        <div ref={imgRef} className="relative z-10 w-full flex items-center justify-center">
          <ShoeImage shoe={shoe} size={variant === "featured" ? "lg" : "md"} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div>
            <h3 className={`font-['Bebas_Neue'] text-xl tracking-wider leading-none ${textPrimary}`}>
              {shoe.name}
            </h3>
            <p className={`text-[11px] tracking-widest uppercase mt-1 ${textMuted}`}>
              {shoe.category || "Unisex"} · Lifestyle
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="font-['Bebas_Neue'] text-xl tracking-wider" style={{ color: shoe.accent }}>
              ${shoe.price}
            </div>
            {shoe.originalPrice && (
              <div className={`text-xs line-through ${textMuted}`}>${shoe.originalPrice}</div>
            )}
          </div>
        </div>

        {/* Color dots */}
        <div className="flex items-center gap-2 mb-4">
          {[shoe.accent, shoe.color === "#1c1c1c" ? "#fff" : "#1c1c1c", "#888"].map((c, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border cursor-pointer transition-transform hover:scale-125 ${i === 0 ? "ring-1 ring-offset-1 scale-110" : ""}`}
              style={{
                background: c,
                borderColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                ringColor: c,
              }}
            />
          ))}
        </div>

        {/* Add to Cart */}
        <button
          onClick={handleAddToCart}
          className="w-full py-2.5 text-xs font-black tracking-[3px] uppercase transition-all duration-200 border"
          style={
            added
              ? { background: "#22c55e", color: "#fff", borderColor: "#22c55e" }
              : {
                  background: shoe.accent,
                  color: "#fff",
                  borderColor: shoe.accent,
                }
          }
        >
          {added ? "✓ Added!" : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}