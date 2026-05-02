
// eslint-disable-next-line no-unused-vars
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase.js";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/authSlice";
import { getRolePath } from "../utils/roleNavigate.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export default function Signin() {
  const dispatch = useDispatch();
  const navigate  = useNavigate();
  const canvasRef = useRef(null);
  const mouseRef  = useRef({ x: 0, y: 0 });

  const [formData, setFormData]       = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [gLoading, setGLoading]       = useState(false);

  // ── Mouse tracking for 3D parallax ───────────────────────────────────────
  useEffect(() => {
    const onMove = e => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // ── 3D Background (more dynamic than signup) ──────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let spheres = [];

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      mkSpheres();
    };

    const mkSpheres = () => {
      const W = canvas.width, H = canvas.height;
      spheres = Array.from({ length: 30 }, (_, i) => ({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     15 + Math.random() * 90,
        dx:    (Math.random() - 0.5) * 0.25,
        dy:    (Math.random() - 0.5) * 0.25,
        hue:   i % 3 === 0 ? 260 + Math.random() * 20
             : i % 3 === 1 ? 220 + Math.random() * 20
             :                280 + Math.random() * 30,
        alpha: 0.05 + Math.random() * 0.1,
        phase: Math.random() * Math.PI * 2,
        speed: 0.004 + Math.random() * 0.004,
      }));
    };

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const mouse = mouseRef.current;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#060612";
      ctx.fillRect(0, 0, W, H);

      spheres.forEach(s => {
        s.phase += s.speed;
        s.x += s.dx + Math.sin(s.phase) * 0.08;
        s.y += s.dy;
        if (s.x < -s.r) s.x = W + s.r;
        if (s.x > W + s.r) s.x = -s.r;
        if (s.y < -s.r) s.y = H + s.r;
        if (s.y > H + s.r) s.y = -s.r;

        const dist = Math.hypot(s.x - mouse.x, s.y - mouse.y);
        const pull = Math.max(0, 1 - dist / 300);
        const a    = s.alpha + pull * 0.08;
        const r    = s.r + pull * 15;

        const g = ctx.createRadialGradient(
          s.x - r * 0.28, s.y - r * 0.28, r * 0.04,
          s.x, s.y, r
        );
        g.addColorStop(0,    `hsla(${s.hue},80%,72%,${a * 1.8})`);
        g.addColorStop(0.45, `hsla(${s.hue},70%,50%,${a})`);
        g.addColorStop(1,    `hsla(${s.hue},60%,28%,0)`);
        ctx.beginPath();
        ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
        ctx.fillStyle = g;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // ── Firebase Google Sign-In ───────────────────────────────────────────────
  const handleGoogleAuth = async () => {
    setGLoading(true);
    const tid = toast.loading("Opening Google sign-in...");
    try {
      const result        = await signInWithPopup(auth, provider);
      const firebaseToken = await result.user.getIdToken();

      toast.loading("Signing you in...", { id: tid });

      const res = await api.post("/api/auth/google", { firebaseToken });
      toast.success(`Welcome back, ${res.data.user.name}! 👋`, { id: tid });
      dispatch(setUser(res.data.user));
      navigate(getRolePath(res.data.user.role));
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user") { toast.dismiss(tid); return; }
      toast.error(err.response?.data?.message || "Google sign-in failed.", { id: tid });
    } finally {
      setGLoading(false);
    }
  };

  // ── Email/Password Sign-In ────────────────────────────────────────────────
  const handleChange = e =>
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!formData.email.trim())    return toast.error("Please enter your email.");
    if (!formData.password)        return toast.error("Please enter your password.");

    setLoading(true);
    const tid = toast.loading("Signing you in...");
    try {
   const res=  await api.post("/api/auth/login", formData);
      toast.success("Welcome back! 🎉", { id: tid });
      dispatch(setUser(res.data.user));
      navigate(getRolePath(res.data.user.role));
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid email or password.", { id: tid });
    } finally {
      setLoading(false);
    }
  };


  const s = {
    page: {
      position: "relative", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      padding: "20px 16px", boxSizing: "border-box",
      background: "#060612",
    },
    canvas: { position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0 },
    card: {
      position: "relative", zIndex: 2,
      width: "100%", maxWidth: 400,
      background: "rgba(255,255,255,0.04)",
      backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 24,
      padding: "clamp(24px,5vw,36px) clamp(18px,5vw,30px) 28px",
      boxSizing: "border-box",
      animation: "cardIn .7s cubic-bezier(.22,1,.36,1) both",
    },
    logoRing: {
      width: 46, height: 46, borderRadius: "50%",
      background: "linear-gradient(135deg,#7c3aed,#2563eb)",
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 14px",
      boxShadow: "0 0 32px rgba(124,58,237,.4)",
    },
    h1: {
      fontFamily: "'Sora', sans-serif", fontSize: "clamp(18px,4vw,21px)",
      fontWeight: 600, color: "#fff", textAlign: "center",
      letterSpacing: -0.4, margin: "0 0 4px",
    },
    sub: {
      fontSize: "clamp(10px,2.5vw,12px)", color: "rgba(255,255,255,.38)",
      textAlign: "center", margin: "0 0 22px",
    },
    gBtn: {
      display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
      width: "100%", padding: "11px 12px",
      background: gLoading ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.07)",
      border: "1px solid rgba(255,255,255,.12)", borderRadius: 12,
      color: "#fff", fontSize: "clamp(12px,3vw,13px)", fontFamily: "'DM Sans', sans-serif",
      cursor: gLoading ? "not-allowed" : "pointer",
      marginBottom: 16, opacity: gLoading ? 0.6 : 1,
      transition: "all .2s", letterSpacing: .1,
    },
    divRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 16 },
    divL:   { flex: 1, height: 1, background: "rgba(255,255,255,.08)" },
    divT:   { fontSize: "clamp(10px,2.5vw,11px)", color: "rgba(255,255,255,.28)", margin: 0, whiteSpace: "nowrap" },
    lbl:    {
      display: "block", fontSize: "clamp(9px,2vw,10.5px)",
      color: "rgba(255,255,255,.44)", marginBottom: 5,
      letterSpacing: .5, textTransform: "uppercase",
    },
    inp: {
      width: "100%", boxSizing: "border-box", padding: "10px 13px",
      background: "rgba(255,255,255,.06)",
      border: "1px solid rgba(255,255,255,.1)",
      borderRadius: 11, color: "#fff",
      fontSize: "clamp(12px,3vw,13px)", fontFamily: "'DM Sans', sans-serif",
      outline: "none", transition: "border-color .2s, background .2s",
    },
    eye: {
      position: "absolute", right: 11, bottom: 10,
      background: "none", border: "none",
      color: "rgba(255,255,255,.38)", cursor: "pointer", fontSize: 13, padding: 0,
    },
    forgot: {
      display: "block", textAlign: "right", fontSize: "clamp(10px,2.5vw,11px)",
      color: "rgba(139,92,246,.85)", textDecoration: "none",
      marginTop: -4, marginBottom: 16, transition: "color .2s",
    },
    btn: {
      width: "100%", padding: 12, borderRadius: 12, border: "none",
      background: "linear-gradient(135deg,#7c3aed 0%,#2563eb 100%)",
      color: "#fff", fontSize: "clamp(12px,3vw,13.5px)", fontWeight: 500,
      fontFamily: "'DM Sans', sans-serif",
      cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.65 : 1,
      boxShadow: "0 4px 20px rgba(124,58,237,.35)",
      transition: "all .2s", letterSpacing: .2,
    },
    foot: {
      textAlign: "center", fontSize: "clamp(10px,2.5vw,11.5px)",
      color: "rgba(255,255,255,.3)", marginTop: 16,
    },
    fLink: { color: "#a78bfa", textDecoration: "none" },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes cardIn { from { opacity:0; transform:translateY(28px) scale(.97) } to { opacity:1; transform:none } }
        input:focus { border-color: rgba(124,58,237,.6) !important; background: rgba(124,58,237,.07) !important; }
        input::placeholder { color: rgba(255,255,255,.22); }
        a.forgot:hover { color: #c4b5fd !important; }
        a.signup-link:hover { color: #c4b5fd !important; }
      `}</style>

      <div style={s.page}>
        <canvas ref={canvasRef} style={s.canvas} />

        <div style={s.card}>
          {/* Logo */}
          <div style={s.logoRing}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>

          <p style={s.h1}>Welcome back</p>
          <p style={s.sub}>Sign in to your account to continue</p>

          {/* Google */}
          <button style={s.gBtn} onClick={handleGoogleAuth} disabled={gLoading}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {gLoading ? "Signing in..." : "Continue with Google"}
          </button>

          <div style={s.divRow}>
            <span style={s.divL}/><p style={s.divT}>or sign in with email</p><span style={s.divL}/>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 12 }}>
              <label style={s.lbl}>Email address</label>
              <input style={s.inp} type="email" name="email"
                placeholder="you@example.com"
                value={formData.email} onChange={handleChange}
                autoComplete="email" required />
            </div>

            {/* Password */}
            <div style={{ position: "relative", marginBottom: 6 }}>
              <label style={s.lbl}>Password</label>
              <input
                style={{ ...s.inp, paddingRight: 36 }}
                type={showPassword ? "text" : "password"}
                name="password" placeholder="Enter your password"
                value={formData.password} onChange={handleChange}
                autoComplete="current-password" required
              />
              <button type="button" style={s.eye}
                onClick={() => setShowPassword(p => !p)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <Link to="/forgot-password" className="forgot" style={s.forgot}>
              Forgot password?
            </Link>

            <button type="submit" style={s.btn} disabled={loading}>
              {loading ? "Signing In..." : "Sign In →"}
            </button>
          </form>

          <p style={s.foot}>
            Don't have an account?{" "}
            <Link to="/signup" className="signup-link" style={s.fLink}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}