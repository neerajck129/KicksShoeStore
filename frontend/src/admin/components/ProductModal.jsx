// src/admin/components/ProductModal.jsx
import { useState, useEffect } from "react";

const API      = import.meta.env.VITE_API_URL || "http://localhost:5000";
const getToken = () => localStorage.getItem("token");

const UK_SIZES = [
  "UK 6","UK 6.5","UK 7","UK 7.5","UK 8","UK 8.5",
  "UK 9","UK 9.5","UK 10","UK 10.5","UK 11","UK 11.5","UK 12",
];

const CATEGORIES = ["men", "women", "kids", "unisex"];
const BRANDS     = ["Nike","Adidas","New Balance","Jordan","Puma","Converse","Vans","Reebok","Other"];

// Default sizes — all zero stock
const defaultSizes = () => UK_SIZES.map(size => ({ size, stock: 0 }));

const EMPTY_FORM = {
  name: "", price: "", category: "", brand: "", description: "",
};

function Field({ label, required, children, error }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-black uppercase tracking-[2.5px] text-white/30">
        {label}{required && <span className="text-[#ff4f1f] ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-[10px] mt-1">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full bg-white/5 border border-white/10 text-white text-sm font-body " +
  "px-3 py-2.5 rounded-sm placeholder-white/20 " +
  "focus:outline-none focus:border-[#ff4f1f] transition-colors";

export default function ProductModal({ mode, product, onClose, onSuccess }) {
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [sizes,     setSizes]     = useState(defaultSizes());
  const [imageFile, setImageFile] = useState(null);
  const [preview,   setPreview]   = useState("");
  const [errors,    setErrors]    = useState({});
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);

  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd  = mode === "add";

  // ── Populate when editing / viewing ───────────────────────────────────────
  useEffect(() => {
    if (product) {
      setForm({
        name:        product.name        || "",
        price:       product.price       ?? "",
        category:    product.category    || "",
        brand:       product.brand       || "",
        description: product.description || "",
      });
      setPreview(product.image || "");

      // Merge saved sizes with full UK size list so all sizes always show
      const saved = product.sizes || [];
      setSizes(
        UK_SIZES.map(size => {
          const found = saved.find(s => s.size === size);
          return { size, stock: found ? found.stock : 0 };
        })
      );
    } else {
      setForm(EMPTY_FORM);
      setSizes(defaultSizes());
      setPreview("");
    }
    setErrors({});
    setImageFile(null);
  }, [product, mode]);

  const ch = (field) => (e) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const setStock = (size, val) => {
    const n = Math.max(0, parseInt(val) || 0);
    setSizes(prev => prev.map(s => s.size === size ? { ...s, stock: n } : s));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name     = "Required";
    if (!form.price)        e.price    = "Required";
    if (isNaN(Number(form.price)) || Number(form.price) < 0)
                            e.price    = "Must be a positive number";
    if (!form.category)     e.category = "Required";
    if (!form.brand.trim()) e.brand    = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);

    const fd = new FormData();
    fd.append("name",        form.name.trim());
    fd.append("price",       form.price);
    fd.append("category",    form.category);
    fd.append("brand",       form.brand.trim());
    fd.append("description", form.description.trim());
    // Send sizes as JSON string — controller parses it
    fd.append("sizes",       JSON.stringify(sizes));
    if (imageFile) fd.append("image", imageFile);

    try {
      const url    = isAdd ? `${API}/api/products` : `${API}/api/products/${product._id}`;
      const method = isAdd ? "POST" : "PUT";
      const res    = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `Server error ${res.status}`);
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      setErrors({ _global: err.message });
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm(`Delete "${product?.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/api/products/${product._id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      onSuccess?.();
      onClose();
    } catch (err) {
      setErrors({ _global: err.message });
    } finally {
      setDeleting(false);
    }
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalStock   = sizes.reduce((s, sz) => s + sz.stock, 0);
  const isOutOfStock = sizes.every(sz => sz.stock === 0);
  const activeSizes  = sizes.filter(sz => sz.stock > 0).length;

  const title = isAdd ? "Add Product" : isEdit ? "Edit Product" : "Product Details";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
                 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#161616] border border-white/10 rounded-2xl w-full max-w-2xl
                      max-h-[92vh] flex flex-col overflow-hidden
                      shadow-[0_0_80px_rgba(255,79,31,0.08)]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4
                        border-b border-white/8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-white font-['Bebas_Neue'] text-2xl uppercase tracking-wide">
              {title}
            </h2>
            {!isAdd && (
              <span className={`text-[9px] font-black uppercase tracking-widest border
                               rounded-sm px-1.5 py-0.5
                               ${isOutOfStock
                                 ? "bg-red-500/15 text-red-400 border-red-500/25"
                                 : "bg-green-500/15 text-green-400 border-green-500/25"}`}>
                {isOutOfStock ? "Out of Stock" : `${activeSizes} sizes available`}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {errors._global && (
            <div className="bg-red-500/10 border border-red-500/25 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">⚠ {errors._global}</p>
            </div>
          )}

          {/* Image */}
          <div className="flex gap-4 items-start">
            <div className="w-24 h-24 rounded-xl border border-white/10 flex-shrink-0
                            bg-white/5 flex items-center justify-center overflow-hidden">
              {preview
                ? <img src={preview} alt="preview"
                       className="w-full h-full object-contain"
                       onError={e => (e.target.style.display = "none")} />
                : <span className="text-3xl opacity-30">👟</span>}
            </div>
            {!isView && (
              <div className="flex-1">
                <label className="block text-[10px] font-black uppercase tracking-[2.5px]
                                  text-white/30 mb-2">
                  Product Image
                </label>
                <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5
                                   bg-white/5 border border-white/10 rounded-sm text-sm
                                   text-white/50 hover:border-[#ff4f1f]/40 hover:text-white
                                   transition-colors w-fit">
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  {imageFile ? imageFile.name : "Upload image"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                </label>
                {isEdit && !imageFile && (
                  <p className="text-white/20 text-[10px] mt-1.5">Leave empty to keep existing image</p>
                )}
              </div>
            )}
          </div>

          {/* Name */}
          <Field label="Product Name" required error={errors.name}>
            {isView
              ? <p className="text-white text-sm">{form.name || "—"}</p>
              : <input value={form.name} onChange={ch("name")}
                       placeholder="Air Max 90" className={inputCls} />}
          </Field>

          {/* Price */}
          <Field label="Price (₹)" required error={errors.price}>
            {isView
              ? <p className="text-[#ff4f1f] text-sm font-black">₹{form.price}</p>
              : <input value={form.price} onChange={ch("price")}
                       type="number" min="0" placeholder="4999" className={inputCls} />}
          </Field>

          {/* Category + Brand */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category" required error={errors.category}>
              {isView
                ? <p className="text-white text-sm capitalize">{form.category || "—"}</p>
                : (
                  <select value={form.category} onChange={ch("category")}
                    className={inputCls + " cursor-pointer"} style={{ background: "#1a1a1a" }}>
                    <option value="">Select…</option>
                    {CATEGORIES.map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                )}
            </Field>
            <Field label="Brand" required error={errors.brand}>
              {isView
                ? <p className="text-white text-sm">{form.brand || "—"}</p>
                : (
                  <select value={form.brand} onChange={ch("brand")}
                    className={inputCls + " cursor-pointer"} style={{ background: "#1a1a1a" }}>
                    <option value="">Select…</option>
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                )}
            </Field>
          </div>

          {/* Description */}
          <Field label="Description">
            {isView
              ? <p className="text-white/60 text-sm leading-relaxed">{form.description || "—"}</p>
              : (
                <textarea value={form.description} onChange={ch("description")}
                  rows={2} placeholder="Short product description…"
                  className={inputCls + " resize-none"} />
              )}
          </Field>

          {/* ── Size & Stock Grid ─────────────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[10px] font-black uppercase tracking-[2.5px] text-white/30">
                Sizes & Stock
              </label>
              {/* Summary pills */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-white/30">
                  Total: <span className="text-white">{totalStock}</span>
                </span>
                <span className={`text-[9px] font-black uppercase tracking-widest border
                                  rounded-sm px-1.5 py-0.5
                                  ${isOutOfStock
                                    ? "bg-red-500/15 text-red-400 border-red-500/25"
                                    : "bg-green-500/15 text-green-400 border-green-500/25"}`}>
                  {isOutOfStock ? "All OOS" : `${activeSizes} in stock`}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sizes.map(({ size, stock }) => {
                const oos = stock === 0;
                return (
                  <div key={size}
                    className={`rounded-sm border p-2.5 transition-colors
                                ${oos
                                  ? "border-red-500/20 bg-red-500/5"
                                  : "border-white/10 bg-white/3"}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={`text-xs font-black ${oos ? "text-red-400/70" : "text-white/70"}`}>
                        {size}
                      </span>
                      {oos && (
                        <span className="text-[8px] font-black uppercase tracking-widest text-red-400/60">
                          OOS
                        </span>
                      )}
                    </div>

                    {isView ? (
                      <p className={`text-sm font-black ${oos ? "text-red-400" : "text-white"}`}>
                        {stock} {stock === 1 ? "unit" : "units"}
                      </p>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setStock(size, stock - 1)}
                          disabled={stock === 0}
                          className="w-6 h-6 rounded-sm bg-white/8 text-white/50
                                     hover:bg-white/15 disabled:opacity-25
                                     flex items-center justify-center text-sm font-black
                                     transition-colors"
                        >−</button>
                        <input
                          type="number" min="0" value={stock}
                          onChange={e => setStock(size, e.target.value)}
                          className="flex-1 bg-transparent border border-white/10 text-white
                                     text-xs font-black text-center rounded-sm py-1
                                     focus:outline-none focus:border-[#ff4f1f] transition-colors
                                     [appearance:textfield]
                                     [&::-webkit-outer-spin-button]:appearance-none
                                     [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          onClick={() => setStock(size, stock + 1)}
                          className="w-6 h-6 rounded-sm bg-white/8 text-white/50
                                     hover:bg-white/15 flex items-center justify-center
                                     text-sm font-black transition-colors"
                        >+</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Quick fill buttons — only in add/edit mode */}
            {!isView && (
              <div className="flex gap-2 mt-3 flex-wrap">
                <button
                  onClick={() => setSizes(UK_SIZES.map(size => ({ size, stock: 10 })))}
                  className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5
                             border border-white/10 text-white/35 hover:border-[#ff4f1f]/40
                             hover:text-[#ff4f1f] rounded-sm transition-colors"
                >
                  Fill all → 10
                </button>
                <button
                  onClick={() => setSizes(UK_SIZES.map(size => ({ size, stock: 0 })))}
                  className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5
                             border border-white/10 text-white/35 hover:border-red-500/40
                             hover:text-red-400 rounded-sm transition-colors"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/8 flex-shrink-0 flex gap-3">
          {isView ? (
            <button
              onClick={onClose}
              className="flex-1 bg-[#ff4f1f] text-white text-xs font-black uppercase
                         tracking-widest py-3 rounded-sm hover:bg-white hover:text-[#111]
                         transition-colors"
            >
              Close
            </button>
          ) : (
            <>
              {isEdit && (
                <button
                  onClick={handleDelete}
                  disabled={deleting || saving}
                  className="px-5 py-3 border border-red-500/30 text-red-400 text-xs font-black
                             uppercase tracking-widest rounded-sm hover:bg-red-500/10
                             transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting
                    ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                    : <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                      </svg>}
                </button>
              )}
              <button
                onClick={onClose}
                disabled={saving || deleting}
                className="flex-1 border border-white/15 text-white/50 text-xs font-black
                           uppercase tracking-widest py-3 rounded-sm hover:border-white/30
                           hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving || deleting}
                className="flex-1 bg-[#ff4f1f] text-white text-xs font-black uppercase
                           tracking-widest py-3 rounded-sm hover:bg-white hover:text-[#111]
                           transition-colors disabled:opacity-50
                           flex items-center justify-center gap-2"
              >
                {saving
                  ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
                  : isAdd ? "Add Product" : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}