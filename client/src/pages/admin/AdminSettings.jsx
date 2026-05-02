/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import toast from "react-hot-toast";

export default function AdminSettings() {
  const [siteName, setSiteName] = useState("SmartLabour");
  const [email,    setEmail]    = useState("admin@smartlabour.pk");

  return (
    <>
      <style>{`
        .as-wrap { font-family:'DM Sans',sans-serif; max-width:560px; padding-bottom:20px; }
        .as-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        @media(max-width:480px) {
          .as-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="as-wrap">
        <div style={{ marginBottom:24 }}>
          <p style={s.title}>⚙️ Settings</p>
          <p style={s.sub}>Manage platform configuration</p>
        </div>

        {/* General */}
        <div style={s.card}>
          <p style={s.cardTitle}>General Settings</p>
          <div style={{ marginTop:16, display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <p style={s.lbl}>Platform Name</p>
              <input style={s.inp} value={siteName}
                onChange={e => setSiteName(e.target.value)} />
            </div>
            <div>
              <p style={s.lbl}>Admin Email</p>
              <input style={s.inp} type="email" value={email}
                onChange={e => setEmail(e.target.value)} />
            </div>
            <button style={s.btn} onClick={() => toast.success("Settings saved!")}>
              Save Changes
            </button>
          </div>
        </div>

        {/* Info Cards */}
        <div style={{ marginTop:14 }}>
          <div className="as-grid">
            {[
              { icon:"🌐", label:"Platform Version", value:"v1.0.0" },
              { icon:"🗄️", label:"Database",         value:"MongoDB Atlas" },
              { icon:"🔐", label:"Auth",             value:"JWT + Firebase" },
              { icon:"📧", label:"Email Service",    value:"Nodemailer" },
            ].map(item => (
              <div key={item.label} style={s.infoCard}>
                <span style={{ fontSize:20 }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"0 0 2px" }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize:13, color:"#fff", margin:0, fontWeight:500 }}>
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const s = {
  title:    { fontFamily:"'Sora',sans-serif", fontSize:"clamp(16px,4vw,20px)", fontWeight:600, color:"#fff", margin:0 },
  sub:      { fontSize:12, color:"rgba(255,255,255,0.35)", margin:"4px 0 0" },
  card:     { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"clamp(14px,3vw,20px)" },
  cardTitle:{ fontSize:14, fontWeight:500, color:"#fff", margin:0 },
  lbl:      { fontSize:11, color:"rgba(255,255,255,0.48)", marginBottom:5 },
  inp:      { width:"100%", boxSizing:"border-box", padding:"10px 12px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, color:"#fff", fontSize:13, fontFamily:"inherit", outline:"none" },
  btn:      { padding:"10px 24px", borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#4f46e5)", border:"none", color:"#fff", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" },
  infoCard: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"14px 16px", display:"flex", alignItems:"center", gap:12 },
};