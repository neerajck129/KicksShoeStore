import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LINKS = {
  Shop: ["New Arrivals", "Men's", "Women's", "Kids'", "Sale", "Collabs"],
  Help: ["Size Guide", "Shipping Info", "Returns", "Track Order", "FAQ"],
  Company: ["About Us", "Careers", "Press", "Sustainability", "Investors"],
};

export default function Footer({ darkMode }) {
  const footerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".footer-col",
        { opacity: 0, y: 30 },
        {
          opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "power2.out",
          scrollTrigger: { trigger: footerRef.current, start: "top 90%" },
        }
      );
    }, footerRef);
    return () => ctx.revert();
  }, []);

  const bg = darkMode ? "bg-[#0a0a0a]" : "bg-[#1c1c1c]";
  const border = darkMode ? "border-white/10" : "border-white/10";

  return (
    <footer ref={footerRef} className={`${bg} text-white/70 pt-16 pb-8`}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Top Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="footer-col col-span-2 md:col-span-2">
            <div className="flex items-center gap-1 mb-4">
              <span className="font-['Bebas_Neue'] text-4xl tracking-widest text-white">KIKS</span>
              <span className="font-['Bebas_Neue'] text-4xl text-[#ff4f1f]">.</span>
            </div>
            <p className="text-sm leading-relaxed text-white/50 max-w-xs mb-6">
              Built for those who run different. Premium footwear engineered for the streets, the track, and everywhere between.
            </p>
            {/* Newsletter */}
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 bg-white/5 border border-white/10 rounded-sm px-3 py-2 text-xs text-white/70 placeholder:text-white/30 outline-none focus:border-[#ff4f1f] transition-colors"
              />
              <button className="bg-[#ff4f1f] text-white text-xs font-bold px-4 py-2 tracking-widest uppercase hover:bg-[#e04010] transition-colors">
                Join
              </button>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title} className="footer-col">
              <h4 className="font-['Bebas_Neue'] text-base tracking-[3px] text-white mb-4">{title}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-xs text-white/40 hover:text-[#ff4f1f] transition-colors tracking-wide">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Row */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30 tracking-widest">© 2025 KIKS. All rights reserved.</p>

          <div className="flex items-center gap-6">
            {["Twitter", "Instagram", "TikTok", "YouTube"].map((s) => (
              <a key={s} href="#" className="text-xs text-white/30 hover:text-white/70 transition-colors tracking-wide">
                {s}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {["VISA", "MC", "AMEX", "PayPal"].map((p) => (
              <span key={p} className="text-[10px] border border-white/20 text-white/40 px-2 py-1 rounded-sm font-bold tracking-wider">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}