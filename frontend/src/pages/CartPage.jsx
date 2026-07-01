// src/pages/CartPage.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Constants ──────────────────────────────────────────────────────────────────
const RECENT_ADDRESS_KEY  = "kiks_recent_address";
const MAX_RECENT          = 3;

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa",
  "Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala",
  "Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland",
  "Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura",
  "Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu","Delhi","Jammu and Kashmir",
  "Ladakh","Lakshadweep","Puducherry",
];

const COUPONS = {
  KIKS40:     { type: "pct",   value: 40,  min: 100,  label: "40% off entire order"          },
  KIKSBUNDLE: { type: "fixed", value: 500, min: 200,  label: "₹500 off on orders above ₹200" },
  KIKSCLR:    { type: "pct",   value: 20,  min: 49,   label: "20% off clearance items"       },
};

// ── Local storage helpers ──────────────────────────────────────────────────────
const getRecents = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_ADDRESS_KEY) || "[]"); }
  catch { return []; }
};
const saveRecent = (addr) => {
  const filtered = getRecents().filter(a => !(a.phone === addr.phone && a.name === addr.name));
  const updated  = [{ ...addr, savedAt: Date.now() }, ...filtered].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_ADDRESS_KEY, JSON.stringify(updated));
  return updated;
};

// ── Icons ──────────────────────────────────────────────────────────────────────
const TrashIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

// ── Empty cart ─────────────────────────────────────────────────────────────────
function EmptyCart({ darkMode, setCurrentPage }) {
  return (
    <div className="flex flex-col items-center justify-center py-40 px-6 text-center">
      <div className={`w-24 h-24 rounded-2xl flex items-center justify-center mb-6
                       ${darkMode ? "bg-white/[0.04]" : "bg-black/[0.04]"}`}>
        <svg width="40" height="40" fill="none"
             stroke={darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}
             strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      </div>
      <h2 className={`font-['Bebas_Neue'] text-5xl tracking-wider mb-2
                      ${darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
        Your Bag is Empty
      </h2>
      <p className={`text-sm max-w-xs mb-8 leading-relaxed
                     ${darkMode ? "text-white/35" : "text-black/35"}`}>
        Looks like you haven't added anything yet.
      </p>
      <button onClick={() => setCurrentPage("products")}
        className="bg-[#ff4f1f] text-white text-xs font-black px-10 py-4
                   tracking-[3px] uppercase hover:bg-[#e04010] transition-all
                   duration-200 hover:scale-105 active:scale-95 rounded-sm">
        Browse Products →
      </button>
    </div>
  );
}

// ── Cart item ──────────────────────────────────────────────────────────────────
function CartItem({ item, darkMode, onRemove, onQtyChange }) {
  const ref = useRef(null);
  const [removing,     setRemoving]     = useState(false);
  const [updating,     setUpdating]     = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const product = item.product;

  const handleQty = (delta) => {
    const newQty = item.quantity + delta;
    if (newQty < 1 || updating) return;
    setUpdating(true);
    onQtyChange(product._id, newQty, item.size).finally(() => setUpdating(false));
  };

  const handleConfirmRemove = () => {
    setRemoving(true);
    gsap.to(ref.current, {
      opacity: 0, x: -24, height: 0, marginBottom: 0,
      paddingTop: 0, paddingBottom: 0, duration: 0.32, ease: "power2.in",
      onComplete: () => onRemove(product._id, item.size),
    });
  };

  return (
    <div ref={ref}
      className={`relative border-b last:border-b-0 transition-colors
                  ${darkMode ? "border-white/[0.06]" : "border-black/[0.05]"}`}>
      {showConfirm && (
        <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center
                         gap-3 backdrop-blur-sm rounded-sm
                         ${darkMode ? "bg-[#111]/90" : "bg-white/90"}`}>
          <p className={`text-sm font-bold ${darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
            Remove this item?
          </p>
          <div className="flex gap-2">
            <button onClick={() => setShowConfirm(false)}
              className={`px-5 py-2.5 text-xs font-black tracking-[2px] uppercase rounded-sm
                          border transition-all
                          ${darkMode ? "border-white/20 text-white/60" : "border-black/15 text-black/50"}`}>
              Keep
            </button>
            <button onClick={handleConfirmRemove} disabled={removing}
              className="px-5 py-2.5 text-xs font-black tracking-[2px] uppercase rounded-sm
                         bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50
                         flex items-center gap-1.5">
              {removing
                ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                : <TrashIcon />}
              Remove
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-4 p-5">
        <div className={`w-[100px] h-[100px] flex-shrink-0 rounded-sm overflow-hidden
                         ${darkMode ? "bg-[#222]" : "bg-[#f4f2ee]"}`}>
          {product.image
            ? <img src={product.image} alt={product.name}
                   className="w-full h-full object-cover"
                   onError={e => { e.target.src = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop"; }} />
            : <div className="w-full h-full flex items-center justify-center text-3xl">👟</div>}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className={`text-[10px] tracking-[3px] uppercase font-bold mb-0.5
                             ${darkMode ? "text-white/30" : "text-black/30"}`}>
                {product.brand || "KIKS"}
              </p>
              <h3 className={`font-['Bebas_Neue'] text-xl tracking-wider leading-tight
                              ${darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
                {product.name}
              </h3>
              {item.size && (
                <span className={`inline-block text-[10px] tracking-[2px] uppercase mt-1
                                  px-2 py-0.5 rounded-sm font-bold
                                  ${darkMode ? "bg-white/[0.07] text-white/40" : "bg-black/[0.05] text-black/35"}`}>
                  {item.size}
                </span>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[#ff4f1f] font-black text-lg leading-none">
                ₹{(product.price * item.quantity).toLocaleString()}
              </p>
              {item.quantity > 1 && (
                <p className={`text-[10px] mt-0.5 ${darkMode ? "text-white/30" : "text-black/30"}`}>
                  ₹{product.price.toLocaleString()} each
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
            <div className={`inline-flex items-center rounded-sm border overflow-hidden
                             ${darkMode ? "border-white/[0.12]" : "border-black/[0.12]"}`}>
              <button onClick={() => handleQty(-1)} disabled={item.quantity <= 1 || updating}
                className={`w-9 h-9 flex items-center justify-center font-black text-base
                            transition-colors disabled:opacity-25
                            ${darkMode ? "text-white/50 hover:bg-white/[0.07]" : "text-black/40 hover:bg-black/[0.05]"}`}>
                −
              </button>
              <div className={`w-10 h-9 flex items-center justify-center text-sm font-black
                               border-l border-r
                               ${darkMode ? "border-white/[0.08] text-white" : "border-black/[0.08] text-[#1c1c1c]"}`}>
                {updating
                  ? <div className="w-3.5 h-3.5 border-2 border-[#ff4f1f] border-t-transparent rounded-full animate-spin"/>
                  : item.quantity}
              </div>
              <button onClick={() => handleQty(1)} disabled={updating}
                className={`w-9 h-9 flex items-center justify-center font-black text-base
                            transition-colors disabled:opacity-25
                            ${darkMode ? "text-white/50 hover:bg-white/[0.07]" : "text-black/40 hover:bg-black/[0.05]"}`}>
                +
              </button>
            </div>
            <button onClick={() => setShowConfirm(true)} disabled={removing}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-sm text-[11px] font-black
                          tracking-[1.5px] uppercase border transition-all
                          ${darkMode
                            ? "border-red-500/20 text-red-400/70 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/[0.08]"
                            : "border-red-400/25 text-red-400/80 hover:border-red-500/50 hover:text-red-500 hover:bg-red-50"}`}>
              <TrashIcon /> Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Address form ───────────────────────────────────────────────────────────────
function AddressForm({ darkMode, address, setAddress, onSave, savedAddress }) {
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const inp = darkMode
    ? "bg-white/[0.04] border-white/[0.1] text-white placeholder:text-white/20 focus:border-[#ff4f1f]"
    : "bg-[#fafaf9] border-black/[0.1] text-[#1c1c1c] placeholder:text-black/25 focus:border-[#ff4f1f]";

  const inputCls  = (f) => `w-full px-3 py-2.5 text-xs rounded-sm border outline-none
    transition-colors duration-150 ${inp} ${errors[f] ? "!border-red-400/70" : ""}`;
  const selectCls = `w-full px-3 py-2.5 text-xs rounded-sm border outline-none
    transition-colors duration-150 cursor-pointer ${inp}`;
  const labelCls  = `block text-[10px] tracking-[2.5px] uppercase font-bold mb-1.5
    ${darkMode ? "text-white/30" : "text-black/30"}`;

  const ch = (f) => (e) => {
    setAddress(p => ({ ...p, [f]: e.target.value }));
    setErrors(p  => ({ ...p, [f]: null }));
  };

  const validate = () => {
    const e = {};
    if (!address.name?.trim())    e.name    = "Required";
    if (!address.phone?.trim())   e.phone   = "Required";
    if (!address.line1?.trim())   e.line1   = "Required";
    if (!address.city?.trim())    e.city    = "Required";
    if (!address.state?.trim())   e.state   = "Select a state";
    if (!address.pincode?.trim()) e.pincode = "Required";
    const ph = address.phone?.replace(/[\s\-+]/g, "");
    if (address.phone && !/^[6-9]\d{9}$/.test(ph)) e.phone   = "Invalid mobile number";
    if (address.pincode && !/^\d{6}$/.test(address.pincode)) e.pincode = "Must be 6 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    onSave({ ...address });
    setSaving(false);
  };

  const isEdited = savedAddress && JSON.stringify(address) !== JSON.stringify(savedAddress);
  const isSaved  = savedAddress && !isEdited;

  return (
    <div className={`rounded-sm border mt-6
                     ${darkMode ? "bg-[#161616] border-white/[0.07]" : "bg-white border-black/[0.07]"}`}>
      <div className={`flex items-center gap-3 px-5 py-4 border-b
                       ${darkMode ? "border-white/[0.06]" : "border-black/[0.05]"}`}>
        <div className="w-8 h-8 rounded-sm bg-[#ff4f1f]/12 flex items-center justify-center flex-shrink-0">
          <svg width="14" height="14" fill="none" stroke="#ff4f1f" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div className="flex-1">
          <h3 className={`font-['Bebas_Neue'] text-xl tracking-wider leading-none
                          ${darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
            Delivery Address
          </h3>
          <p className={`text-[10px] mt-0.5 ${darkMode ? "text-white/30" : "text-black/30"}`}>
            Fill all required fields, then tap Save
          </p>
        </div>
        {isSaved && (
          <span className="flex items-center gap-1.5 text-green-400 text-[10px] font-black tracking-[2px] uppercase">
            <CheckIcon /> Saved
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Full Name *</label>
            <input value={address.name} onChange={ch("name")}
                   placeholder="John Doe" className={inputCls("name")} />
            {errors.name && <p className="text-red-400 text-[10px] mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className={labelCls}>Phone *</label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black select-none
                               ${darkMode ? "text-white/35" : "text-black/30"}`}>+91</span>
              <input value={address.phone} onChange={ch("phone")}
                     placeholder="98765 43210" type="tel" maxLength={10}
                     className={`${inputCls("phone")} pl-10`} />
            </div>
            {errors.phone && <p className="text-red-400 text-[10px] mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div>
          <label className={labelCls}>House / Flat / Building *</label>
          <input value={address.line1} onChange={ch("line1")}
                 placeholder="Flat 4B, Sunshine Apartments" className={inputCls("line1")} />
          {errors.line1 && <p className="text-red-400 text-[10px] mt-1">{errors.line1}</p>}
        </div>
        <div>
          <label className={labelCls}>Street / Area / Locality</label>
          <input value={address.line2} onChange={ch("line2")}
                 placeholder="MG Road, Near City Mall" className={inputCls("line2")} />
        </div>
        <div>
          <label className={labelCls}>Landmark</label>
          <input value={address.landmark} onChange={ch("landmark")}
                 placeholder="Opposite SBI Bank" className={inputCls("landmark")} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>City *</label>
            <input value={address.city} onChange={ch("city")}
                   placeholder="Mumbai" className={inputCls("city")} />
            {errors.city && <p className="text-red-400 text-[10px] mt-1">{errors.city}</p>}
          </div>
          <div>
            <label className={labelCls}>State *</label>
            <select value={address.state} onChange={ch("state")}
                    className={`${selectCls} ${errors.state ? "!border-red-400/70" : ""}`}
                    style={{ background: darkMode ? "#1a1a1a" : "#fafaf9" }}>
              <option value="">Select State / UT</option>
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.state && <p className="text-red-400 text-[10px] mt-1">{errors.state}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Pincode *</label>
            <input value={address.pincode} onChange={ch("pincode")}
                   placeholder="400001" maxLength={6} className={inputCls("pincode")} />
            {errors.pincode && <p className="text-red-400 text-[10px] mt-1">{errors.pincode}</p>}
          </div>
          <div>
            <label className={labelCls}>Country</label>
            <input value={address.country} onChange={ch("country")}
                   placeholder="India" className={inputCls("country")} />
          </div>
        </div>

        <div>
          <label className={labelCls}>Delivery Instructions</label>
          <textarea value={address.instructions} onChange={ch("instructions")} rows={2}
                    placeholder="Call before delivery…"
                    className={`${inputCls("instructions")} resize-none`} />
        </div>

        <div>
          <label className={labelCls}>Address Type</label>
          <div className="flex gap-2">
            {[["Home","🏠"],["Work","🏢"],["Other","📍"]].map(([type, icon]) => (
              <button key={type} onClick={() => setAddress(p => ({ ...p, type }))}
                className={`px-4 py-2 text-[11px] font-black tracking-[1.5px] uppercase
                            rounded-sm border transition-all
                            ${address.type === type
                              ? "bg-[#ff4f1f] text-white border-[#ff4f1f]"
                              : darkMode
                                ? "border-white/12 text-white/45 hover:border-white/25"
                                : "border-black/12 text-black/40 hover:border-black/22"}`}>
                {icon} {type}
              </button>
            ))}
          </div>
        </div>

        <div className={`pt-4 border-t ${darkMode ? "border-white/[0.06]" : "border-black/[0.05]"}`}>
          <button onClick={handleSave} disabled={saving}
            className={`w-full flex items-center justify-center gap-2.5 py-3.5
                        text-xs font-black tracking-[3px] uppercase rounded-sm
                        transition-all active:scale-[0.99]
                        ${saving    ? "bg-[#ff4f1f]/50 text-white cursor-wait"
                        : isSaved   ? "bg-green-600/80 text-white hover:bg-green-600"
                        : isEdited  ? "bg-orange-500 text-white hover:bg-orange-600"
                                    : "bg-[#ff4f1f] text-white hover:bg-[#e04010]"}`}>
            {saving
              ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"/>Saving…</>
              : isSaved  ? <><CheckIcon /> Address Saved</>
              : isEdited ? "Save Updated Address"
              : "Save Delivery Address"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Order Summary with Razorpay ────────────────────────────────────────────────
function OrderSummary({
  items, darkMode, setCurrentPage, savedAddress,
  recentAddresses, onUseRecentAddress,
}) {
  const [coupon,         setCoupon]         = useState("");
  const [appliedCode,    setAppliedCode]    = useState(null);
  const [couponError,    setCouponError]    = useState("");
  const [couponLoading,  setCouponLoading]  = useState(false);
  const [discount,       setDiscount]       = useState(0);
  const [payLoading,     setPayLoading]     = useState(false);
  const [showRecent,     setShowRecent]     = useState(false);

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping = subtotal > 0 && subtotal >= 5000 ? 0 : subtotal > 0 ? 199 : 0;
  const total    = Math.max(0, subtotal - discount) + shipping;

  // ── Coupon logic ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!appliedCode) return;
    const c = COUPONS[appliedCode.code];
    if (!c) return;
    if (subtotal < c.min) { setAppliedCode(null); setDiscount(0); return; }
    setDiscount(c.type === "pct" ? Math.round(subtotal * c.value / 100) : c.value);
  }, [subtotal]);

  const applyCoupon = async () => {
    setCouponError(""); setCouponLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const code  = coupon.trim().toUpperCase();
    const found = COUPONS[code];
    if (!found)            { setCouponError("Invalid coupon code."); setDiscount(0); setAppliedCode(null); }
    else if (subtotal < found.min) { setCouponError(`Min order ₹${found.min} required.`); setDiscount(0); setAppliedCode(null); }
    else {
      const d = found.type === "pct" ? Math.round(subtotal * found.value / 100) : found.value;
      setDiscount(d);
      setAppliedCode({ code, label: found.label });
    }
    setCouponLoading(false);
  };

  const removeCoupon = () => {
    setAppliedCode(null); setDiscount(0); setCoupon(""); setCouponError("");
  };

  // ── Razorpay payment ──────────────────────────────────────────────────────
  const handlePayment = async () => {
    if (!savedAddress || subtotal === 0) return;
    setPayLoading(true);

    try {
      const token = localStorage.getItem("token");

      // 1. Create order on backend
      const { data } = await axios.post(
        `${API}/api/orders/create`,
        {
          address:        savedAddress,
          subtotal,
          shippingCharge: shipping,
          discount,
          total,
          couponCode:     appliedCode?.code || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Load Razorpay SDK if not already loaded
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script   = document.createElement("script");
          script.src     = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload  = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      // 3. Open Razorpay checkout
      const options = {
        key:         data.keyId,
        amount:      data.amount,
        currency:    data.currency,
        name:        "KIKS.",
        description: "Sneaker Purchase",
        order_id:    data.orderId,
        prefill: {
          name:    savedAddress.name,
          contact: `+91${savedAddress.phone}`,
        },
        theme: { color: "#ff4f1f" },
        modal: {
          ondismiss: () => setPayLoading(false),
        },
        handler: async (response) => {
          try {
            // 4. Verify payment on backend
            const verifyRes = await axios.post(
              `${API}/api/orders/verify`,
              {
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                dbOrderId:           data.dbOrderId,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            if (verifyRes.data.success) {
              // Clear cart count
              localStorage.setItem("cartCount", "0");
              window.dispatchEvent(new Event("cartUpdated"));
              // Navigate to orders page
              setCurrentPage("orders");
            }
          } catch (err) {
            console.error("Verify error:", err);
            alert("Payment verification failed. Contact support.");
          } finally {
            setPayLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        console.error("Payment failed:", response.error);
        setPayLoading(false);
        alert(`Payment failed: ${response.error.description}`);
      });
      rzp.open();

    } catch (err) {
      console.error("Payment init error:", err);
      setPayLoading(false);
      alert("Failed to initiate payment. Please try again.");
    }
  };

  const divider = <div className={`h-px ${darkMode ? "bg-white/[0.05]" : "bg-black/[0.05]"}`} />;

  const SummaryRow = ({ label, value, accent, large }) => (
    <div className="flex items-center justify-between py-2.5">
      <span className={`${large ? "text-sm font-black tracking-[2px] uppercase" : "text-xs"}
                        ${darkMode ? "text-white/45" : "text-black/40"}`}>{label}</span>
      <span className={`font-black
                        ${large
                          ? "font-['Bebas_Neue'] text-3xl tracking-wider text-[#ff4f1f]"
                          : "text-sm"}
                        ${accent ? "text-green-400" : darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
        {value}
      </span>
    </div>
  );

  const filteredRecent = recentAddresses.filter(
    a => !(savedAddress && a.phone === savedAddress.phone && a.name === savedAddress.name)
  );

  return (
    <div className={`rounded-sm border sticky top-20
                     ${darkMode ? "bg-[#161616] border-white/[0.07]" : "bg-white border-black/[0.07]"}`}>
      <div className="h-[3px] rounded-t-sm" style={{ background: "linear-gradient(90deg,#ff4f1f,#ff8c5a)" }} />

      <div className="p-6 space-y-0">
        <h3 className={`font-['Bebas_Neue'] text-2xl tracking-wider mb-4
                        ${darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
          Order Summary
        </h3>

        {divider}
        <SummaryRow label="Subtotal" value={subtotal > 0 ? `₹${subtotal.toLocaleString()}` : "—"} />
        {divider}
        <SummaryRow label="Shipping"
          value={subtotal === 0 ? "—" : shipping === 0 ? "FREE" : `₹${shipping}`}
          accent={shipping === 0 && subtotal > 0} />
        {appliedCode && (
          <>{divider}<SummaryRow label={`Coupon · ${appliedCode.code}`} value={`−₹${discount.toLocaleString()}`} accent /></>
        )}
        {divider}
        <SummaryRow label="Total" value={subtotal > 0 ? `₹${total.toLocaleString()}` : "₹0"} large />
        {divider}

        {/* Coupon */}
        <div className="pt-4 pb-2">
          <p className={`text-[10px] tracking-[2.5px] uppercase font-bold mb-2
                         ${darkMode ? "text-white/30" : "text-black/30"}`}>Promo Code</p>
          {appliedCode ? (
            <div className="flex items-center justify-between px-3 py-2.5 rounded-sm border border-green-500/30 bg-green-500/[0.06]">
              <div>
                <p className="text-green-400 text-xs font-black tracking-[2px]">{appliedCode.code}</p>
                <p className={`text-[10px] mt-0.5 ${darkMode ? "text-white/30" : "text-black/30"}`}>{appliedCode.label}</p>
              </div>
              <button onClick={removeCoupon}
                className="w-6 h-6 flex items-center justify-center rounded-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input value={coupon}
                onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponError(""); }}
                onKeyDown={e => e.key === "Enter" && applyCoupon()}
                placeholder="Enter promo code"
                className={`flex-1 px-3 py-2.5 text-xs font-bold tracking-[2px] uppercase
                            border rounded-sm outline-none focus:border-[#ff4f1f] transition-colors
                            placeholder:normal-case placeholder:tracking-normal placeholder:font-normal
                            ${darkMode
                              ? "bg-white/[0.04] border-white/[0.1] text-white placeholder:text-white/20"
                              : "bg-[#fafaf9] border-black/[0.1] text-[#1c1c1c] placeholder:text-black/25"}`} />
              <button onClick={applyCoupon} disabled={!coupon.trim() || couponLoading}
                className="px-4 py-2.5 bg-[#ff4f1f] text-white text-[11px] font-black
                           tracking-[2px] uppercase rounded-sm hover:bg-[#e04010]
                           transition-colors disabled:opacity-40 flex items-center gap-1.5">
                {couponLoading
                  ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"/>
                  : "Apply"}
              </button>
            </div>
          )}
          {couponError && <p className="text-red-400 text-[10px] mt-1.5">{couponError}</p>}
        </div>

        {/* Saved address preview */}
        <div className="pt-1 pb-2">
          <p className={`text-[10px] tracking-[2.5px] uppercase font-bold mb-2
                         ${darkMode ? "text-white/30" : "text-black/30"}`}>
            Shipping Address
          </p>
          {savedAddress ? (
            <div className="flex items-start gap-2.5 p-3 rounded-sm border border-[#ff4f1f]/30 bg-[#ff4f1f]/[0.04]">
              <div className="w-5 h-5 rounded-full bg-[#ff4f1f] flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckIcon />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#ff4f1f] text-[10px] font-black tracking-[2px] uppercase mb-1">Delivering to</p>
                <p className={`text-xs font-black ${darkMode ? "text-white/85" : "text-[#1c1c1c]"}`}>{savedAddress.name}</p>
                <p className={`text-[10px] leading-relaxed mt-0.5 ${darkMode ? "text-white/45" : "text-black/45"}`}>
                  {savedAddress.line1}{savedAddress.line2 ? `, ${savedAddress.line2}` : ""}
                </p>
                <p className={`text-[10px] ${darkMode ? "text-white/45" : "text-black/45"}`}>
                  {savedAddress.city}, {savedAddress.state} — {savedAddress.pincode}
                </p>
                <p className={`text-[10px] mt-0.5 font-bold ${darkMode ? "text-white/40" : "text-black/40"}`}>
                  📞 +91 {savedAddress.phone}
                </p>
              </div>
            </div>
          ) : (
            <div className={`flex items-center gap-2 p-3 rounded-sm border
                             ${darkMode ? "border-white/[0.07] bg-white/[0.02]" : "border-black/[0.07] bg-black/[0.02]"}`}>
              <svg width="12" height="12" fill="none" stroke="#ff4f1f" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className={`text-[10px] ${darkMode ? "text-white/35" : "text-black/35"}`}>
                Save your delivery address below to proceed
              </p>
            </div>
          )}

          {/* Recent addresses */}
          {filteredRecent.length > 0 && (
            <div className="mt-3">
              <button onClick={() => setShowRecent(r => !r)}
                className={`text-[10px] font-black tracking-[1.5px] uppercase mb-2
                             ${darkMode ? "text-white/25 hover:text-white/50" : "text-black/25 hover:text-black/50"}`}>
                {showRecent ? "Hide recent ↑" : `Recent addresses (${filteredRecent.length}) ↓`}
              </button>
              {showRecent && (
                <div className="space-y-2">
                  {filteredRecent.map((addr, i) => (
                    <div key={i}
                      onClick={() => onUseRecentAddress(addr)}
                      className={`p-3 rounded-sm border cursor-pointer transition-all
                                  ${darkMode
                                    ? "border-white/[0.07] bg-white/[0.02] hover:border-[#ff4f1f]/40"
                                    : "border-black/[0.07] hover:border-[#ff4f1f]/40"}`}>
                      <p className={`text-xs font-black ${darkMode ? "text-white/70" : "text-[#1c1c1c]"}`}>
                        {addr.name}
                      </p>
                      <p className={`text-[10px] ${darkMode ? "text-white/35" : "text-black/35"}`}>
                        {addr.city}, {addr.state}
                      </p>
                      <p className="text-[#ff4f1f] text-[10px] font-black mt-1">Use this →</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="pt-2 space-y-2">
          <button
            onClick={handlePayment}
            disabled={!savedAddress || subtotal === 0 || payLoading}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-sm
                        text-xs font-black tracking-[3px] uppercase transition-all
                        ${savedAddress && subtotal > 0 && !payLoading
                          ? "bg-[#ff4f1f] text-white hover:bg-[#e04010] hover:scale-[1.015] active:scale-[0.99]"
                          : "bg-[#ff4f1f]/35 text-white cursor-not-allowed"}`}>
            {payLoading ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>Processing…</>
            ) : (
              <>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <path d="M2 10h20"/>
                </svg>
                {savedAddress ? `Pay ₹${total.toLocaleString()}` : "Save Address First"}
              </>
            )}
          </button>

          <button onClick={() => setCurrentPage("products")}
            className={`w-full py-3 rounded-sm text-xs font-black tracking-[2.5px] uppercase
                        border transition-all hover:border-[#ff4f1f] hover:text-[#ff4f1f]
                        ${darkMode ? "border-white/12 text-white/40" : "border-black/12 text-black/35"}`}>
            ← Continue Shopping
          </button>
        </div>

        {/* Trust row */}
        <div className={`grid grid-cols-3 gap-2 pt-4 mt-2 border-t
                         ${darkMode ? "border-white/[0.05]" : "border-black/[0.05]"}`}>
          {[["🔒","Secure Pay"],["↩","Easy Returns"],["✅","Authentic"]].map(([icon, label]) => (
            <div key={label} className="flex flex-col items-center gap-1 text-center">
              <span className="text-base">{icon}</span>
              <span className={`text-[9px] tracking-[1.5px] uppercase leading-tight
                               ${darkMode ? "text-white/22" : "text-black/22"}`}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function CartPage({ darkMode, setCurrentPage }) {
  const heroRef = useRef(null);

  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [toast,   setToast]   = useState(null);

  const [address,         setAddress]         = useState({
    name:"", phone:"", altPhone:"", line1:"", line2:"",
    landmark:"", city:"", state:"", pincode:"", country:"India",
    instructions:"", type:"Home",
  });
  const [savedAddress,    setSavedAddress]    = useState(null);
  const [recentAddresses, setRecentAddresses] = useState([]);

  const bg        = darkMode ? "bg-[#0e0e0e]" : "bg-[#f2f0eb]";
  const sectionBg = darkMode ? "bg-[#111]"    : "bg-[#fafaf9]";

  useEffect(() => {
    const recents = getRecents();
    setRecentAddresses(recents);
    if (recents.length > 0) {
      const { savedAt, ...rest } = recents[0];
      setAddress(rest);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(`${API}/api/cart`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(data?.items || []);
        localStorage.setItem("cartCount", data?.items?.length || 0);
        window.dispatchEvent(new Event("cartUpdated"));
      } catch {
        setError("Failed to load cart. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".ct-hero-content", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", delay: 0.1 });
      gsap.to(".ct-ticker-inner", { x: "-50%", duration: 22, ease: "none", repeat: -1 });
    });
    return () => ctx.revert();
  }, [loading]);

  const handleRemove = useCallback(async (productId, size = "") => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API}/api/cart/${productId}?size=${encodeURIComponent(size)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(prev => {
        const updated = prev.filter(i => !(i.product._id === productId && i.size === size));
        localStorage.setItem("cartCount", updated.length);
        window.dispatchEvent(new Event("cartUpdated"));
        return updated;
      });
      showToast("Item removed");
    } catch {
      showToast("Could not remove item", true);
    }
  }, []);

  const handleQtyChange = useCallback(async (productId, quantity, size = "") => {
    let snapshot;
    setItems(prev => {
      snapshot = prev;
      return prev.map(i =>
        i.product._id === productId && i.size === size ? { ...i, quantity } : i
      );
    });
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${API}/api/cart/${productId}`,
        { quantity, size },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch {
      if (snapshot) setItems(snapshot);
      showToast("Could not update quantity", true);
    }
  }, []);

  const handleSaveAddress = (addr) => {
    setSavedAddress({ ...addr });
    const updated = saveRecent(addr);
    setRecentAddresses(updated);
    showToast("Delivery address saved ✓");
  };

  const handleUseRecentAddress = (addr) => {
    const { savedAt, ...rest } = addr;
    setAddress({ ...rest });
    setSavedAddress({ ...rest });
    const updated = saveRecent(rest);
    setRecentAddresses(updated);
    showToast(`Using address for ${addr.name} ✓`);
  };

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 2600);
  };

  if (loading) return (
    <div className={`${bg} min-h-screen flex items-center justify-center`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#ff4f1f] border-t-transparent rounded-full animate-spin"/>
        <p className={`text-[10px] tracking-[4px] uppercase ${darkMode ? "text-white/35" : "text-black/35"}`}>
          Loading Cart
        </p>
      </div>
    </div>
  );

  if (error) return (
    <div className={`${bg} min-h-screen flex items-center justify-center px-6`}>
      <div className="text-center max-w-xs">
        <div className="text-4xl mb-4">⚠️</div>
        <p className={`text-sm mb-6 ${darkMode ? "text-white/50" : "text-black/50"}`}>{error}</p>
        <button onClick={() => window.location.reload()}
          className="bg-[#ff4f1f] text-white text-xs font-black px-6 py-3 tracking-[3px] uppercase rounded-sm">
          Retry
        </button>
      </div>
    </div>
  );

  const count = items.length;

  return (
    <div className={`${bg} min-h-screen overflow-x-hidden`}>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-sm
                         text-xs font-black tracking-[2px] uppercase shadow-2xl flex items-center gap-2
                         ${toast.isError ? "bg-red-500 text-white" : "bg-[#1c1c1c] text-white"}`}>
          {toast.isError
            ? <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
            : <svg width="12" height="12" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>}
          {toast.msg}
        </div>
      )}

      {/* Hero */}
      <section ref={heroRef} className="relative overflow-hidden"
               style={{
                 background: darkMode
                   ? "linear-gradient(135deg,#0e0e0e 0%,#0c1a08 100%)"
                   : "linear-gradient(135deg,#f2f0eb 0%,#e8e0d0 100%)",
                 minHeight: "38vh", display: "flex", alignItems: "center",
               }}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -right-10 w-[360px] h-[360px] rounded-full opacity-[0.05]"
               style={{ background: "#ff4f1f" }} />
          <div className={`absolute -bottom-6 right-0 pointer-events-none select-none
                           font-['Bebas_Neue'] text-[130px] md:text-[180px] tracking-widest leading-none
                           ${darkMode ? "text-white/[0.022]" : "text-black/[0.03]"}`}>
            CART
          </div>
        </div>
        <div className="ct-hero-content max-w-7xl mx-auto px-6 w-full pt-[88px] pb-10 relative z-10">
          <h1 className={`font-['Bebas_Neue'] text-[58px] md:text-[88px] tracking-wider
                          leading-[0.9] mb-3 ${darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
            MY <span className="text-[#ff4f1f]">CART</span>
          </h1>
          <p className={`text-sm ${darkMode ? "text-white/35" : "text-black/35"}`}>
            {count > 0 ? `${count} item${count === 1 ? "" : "s"} in your bag` : "Your bag is empty"}
          </p>
        </div>
      </section>

      {/* Ticker */}
      <div className="bg-[#ff4f1f] py-2.5 overflow-hidden">
        <div className="ct-ticker-inner flex whitespace-nowrap">
          {Array(8).fill("🛒 YOUR CART · FREE SHIPPING ABOVE ₹5000 · SECURE CHECKOUT · EASY RETURNS · ").map((t, i) => (
            <span key={i} className="text-white text-[10px] font-black tracking-[4px] uppercase mx-8">{t}</span>
          ))}
        </div>
      </div>

      {/* Content */}
      <section className={`${sectionBg} py-16`}>
        <div className="max-w-7xl mx-auto px-6">
          {count === 0 ? (
            <EmptyCart darkMode={darkMode} setCurrentPage={setCurrentPage} />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2">
                <div className={`rounded-sm border overflow-hidden
                                 ${darkMode ? "bg-[#161616] border-white/[0.07]" : "bg-white border-black/[0.07]"}`}>
                  {items.map(item => (
                    <CartItem
                      key={`${item.product._id}-${item.size}`}
                      item={item}
                      darkMode={darkMode}
                      onRemove={handleRemove}
                      onQtyChange={handleQtyChange}
                    />
                  ))}
                </div>
                <AddressForm
                  darkMode={darkMode}
                  address={address}
                  setAddress={setAddress}
                  onSave={handleSaveAddress}
                  savedAddress={savedAddress}
                />
              </div>
              <div className="lg:col-span-1">
                <OrderSummary
                  items={items}
                  darkMode={darkMode}
                  setCurrentPage={setCurrentPage}
                  savedAddress={savedAddress}
                  recentAddresses={recentAddresses}
                  onUseRecentAddress={handleUseRecentAddress}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}