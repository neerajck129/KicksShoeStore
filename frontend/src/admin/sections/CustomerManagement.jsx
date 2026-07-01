// src/admin/sections/CustomerManagement.jsx
import { useState, useMemo, useEffect, useCallback } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Read JWT from localStorage (set by LoginPage after login)
const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const COLORS = ["#ff4f1f","#f97316","#eab308","#22c55e","#06b6d4","#8b5cf6","#ec4899","#14b8a6"];
const avaColor  = (id) => COLORS[Math.abs(String(id).charCodeAt(0) + String(id).charCodeAt(1)) % COLORS.length];
const initials  = (name) => name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

const STATUS_CLS = {
  active:   "bg-green-500/15 text-green-400 border-green-500/25",
  inactive: "bg-white/8 text-white/40 border-white/15",
  blocked:  "bg-red-500/15 text-red-400 border-red-500/25",
};

function SkeletonRow() {
  return (
    <tr className="animate-pulse border-b border-white/5">
      {[140, 180, 80, 90, 50, 70, 70, 60].map((w, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-3 rounded-sm bg-white/8" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);

  const [search,    setSearch]    = useState("");
  const [statusFil, setStatusFil] = useState("all");
  const [sortBy,    setSortBy]    = useState("spent");
  const [detail,    setDetail]    = useState(null);

  // ── Fetch customers ─────────────────────────────────────────────────────────
  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/api/users/admin/customers`, {
        headers: authHeaders(),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Error ${res.status}`);
      }
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  // ── Toggle block (optimistic) ───────────────────────────────────────────────
  const flipStatus = (s) => (s === "blocked" ? "active" : "blocked");

  const toggleBlock = useCallback(async (id) => {
    // Optimistic update
    setCustomers(cs => cs.map(c => c.id === id ? { ...c, status: flipStatus(c.status) } : c));
    setDetail(d => d?.id === id ? { ...d, status: flipStatus(d.status) } : d);

    try {
      const res = await fetch(
        `${API}/api/users/admin/customers/${id}/toggle-block`,
        { method: "PATCH", headers: authHeaders() }
      );
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      // Confirm with server's authoritative status
      setCustomers(cs => cs.map(c => c.id === id ? { ...c, status: data.status } : c));
      setDetail(d => d?.id === id ? { ...d, status: data.status } : d);
    } catch {
      // Rollback
      setCustomers(cs => cs.map(c => c.id === id ? { ...c, status: flipStatus(c.status) } : c));
      setDetail(d => d?.id === id ? { ...d, status: flipStatus(d.status) } : d);
    }
  }, []);

  // ── Filtering / sorting ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = customers;
    if (statusFil !== "all") r = r.filter(c => c.status === statusFil);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q)
      );
    }
    if (sortBy === "spent")  r = [...r].sort((a,b) => b.spent  - a.spent);
    if (sortBy === "orders") r = [...r].sort((a,b) => b.orders - a.orders);
    if (sortBy === "name")   r = [...r].sort((a,b) => a.name.localeCompare(b.name));
    return r;
  }, [customers, search, statusFil, sortBy]);

  const totalSpent = customers.reduce((s, c) => s + c.spent, 0);
  const avgOrders  = customers.length
    ? (customers.reduce((s, c) => s + c.orders, 0) / customers.length).toFixed(1)
    : "0.0";

  return (
    <div className="space-y-5">

      {/* ── Summary cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: customers.length,                                emoji: "👥" },
          { label: "Active",          value: customers.filter(c=>c.status==="active").length, emoji: "✅" },
          { label: "Total Spent",     value: `$${totalSpent.toLocaleString()}`,               emoji: "💰" },
          { label: "Avg Orders",      value: avgOrders,                                       emoji: "📦" },
        ].map(s => (
          <div key={s.label} className="bg-[#111] border border-white/8 rounded-xl p-4">
            <span className="text-2xl block mb-2">{s.emoji}</span>
            <p className="text-white/35 text-[10px] uppercase tracking-widest font-body">{s.label}</p>
            <p className="text-white font-display text-2xl mt-0.5">
              {loading
                ? <span className="inline-block w-12 h-6 bg-white/10 rounded animate-pulse" />
                : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Error banner ────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center justify-between bg-red-500/10 border border-red-500/25
                        rounded-xl px-5 py-3">
          <p className="text-red-400 text-sm font-body">⚠ {error}</p>
          <button onClick={fetchCustomers}
            className="text-xs font-black uppercase tracking-widest font-body text-red-400
                       hover:text-white transition-colors">
            Retry
          </button>
        </div>
      )}

      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none"
               width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email or city…"
            className="w-full bg-white/5 border border-white/10 text-white text-sm font-body
                       pl-8 pr-4 py-2 rounded-sm placeholder-white/20
                       focus:outline-none focus:border-accent transition-colors" />
        </div>
        <div className="flex rounded-sm overflow-hidden border border-white/10">
          {["all","active","inactive","blocked"].map(s => (
            <button key={s} onClick={() => setStatusFil(s)}
              className={`px-3 py-2 text-xs font-black uppercase tracking-widest font-body transition-colors
                          ${statusFil === s ? "bg-accent text-white" : "text-white/40 hover:text-white"}`}>
              {s}
            </button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="bg-white/5 border border-white/10 text-white/55 text-sm font-body
                     px-3 py-2 rounded-sm focus:outline-none focus:border-accent cursor-pointer">
          <option value="spent"  style={{background:"#1a1a1a"}}>Sort: Revenue</option>
          <option value="orders" style={{background:"#1a1a1a"}}>Sort: Orders</option>
          <option value="name"   style={{background:"#1a1a1a"}}>Sort: Name A–Z</option>
        </select>
        <button onClick={fetchCustomers}
          className="p-2 text-white/30 hover:text-accent border border-white/10
                     hover:border-accent/40 rounded-sm transition-colors"
          title="Refresh">
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
          </svg>
        </button>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="bg-[#111] border border-white/8 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                {["Customer","Email","City","Joined","Orders","Spent","Status",""].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase
                                          tracking-widest text-white/30 font-body whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                : filtered.map(c => (
                  <tr key={c.id} className="hover:bg-white/3 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center
                                        text-white text-xs font-black font-body flex-shrink-0"
                             style={{ background: avaColor(c.id) }}>
                          {initials(c.name)}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold font-body whitespace-nowrap">{c.name}</p>
                          <p className="text-white/30 text-[10px] font-body">{c.phone || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-white/45 text-xs font-body">{c.email}</td>
                    <td className="px-5 py-3 text-white/45 text-xs font-body">{c.city || "—"}</td>
                    <td className="px-5 py-3 text-white/35 text-xs font-body whitespace-nowrap">{c.joined}</td>
                    <td className="px-5 py-3 text-white font-bold text-sm font-body">{c.orders}</td>
                    <td className="px-5 py-3 text-accent font-black text-sm font-body">
                      ${c.spent.toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-[9px] font-black uppercase tracking-widest font-body
                                        border rounded-sm px-1.5 py-0.5 ${STATUS_CLS[c.status]}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setDetail(c)}
                          className="p-1.5 text-white/30 hover:text-accent transition-colors rounded-sm hover:bg-accent/8">
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        </button>
                        <button onClick={() => toggleBlock(c.id)}
                          className={`p-1.5 transition-colors rounded-sm
                                      ${c.status === "blocked"
                                        ? "text-green-400 hover:bg-green-500/8"
                                        : "text-white/30 hover:text-red-400 hover:bg-red-500/8"}`}
                          title={c.status === "blocked" ? "Unblock" : "Block"}>
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            {c.status === "blocked"
                              ? <><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>
                              : <><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></>}
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {!loading && filtered.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-white/25 font-display text-xl uppercase tracking-widest">
                {error ? "Failed to load customers" : "No customers found"}
              </p>
            </div>
          )}
        </div>
        <div className="px-5 py-3 border-t border-white/8">
          <p className="text-white/25 text-xs font-body">
            {loading ? "Loading…" : `${filtered.length} of ${customers.length} customers`}
          </p>
        </div>
      </div>

      {/* ── Detail Modal ─────────────────────────────────────────────────── */}
      {detail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50
                        flex items-center justify-center p-5">
          <div className="bg-[#161616] border border-white/10 rounded-2xl w-full max-w-sm
                          shadow-[0_0_60px_rgba(255,79,31,0.07)] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
              <h2 className="text-white font-display text-2xl uppercase tracking-wide">Customer</h2>
              <button onClick={() => setDetail(null)}
                className="text-white/30 hover:text-white transition-colors">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center
                                text-white text-lg font-black font-body"
                     style={{ background: avaColor(detail.id) }}>
                  {initials(detail.name)}
                </div>
                <div>
                  <p className="text-white font-display text-2xl leading-none">{detail.name}</p>
                  <span className={`text-[9px] font-black uppercase tracking-widest font-body
                                    border rounded-sm px-1.5 py-0.5 mt-1.5 inline-block
                                    ${STATUS_CLS[detail.status]}`}>
                    {detail.status}
                  </span>
                </div>
              </div>
              <div className="space-y-0 divide-y divide-white/5">
                {[
                  ["Email",       detail.email],
                  ["Phone",       detail.phone  || "—"],
                  ["City",        detail.city   || "—"],
                  ["Joined",      detail.joined],
                  ["Orders",      detail.orders],
                  ["Total Spent", `$${detail.spent.toLocaleString()}`],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between py-2.5">
                    <span className="text-white/30 text-xs font-body uppercase tracking-widest">{label}</span>
                    <span className={`text-sm font-semibold font-body
                                      ${label === "Total Spent" ? "text-accent" : "text-white"}`}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => toggleBlock(detail.id)}
                  className={`flex-1 text-xs font-black uppercase tracking-widest font-body
                               py-3 rounded-sm border transition-colors
                               ${detail.status === "blocked"
                                 ? "border-green-500/30 text-green-400 hover:bg-green-500/10"
                                 : "border-red-500/30 text-red-400 hover:bg-red-500/10"}`}>
                  {detail.status === "blocked" ? "Unblock" : "Block User"}
                </button>
                <button onClick={() => setDetail(null)}
                  className="flex-1 bg-accent text-white text-xs font-black uppercase tracking-widest
                             font-body py-3 rounded-sm hover:bg-white hover:text-[#111] transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}