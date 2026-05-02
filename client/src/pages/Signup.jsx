// eslint-disable-next-line no-unused-vars
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/authSlice";
import { getRolePath } from "../utils/roleNavigate";
const ROLES = [
    { value: "worker",   icon: "🔧", label: "Worker",   desc: "Find work" },
    { value: "employer", icon: "💼", label: "Employer",  desc: "Post jobs" },
    { value: "admin",    icon: "🛡️", label: "Admin",     desc: "Manage all" },
];

export default function Signup() {
    const dispatch = useDispatch();
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", phone: "", role: "employer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [gLoading, setGLoading]         = useState(false);

  // ── 3D Sphere Background ─────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let spheres = [];

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const mkSpheres = () => {
      const W = canvas.width, H = canvas.height;
      spheres = Array.from({ length: 26 }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: 20 + Math.random() * 80,
        dx: (Math.random() - 0.5) * 0.28,
        dy: (Math.random() - 0.5) * 0.28,
        hue: Math.random() < 0.55 ? 255 + Math.random() * 35 : 195 + Math.random() * 30,
        alpha: 0.06 + Math.random() * 0.13,
      }));
    };

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#0a0a1a";
      ctx.fillRect(0, 0, W, H);
      spheres.forEach(s => {
        s.x += s.dx; s.y += s.dy;
        if (s.x < -s.r) s.x = W + s.r;
        if (s.x > W + s.r) s.x = -s.r;
        if (s.y < -s.r) s.y = H + s.r;
        if (s.y > H + s.r) s.y = -s.r;
        const g = ctx.createRadialGradient(
          s.x - s.r * 0.3, s.y - s.r * 0.3, s.r * 0.05, s.x, s.y, s.r
        );
        g.addColorStop(0, `hsla(${s.hue},82%,78%,${s.alpha * 1.6})`);
        g.addColorStop(0.5, `hsla(${s.hue},72%,55%,${s.alpha})`);
        g.addColorStop(1, `hsla(${s.hue},60%,28%,0)`);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    };

    resize(); mkSpheres(); draw();
    const onResize = () => { resize(); mkSpheres(); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  // ── Firebase Google Auth ──────────────────────────────────────────────────
  const handleGoogleAuth = async () => {
    setGLoading(true);
    const toastId = toast.loading("Opening Google sign-in...");
    try {
      const result = await signInWithPopup(auth, provider);
      const firebaseToken = await result.user.getIdToken();

      toast.loading("Saving your account...", { id: toastId });

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/google`,
        { firebaseToken, role: formData.role }
      );

dispatch(setUser(res.data.user));

      localStorage.setItem("token", res.data.token);
      toast.success(`Welcome, ${res.data.user.name}! 🎉`, { id: toastId });
      navigate(getRolePath(res.data.user.role));

    } catch (err) {
      const msg = err.response?.data?.message || "Google sign-in failed. Try again.";
      toast.error(msg, { id: toastId });
    } finally {
      setGLoading(false);
    }
  };

  // ── Email Signup ──────────────────────────────────────────────────────────
  const handleChange = e =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.name.trim())          return toast.error("Please enter your full name.");
    if (!formData.phone.trim())         return toast.error("Please enter your phone number.");
    if (formData.password.length < 8)   return toast.error("Password must be at least 8 characters.");

    setLoading(true);
    const toastId = toast.loading("Creating your account...");
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        formData
      );
      toast.success("Account created! Check your email for OTP.", { id: toastId });
      navigate("/verify-otp", { state: { email: formData.email } });

    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong. Try again.";
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // ── Styles (fully responsive) ─────────────────────────────────────────────
  const s = {
    page: {
      position: "relative", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", padding: "20px 16px",
      boxSizing: "border-box",
    },
    canvas: { position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0 },
    card: {
      position: "relative", zIndex: 2, width: "100%", maxWidth: 400,
      background: "rgba(255,255,255,0.06)",
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      border: "1px solid rgba(255,255,255,0.13)",
      borderRadius: 22, padding: "clamp(20px, 5vw, 32px) clamp(16px, 5vw, 28px) 24px",
      boxSizing: "border-box",
    },
    h1: {
      fontFamily: "'Sora', sans-serif", fontSize: "clamp(18px, 4vw, 22px)",
      fontWeight: 600, color: "#fff", textAlign: "center",
      letterSpacing: -0.5, margin: "0 0 3px",
    },
    sub:  { textAlign: "center", fontSize: "clamp(10px, 2.5vw, 11.5px)", color: "rgba(255,255,255,0.4)", margin: "0 0 18px" },
    gBtn: {
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      width: "100%", padding: "10px 12px",
      background: gLoading ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.09)",
      border: "1px solid rgba(255,255,255,0.14)", borderRadius: 11,
      color: "#fff", fontSize: "clamp(12px, 3vw, 13px)",
      fontFamily: "inherit", cursor: gLoading ? "not-allowed" : "pointer",
      marginBottom: 14, opacity: gLoading ? 0.6 : 1, transition: "all .2s",
    },
    divRow: { display: "flex", alignItems: "center", gap: 9, marginBottom: 14 },
    divL:   { flex: 1, height: 1, background: "rgba(255,255,255,0.11)" },
    divT:   { fontSize: "clamp(10px, 2.5vw, 11px)", color: "rgba(255,255,255,0.32)", margin: 0, whiteSpace: "nowrap" },
    lbl:    { fontSize: "clamp(10px, 2.5vw, 10.5px)", color: "rgba(255,255,255,0.48)", marginBottom: 4, letterSpacing: 0.4 },
    inp:    {
      width: "100%", boxSizing: "border-box", padding: "10px 12px",
      background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.11)",
      borderRadius: 10, color: "#fff", fontSize: "clamp(12px, 3vw, 13px)",
      fontFamily: "inherit", outline: "none",
    },
    eye:   {
      position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
      background: "none", border: "none", color: "rgba(255,255,255,0.4)",
      cursor: "pointer", fontSize: 13, padding: 0,
    },
    roles: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7, marginBottom: 14 },
    role:  (a) => ({
      padding: "10px 4px", borderRadius: 11, cursor: "pointer", textAlign: "center",
      border: `1px solid ${a ? "rgba(139,92,246,0.65)" : "rgba(255,255,255,0.1)"}`,
      background: a ? "rgba(139,92,246,0.28)" : "rgba(255,255,255,0.04)",
      transition: "all .22s",
    }),
    rIcon: { fontSize: "clamp(16px, 4vw, 20px)", marginBottom: 3 },
    rName: (a) => ({ fontSize: "clamp(10px, 2.5vw, 11px)", fontWeight: 500, color: a ? "#c4b5fd" : "rgba(255,255,255,0.68)" }),
    rDesc: { fontSize: "clamp(8px, 2vw, 9px)", color: "rgba(255,255,255,0.32)", marginTop: 2 },
    btn:   {
      width: "100%", padding: 11, borderRadius: 11,
      background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
      border: "none", color: "#fff", fontSize: "clamp(12px, 3vw, 13px)",
      fontWeight: 500, fontFamily: "inherit",
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.65 : 1, marginTop: 2,
    },
    foot:  { textAlign: "center", fontSize: "clamp(10px, 2.5vw, 11px)", color: "rgba(255,255,255,0.32)", marginTop: 12 },
    fLink: { color: "#a78bfa", textDecoration: "none" },
  };

  return (
    <div style={s.page}>
      <canvas ref={canvasRef} style={s.canvas} />

      <div style={s.card}>
        <p style={s.h1}>Create your account</p>
        <p style={s.sub}>Join thousands of professionals today</p>

        {/* ── Google Button ── */}
        <button style={s.gBtn} onClick={handleGoogleAuth} disabled={gLoading}>
          <svg width="15" height="15" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {gLoading ? "Signing in..." : "Continue with Google"}
        </button>

        <div style={s.divRow}>
          <span style={s.divL}/><p style={s.divT}>or sign up with email</p><span style={s.divL}/>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name + Phone */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
            <div>
              <p style={s.lbl}>Full name</p>
              <input style={s.inp} type="text" name="name"
                placeholder="Alex Johnson" value={formData.name} onChange={handleChange} required />
            </div>
            <div>
              <p style={s.lbl}>Phone</p>
              <input style={s.inp} type="tel" name="phone"
                placeholder="+92 300 0000000" value={formData.phone} onChange={handleChange} required />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom:10 }}>
            <p style={s.lbl}>Email address</p>
            <input style={s.inp} type="email" name="email"
              placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
          </div>

          {/* Password */}
          <div style={{ position:"relative", marginBottom:14 }}>
            <p style={s.lbl}>Password</p>
            <input
              style={{ ...s.inp, paddingRight: 34 }}
              type={showPassword ? "text" : "password"}
              name="password" placeholder="Min. 8 characters"
              value={formData.password} onChange={handleChange} required
            />
            <button type="button" style={s.eye} onClick={() => setShowPassword(p => !p)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Role Picker */}
          <p style={{ ...s.lbl, marginBottom:8 }}>I am joining as a</p>
          <div style={s.roles}>
            {ROLES.map(r => (
              <div key={r.value} style={s.role(formData.role === r.value)}
                onClick={() => setFormData(p => ({ ...p, role: r.value }))}>
                <div style={s.rIcon}>{r.icon}</div>
                <div style={s.rName(formData.role === r.value)}>{r.label}</div>
                <div style={s.rDesc}>{r.desc}</div>
              </div>
            ))}
          </div>

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? "Creating Account..." : "Create Account →"}
          </button>
        </form>

        <p style={s.foot}>
          Already have an account?{" "}
          <a href="/login" style={s.fLink}>Sign in</a>
        </p>
      </div>
    </div>
  );
}