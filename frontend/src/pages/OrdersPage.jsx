// src/pages/OrdersPage.jsx
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import gsap from "gsap";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const STATUS_CONFIG = {
  pending:    { label: "Pending",    color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25" },
  paid:       { label: "Confirmed",  color: "bg-blue-500/15 text-blue-400 border-blue-500/25"      },
  processing: { label: "Processing", color: "bg-purple-500/15 text-purple-400 border-purple-500/25"},
  shipped:    { label: "Shipped",    color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25"      },
  delivered:  { label: "Delivered",  color: "bg-green-500/15 text-green-400 border-green-500/25"   },
  cancelled:  { label: "Cancelled",  color: "bg-red-500/15 text-red-400 border-red-500/25"         },
};

const STATUS_STEPS = ["paid", "processing", "shipped", "delivered"];

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ── Tick animation (SVG checkmark drawn via stroke-dashoffset) ─────────────────
function AnimatedTick() {
  return (
    <svg viewBox="0 0 52 52" className="w-full h-full" fill="none">
      <circle cx="26" cy="26" r="25" stroke="#ff4f1f" strokeWidth="2" opacity="0.2" />
      <circle
        cx="26" cy="26" r="25"
        stroke="#ff4f1f" strokeWidth="2" fill="none"
        strokeDasharray="157" strokeDashoffset="157"
        style={{ animation: "drawCircle 0.6s ease forwards 0.1s" }}
      />
      <polyline
        points="14,27 22,35 38,19"
        stroke="#ff4f1f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
        strokeDasharray="30" strokeDashoffset="30"
        style={{ animation: "drawTick 0.4s ease forwards 0.7s" }}
      />
      <style>{`
        @keyframes drawCircle { to { stroke-dashoffset: 0; } }
        @keyframes drawTick   { to { stroke-dashoffset: 0; } }
      `}</style>
    </svg>
  );
}

// ── Order confirmation screen shown right after payment ────────────────────────
function OrderConfirmation({ order, darkMode, setCurrentPage }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    gsap.fromTo(
      containerRef.current.querySelectorAll(".conf-row"),
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.08, ease: "power2.out", delay: 0.9 }
    );
  }, []);

  const address = order.address || {};

  return (
    <div ref={containerRef} className="max-w-lg mx-auto px-4 py-12">

      {/* Animated tick */}
      <div className="conf-row flex justify-center mb-6">
        <div className="w-20 h-20">
          <AnimatedTick />
        </div>
      </div>

      {/* Headline */}
      <div className="conf-row text-center mb-8">
        <h2 className={`font-['Bebas_Neue'] text-4xl tracking-wider mb-1
                         ${darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
          Order <span className="text-[#ff4f1f]">Confirmed!</span>
        </h2>
        <p className={`text-sm ${darkMode ? "text-white/45" : "text-black/45"}`}>
          Payment successful · Order #{(order._id || "").slice(-8).toUpperCase()}
        </p>
        {order.paidAt && (
          <p className={`text-xs mt-1 ${darkMode ? "text-white/30" : "text-black/30"}`}>
            Paid on {formatDate(order.paidAt)}
          </p>
        )}
      </div>

      {/* Items */}
      <div className={`conf-row rounded-xl border overflow-hidden mb-4
                        ${darkMode ? "bg-[#161616] border-white/[0.07]" : "bg-white border-black/[0.07]"}`}>
        <div className={`px-4 py-3 border-b flex items-center justify-between
                          ${darkMode ? "border-white/[0.05]" : "border-black/[0.05]"}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest
                          ${darkMode ? "text-white/35" : "text-black/35"}`}>
            Items Ordered
          </p>
          <p className={`text-[10px] font-black text-[#ff4f1f]`}>
            {(order.items || []).length} item{(order.items || []).length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {(order.items || []).map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <div className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center
                                ${darkMode ? "bg-[#222]" : "bg-[#f4f2ee]"}`}>
                {item.image
                  ? <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  : <span className="text-lg">👟</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold truncate ${darkMode ? "text-white/85" : "text-[#1c1c1c]"}`}>
                  {item.name}
                </p>
                <p className={`text-[10px] mt-0.5 ${darkMode ? "text-white/35" : "text-black/35"}`}>
                  {item.size && `${item.size} · `}Qty {item.quantity}
                </p>
              </div>
              <p className="text-[#ff4f1f] font-black text-sm flex-shrink-0">
                ₹{((item.price || 0) * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Price summary */}
      <div className={`conf-row rounded-xl border p-4 space-y-2 mb-4
                        ${darkMode ? "bg-[#161616] border-white/[0.07]" : "bg-white border-black/[0.07]"}`}>
        {[
          ["Subtotal",  `₹${(order.subtotal || 0).toLocaleString()}`],
          ["Shipping",  order.shippingCharge === 0 ? "FREE" : `₹${order.shippingCharge}`],
          ...(order.discount > 0 ? [["Discount", `−₹${order.discount.toLocaleString()}`]] : []),
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-xs">
            <span className={darkMode ? "text-white/40" : "text-black/40"}>{k}</span>
            <span className={darkMode ? "text-white/70" : "text-[#1c1c1c]"}>{v}</span>
          </div>
        ))}
        <div className={`flex justify-between text-sm font-black pt-2 border-t
                          ${darkMode ? "border-white/10" : "border-black/10"}`}>
          <span className={darkMode ? "text-white" : "text-[#1c1c1c]"}>Total Paid</span>
          <span className="text-[#ff4f1f]">₹{(order.total || 0).toLocaleString()}</span>
        </div>
      </div>

      {/* Delivery address */}
      {address.name && (
        <div className={`conf-row rounded-xl border p-4 mb-4
                          ${darkMode ? "bg-[#161616] border-white/[0.07]" : "bg-white border-black/[0.07]"}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-2
                          ${darkMode ? "text-white/30" : "text-black/30"}`}>
            Delivering To
          </p>
          <div className={`text-xs leading-relaxed ${darkMode ? "text-white/60" : "text-black/60"}`}>
            <p className="font-bold">{address.name}</p>
            <p>{address.line1}{address.line2 ? `, ${address.line2}` : ""}</p>
            {address.landmark && <p>{address.landmark}</p>}
            <p>{address.city}, {address.state} — {address.pincode}</p>
            <p className="mt-0.5">📞 +91 {address.phone}</p>
          </div>
        </div>
      )}

      {/* Payment reference */}
      {order.razorpayPaymentId && (
        <div className={`conf-row rounded-xl border p-3 mb-6
                          ${darkMode ? "bg-[#161616] border-white/[0.07]" : "bg-white border-black/[0.07]"}`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1.5
                          ${darkMode ? "text-white/25" : "text-black/25"}`}>
            Payment Reference
          </p>
          <div className={`text-[10px] space-y-0.5 font-mono
                            ${darkMode ? "text-white/35" : "text-black/35"}`}>
            <p>Payment ID: {order.razorpayPaymentId}</p>
            <p>Order ID: {order.razorpayOrderId}</p>
          </div>
        </div>
      )}

      {/* CTA buttons */}
      <div className="conf-row flex gap-3">
        <button
          onClick={() => setCurrentPage("orders")}
          className={`flex-1 py-3.5 text-xs font-black uppercase tracking-[3px] rounded-sm border
                       transition-all hover:scale-105 active:scale-95
                       ${darkMode
                         ? "border-white/15 text-white/60 hover:border-white/35 hover:text-white"
                         : "border-black/15 text-black/50 hover:border-black/30 hover:text-black"}`}
        >
          View All Orders
        </button>
        <button
          onClick={() => setCurrentPage("products")}
          className="flex-1 py-3.5 text-xs font-black uppercase tracking-[3px] rounded-sm
                      bg-[#ff4f1f] text-white hover:bg-[#e04010]
                      transition-all hover:scale-105 active:scale-95"
        >
          Continue Shopping →
        </button>
      </div>
    </div>
  );
}

// ── Order card ─────────────────────────────────────────────────────────────────
function OrderCard({ order, darkMode }) {
  const [expanded, setExpanded] = useState(false);
  const cfg      = STATUS_CONFIG[order.status] || STATUS_CONFIG.paid;
  const stepIdx  = STATUS_STEPS.indexOf(order.status);

  return (
    <div className={`rounded-xl border overflow-hidden transition-all duration-200
                     ${darkMode
                       ? "bg-[#161616] border-white/[0.07] hover:border-white/15"
                       : "bg-white border-black/[0.07] hover:border-black/15"}`}>

      {/* Top accent */}
      <div className="h-[2px]"
           style={{ background: order.status === "delivered" ? "#22c55e" : "#ff4f1f" }} />

      {/* Header row */}
      <div className="p-5 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <p className={`font-['Bebas_Neue'] text-xl tracking-wider
                           ${darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
              Order #{order._id.slice(-8).toUpperCase()}
            </p>
            <span className={`text-[9px] font-black uppercase tracking-widest border
                              rounded-sm px-1.5 py-0.5 ${cfg.color}`}>
              {cfg.label}
            </span>
          </div>
          <p className={`text-[10px] ${darkMode ? "text-white/35" : "text-black/35"}`}>
            Placed on {formatDate(order.createdAt)}
            {order.paidAt ? ` · Paid on ${formatDate(order.paidAt)}` : ""}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-[#ff4f1f] font-['Bebas_Neue'] text-2xl tracking-wider">
            ₹{order.total.toLocaleString()}
          </p>
          <p className={`text-[10px] ${darkMode ? "text-white/30" : "text-black/30"}`}>
            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Progress tracker */}
      {stepIdx >= 0 && (
        <div className={`px-5 pb-4 border-t
                         ${darkMode ? "border-white/[0.05]" : "border-black/[0.05]"}`}>
          <div className="pt-4 flex items-center gap-0">
            {STATUS_STEPS.map((step, i) => {
              const done    = i <= stepIdx;
              const current = i === stepIdx;
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center
                                     text-[10px] font-black transition-all
                                     ${done
                                       ? "bg-[#ff4f1f] text-white"
                                       : darkMode ? "bg-white/10 text-white/30" : "bg-black/8 text-black/30"}
                                     ${current ? "ring-2 ring-[#ff4f1f] ring-offset-2 ring-offset-[#161616]" : ""}`}>
                      {done ? "✓" : i + 1}
                    </div>
                    <span className={`text-[8px] uppercase tracking-widest whitespace-nowrap
                                      ${done
                                        ? "text-[#ff4f1f] font-black"
                                        : darkMode ? "text-white/25" : "text-black/25"}`}>
                      {STATUS_CONFIG[step].label}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-[2px] mx-1 mb-4 rounded-full transition-all
                                     ${i < stepIdx ? "bg-[#ff4f1f]" : darkMode ? "bg-white/10" : "bg-black/8"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Items preview */}
      <div className={`px-5 pb-3 border-t ${darkMode ? "border-white/[0.05]" : "border-black/[0.05]"}`}>
        <div className="flex items-center gap-3 pt-4 overflow-x-auto pb-1 scrollbar-hide">
          {order.items.map((item, i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className={`w-14 h-14 rounded-lg overflow-hidden flex items-center justify-center
                               ${darkMode ? "bg-[#222]" : "bg-[#f4f2ee]"}`}>
                {item.image
                  ? <img src={item.image} alt={item.name}
                         className="w-full h-full object-contain"
                         onError={e => (e.target.style.display = "none")} />
                  : <span className="text-xl">👟</span>}
              </div>
              <p className={`text-[9px] text-center max-w-[56px] truncate
                             ${darkMode ? "text-white/40" : "text-black/40"}`}>
                {item.name}
              </p>
              {item.size && (
                <span className={`text-[8px] font-black px-1 py-0.5 rounded-sm
                                  ${darkMode ? "bg-white/8 text-white/35" : "bg-black/5 text-black/35"}`}>
                  {item.size}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Expand / collapse */}
      <button
        onClick={() => setExpanded(e => !e)}
        className={`w-full flex items-center justify-center gap-2 py-3 text-[10px] font-black
                    uppercase tracking-widest border-t transition-colors
                    ${darkMode
                      ? "border-white/[0.05] text-white/30 hover:text-white hover:bg-white/3"
                      : "border-black/[0.05] text-black/30 hover:text-black hover:bg-black/3"}`}>
        {expanded ? "Hide Details ↑" : "View Details ↓"}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className={`p-5 border-t space-y-4
                         ${darkMode ? "border-white/[0.05]" : "border-black/[0.05]"}`}>

          {/* Items detail */}
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-3
                           ${darkMode ? "text-white/30" : "text-black/30"}`}>Items</p>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-lg overflow-hidden flex-shrink-0
                                     ${darkMode ? "bg-[#222]" : "bg-[#f4f2ee]"}`}>
                      {item.image
                        ? <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        : <span className="flex items-center justify-center h-full text-base">👟</span>}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold truncate ${darkMode ? "text-white/80" : "text-[#1c1c1c]"}`}>
                        {item.name}
                      </p>
                      <p className={`text-[10px] ${darkMode ? "text-white/35" : "text-black/35"}`}>
                        {item.size && `${item.size} · `}Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="text-[#ff4f1f] font-black text-sm flex-shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className={`rounded-sm p-3 space-y-1.5
                           ${darkMode ? "bg-white/3" : "bg-black/3"}`}>
            {[
              ["Subtotal",  `₹${order.subtotal.toLocaleString()}`],
              ["Shipping",  order.shippingCharge === 0 ? "FREE" : `₹${order.shippingCharge}`],
              ...(order.discount > 0 ? [["Discount", `−₹${order.discount.toLocaleString()}`]] : []),
              ...(order.couponCode   ? [[`Coupon (${order.couponCode})`, ""]] : []),
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className={darkMode ? "text-white/40" : "text-black/40"}>{k}</span>
                <span className={darkMode ? "text-white/70" : "text-[#1c1c1c]"}>{v}</span>
              </div>
            ))}
            <div className={`flex justify-between text-sm font-black pt-1.5 border-t
                             ${darkMode ? "border-white/10" : "border-black/10"}`}>
              <span className={darkMode ? "text-white" : "text-[#1c1c1c]"}>Total</span>
              <span className="text-[#ff4f1f]">₹{order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery address */}
          {order.address && (
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-2
                             ${darkMode ? "text-white/30" : "text-black/30"}`}>
                Delivery Address
              </p>
              <div className={`text-xs leading-relaxed ${darkMode ? "text-white/55" : "text-black/55"}`}>
                <p className="font-bold">{order.address.name}</p>
                <p>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}</p>
                {order.address.landmark && <p>{order.address.landmark}</p>}
                <p>{order.address.city}, {order.address.state} — {order.address.pincode}</p>
                <p className="mt-0.5">📞 +91 {order.address.phone}</p>
              </div>
            </div>
          )}

          {/* Payment IDs */}
          {order.razorpayPaymentId && (
            <div className={`text-[10px] space-y-0.5 ${darkMode ? "text-white/25" : "text-black/25"}`}>
              <p>Payment ID: <span className="font-mono">{order.razorpayPaymentId}</span></p>
              <p>Order ID: <span className="font-mono">{order.razorpayOrderId}</span></p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function OrdersPage({ darkMode, setCurrentPage, confirmedOrder }) {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // When arriving from a fresh payment, show confirmation screen first.
  // "view-all" is set when the user clicks "View All Orders" in the confirmation.
  const [view, setView] = useState(confirmedOrder ? "confirmation" : "list");

  // Keep confirmedOrder stable so switching to list doesn't lose it
  const [localConfirmed] = useState(confirmedOrder);

  const bg        = darkMode ? "bg-[#0e0e0e]" : "bg-[#f2f0eb]";
  const sectionBg = darkMode ? "bg-[#111]"    : "bg-white";

  // When user clicks "View All Orders" from confirmation, fetch fresh list
  const handleViewAll = () => {
    setView("list");
    setCurrentPage("orders");   // keep URL in sync (noop here but good habit)
  };

  useEffect(() => {
    if (!loading) return;
    // Fetch orders — also re-runs when user clicks Retry (loading reset to true)
    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("You must be logged in to view orders.");
          setLoading(false);
          return;
        }
        const { data } = await axios.get(`${API}/api/orders/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(data.orders || []);

        // Update the orders count badge in the header
        const count = (data.orders || []).length;
        localStorage.setItem("ordersCount", count);
        window.dispatchEvent(new Event("ordersUpdated"));
      } catch (err) {
        const status = err?.response?.status;
        const msg    = err?.response?.data?.message;
        if (status === 401) {
          setError("Session expired — please log in again.");
        } else if (status === 403) {
          setError("Access denied.");
        } else {
          setError(msg || `Failed to load orders (${status || "network error"}).`);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [loading]);

  useEffect(() => {
    if (loading || view !== "list") return;
    gsap.fromTo(".order-card",
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.1 }
    );
  }, [loading, view]);

  // ── Confirmation view ────────────────────────────────────────────────────────
  if (view === "confirmation" && localConfirmed) {
    return (
      <div className={`${bg} min-h-screen`}>
        {/* Minimal hero for confirmation */}
        <section
          className="relative overflow-hidden"
          style={{
            background: darkMode
              ? "linear-gradient(135deg,#0e0e0e 0%,#1a0a06 100%)"
              : "linear-gradient(135deg,#f2f0eb 0%,#e8e0d0 100%)",
            minHeight: "28vh",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className={`absolute -bottom-4 right-0 select-none pointer-events-none
                             font-['Bebas_Neue'] text-[130px] md:text-[180px] tracking-widest leading-none
                             ${darkMode ? "text-white/[0.022]" : "text-black/[0.03]"}`}>
              PAID
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-6 w-full pt-[88px] pb-10 relative z-10">
            <p className="text-[11px] font-bold tracking-[3px] uppercase text-[#ff4f1f] mb-2">
              Payment Successful
            </p>
            <h1 className={`font-['Bebas_Neue'] text-[52px] md:text-[70px] tracking-wider
                            leading-[0.9] mb-2 ${darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
              Thank <span className="text-[#ff4f1f]">You!</span>
            </h1>
            <p className={`text-sm ${darkMode ? "text-white/35" : "text-black/35"}`}>
              Your order has been received and is being processed.
            </p>
          </div>
        </section>

        <section className={`${sectionBg} py-8`}>
          <OrderConfirmation
            order={localConfirmed}
            darkMode={darkMode}
            setCurrentPage={(page) => {
              if (page === "orders") {
                handleViewAll();
              } else {
                setCurrentPage(page);
              }
            }}
          />
        </section>
      </div>
    );
  }

  // ── List view loading ────────────────────────────────────────────────────────
  if (loading) return (
    <div className={`${bg} min-h-screen flex items-center justify-center`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-[#ff4f1f] border-t-transparent rounded-full animate-spin"/>
        <p className={`text-[10px] tracking-[4px] uppercase ${darkMode ? "text-white/35" : "text-black/35"}`}>
          Loading Orders
        </p>
      </div>
    </div>
  );

  // ── List view ────────────────────────────────────────────────────────────────
  return (
    <div className={`${bg} min-h-screen`}>
      <section className="relative overflow-hidden"
               style={{
                 background: darkMode
                   ? "linear-gradient(135deg,#0e0e0e 0%,#1a0a06 100%)"
                   : "linear-gradient(135deg,#f2f0eb 0%,#e8e0d0 100%)",
                 minHeight: "35vh", display: "flex", alignItems: "center",
               }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className={`absolute -bottom-4 right-0 select-none pointer-events-none
                           font-['Bebas_Neue'] text-[130px] md:text-[180px] tracking-widest leading-none
                           ${darkMode ? "text-white/[0.022]" : "text-black/[0.03]"}`}>
            ORDERS
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 w-full pt-[88px] pb-10 relative z-10">
          <p className="text-[11px] font-bold tracking-[3px] uppercase text-[#ff4f1f] mb-2">
            My Account
          </p>
          <h1 className={`font-['Bebas_Neue'] text-[58px] md:text-[80px] tracking-wider
                          leading-[0.9] mb-2 ${darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
            MY <span className="text-[#ff4f1f]">ORDERS</span>
          </h1>
          <p className={`text-sm ${darkMode ? "text-white/35" : "text-black/35"}`}>
            {orders.length > 0
              ? `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`
              : "No orders yet"}
          </p>
        </div>
      </section>

      <section className={`${sectionBg} py-16`}>
        <div className="max-w-4xl mx-auto px-6">

          {error && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-5 py-4 mb-6
                            flex items-center justify-between gap-4">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={() => { setError(null); setLoading(true); }}
                className="text-[10px] font-black uppercase tracking-widest text-red-400
                           border border-red-500/30 px-3 py-1.5 rounded-sm hover:bg-red-500/10
                           transition-colors flex-shrink-0"
              >
                Retry
              </button>
            </div>
          )}

          {orders.length === 0 && !error ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="text-6xl mb-6">📦</div>
              <h2 className={`font-['Bebas_Neue'] text-4xl tracking-wider mb-3
                              ${darkMode ? "text-white" : "text-[#1c1c1c]"}`}>
                No Orders Yet
              </h2>
              <p className={`text-sm mb-8 max-w-xs leading-relaxed
                             ${darkMode ? "text-white/35" : "text-black/35"}`}>
                When you place an order, it'll show up here.
              </p>
              <button onClick={() => setCurrentPage("products")}
                className="bg-[#ff4f1f] text-white text-xs font-black px-10 py-4
                           tracking-[3px] uppercase hover:bg-[#e04010] transition-all
                           hover:scale-105 active:scale-95 rounded-sm">
                Start Shopping →
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order._id} className="order-card">
                  <OrderCard order={order} darkMode={darkMode} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}