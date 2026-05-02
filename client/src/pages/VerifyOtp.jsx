import axios from "axios";
/* eslint-disable no-unused-vars */
// VerifyOtp.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "../store/slices/authSlice";
import { getRolePath } from "../utils/roleNavigate";


const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export default function VerifyOtp() {
    
  const { state }   = useLocation();
  const navigate    = useNavigate();
  const email       = state?.email || "";
  const dispatch = useDispatch();

  const canvasRef   = useRef(null);
  const mouseRef    = useRef({ x: 0, y: 0 });
  const inputsRef   = useRef([]);

  const [otp, setOtp]           = useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading]   = useState(false);
  const [verified, setVerified] = useState(false);
  const [seconds, setSeconds]   = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);

  // ── Redirect if no email ──────────────────────────────────────────────────
  useEffect(() => {
    if (!email) navigate("/signup", { replace: true });
  }, [email, navigate]);

  // ── Mouse tracking ────────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = e => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // ── 3D Canvas Background ──────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId, spheres = [];

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      mkSpheres();
    };

    const mkSpheres = () => {
      const W = canvas.width, H = canvas.height;
      spheres = Array.from({ length: 22 }, (_, i) => ({
        x:     Math.random() * W,
        y:     Math.random() * H,
        r:     12 + Math.random() * 70,
        dx:    (Math.random() - 0.5) * 0.22,
        dy:    (Math.random() - 0.5) * 0.22,
        hue:   i % 2 === 0 ? 260 + Math.random() * 20 : 220 + Math.random() * 20,
        alpha: 0.04 + Math.random() * 0.09,
        phase: Math.random() * Math.PI * 2,
        speed: 0.003 + Math.random() * 0.003,
      }));
    };

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const mouse = mouseRef.current;
      ctx.fillStyle = "#060612";
      ctx.fillRect(0, 0, W, H);
      spheres.forEach(s => {
        s.phase += s.speed;
        s.x += s.dx + Math.sin(s.phase) * 0.06;
        s.y += s.dy;
        if (s.x < -s.r) s.x = W + s.r;
        if (s.x > W + s.r) s.x = -s.r;
        if (s.y < -s.r) s.y = H + s.r;
        if (s.y > H + s.r) s.y = -s.r;
        const dist = Math.hypot(s.x - mouse.x, s.y - mouse.y);
        const pull = Math.max(0, 1 - dist / 280);
        const a = s.alpha + pull * 0.07;
        const r = s.r + pull * 12;
        const g = ctx.createRadialGradient(s.x - r * 0.28, s.y - r * 0.28, r * 0.04, s.x, s.y, r);
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

    resize(); draw();
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (seconds <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const restartTimer = () => {
    setSeconds(RESEND_SECONDS);
    setCanResend(false);
  };

  // ── OTP Input Handlers ────────────────────────────────────────────────────
  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "");
    if (!digit) return;
    const next = [...otp];
    next[index] = digit[0];
    setOtp(next);
    if (index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const next = [...otp]; next[index] = ""; setOtp(next);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        const next = [...otp]; next[index - 1] = ""; setOtp(next);
      }
    }
    if (e.key === "ArrowLeft"  && index > 0)           inputsRef.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const next = [...otp];
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setOtp(next);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  // ── Submit OTP ────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) return toast.error("Please enter the complete 6-digit code.");

    setLoading(true);
    const tid = toast.loading("Verifying your code...");
    try {
    const res=  await api.post("/api/auth/verify-otp", { email, otp: code });
      setVerified(true);
      toast.success("Email verified! Redirecting...", { id: tid });
      dispatch(setUser(res.data.user));
      setTimeout(() => navigate(getRolePath(res.data.user.role)), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid or expired code. Try again.", { id: tid });
      // shake animation
      inputsRef.current.forEach(inp => {
        if (!inp) return;
        inp.classList.add("shake");
        setTimeout(() => inp.classList.remove("shake"), 400);
      });
      setOtp(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    console.log("Resend Otp for ",email);
    const tid = toast.loading("Sending new code...");
    try {
      await api.post("/api/auth/resend-otp", { email });
      restartTimer();
      setOtp(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
      toast.success("New code sent! Check your inbox.", { id: tid });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not resend. Try again.", { id: tid });
    }
  };

  const isComplete = otp.every(d => d !== "");

  // Timer ring values
  const CIRC = 2 * Math.PI * 11;
  const dashOffset = CIRC * (1 - seconds / RESEND_SECONDS);

  // ── Styles ────────────────────────────────────────────────────────────────
  const s = {
    page: {
      position: "relative", minHeight: "100vh", background: "#060612",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif", padding: "20px 16px", boxSizing: "border-box",
    },
    canvas: { position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0 },
    card: {
      position: "relative", zIndex: 2, width: "100%", maxWidth: 420,
      background: "rgba(255,255,255,0.045)",
      backdropFilter: "blur(36px)", WebkitBackdropFilter: "blur(36px)",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 26,
      padding: "clamp(24px,5vw,36px) clamp(18px,5vw,28px) 30px",
      boxSizing: "border-box",
      animation: "cardIn .7s cubic-bezier(.22,1,.36,1) both",
    },
    iconWrap: {
      width: 62, height: 62, borderRadius: 20,
      margin: "0 auto 18px",
      background: "linear-gradient(145deg,rgba(124,58,237,.25),rgba(37,99,235,.2))",
      border: "1px solid rgba(124,58,237,.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      position: "relative",
    },
    dots: { display: "flex", gap: 5, justifyContent: "center", marginBottom: 20 },
    dot: (state) => ({
      height: 6, borderRadius: 3, transition: "all .3s",
      background: state === "done" ? "rgba(124,58,237,.45)"
                : state === "active" ? "#7c3aed" : "rgba(255,255,255,.14)",
      width: state === "active" ? 18 : 6,
    }),
    h1: {
      fontFamily: "'Sora', sans-serif", fontSize: "clamp(19px,4vw,22px)",
      fontWeight: 600, color: "#fff", textAlign: "center",
      letterSpacing: -0.5, margin: "0 0 6px",
    },
    sub: {
      fontSize: "clamp(11px,2.5vw,12.5px)", color: "rgba(255,255,255,.38)",
      textAlign: "center", margin: "0 0 6px", lineHeight: 1.5,
    },
    badge: {
      display: "inline-flex", alignItems: "center", gap: 6,
      background: "rgba(124,58,237,.15)", border: "1px solid rgba(124,58,237,.3)",
      borderRadius: 30, padding: "5px 14px",
      fontSize: "clamp(10px,2.5vw,11.5px)", color: "#c4b5fd", letterSpacing: .1,
      margin: "0 auto 26px",
    },
    badgeWrap: { textAlign: "center" },
    otpRow: { display: "flex", gap: "clamp(7px,2vw,10px)", justifyContent: "center", marginBottom: 22 },
    box: (filled, success) => ({
      width: "clamp(44px,13vw,54px)", height: "clamp(52px,14vw,62px)",
      borderRadius: 14,
      background: success ? "rgba(34,197,94,.08)" : filled ? "rgba(124,58,237,.08)" : "rgba(255,255,255,.06)",
      border: `1.5px solid ${success ? "rgba(34,197,94,.55)" : filled ? "rgba(124,58,237,.5)" : "rgba(255,255,255,.1)"}`,
      color: "#fff", fontSize: "clamp(20px,5vw,26px)", fontWeight: 600,
      fontFamily: "'Sora', sans-serif", textAlign: "center", outline: "none",
      caretColor: "transparent", transition: "all .18s",
    }),
    timerRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 20 },
    timerLabel: { fontSize: 12, color: "rgba(255,255,255,.35)" },
    resendBtn: {
      fontSize: 12, color: canResend ? "#7c3aed" : "rgba(255,255,255,.22)",
      background: "none", border: "none",
      cursor: canResend ? "pointer" : "default", padding: 0, transition: "color .2s",
    },
    btn: {
      width: "100%", padding: 13, borderRadius: 13, border: "none",
      background: verified
        ? "linear-gradient(135deg,#059669,#10b981)"
        : "linear-gradient(135deg,#7c3aed,#2563eb)",
      color: "#fff", fontSize: "clamp(12px,3vw,14px)", fontWeight: 500,
      fontFamily: "'DM Sans', sans-serif",
      cursor: (!isComplete || loading || verified) ? "not-allowed" : "pointer",
      opacity: (!isComplete || loading) && !verified ? 0.5 : 1,
      boxShadow: "0 4px 24px rgba(124,58,237,.4)",
      transition: "all .25s", letterSpacing: .2,
    },
    back: {
      display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
      marginTop: 16, fontSize: 12, color: "rgba(255,255,255,.3)",
      background: "none", border: "none", cursor: "pointer",
      width: "100%", transition: "color .2s",
    },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@600;700&family=DM+Sans:wght@400;500&display=swap');
        @keyframes cardIn { from{opacity:0;transform:translateY(30px) scale(.96)} to{opacity:1;transform:none} }
        @keyframes ping { 0%,100%{transform:scale(1);opacity:.6} 50%{transform:scale(1.07);opacity:.15} }
        @keyframes bounceIn { 0%{transform:scale(.85)} 60%{transform:scale(1.08)} 100%{transform:scale(1)} }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-5px)} 40%{transform:translateX(5px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        .otp-input:focus { border-color: rgba(124,58,237,.7) !important; background: rgba(124,58,237,.1) !important; box-shadow: 0 0 0 3px rgba(124,58,237,.15); transform: scale(1.04); }
        .otp-input.shake { animation: shake .35s ease; }
        .otp-input.bounce { animation: bounceIn .3s cubic-bezier(.34,1.56,.64,1); }
        .back-btn:hover { color: rgba(255,255,255,.6) !important; }
        .resend:hover:not(:disabled) { color: #a78bfa !important; }
        .submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(124,58,237,.55) !important; }
      `}</style>

      <div style={s.page}>
        <canvas ref={canvasRef} style={s.canvas} />

        <div style={s.card}>

          {/* Icon */}
          <div style={s.iconWrap}>
            <div style={{
              position: "absolute", inset: -6, borderRadius: 26,
              border: "1px solid rgba(124,58,237,.2)",
              animation: "ping 2s ease-in-out infinite",
            }} />
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="rgba(167,139,250,1)" strokeWidth="1.8" strokeLinecap="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>

          {/* Progress dots */}
          <div style={s.dots}>
            <div style={s.dot("done")} />
            <div style={s.dot("active")} />
            <div style={s.dot("none")} />
          </div>

          <p style={s.h1}>Check your inbox</p>
          <p style={s.sub}>We sent a 6-digit verification code to</p>
          <div style={s.badgeWrap}>
            <div style={s.badge}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94"/>
              </svg>
              {email}
            </div>
          </div>

          {/* OTP Boxes */}
          <div style={s.otpRow}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={el => inputsRef.current[i] = el}
                className="otp-input"
                style={s.box(!!digit, verified)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                autoFocus={i === 0}
                autoComplete="one-time-code"
              />
            ))}
          </div>

          {/* Timer + Resend */}
          <div style={s.timerRow}>
            {!canResend && (
              <svg width="28" height="28" viewBox="0 0 28 28"
                style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
                <circle cx="14" cy="14" r="11" fill="none"
                  stroke="rgba(255,255,255,.08)" strokeWidth="2.5"/>
                <circle cx="14" cy="14" r="11" fill="none"
                  stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round"
                  strokeDasharray={CIRC}
                  strokeDashoffset={dashOffset}
                  style={{ transition: "stroke-dashoffset .9s linear" }}/>
                <text x="14" y="14" dominantBaseline="middle" textAnchor="middle"
                  fill="#a78bfa" fontSize="8" fontWeight="600"
                  style={{ transform: "rotate(90deg)", transformOrigin: "14px 14px" }}>
                  {seconds}
                </text>
              </svg>
            )}
            <span style={s.timerLabel}>
              {canResend ? "Didn't receive the code?" : "Resend code in"}
            </span>
            <button
              className="resend"
              style={s.resendBtn}
              disabled={!canResend}
              onClick={handleResend}
            >
              Resend
            </button>
          </div>

          {/* Submit */}
          <button
            className="submit"
            style={s.btn}
            disabled={!isComplete || loading || verified}
            onClick={handleSubmit}
          >
            {verified ? "✓ Verified!" : loading ? "Verifying..." : "Verify Email →"}
          </button>

          {/* Back */}
          <button className="back-btn" style={s.back} onClick={() => navigate("/signup")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back to sign up
          </button>

        </div>
      </div>
    </>
  );
}