/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export default function ForgotPassword() {
  const navigate          = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep]   = useState("email"); // email | sent

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Please enter your email.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Please enter a valid email.");

    setLoading(true);
    const tid = toast.loading("Checking your account...");
    try {
      await api.post("/api/auth/forgot-password", {
        email: email.toLowerCase().trim(),
      });
      toast.success("Reset link sent! Check your inbox.", { id: tid });
      setStep("sent");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong.",
        { id: tid }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Icon */}
        <div style={s.iconWrap}>
          <span style={{ fontSize: 28 }}>🔐</span>
        </div>

        {step === "email" ? (
          <>
            <p style={s.h1}>Forgot Password?</p>
            <p style={s.sub}>
              Enter your email — we'll check if an account exists
              and send a reset link.
            </p>

            <form onSubmit={handleSubmit}>
              <p style={s.lbl}>Email Address</p>
              <input
                style={s.inp}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                style={{ ...s.btn, opacity: loading ? 0.65 : 1 }}
                disabled={loading}
              >
                {loading ? "Checking..." : "Send Reset Link →"}
              </button>
            </form>
          </>
        ) : (
          <>
            <p style={s.h1}>Check Your Inbox ✅</p>
            <p style={s.sub}>
              We've sent a password reset link to{" "}
              <strong style={{ color: "#c4b5fd" }}>{email}</strong>.
              <br />
              Link expires in <strong>15 minutes</strong>.
            </p>
            <div style={s.infoBox}>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                Didn't receive it? Check spam folder or{" "}
                <button
                  style={s.resendLink}
                  onClick={() => setStep("email")}
                >
                  try again
                </button>
              </p>
            </div>
            <button style={s.btn} onClick={() => navigate("/login")}>
              Back to Login →
            </button>
          </>
        )}

        <p style={s.foot}>
          Remember your password?{" "}
          <a href="/login" style={s.link}>Sign in</a>
        </p>
      </div>
    </div>
  );
}

const s = {
  page:      { minHeight:"100vh", background:"#0a0a1a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", padding:"20px 16px" },
  card:      { width:"100%", maxWidth:420, background:"rgba(255,255,255,0.06)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", border:"1px solid rgba(255,255,255,0.13)", borderRadius:22, padding:"clamp(20px,5vw,32px) clamp(16px,5vw,28px)", boxSizing:"border-box" },
  iconWrap:  { width:56, height:56, borderRadius:16, background:"rgba(124,58,237,0.2)", border:"1px solid rgba(124,58,237,0.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" },
  h1:        { fontFamily:"'Sora',sans-serif", fontSize:"clamp(18px,4vw,22px)", fontWeight:600, color:"#fff", textAlign:"center", margin:"0 0 8px" },
  sub:       { fontSize:"clamp(11px,2.5vw,13px)", color:"rgba(255,255,255,0.45)", textAlign:"center", margin:"0 0 22px", lineHeight:1.6 },
  lbl:       { fontSize:11, color:"rgba(255,255,255,0.48)", marginBottom:5, letterSpacing:0.4 },
  inp:       { width:"100%", boxSizing:"border-box", padding:"11px 14px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.11)", borderRadius:11, color:"#fff", fontSize:13, fontFamily:"inherit", outline:"none", marginBottom:14 },
  btn:       { width:"100%", padding:12, borderRadius:11, background:"linear-gradient(135deg,#7c3aed,#4f46e5)", border:"none", color:"#fff", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer", marginTop:4 },
  infoBox:   { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"12px 14px", marginBottom:16, textAlign:"center" },
  resendLink:{ background:"none", border:"none", color:"#a78bfa", cursor:"pointer", fontSize:12, padding:0, fontFamily:"inherit" },
  foot:      { textAlign:"center", fontSize:11, color:"rgba(255,255,255,0.32)", marginTop:16 },
  link:      { color:"#a78bfa", textDecoration:"none" },
};