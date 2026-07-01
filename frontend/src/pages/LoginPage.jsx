// src/pages/LoginPage.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/Authcontext";

const API = "http://localhost:5000/api";
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

/* ─── input class ──────────────────────────────────────────────────────────── */
const inputBase = [
  "w-full bg-white/[0.04] border border-white/10 rounded-lg",
  "px-4 py-3.5 text-white text-sm font-body placeholder-white/20",
  "focus:outline-none focus:border-[#ff4f1f] focus:bg-white/[0.07]",
  "transition-all duration-200",
].join(" ");

/* ─── small helpers ─────────────────────────────────────────────────────────── */
function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-white/35 font-body">
          {label}
        </label>
        {hint}
      </div>
      {children}
    </div>
  );
}

function Toast({ msg, type }) {
  if (!msg) return null;
  const styles = {
    error:   "bg-red-500/15   border-red-500/30   text-red-300",
    success: "bg-green-500/15 border-green-500/30 text-green-300",
    info:    "bg-blue-500/15  border-blue-500/30  text-blue-300",
  };
  const icons = { error: "✕", success: "✓", info: "ℹ" };
  return (
    <div className={`flex items-start gap-3 border rounded-lg px-4 py-3 text-sm font-body ${styles[type]}`}>
      <span className="font-black mt-0.5 flex-shrink-0">{icons[type]}</span>
      <span>{msg}</span>
    </div>
  );
}

/* ─── animated background ───────────────────────────────────────────────────── */
function Background() {
  const orbs = [
    { size: 24, top: "18%",  left: "12%",  delay: "0s",   dur: "8s"  },
    { size: 16, top: "65%",  left: "8%",   delay: "2s",   dur: "11s" },
    { size: 20, top: "35%",  right: "10%", delay: "1.5s", dur: "9s"  },
    { size: 12, top: "80%",  right: "20%", delay: "3s",   dur: "13s" },
    { size: 16, top: "50%",  left: "30%",  delay: "0.8s", dur: "10s" },
  ];
  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#ff4f1f 1px,transparent 1px),linear-gradient(90deg,#ff4f1f 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className="fixed pointer-events-none"
        style={{
          top: "20%", left: "50%", transform: "translateX(-50%)",
          width: 700, height: 700,
          background: "radial-gradient(circle, rgba(255,79,31,0.07) 0%, transparent 65%)",
        }}
      />
      {orbs.map((o, i) => (
        <div
          key={i}
          className="fixed rounded-full pointer-events-none"
          style={{
            width: o.size, height: o.size,
            top: o.top, left: o.left, right: o.right,
            background: "rgba(255,79,31,0.4)",
            animation: `floatOrb ${o.dur} ease-in-out infinite`,
            animationDelay: o.delay,
          }}
        />
      ))}
      <style>{`
        @keyframes floatOrb {
          0%,100% { transform: translateY(0)    scale(1);    opacity: .35; }
          50%      { transform: translateY(-20px) scale(1.15); opacity: .6;  }
        }
      `}</style>
    </>
  );
}

/* ─── Google button ─────────────────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function GoogleButton({ onToken, loading }) {
  const divRef = useRef(null);

  useEffect(() => {
    if (!window.google || !GOOGLE_CLIENT_ID) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (res) => onToken(res.credential),
    });
    window.google.accounts.id.renderButton(divRef.current, {
      theme: "filled_black",
      size: "large",
      text: "continue_with",
      width: 384,
      logo_alignment: "left",
    });
  }, [onToken]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        disabled
        title="Add VITE_GOOGLE_CLIENT_ID to your .env to enable"
        className="w-full flex items-center justify-center gap-3 border border-white/10
                   text-white/30 text-sm font-body py-3.5 rounded-lg cursor-not-allowed
                   hover:border-white/20 transition-colors"
      >
        <GoogleIcon />
        <span>Continue with Google</span>
        <span className="ml-auto text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/20">
          configure .env
        </span>
      </button>
    );
  }

  return (
    <div
      ref={divRef}
      className="w-full overflow-hidden rounded-lg"
      style={{ minHeight: 44, opacity: loading ? 0.5 : 1, pointerEvents: loading ? "none" : "auto" }}
    />
  );
}

/* ─── password strength ─────────────────────────────────────────────────────── */
function PasswordStrength({ password }) {
  if (!password) return null;
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: n <= score ? colors[score] : "rgba(255,255,255,0.08)" }}
          />
        ))}
      </div>
      <p className="text-[10px] font-body font-semibold" style={{ color: colors[score] || "transparent" }}>
        {labels[score]}
      </p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════════════════════════ */
export default function LoginPage({ setCurrentPage }) {
  const { setUser, setIsLoggedIn } = useAuth();
  const [mode,     setMode]     = useState("login");
  const [showPass, setShowPass] = useState(false);
  const [agreed,   setAgreed]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [toast,    setToast]    = useState({ msg: "", type: "error" });
  const [form,     setForm]     = useState({ name: "", email: "", password: "" });

  const handle = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const showToast = (msg, type = "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "error" }), 4000);
  };

  // Load Google GSI script once
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const s = document.createElement("script");
    s.src   = "https://accounts.google.com/gsi/client";
    s.async = true;
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, []);

  /* ── Email / Password submit ─────────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!form.email || !form.password)
      return showToast("Please fill in all required fields");

    if (mode === "signup") {
      if (!form.name.trim())        return showToast("Please enter your full name");
      if (form.password.length < 6) return showToast("Password must be at least 6 characters");
      if (!agreed)                  return showToast("Please accept the Terms to continue");
    }

    setLoading(true);
    try {
      const url = mode === "login"
        ? `${API}/auth/login`
        : `${API}/auth/register`;

      const { data } = await axios.post(url, form, { withCredentials: true });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));
      setUser(data.user);
      setIsLoggedIn(true);

      if (mode === "signup") {
        showToast("Account created! Welcome to KIKS.", "success");
        setTimeout(() => setCurrentPage(data.user.role === "admin" ? "admin" : "home"), 1000);
      } else {
        setCurrentPage(data.user.role === "admin" ? "admin" : "home");
      }
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Google callback ────────────────────────────────────────────────────── */
  const handleGoogleToken = async (credential) => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${API}/auth/google`,
        { credential },
        { withCredentials: true }
      );
      localStorage.setItem("token", data.token);
      localStorage.setItem("user",  JSON.stringify(data.user));
      setUser(data.user);
      setIsLoggedIn(true);
      setCurrentPage(data.user.role === "admin" ? "admin" : "home");
    } catch (err) {
      showToast(err.response?.data?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setToast({ msg: "", type: "error" });
    setForm({ name: "", email: "", password: "" });
    setAgreed(false);
  };

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-5 py-24 relative overflow-hidden">

      <Background />

      <div className="w-full max-w-[440px] relative z-10">

        {/* ── Card ─────────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden border border-white/[0.07]"
          style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.04), 0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(255,79,31,0.05)",
          }}
        >
          {/* accent bar */}
          <div
            className="h-[3px] w-full"
            style={{ background: "linear-gradient(90deg, transparent, #ff4f1f, #ff8c5a, transparent)" }}
          />

          <div className="px-8 pt-8 pb-10 space-y-6">

            {/* ── Logo + toggle ─────────────────────────────────────── */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentPage?.("home")}
                className="flex items-center gap-2 group"
              >
                <div
                  className="w-8 h-8 rounded-md flex items-center justify-center
                             group-hover:scale-105 transition-transform"
                  style={{ background: "linear-gradient(135deg, #ff4f1f, #ff8c5a)" }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M3 17L7 7L12 14L16 9L21 17H3Z" fill="white" />
                  </svg>
                </div>
                <span className="font-display text-xl tracking-[0.08em] text-white uppercase">
                  KIKS<span className="text-[#ff4f1f]">.</span>
                </span>
              </button>

              {/* mode pill */}
              <div className="flex items-center bg-white/[0.05] border border-white/[0.08] rounded-lg p-1 gap-1">
                {["login", "signup"].map((m) => (
                  <button
                    key={m}
                    onClick={() => switchMode(m)}
                    className={[
                      "px-3.5 py-1.5 text-[11px] font-black uppercase tracking-widest",
                      "rounded-md transition-all duration-200 font-body",
                      mode === m
                        ? "bg-[#ff4f1f] text-white shadow-lg shadow-[#ff4f1f]/25"
                        : "text-white/30 hover:text-white/60",
                    ].join(" ")}
                  >
                    {m === "login" ? "Sign In" : "Sign Up"}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Heading ───────────────────────────────────────────── */}
            <div>
              <h1 className="text-white font-display text-[2.1rem] uppercase leading-none tracking-wide">
                {mode === "login" ? "Welcome Back" : "Join the Crew"}
              </h1>
              <p className="text-white/30 font-body text-sm mt-2">
                {mode === "login"
                  ? "Sign in to continue your journey with KIKS."
                  : "Create your account and start running different."}
              </p>
            </div>

            {/* ── Toast ─────────────────────────────────────────────── */}
            <Toast msg={toast.msg} type={toast.type} />

            {/* ── Google button ─────────────────────────────────────── */}
            <GoogleButton onToken={handleGoogleToken} loading={loading} />

            {/* ── Divider ───────────────────────────────────────────── */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] font-body">
                or
              </span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </div>

            {/* ── Fields ────────────────────────────────────────────── */}
            <div className="space-y-4">

              {mode === "signup" && (
                <Field label="Full Name">
                  <input
                    name="name"
                    value={form.name}
                    onChange={handle}
                    type="text"
                    placeholder="John Doe"
                    className={inputBase}
                    autoComplete="name"
                  />
                </Field>
              )}

              <Field label="Email Address">
                <input
                  name="email"
                  value={form.email}
                  onChange={handle}
                  type="email"
                  placeholder="you@email.com"
                  className={inputBase}
                  autoComplete="email"
                />
              </Field>

              <Field
                label="Password"
                hint={
                  mode === "login" && (
                    <button className="text-[#ff4f1f] text-[10px] font-black uppercase
                                       tracking-widest font-body hover:opacity-70 transition-opacity">
                      Forgot?
                    </button>
                  )
                }
              >
                <div className="relative">
                  <input
                    name="password"
                    value={form.password}
                    onChange={handle}
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    className={`${inputBase} pr-12`}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((s) => !s)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/25
                               hover:text-white/60 transition-colors"
                  >
                    {showPass ? (
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {mode === "signup" && <PasswordStrength password={form.password} />}
              </Field>

              {/* Terms checkbox */}
              {mode === "signup" && (
                <label className="flex items-start gap-3 cursor-pointer select-none group pt-1">
                  <div
                    onClick={() => setAgreed((a) => !a)}
                    className={[
                      "mt-0.5 w-5 h-5 rounded-md border-2 flex-shrink-0",
                      "flex items-center justify-center transition-all duration-200",
                      agreed
                        ? "border-[#ff4f1f] bg-[#ff4f1f] shadow-lg shadow-[#ff4f1f]/30"
                        : "border-white/20 group-hover:border-white/40",
                    ].join(" ")}
                  >
                    {agreed && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5L8.5 2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className="text-white/35 text-xs font-body leading-relaxed">
                    I agree to KIKS{" "}
                    <a href="#" className="text-[#ff4f1f] hover:opacity-80 transition-opacity">Terms of Service</a>
                    {" "}and{" "}
                    <a href="#" className="text-[#ff4f1f] hover:opacity-80 transition-opacity">Privacy Policy</a>
                  </span>
                </label>
              )}

              {/* Submit button */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-4 text-sm font-black uppercase tracking-[0.2em]
                           font-body rounded-lg transition-all duration-200
                           disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #ff4f1f 0%, #ff6b3d 100%)",
                  color: "#fff",
                  boxShadow: loading ? "none" : "0 8px 24px rgba(255,79,31,0.35)",
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    {mode === "login" ? "Signing in…" : "Creating account…"}
                  </span>
                ) : (
                  mode === "login" ? "Sign In" : "Create Account"
                )}
              </button>
            </div>

            {/* ── Switch mode ───────────────────────────────────────── */}
            <p className="text-center text-white/20 text-xs font-body">
              {mode === "login" ? "New to KIKS? " : "Already have an account? "}
              <button
                onClick={() => switchMode(mode === "login" ? "signup" : "login")}
                className="text-[#ff4f1f] font-black hover:opacity-75 transition-opacity"
              >
                {mode === "login" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        {/* Back to store */}
        <button
          onClick={() => setCurrentPage?.("home")}
          className="flex items-center gap-2 text-white/20 hover:text-white/50
                     font-body text-xs uppercase tracking-widest mx-auto mt-6
                     transition-colors"
        >
          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to store
        </button>
      </div>
    </div>
  );
}