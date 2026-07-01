import { useEffect, useState } from "react";
import ProductModal from "../components/ProductModal"

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const getToken = () => localStorage.getItem("token");
const authHdrs = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

const COLORS = ["#1e3a5f", "#3b1a1a", "#1a1a3b", "#1a3b2a"];

export default function ProductManagement() {
  const [products, setProducts]   = useState([]);
  const [search, setSearch]       = useState("");
  const [loading, setLoading]     = useState(true);

  // modal state
  const [modal, setModal] = useState({
    open: false,
    mode: "add",   // "add" | "edit" | "view"
    product: null,
  });

  // ── helpers ──────────────────────────────────────────────────────────────
  const openAdd  = ()  => setModal({ open: true, mode: "add",  product: null });
  const openEdit = (p) => setModal({ open: true, mode: "edit", product: p });
  const openView = (p) => setModal({ open: true, mode: "view", product: p });
  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  // ── fetch ────────────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      const res  = await fetch(`${API}/api/products`, { headers: authHdrs() });
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ── filtered list ─────────────────────────────────────────────────────────
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.brand || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="text-white min-h-screen" style={{ padding: "28px 24px" }}>

      {/* ── TOP BAR ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-['Bebas_Neue'] text-3xl tracking-[2px]">
            PRODUCT <span style={{ color: "#ff4f1f" }}>MANAGEMENT</span>
          </h2>
          <p className="text-white/35 text-xs mt-0.5">
            {products.length} products total
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ background: "#ff4f1f", color: "white", border: "none", cursor: "pointer" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#e03e10")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#ff4f1f")}
        >
          <span style={{ fontSize: 16 }}>+</span> Add Product
        </button>
      </div>

      {/* ── SEARCH ── */}
      <input
        placeholder="Search by name or brand..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 14px",
          background: "#1a1a1a",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "8px",
          color: "white",
          fontSize: "14px",
          outline: "none",
          marginBottom: "20px",
          fontFamily: "DM Sans, sans-serif",
        }}
      />

      {/* ── LIST ── */}
      {loading ? (
        <div className="text-white/40 text-center py-20">Loading products...</div>
      ) : filtered.length === 0 ? (
        <div className="text-white/30 text-center py-20">No products found.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((p, i) => {
            const bg = COLORS[i % COLORS.length];
            return (
              <div
                key={p._id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  background: "#111",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "10px",
                  padding: "12px 16px",
                }}
              >
                {/* IMAGE */}
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 8,
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    overflow: "hidden",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  ) : (
                    <span style={{ fontSize: 24, opacity: 0.3 }}>👟</span>
                  )}
                </div>

                {/* DETAILS */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 18, letterSpacing: 1, color: "white", lineHeight: 1 }}>
                    {p.name}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4, textTransform: "uppercase", letterSpacing: 2 }}>
                    {p.brand} · {p.category}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                    <span style={{ fontFamily: "Bebas Neue, sans-serif", fontSize: 16, color: "#ff4f1f" }}>
                      ₹{Number(p.price).toLocaleString()}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 4,
                        border: "1px solid",
                        ...(p.isOutOfStock
                          ? { background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.2)", color: "#f87171" }
                          : { background: "rgba(34,197,94,0.1)", borderColor: "rgba(34,197,94,0.2)", color: "#4ade80" }),
                      }}
                    >
                      {p.isOutOfStock ? "Out of Stock" : "In Stock"}
                    </span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {/* View */}
                  <ActionBtn onClick={() => openView(p)} color="#ffffff18" hoverColor="#ffffff28" title="View">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </ActionBtn>
                  {/* Edit */}
                  <ActionBtn onClick={() => openEdit(p)} color="rgba(255,79,31,0.12)" hoverColor="rgba(255,79,31,0.22)" title="Edit">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff4f1f" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </ActionBtn>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL ── */}
      {modal.open && (
        <ProductModal
          mode={modal.mode}
          product={modal.product}
          onClose={closeModal}
          onSuccess={fetchProducts}
        />
      )}
    </div>
  );
}

// ── tiny icon button ──────────────────────────────────────────────────────────
function ActionBtn({ onClick, color, hoverColor, title, children }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 34,
        height: 34,
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 7,
        background: hov ? hoverColor : color,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.18s",
      }}
    >
      {children}
    </button>
  );
}