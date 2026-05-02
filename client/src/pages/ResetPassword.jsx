/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export default function ResetPassword() {
  const { token }    = useParams();
  const navigate     = useNavigate();

  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [showConf,  setShowConf]  = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [done,      setDone]      = useState(false);

  // ✅ Real-time frontend validation
  const passwordsMatch = confirm.length > 0 && password === confirm;
  const passwordsDiff  = confirm.length > 0 && password !== confirm;
  const isStrong       = password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isStrong)       return toast.error("Password must be at least 8 characters.");
    if (passwordsDiff)   return toast.error("Passwords do not match.");
    if (!passwordsMatch) return toast.error("Please confirm your password.");

    setLoading(true);
    const tid = toast.loading("Resetting your password...");
    try {
      await api.post(`/api/auth/reset-password/${token}`, { password });
      toast.success("Password reset successfully!", { id: tid });
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Invalid or expired link.",
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
        <div style={{
          ...s.iconWrap,
          background: done ? "rgba(16,185,129,0.2)" : "rgba(124,58,237,0.2)",
          border: done ? "1px solid rgba(16,185,129,0.3)" : "1px solid rgba(124,58,237,0.3)",
        }}>
          <span style={{ fontSize: 28 }}>{done ? "✅" : "🔑"}</span>
        </div>

        <p style={s.h1}>
          {done ? "Password Reset!" : "Set New Password"}
        </p>
        <p style={s.sub}>
          {done
            ? "Redirecting to login in a moment..."
            : "Enter your new password below."}
        </p>

        {!done && (
          <form onSubmit={handleSubmit}>

            {/* New Password */}
            <p style={s.lbl}>New Password</p>
            <div style={{ position:"relative", marginBottom:8 }}>
              <input
                style={{
                  ...s.inp,
                  paddingRight: 38,
                  borderColor: password.length > 0
                    ? isStrong
                      ? "rgba(110,231,183,0.5)"
                      : "rgba(248,113,113,0.5)"
                    : "rgba(255,255,255,0.11)",
                }}
                type={showPass ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button type="button" style={s.eye}
                onClick={() => setShowPass(p => !p)}>
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Password strength indicator */}
            {password.length > 0 && (
              <p style={{
                fontSize:11, margin:"0 0 12px",
                color: isStrong ? "#6ee7b7" : "#f87171",
              }}>
                {isStrong ? "✓ Strong password" : "✕ Too short — min 8 characters"}
              </p>
            )}

            {/* Confirm Password */}
            <p style={s.lbl}>Confirm Password</p>
            <div style={{ position:"relative", marginBottom:8 }}>
              <input
                style={{
                  ...s.inp,
                  paddingRight: 38,
                  borderColor: confirm.length > 0
                    ? passwordsMatch
                      ? "rgba(110,231,183,0.5)"
                      : "rgba(248,113,113,0.5)"
                    : "rgba(255,255,255,0.11)",
                }}
                type={showConf ? "text" : "password"}
                placeholder="Repeat your password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
              <button type="button" style={s.eye}
                onClick={() => setShowConf(p => !p)}>
                {showConf ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* ✅ Real-time match feedback */}
            {confirm.length > 0 && (
              <p style={{
                fontSize:11, margin:"0 0 16px",
                color: passwordsMatch ? "#6ee7b7" : "#f87171",
              }}>
                {passwordsMatch
                  ? "✓ Passwords match"
                  : "✕ Passwords do not match"}
              </p>
            )}

            <button
              type="submit"
              style={{
                ...s.btn,
                opacity: loading || passwordsDiff || !isStrong ? 0.55 : 1,
                cursor:  loading || passwordsDiff || !isStrong ? "not-allowed" : "pointer",
              }}
              disabled={loading || passwordsDiff || !isStrong}
            >
              {loading ? "Resetting..." : "Reset Password →"}
            </button>
          </form>
        )}

        {!done && (
          <p style={s.foot}>
            Remember your password?{" "}
            <a href="/login" style={s.link}>Sign in</a>
          </p>
        )}
      </div>
    </div>
  );
}

const s = {
  page:     { minHeight:"100vh", background:"#0a0a1a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", padding:"20px 16px" },
  card:     { width:"100%", maxWidth:420, background:"rgba(255,255,255,0.06)", backdropFilter:"blur(24px)", WebkitBackdropFilter:"blur(24px)", border:"1px solid rgba(255,255,255,0.13)", borderRadius:22, padding:"clamp(20px,5vw,32px) clamp(16px,5vw,28px)", boxSizing:"border-box" },
  iconWrap: { width:56, height:56, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" },
  h1:       { fontFamily:"'Sora',sans-serif", fontSize:"clamp(18px,4vw,22px)", fontWeight:600, color:"#fff", textAlign:"center", margin:"0 0 8px" },
  sub:      { fontSize:"clamp(11px,2.5vw,13px)", color:"rgba(255,255,255,0.45)", textAlign:"center", margin:"0 0 22px", lineHeight:1.6 },
  lbl:      { fontSize:11, color:"rgba(255,255,255,0.48)", marginBottom:5, letterSpacing:0.4 },
  inp:      { width:"100%", boxSizing:"border-box", padding:"11px 14px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.11)", borderRadius:11, color:"#fff", fontSize:13, fontFamily:"inherit", outline:"none", transition:"border-color 0.2s" },
  eye:      { position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:13, padding:0 },
  btn:      { width:"100%", padding:12, borderRadius:11, background:"linear-gradient(135deg,#7c3aed,#4f46e5)", border:"none", color:"#fff", fontSize:13, fontWeight:500, fontFamily:"inherit", transition:"opacity 0.2s" },
  foot:     { textAlign:"center", fontSize:11, color:"rgba(255,255,255,0.32)", marginTop:16 },
  link:     { color:"#a78bfa", textDecoration:"none" },
};