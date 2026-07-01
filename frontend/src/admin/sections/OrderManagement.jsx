// src/admin/sections/OrderManagement.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from "react";

const API      = import.meta.env.VITE_API_URL || "http://localhost:5000";
const getToken = () => localStorage.getItem("token");
const authHdrs = () => ({
  "Content-Type": "application/json",
  Authorization:  `Bearer ${getToken()}`,
});

// ── Config ────────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending:    { label: "Pending",    cls: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",  icon: "⏳" },
  paid:       { label: "Confirmed",  cls: "bg-blue-500/15 text-blue-400 border-blue-500/25",        icon: "✅" },
  processing: { label: "Processing", cls: "bg-purple-500/15 text-purple-400 border-purple-500/25",  icon: "⚙️" },
  shipped:    { label: "Shipped",    cls: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",        icon: "🚚" },
  delivered:  { label: "Delivered",  cls: "bg-green-500/15 text-green-400 border-green-500/25",     icon: "📦" },
  cancelled:  { label: "Cancelled",  cls: "bg-red-500/15 text-red-400 border-red-500/25",           icon: "❌" },
};

// Statuses that count as revenue (payment confirmed)
const REVENUE_STATUSES = new Set(["paid", "processing", "shipped", "delivered"]);

const STATUS_FLOW = ["pending", "paid", "processing", "shipped", "delivered"];

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}
function shortId(id) { return String(id).slice(-8).toUpperCase(); }

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest border
                      rounded-sm px-1.5 py-0.5 whitespace-nowrap ${cfg.cls}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ── Skeleton row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-white/5">
      {[120, 160, 100, 80, 90, 80, 70].map((w, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-3 rounded-sm bg-white/8" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

// ── Status update dropdown ────────────────────────────────────────────────────
// Fixed: use a ref + mousedown listener instead of a backdrop div so the
// option click registers before the menu closes.
function StatusDropdown({ order, onUpdate }) {
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  // Close on outside click (mousedown fires before blur/click, no swallowing)
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSelect = async (status) => {
    setOpen(false);
    if (status === order.status) return;
    setLoading(true);
    await onUpdate(order._id, status);
    setLoading(false);
  };

  const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={loading}
        className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest
                    border rounded-sm px-2 py-1 transition-all hover:brightness-110
                    disabled:opacity-50 ${cfg.cls}`}
      >
        {loading
          ? <div className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin"/>
          : <>{cfg.icon} {cfg.label}</>}
        <svg width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2.5"
             viewBox="0 0 24 24" className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-8 z-30 w-44 bg-[#1a1a1a] border border-white/10
                        rounded-xl overflow-hidden shadow-2xl">
          {Object.entries(STATUS_CONFIG).map(([key, val]) => (
            <button
              key={key}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(key); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-[11px] font-bold
                          transition-colors hover:bg-white/5 text-left
                          ${key === order.status ? "opacity-40 cursor-default" : ""}`}
            >
              <span className={`text-[9px] font-black uppercase tracking-widest border
                                rounded-sm px-1.5 py-0.5 ${val.cls}`}>
                {val.icon}
              </span>
              <span className="text-white/70">{val.label}</span>
              {key === order.status && (
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5"
                     viewBox="0 0 24 24" className="ml-auto text-white/40">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Order detail modal ────────────────────────────────────────────────────────
function OrderModal({ order, onClose, onUpdate }) {
  const [updating, setUpdating] = useState(false);
  const stepIdx = STATUS_FLOW.indexOf(order.status);

  const handleStatus = async (status) => {
    if (status === order.status) return;
    setUpdating(true);
    await onUpdate(order._id, status);
    setUpdating(false);
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50
                    flex items-center justify-center p-4"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#161616] border border-white/10 rounded-2xl w-full max-w-2xl
                      max-h-[90vh] flex flex-col overflow-hidden
                      shadow-[0_0_80px_rgba(255,79,31,0.08)]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 flex-shrink-0">
          <div>
            <h2 className="text-white font-['Bebas_Neue'] text-2xl tracking-wide">
              Order #{shortId(order._id)}
            </h2>
            <p className="text-white/30 text-[10px] mt-0.5">{formatDate(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">

          {/* Progress tracker */}
          {order.status !== "cancelled" && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">
                Order Progress
              </p>
              <div className="flex items-center">
                {STATUS_FLOW.map((step, i) => {
                  const done    = i <= stepIdx;
                  const current = i === stepIdx;
                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                         text-xs font-black transition-all
                                         ${done ? "bg-[#ff4f1f] text-white" : "bg-white/8 text-white/25"}
                                         ${current ? "ring-2 ring-[#ff4f1f] ring-offset-2 ring-offset-[#161616]" : ""}`}>
                          {done ? "✓" : i + 1}
                        </div>
                        <span className={`text-[8px] uppercase tracking-widest whitespace-nowrap
                                          ${done ? "text-[#ff4f1f] font-black" : "text-white/25"}`}>
                          {STATUS_CONFIG[step].label}
                        </span>
                      </div>
                      {i < STATUS_FLOW.length - 1 && (
                        <div className={`flex-1 h-[2px] mx-2 mb-5 rounded-full
                                         ${i < stepIdx ? "bg-[#ff4f1f]" : "bg-white/8"}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status flow actions */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
              Update Status
            </p>

            {order.status === "cancelled" ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border
                              border-red-500/25 rounded-lg">
                <span className="text-red-400 text-sm">❌</span>
                <p className="text-red-400 text-xs font-bold">This order has been cancelled</p>
              </div>
            ) : order.status === "delivered" ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border
                              border-green-500/25 rounded-lg">
                <span className="text-green-400 text-sm">📦</span>
                <p className="text-green-400 text-xs font-bold">Order delivered — no further action needed</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Forward flow — next logical step */}
                <div className="flex flex-wrap gap-2">
                  {/* Confirmed (paid) */}
                  {order.status === "pending" && (
                    <button
                      onClick={() => handleStatus("paid")}
                      disabled={updating}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase
                                 tracking-widest rounded-sm bg-blue-500/15 border border-blue-500/30
                                 text-blue-400 hover:bg-blue-500/25 disabled:opacity-50 transition-all"
                    >
                      ✅ Mark as Confirmed
                    </button>
                  )}
                  {/* Processing */}
                  {(order.status === "pending" || order.status === "paid") && (
                    <button
                      onClick={() => handleStatus("processing")}
                      disabled={updating}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase
                                 tracking-widest rounded-sm bg-purple-500/15 border border-purple-500/30
                                 text-purple-400 hover:bg-purple-500/25 disabled:opacity-50 transition-all"
                    >
                      ⚙️ Mark as Processing
                    </button>
                  )}
                  {/* Shipped */}
                  {["pending","paid","processing"].includes(order.status) && (
                    <button
                      onClick={() => handleStatus("shipped")}
                      disabled={updating}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase
                                 tracking-widest rounded-sm bg-cyan-500/15 border border-cyan-500/30
                                 text-cyan-400 hover:bg-cyan-500/25 disabled:opacity-50 transition-all"
                    >
                      🚚 Mark as Shipped
                    </button>
                  )}
                  {/* Delivered */}
                  {["pending","paid","processing","shipped"].includes(order.status) && (
                    <button
                      onClick={() => handleStatus("delivered")}
                      disabled={updating}
                      className="flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase
                                 tracking-widest rounded-sm bg-green-500/15 border border-green-500/30
                                 text-green-400 hover:bg-green-500/25 disabled:opacity-50 transition-all"
                    >
                      📦 Mark as Delivered
                    </button>
                  )}
                  {updating && (
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <div className="w-3.5 h-3.5 border-2 border-[#ff4f1f] border-t-transparent
                                      rounded-full animate-spin"/>
                      <span className="text-white/40 text-xs font-body">Updating…</span>
                    </div>
                  )}
                </div>

                {/* Cancel — destructive, separated */}
                {order.status !== "cancelled" && (
                  <button
                    onClick={() => {
                      if (window.confirm("Cancel this order? This cannot be undone.")) {
                        handleStatus("cancelled");
                      }
                    }}
                    disabled={updating}
                    className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase
                               tracking-widest rounded-sm border border-red-500/20 text-red-400/60
                               hover:border-red-500/40 hover:text-red-400 disabled:opacity-40
                               transition-all"
                  >
                    ❌ Cancel Order
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Payment info */}
          <div className="bg-white/3 border border-white/8 rounded-xl p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
              Payment Details
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                ["Payment Status", REVENUE_STATUSES.has(order.status) ? "✅ Paid" : "⏳ Awaiting"],
                ["Total",          `₹${order.total.toLocaleString()}`],
                ["Subtotal",       `₹${(order.subtotal || 0).toLocaleString()}`],
                ["Shipping",       order.shippingCharge === 0 ? "FREE" : `₹${order.shippingCharge}`],
                ...(order.discount > 0 ? [["Discount", `−₹${order.discount.toLocaleString()}`]] : []),
                ...(order.couponCode   ? [["Coupon",   order.couponCode]] : []),
                ...(order.paidAt       ? [["Paid At",  formatDate(order.paidAt)]] : []),
              ].map(([k, v]) => (
                <div key={k}>
                  <p className="text-white/30 text-[10px] mb-0.5">{k}</p>
                  <p className="text-white font-bold">{v}</p>
                </div>
              ))}
            </div>
            {order.razorpayPaymentId && (
              <div className="mt-3 pt-3 border-t border-white/8 space-y-1">
                <p className="text-[10px] text-white/25 font-mono break-all">
                  Payment ID: {order.razorpayPaymentId}
                </p>
                <p className="text-[10px] text-white/25 font-mono break-all">
                  Razorpay Order: {order.razorpayOrderId}
                </p>
              </div>
            )}
          </div>

          {/* Customer info */}
          {order.user && (
            <div className="bg-white/3 border border-white/8 rounded-xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
                Customer
              </p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ff4f1f] flex items-center
                                justify-center text-white text-sm font-black flex-shrink-0">
                  {(order.user.name || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-bold">{order.user.name}</p>
                  <p className="text-white/40 text-xs">{order.user.email}</p>
                  {order.user.phone && (
                    <p className="text-white/30 text-[10px]">+91 {order.user.phone}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Delivery address */}
          {order.address && (
            <div className="bg-white/3 border border-white/8 rounded-xl p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
                Delivery Address
              </p>
              <div className="text-xs text-white/60 leading-relaxed space-y-0.5">
                <p className="text-white font-bold">{order.address.name}</p>
                <p>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}</p>
                {order.address.landmark && <p>{order.address.landmark}</p>}
                <p>{order.address.city}, {order.address.state} — {order.address.pincode}</p>
                <p className="mt-1">📞 +91 {order.address.phone}
                  {order.address.altPhone ? ` · +91 ${order.address.altPhone}` : ""}
                </p>
                {order.address.instructions && (
                  <p className="text-white/35 italic mt-1">"{order.address.instructions}"</p>
                )}
              </div>
            </div>
          )}

          {/* Items */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-3">
              Items ({(order.items || []).length})
            </p>
            <div className="space-y-2">
              {(order.items || []).map((item, i) => (
                <div key={i}
                  className="flex items-center gap-3 bg-white/3 border border-white/8
                             rounded-xl p-3">
                  <div className="w-12 h-12 rounded-lg bg-[#222] flex-shrink-0 overflow-hidden
                                  flex items-center justify-center">
                    {item.image
                      ? <img src={item.image} alt={item.name}
                             className="w-full h-full object-contain"
                             onError={e => (e.target.style.display = "none")} />
                      : <span className="text-xl">👟</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold truncate">{item.name}</p>
                    <p className="text-white/40 text-[10px]">
                      {item.size && `${item.size} · `}Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-[#ff4f1f] font-black text-sm flex-shrink-0">
                    ₹{((item.price || 0) * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/8 flex-shrink-0">
          <button onClick={onClose}
            className="w-full bg-[#ff4f1f] text-white text-xs font-black uppercase
                       tracking-widest py-3 rounded-sm hover:bg-white hover:text-[#111]
                       transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function OrderManagement() {
  const [orders,       setOrders]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [detail,       setDetail]       = useState(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res  = await fetch(`${API}/api/orders/admin/all`, { headers: authHdrs() });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setOrders(data.orders);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Update status (optimistic) ─────────────────────────────────────────────
  const handleUpdateStatus = useCallback(async (orderId, status) => {
    // Optimistic update — both table and open modal
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    setDetail(d => d?._id === orderId ? { ...d, status } : d);

    try {
      const res  = await fetch(`${API}/api/orders/admin/${orderId}/status`, {
        method:  "PATCH",
        headers: authHdrs(),
        body:    JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      // Confirm with server value
      setOrders(prev => prev.map(o =>
        o._id === orderId ? { ...o, status: data.order.status } : o
      ));
      setDetail(d => d?._id === orderId ? { ...d, status: data.order.status } : d);
    } catch (err) {
      // Rollback
      fetchOrders();
      alert(`Failed to update status: ${err.message}`);
    }
  }, [fetchOrders]);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = orders;
    if (statusFilter !== "all") r = r.filter(o => o.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(o =>
        o._id.toLowerCase().includes(q) ||
        o.user?.name?.toLowerCase().includes(q) ||
        o.user?.email?.toLowerCase().includes(q) ||
        o.address?.city?.toLowerCase().includes(q)
      );
    }
    return r;
  }, [orders, statusFilter, search]);

  // ── Summary stats — only count revenue-confirmed orders ───────────────────
  const revenue   = orders.filter(o => REVENUE_STATUSES.has(o.status))
                          .reduce((s, o) => s + (o.total || 0), 0);
  const confirmed = orders.filter(o => REVENUE_STATUSES.has(o.status)).length;
  const pending   = orders.filter(o => o.status === "pending").length;
  const delivered = orders.filter(o => o.status === "delivered").length;

  return (
    <div className="space-y-5">

      {/* Detail modal — re-renders when detail.status changes via optimistic update */}
      {detail && (
        <OrderModal
          key={detail._id + detail.status}   // remount on status change so progress bar re-animates
          order={detail}
          onClose={() => setDetail(null)}
          onUpdate={handleUpdateStatus}
        />
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Orders",  value: orders.length,               emoji: "📦" },
          { label: "Revenue",       value: `₹${revenue.toLocaleString()}`, emoji: "💰", accent: true },
          { label: "Confirmed",     value: confirmed,                   emoji: "✅" },
          { label: "Pending",       value: pending,                     emoji: "⏳", warn: pending > 0 },
        ].map(s => (
          <div key={s.label}
            className={`bg-[#111] border rounded-xl p-4 transition-colors
                        ${s.warn   ? "border-yellow-500/20"
                        : s.accent ? "border-[#ff4f1f]/20"
                        :            "border-white/8"}`}>
            <span className="text-2xl block mb-2">{s.emoji}</span>
            <p className="text-white/35 text-[10px] uppercase tracking-widest font-body">{s.label}</p>
            <p className={`font-['Bebas_Neue'] text-2xl mt-0.5
                           ${s.warn ? "text-yellow-400" : s.accent ? "text-[#ff4f1f]" : "text-white"}`}>
              {loading
                ? <span className="inline-block w-12 h-6 bg-white/10 rounded animate-pulse"/>
                : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/25
                        rounded-xl px-5 py-3">
          <p className="text-red-400 text-sm font-body">⚠ {error}</p>
          <button onClick={fetchOrders}
            className="text-xs font-black uppercase tracking-widest text-red-400
                       hover:text-white transition-colors">
            Retry
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
               width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by order ID, name, email…"
            className="w-full bg-white/5 border border-white/10 text-white text-sm font-body
                       pl-8 pr-4 py-2 rounded-sm placeholder-white/20
                       focus:outline-none focus:border-[#ff4f1f] transition-colors" />
        </div>

        {/* Status filter — scrollable on small screens */}
        <div className="flex rounded-sm overflow-x-auto border border-white/10 flex-shrink-0
                        max-w-full scrollbar-hide">
          {["all", ...Object.keys(STATUS_CONFIG)].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 text-[10px] font-black uppercase tracking-widest font-body
                          transition-colors whitespace-nowrap flex-shrink-0
                          ${statusFilter === s
                            ? "bg-[#ff4f1f] text-white"
                            : "text-white/40 hover:text-white"}`}>
              {s === "all" ? "All" : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button onClick={fetchOrders}
          className="p-2 text-white/30 hover:text-[#ff4f1f] border border-white/10
                     hover:border-[#ff4f1f]/40 rounded-sm transition-colors flex-shrink-0"
          title="Refresh">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
          </svg>
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#111] border border-white/8 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Order ID","Customer","Items","Total","Payment","Status",""].map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-[10px] font-black uppercase
                                          tracking-widest text-white/30 font-body whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                : filtered.map(order => (
                  <tr key={order._id} className="hover:bg-white/3 transition-colors group">

                    {/* Order ID + date */}
                    <td className="px-4 py-3">
                      <p className="text-white text-xs font-black font-body">
                        #{shortId(order._id)}
                      </p>
                      <p className="text-white/25 text-[9px] font-body mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short",
                        })}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      <p className="text-white text-xs font-semibold font-body whitespace-nowrap">
                        {order.user?.name || "—"}
                      </p>
                      <p className="text-white/30 text-[9px] font-body truncate max-w-[140px]">
                        {order.user?.email || "—"}
                      </p>
                    </td>

                    {/* Items preview */}
                    <td className="px-4 py-3">
                      <div className="flex -space-x-2">
                        {(order.items || []).slice(0, 3).map((item, i) => (
                          <div key={i}
                            className="w-7 h-7 rounded-lg bg-[#222] border border-white/10
                                       flex items-center justify-center overflow-hidden flex-shrink-0">
                            {item.image
                              ? <img src={item.image} alt="" className="w-full h-full object-contain"
                                     onError={e => (e.target.style.display = "none")} />
                              : <span className="text-xs">👟</span>}
                          </div>
                        ))}
                        {(order.items || []).length > 3 && (
                          <div className="w-7 h-7 rounded-lg bg-white/8 border border-white/10
                                          flex items-center justify-center text-[9px]
                                          text-white/40 font-black">
                            +{order.items.length - 3}
                          </div>
                        )}
                      </div>
                      <p className="text-white/30 text-[9px] font-body mt-1">
                        {(order.items || []).length} item{(order.items || []).length !== 1 ? "s" : ""}
                      </p>
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3">
                      <p className="text-[#ff4f1f] font-black text-sm font-body">
                        ₹{(order.total || 0).toLocaleString()}
                      </p>
                    </td>

                    {/* Payment status */}
                    <td className="px-4 py-3">
                      {order.razorpayPaymentId ? (
                        <span className="text-[9px] font-black uppercase tracking-widest border
                                         rounded-sm px-1.5 py-0.5 bg-green-500/15 text-green-400
                                         border-green-500/25 whitespace-nowrap">
                          ✅ Paid
                        </span>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-widest border
                                         rounded-sm px-1.5 py-0.5 bg-yellow-500/15 text-yellow-400
                                         border-yellow-500/25 whitespace-nowrap">
                          ⏳ Pending
                        </span>
                      )}
                    </td>

                    {/* Status dropdown */}
                    <td className="px-4 py-3">
                      <StatusDropdown order={order} onUpdate={handleUpdateStatus} />
                    </td>

                    {/* View details */}
                    <td className="px-4 py-3">
                      <button onClick={() => setDetail(order)}
                        className="p-1.5 text-white/20 hover:text-[#ff4f1f] transition-colors
                                   rounded-sm hover:bg-[#ff4f1f]/8 group-hover:text-white/40">
                        <svg width="13" height="13" fill="none" stroke="currentColor"
                             strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {!loading && filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-white/25 font-['Bebas_Neue'] text-xl uppercase tracking-widest">
                {error ? "Failed to load orders" : "No orders found"}
              </p>
              {statusFilter !== "all" && (
                <button onClick={() => setStatusFilter("all")}
                  className="mt-4 text-[10px] text-[#ff4f1f] font-black uppercase tracking-widest
                             hover:underline">
                  Clear filter
                </button>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-white/8 flex items-center justify-between">
          <p className="text-white/25 text-xs font-body">
            {loading ? "Loading…" : `${filtered.length} of ${orders.length} orders`}
          </p>
          {!loading && orders.length > 0 && (
            <p className="text-white/20 text-[10px] font-body">
              Revenue from confirmed orders: <span className="text-[#ff4f1f] font-black">
                ₹{revenue.toLocaleString()}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}