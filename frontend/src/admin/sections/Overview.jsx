// src/admin/sections/Overview.jsx
import { useState, useEffect, useCallback } from "react";

const API      = import.meta.env.VITE_API_URL || "http://localhost:5000";
const getToken = () => localStorage.getItem("token");
const authHdrs = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const CAT_COLORS = ["#ff4f1f","#fb923c","#fde68a","#4ade80","#38bdf8","#a78bfa","#f472b6"];
const catColor   = i => CAT_COLORS[i % CAT_COLORS.length];

const STATUS_CONFIG = {
  pending:    { label: "Pending",    color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25" },
  paid:       { label: "Confirmed",  color: "bg-blue-500/15 text-blue-400 border-blue-500/25"       },
  processing: { label: "Processing", color: "bg-purple-500/15 text-purple-400 border-purple-500/25" },
  shipped:    { label: "Shipped",    color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25"       },
  delivered:  { label: "Delivered",  color: "bg-green-500/15 text-green-400 border-green-500/25"    },
  cancelled:  { label: "Cancelled",  color: "bg-red-500/15 text-red-400 border-red-500/25"          },
};

function Skel({ w = "100%", h = 16 }) {
  return <div className="animate-pulse bg-white/8 rounded-sm" style={{ width: w, height: h }} />;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function Overview({ setActive }) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`${API}/api/products/admin/overview`, { headers: authHdrs() });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const d = data || {};

  const statCards = [
    {
      label: "Total Products",
      value: loading ? null : (d.totalProducts ?? 0),
      sub:   null,
      emoji: "👟",
      live:  true,
    },
    {
      label: "Total Customers",
      value: loading ? null : (d.totalCustomers ?? 0),
      sub:   null,
      emoji: "👥",
      live:  true,
    },
    {
      label: "Low Stock",
      value: loading ? null : (d.lowStock?.count ?? 0),
      sub:   null,
      emoji: "⚠️",
      live:  true,
      warn:  (d.lowStock?.count ?? 0) > 0,
    },
    {
      label: "Total Revenue",
      value: loading ? null : `₹${((d.totalRevenue ?? 0) / 1000).toFixed(1)}k`,
      sub:   "paid orders only",
      emoji: "💰",
      live:  true,
      accent: true,
    },
    {
      label: "Total Orders",
      value: loading ? null : (d.totalOrders ?? 0),
      sub:   loading ? null : `${d.ordersByStatus?.pending ?? 0} pending`,
      emoji: "📦",
      live:  true,
    },
  ];

  // Status breakdown bar data
  const STATUS_ORDER = ["pending","paid","processing","shipped","delivered","cancelled"];
  const statusBreakdown = STATUS_ORDER
    .map(s => ({ key: s, count: d.ordersByStatus?.[s] ?? 0, ...STATUS_CONFIG[s] }))
    .filter(s => s.count > 0);

  const totalOrdersForPct = statusBreakdown.reduce((n, s) => n + s.count, 0) || 1;

  return (
    <div className="space-y-6">

      {/* ── Error ─────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/25
                        rounded-xl px-5 py-3">
          <p className="text-red-400 text-sm font-body">⚠ {error}</p>
          <button onClick={fetchStats}
            className="text-xs font-black uppercase tracking-widest font-body
                       text-red-400 hover:text-white transition-colors">
            Retry
          </button>
        </div>
      )}

      {/* ── Stat cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map(s => (
          <div key={s.label}
            className={`bg-[#111] border rounded-xl p-5 transition-colors
                        ${s.warn
                          ? "border-yellow-500/30"
                          : s.accent
                            ? "border-[#ff4f1f]/25 hover:border-[#ff4f1f]/40"
                            : "border-white/8 hover:border-white/15"}`}>
            <span className="text-2xl block mb-3">{s.emoji}</span>
            <p className="text-white/35 text-[10px] uppercase tracking-widest font-body mb-1.5">
              {s.label}
            </p>
            {loading
              ? <Skel h={28} w={60} />
              : <p className={`font-display text-3xl leading-none
                               ${s.warn ? "text-yellow-400" : s.accent ? "text-[#ff4f1f]" : "text-white"}`}>
                  {s.value}
                </p>
            }
            {!loading && s.sub && (
              <p className="text-white/25 text-[9px] uppercase tracking-widest font-body mt-1.5">
                {s.sub}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ── Order status breakdown ────────────────────────────────────── */}
      {!loading && statusBreakdown.length > 0 && (
        <div className="bg-[#111] border border-white/8 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
            <p className="text-white font-display text-xl uppercase tracking-wide">Order Status</p>
            <span className="text-white/25 text-[10px] font-body uppercase tracking-widest">
              {d.totalOrders} total
            </span>
          </div>

          {/* Stacked progress bar */}
          <div className="px-5 pt-5 pb-2">
            <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
              {statusBreakdown.map(s => (
                <div
                  key={s.key}
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width:      `${(s.count / totalOrdersForPct) * 100}%`,
                    background: s.key === "delivered" ? "#22c55e"
                              : s.key === "cancelled"  ? "#f87171"
                              : s.key === "shipped"    ? "#22d3ee"
                              : s.key === "processing" ? "#a78bfa"
                              : s.key === "paid"       ? "#60a5fa"
                              : "#fbbf24",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="px-5 pb-5 pt-3 flex flex-wrap gap-x-5 gap-y-2">
            {statusBreakdown.map(s => (
              <div key={s.key} className="flex items-center gap-2">
                <span className={`text-[9px] font-black uppercase tracking-widest border
                                  rounded-sm px-1.5 py-0.5 ${s.color}`}>
                  {s.label}
                </span>
                <span className="text-white/45 text-xs font-body">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent orders ─────────────────────────────────────────────── */}
      <div className="bg-[#111] border border-white/8 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
          <p className="text-white font-display text-xl uppercase tracking-wide">Recent Orders</p>
          <button
            onClick={() => setActive?.("orders")}
            className="text-[10px] font-black uppercase tracking-widest text-[#ff4f1f]
                       hover:text-white transition-colors font-body">
            View All →
          </button>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skel key={i} h={14} />)}
          </div>
        ) : (d.recentOrders || []).length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-white/25 font-body text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {(d.recentOrders || []).map(order => {
              const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.paid;
              return (
                <div key={order.id}
                  onClick={() => setActive?.("orders")}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/3
                             transition-colors cursor-pointer group">

                  {/* Order ID + date */}
                  <div className="min-w-0 flex-1">
                    <p className="text-white text-xs font-black font-body">
                      #{String(order.id).slice(-8).toUpperCase()}
                    </p>
                    <p className="text-white/30 text-[10px] font-body mt-0.5">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  {/* Customer */}
                  <div className="hidden sm:block min-w-0 w-36">
                    <p className="text-white/70 text-xs font-body truncate">{order.userName}</p>
                    <p className="text-white/25 text-[10px] font-body truncate">{order.userEmail}</p>
                  </div>

                  {/* Items */}
                  <div className="hidden md:block w-16 text-center">
                    <p className="text-white/45 text-xs font-body">
                      {order.itemCount} item{order.itemCount !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span className={`text-[9px] font-black uppercase tracking-widest border
                                    rounded-sm px-1.5 py-0.5 flex-shrink-0 ${cfg.color}`}>
                    {cfg.label}
                  </span>

                  {/* Total */}
                  <p className="text-[#ff4f1f] font-black text-sm font-body flex-shrink-0 w-20 text-right">
                    ₹{(order.total || 0).toLocaleString()}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Two column: Low stock + Categories ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Low stock list */}
        <div className="bg-[#111] border border-white/8 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
            <p className="text-white font-display text-xl uppercase tracking-wide">Low Stock</p>
            {!loading && (
              <span className={`text-[9px] font-black uppercase tracking-widest font-body
                               border rounded-sm px-1.5 py-0.5
                               ${(d.lowStock?.count || 0) > 0
                                 ? "bg-yellow-500/15 text-yellow-400 border-yellow-500/25"
                                 : "bg-green-500/15 text-green-400 border-green-500/25"}`}>
                {d.lowStock?.count || 0} items
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skel key={i} h={14} />)}
            </div>
          ) : (d.lowStock?.items?.length ?? 0) === 0 ? (
            <div className="py-12 text-center">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-white/25 font-body text-sm">All products well stocked</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {d.lowStock.items.map(item => (
                <div key={item.id}
                  className="flex items-center justify-between px-5 py-3
                             hover:bg-white/3 transition-colors">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold font-body truncate">{item.name}</p>
                    <p className="text-white/30 text-[10px] font-body">{item.category}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-20 h-1.5 bg-white/8 rounded-full overflow-hidden">
                      <div className="h-full rounded-full"
                           style={{
                             width:      `${Math.min((item.stock / 10) * 100, 100)}%`,
                             background: item.stock === 0 ? "#f87171" : "#fbbf24",
                           }} />
                    </div>
                    <span className={`text-xs font-black font-body w-14 text-right
                                      ${item.stock === 0 ? "text-red-400" : "text-yellow-400"}`}>
                      {item.stock === 0 ? "OUT" : `${item.stock} left`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="bg-[#111] border border-white/8 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8">
            <p className="text-white font-display text-xl uppercase tracking-wide">Categories</p>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skel key={i} h={14} />)}
            </div>
          ) : (d.categoryBreakdown || []).length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-white/25 font-body text-sm">No products yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {(d.categoryBreakdown || []).map((cat, i) => {
                const total = (d.categoryBreakdown || []).reduce((s, c) => s + c.count, 0);
                const pct   = Math.round((cat.count / total) * 100);
                return (
                  <div key={cat.label}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-white/3 transition-colors">
                    <div className="w-2 h-2 rounded-full flex-shrink-0"
                         style={{ background: catColor(i) }} />
                    <p className="text-white text-sm font-semibold font-body flex-1 truncate">
                      {cat.label}
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-white/8 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                             style={{ width: `${pct}%`, background: catColor(i) }} />
                      </div>
                      <span className="text-white/45 text-xs font-body w-12 text-right">
                        {cat.count} · {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Top products ──────────────────────────────────────────────── */}
      <div className="bg-[#111] border border-white/8 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
          <p className="text-white font-display text-xl uppercase tracking-wide">Top Products</p>
          <span className="text-white/20 text-[10px] font-body uppercase tracking-widest">
            by inventory value
          </span>
        </div>
        {loading ? (
          <div className="p-5 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <Skel key={i} h={14} />)}
          </div>
        ) : (d.topProducts || []).length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-white/25 font-body text-sm">No products yet</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {(d.topProducts || []).map((p, i) => (
              <div key={p.name}
                className="flex items-center gap-4 px-5 py-3 hover:bg-white/3 transition-colors">
                <span className="text-white/20 font-display text-lg w-5 flex-shrink-0">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold font-body truncate">{p.name}</p>
                  <p className="text-white/30 text-[10px] font-body">
                    {p.category} · {p.stock} in stock · ₹{p.price}/unit
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-28 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#ff4f1f] transition-all duration-700"
                         style={{ width: `${p.pct}%` }} />
                  </div>
                  <span className="text-[#ff4f1f] font-black text-sm font-body w-24 text-right">
                    ₹{p.value.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}