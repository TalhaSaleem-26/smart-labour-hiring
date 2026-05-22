/* eslint-disable no-unused-vars */
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { clearUser } from "../../store/slices/authSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export default function EmployerSettings() {
  const { user }  = useSelector(s => s.auth);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      dispatch(clearUser());
      toast.success("Logged out!");
      navigate("/login");
    } catch {
      toast.error("Logout failed.");
    }
  };

  const handleResetPassword = () => {
    const tid = toast.loading("Sending reset link...");
    api.post("/api/auth/forgot-password", { email: user?.email })
      .then(() => toast.success("Reset link sent! Check your email.", { id: tid }))
      .catch(() => toast.error("Failed to send.", { id: tid }));
  };

  return (
    <>
      <style>{`
        .es-page   { font-family:'DM Sans',sans-serif; padding-bottom:24px; }
        .es-layout { display:grid; grid-template-columns:1fr 300px; gap:16px; align-items:start; }
        .es-left   { display:flex; flex-direction:column; gap:14px; }
        .es-right  { display:flex; flex-direction:column; gap:14px; position:sticky; top:80px; }
        @media(max-width:900px) {
          .es-layout { grid-template-columns:1fr; }
          .es-right  { position:static; }
        }
      `}</style>

      <div className="es-page">
        <div style={{ marginBottom:24 }}>
          <p style={s.title}>⚙️ Settings</p>
          <p style={s.sub}>Manage your employer account preferences</p>
        </div>

        <div className="es-layout">

          {/* LEFT */}
          <div className="es-left">

            <div style={s.card}>
              <p style={s.cardTitle}>👤 Account Information</p>
              <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:12 }}>
                {[
                  { label:"Full Name",    value: user?.name || "" },
                  { label:"Email Address", value: user?.email || "" },
                  { label:"Role",         value: "Employer" },
                ].map(f => (
                  <div key={f.label}>
                    <p style={s.lbl}>{f.label}</p>
                    <input style={{ ...s.inp, opacity:0.6, cursor:"not-allowed" }}
                      value={f.value} disabled />
                  </div>
                ))}
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", margin:0 }}>
                  * Contact admin to update name or email
                </p>
              </div>
            </div>

            <div style={s.card}>
              <p style={s.cardTitle}>🔐 Password & Security</p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:"8px 0 16px", lineHeight:1.5 }}>
                A password reset link will be sent to your registered email address.
              </p>
              <button style={s.primaryBtn} onClick={handleResetPassword}>
                Send Password Reset Link →
              </button>
            </div>

            <div style={{ ...s.card, border:"1px solid rgba(248,113,113,0.2)" }}>
              <p style={{ ...s.cardTitle, color:"#f87171" }}>⚠️ Danger Zone</p>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", margin:"8px 0 16px" }}>
                These actions cannot be undone.
              </p>
              <button style={s.dangerBtn} onClick={handleLogout}>
                🚪 Logout from all devices
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="es-right">

            <div style={s.card}>
              <p style={s.cardTitle}>📋 Account Summary</p>
              <div style={{ marginTop:14, display:"flex", flexDirection:"column", gap:10 }}>
                {[
                  { label:"Name",     value: user?.name || "—" },
                  { label:"Email",    value: user?.email?.slice(0,22) + (user?.email?.length > 22 ? "..." : "") },
                  { label:"Role",     value: "Employer" },
                  { label:"Auth",     value: user?.authType === "google" ? "🔵 Google" : "📧 Email" },
                  { label:"Verified", value: user?.isVerified ? "✅ Yes" : "❌ No" },
                ].map(item => (
                  <div key={item.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>{item.label}</span>
                    <span style={{ fontSize:12, color:"#fff", fontWeight:500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...s.card, background:"rgba(110,231,183,0.06)", border:"1px solid rgba(110,231,183,0.15)" }}>
              <p style={s.cardTitle}>🛡️ Security Info</p>
              <div style={{ marginTop:12, display:"flex", flexDirection:"column", gap:8 }}>
                {[
                  { icon:"🔒", text:"Data encrypted at rest" },
                  { icon:"🍪", text:"Secure HTTP-only cookies" },
                  { icon:"🔑", text:"JWT token authentication" },
                  { icon:"🔥", text:"Firebase Google Auth" },
                ].map((item, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:14 }}>{item.icon}</span>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.45)" }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={s.card}>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", margin:0, textAlign:"center" }}>
                SmartLabour v1.0.0 · SZABIST University
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const s = {
  title:      { fontFamily:"'Sora',sans-serif", fontSize:"clamp(16px,4vw,20px)", fontWeight:600, color:"#fff", margin:0 },
  sub:        { fontSize:12, color:"rgba(255,255,255,0.35)", margin:"4px 0 0" },
  card:       { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"clamp(14px,3vw,20px)" },
  cardTitle:  { fontSize:14, fontWeight:500, color:"#fff", margin:0 },
  lbl:        { fontSize:11, color:"rgba(255,255,255,0.48)", marginBottom:5 },
  inp:        { width:"100%", boxSizing:"border-box", padding:"10px 12px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, color:"#fff", fontSize:13, fontFamily:"inherit", outline:"none" },
  primaryBtn: { padding:"10px 20px", borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#4f46e5)", border:"none", color:"#fff", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" },
  dangerBtn:  { padding:"10px 20px", borderRadius:10, background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", color:"#f87171", fontSize:13, cursor:"pointer", fontFamily:"inherit" },
};