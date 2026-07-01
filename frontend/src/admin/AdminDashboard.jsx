// src/admin/AdminDashboard.jsx
import { useState } from "react";
import Overview           from "./sections/Overview";
import ProductManagement  from "./sections/ProductManagement";
import CustomerManagement from "./sections/CustomerManagement";
import OrderManagement    from "./sections/OrderManagement";

const NAV = [
  {
    id: "overview", label: "Overview",
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>,
  },
  {
    id: "products", label: "Products",
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
      <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
    </svg>,
  },
  {
    id: "customers", label: "Customers",
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
    </svg>,
  },
  {
    id: "orders", label: "Orders",
    icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
      <line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>,
  },
];

const TITLES = {
  overview:  { title: "Dashboard",  sub: "Store performance overview"         },
  products:  { title: "Products",   sub: "Manage your inventory"              },
  customers: { title: "Customers",  sub: "View and manage your customer base" },
  orders:    { title: "Orders",     sub: "Manage and update order statuses"   },
};

// ── Sidebar ───────────────────────────────────────────────────────────────────
function SidebarContent({ active, setActive, setCurrentPage, onNavigate }) {
  return (
    <>
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 h-16 border-b border-white/8 flex-shrink-0">
        <button onClick={() => setCurrentPage?.("home")}
          className="flex items-center gap-0.5 group">
          <span className="font-display text-2xl tracking-widest text-white
                           group-hover:text-white/70 transition-colors">KIKS</span>
          <span className="font-display text-2xl text-accent">.</span>
        </button>
        <span className="text-[9px] font-black uppercase tracking-widest font-body
                         text-white/25 border border-white/15 px-1.5 py-0.5 rounded-sm ml-1">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="text-white/20 text-[9px] font-black uppercase tracking-widest font-body
                      px-3 py-2">Navigation</p>
        {NAV.map(item => (
          <button key={item.id}
            onClick={() => { setActive(item.id); onNavigate?.(); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                        font-semibold font-body transition-all duration-200
                        ${active === item.id
                          ? "bg-accent/12 text-accent border border-accent/20"
                          : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"}`}>
            <span className={active === item.id ? "text-accent" : "text-white/40"}>
              {item.icon}
            </span>
            {item.label}
            {active === item.id && (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
            )}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/8 space-y-1 flex-shrink-0">
        <button onClick={() => setCurrentPage?.("home")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                     font-semibold font-body text-white/35 hover:text-white
                     hover:bg-white/5 transition-colors">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Back to Store
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                           font-semibold font-body text-red-400/50 hover:text-red-400
                           hover:bg-red-500/5 transition-colors">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>
    </>
  );
}

export default function AdminDashboard({ setCurrentPage }) {
  const [active,     setActive]     = useState("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);

  const { title, sub } = TITLES[active] || TITLES.overview;

  const notifications = [
    { msg: "New order received",               time: "2m ago",  dot: "bg-blue-400"   },
    { msg: "Stock low: Urban Drift Low (8)",   time: "15m ago", dot: "bg-yellow-400" },
    { msg: "Deepak Joshi account flagged",     time: "1h ago",  dot: "bg-red-400"    },
    { msg: "Monthly report is ready",          time: "3h ago",  dot: "bg-green-400"  },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">

      {/* ── Desktop Sidebar ──────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-[#0d0d0d]
                        border-r border-white/8 sticky top-0 h-screen">
        <SidebarContent
          active={active} setActive={setActive}
          setCurrentPage={setCurrentPage} />
      </aside>

      {/* ── Mobile Drawer ────────────────────────────────────────────── */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
               onClick={() => setDrawerOpen(false)} />
          <aside className="fixed top-0 left-0 bottom-0 w-60 bg-[#0d0d0d] border-r border-white/8
                            z-50 flex flex-col lg:hidden">
            <div className="absolute top-4 right-4">
              <button onClick={() => setDrawerOpen(false)}
                className="text-white/30 hover:text-white transition-colors p-1">
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <SidebarContent
              active={active} setActive={setActive}
              setCurrentPage={setCurrentPage}
              onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </>
      )}

      {/* ── Main ─────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Top bar */}
        <div className="sticky top-0 z-30 h-16 bg-[#0a0a0a]/90 backdrop-blur-md
                        border-b border-white/8 flex items-center justify-between px-5 gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button onClick={() => setDrawerOpen(true)}
              className="lg:hidden text-white/35 hover:text-white transition-colors p-1">
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="3" y1="6"  x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div>
              <h1 className="text-white font-display text-xl uppercase tracking-wide leading-none">
                {title}
              </h1>
              <p className="text-white/30 text-[10px] font-body mt-0.5">{sub}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <div className="relative">
              <button onClick={() => setNotifOpen(o => !o)}
                className="relative w-8 h-8 border border-white/10 rounded-lg flex items-center
                           justify-center text-white/35 hover:border-accent/40 hover:text-accent
                           transition-colors">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent rounded-full
                                 text-white text-[8px] font-black flex items-center justify-center">
                  {notifications.length}
                </span>
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-11 w-72 bg-[#181818] border border-white/10
                                rounded-xl overflow-hidden shadow-2xl z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
                    <p className="text-white font-display text-lg uppercase tracking-wide">
                      Notifications
                    </p>
                    <button onClick={() => setNotifOpen(false)}
                      className="text-white/25 hover:text-white transition-colors text-xs font-body">
                      Clear all
                    </button>
                  </div>
                  {notifications.map((n, i) => (
                    <div key={i}
                      className="flex items-start gap-3 px-4 py-3 border-b border-white/5
                                 hover:bg-white/3 transition-colors last:border-0">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.dot}`} />
                      <div className="min-w-0">
                        <p className="text-white/70 text-xs font-body leading-relaxed">{n.msg}</p>
                        <p className="text-white/25 text-[10px] font-body mt-0.5">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin avatar */}
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center
                            text-white text-xs font-black font-body cursor-pointer
                            hover:bg-white hover:text-[#111] transition-colors"
                 title="Admin">
              AD
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 p-5 overflow-auto"
             onClick={() => notifOpen && setNotifOpen(false)}>
          {active === "overview"  && <Overview  setActive={setActive} />}
          {active === "products"  && <ProductManagement />}
          {active === "customers" && <CustomerManagement />}
          {active === "orders"    && <OrderManagement />}
        </div>
      </div>
    </div>
  );
}