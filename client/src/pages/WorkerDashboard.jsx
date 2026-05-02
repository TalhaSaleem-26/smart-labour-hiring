/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

const CATEGORY_ICONS = {
  plumber: "🔧", electrician: "⚡", painter: "🎨",
  cleaner: "🧹", carpenter: "🪚", welder: "🔩",
  mason: "🧱", driver: "🚗", gardener: "🌿", other: "💼",
};

export default function WorkerDashboard() {
  const { user }      = useSelector(s => s.auth);
  const navigate      = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/worker/me")
      .then(res => setProfile(res.data.worker))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const QUICK_STATS = [
    { label:"Profile Status", value: profile ? profile.status : "Incomplete", color: profile?.status === "approved" ? "#6ee7b7" : profile?.status === "pending" ? "#fcd34d" : "#f87171", icon:"📋" },
    { label:"Category",       value: profile?.category ? profile.category.charAt(0).toUpperCase() + profile.category.slice(1) : "—", color:"#c4b5fd", icon: profile?.category ? CATEGORY_ICONS[profile.category] : "🔧" },
    { label:"Hourly Rate",    value: profile?.hourlyRate ? `PKR ${profile.hourlyRate}` : "—", color:"#6ee7b7", icon:"💰" },
    { label:"Experience",     value: profile?.experience !== undefined ? `${profile.experience} yrs` : "—", color:"#7dd3fc", icon:"⭐" },
  ];

  return (
    <>
      <style>{`
        .wd-wrap { font-family:'DM Sans',sans-serif; padding-bottom:24px; }
        .wd-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:16px; }
        .wd-bottom { display:grid; grid-template-columns:2fr 1fr; gap:14px; }
        @media(max-width:1024px) {
          .wd-stats  { grid-template-columns:repeat(2,1fr); }
          .wd-bottom { grid-template-columns:1fr; }
        }
        @media(max-width:480px) {
          .wd-stats { grid-template-columns:1fr 1fr; }
        }
      `}</style>

      <div className="wd-wrap">

        {/* ── Welcome Header ── */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.avatarLg}>
              {user?.name?.charAt(0)?.toUpperCase() || "W"}
            </div>
            <div>
              <p style={s.greet}>{greet()}, <strong>{user?.name?.split(" ")[0]}</strong> 👋</p>
              <p style={s.greetSub}>
                {profile?.status === "approved"
                  ? "Your profile is active and visible to employers."
                  : profile?.status === "pending"
                  ? "Your profile is under review by admin."
                  : "Complete your profile to start receiving job offers."}
              </p>
            </div>
          </div>
          <div style={s.headerRight}>
            <div style={{
              ...s.statusBadge,
              background: profile?.status === "approved" ? "rgba(110,231,183,0.15)" : profile?.status === "pending" ? "rgba(252,211,77,0.15)" : "rgba(248,113,113,0.15)",
              border: `1px solid ${profile?.status === "approved" ? "rgba(110,231,183,0.4)" : profile?.status === "pending" ? "rgba(252,211,77,0.4)" : "rgba(248,113,113,0.4)"}`,
              color: profile?.status === "approved" ? "#6ee7b7" : profile?.status === "pending" ? "#fcd34d" : "#f87171",
            }}>
              {profile?.status === "approved" ? "✅ Active" : profile?.status === "pending" ? "⏳ Pending Review" : "⚠️ Profile Incomplete"}
            </div>
          </div>
        </div>

        {/* ── Profile Incomplete Banner ── */}
        {!profile && !loading && (
          <div style={s.banner}>
            <div style={s.bannerLeft}>
              <span style={{ fontSize:24 }}>🚀</span>
              <div>
                <p style={s.bannerTitle}>Complete your worker profile</p>
                <p style={s.bannerSub}>Add your skills, location and rate to start receiving job offers from employers.</p>
              </div>
            </div>
            <button style={s.bannerBtn} onClick={() => navigate("/worker/register")}>
              Complete Now →
            </button>
          </div>
        )}

        {/* ── Pending Banner ── */}
        {profile?.status === "pending" && (
          <div style={{ ...s.banner, background:"rgba(252,211,77,0.08)", border:"1px solid rgba(252,211,77,0.2)" }}>
            <div style={s.bannerLeft}>
              <span style={{ fontSize:24 }}>⏳</span>
              <div>
                <p style={{ ...s.bannerTitle, color:"#fcd34d" }}>Profile Under Review</p>
                <p style={s.bannerSub}>Admin is reviewing your profile. You'll be notified once approved.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Quick Stats ── */}
        <div className="wd-stats">
          {QUICK_STATS.map(st => (
            <div key={st.label} style={s.statCard}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <p style={s.statLabel}>{st.label}</p>
                <span style={{ fontSize:18 }}>{st.icon}</span>
              </div>
              <p style={{ fontSize:"clamp(14px,3vw,18px)", fontWeight:600, color:st.color, margin:0 }}>
                {loading ? "..." : st.value}
              </p>
            </div>
          ))}
        </div>

        {/* ── Bottom Section ── */}
        <div className="wd-bottom">

          {/* Profile Summary */}
          <div style={s.card}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <p style={s.cardTitle}>📋 Profile Summary</p>
              <button style={s.editBtn} onClick={() => navigate("/worker/profile")}>
                Edit Profile
              </button>
            </div>

            {loading ? (
              <p style={s.loadText}>Loading...</p>
            ) : !profile ? (
              <div style={s.emptyBox}>
                <span style={{ fontSize:32 }}>👷</span>
                <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, margin:"10px 0 16px" }}>
                  No profile found. Create one to get started!
                </p>
                <button style={s.createBtn} onClick={() => navigate("/worker/register")}>
                  Create Profile →
                </button>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

                {/* Category */}
                <div style={s.infoRow}>
                  <span style={s.infoIcon}>{CATEGORY_ICONS[profile.category] || "💼"}</span>
                  <div>
                    <p style={s.infoLabel}>Category</p>
                    <p style={s.infoVal}>{profile.category?.charAt(0).toUpperCase() + profile.category?.slice(1)}</p>
                  </div>
                </div>

                {/* Location */}
                <div style={s.infoRow}>
                  <span style={s.infoIcon}>📍</span>
                  <div>
                    <p style={s.infoLabel}>Location</p>
                    <p style={s.infoVal}>
                      {profile.location?.city
                        ? `${profile.location.city}${profile.location.area ? `, ${profile.location.area}` : ""}`
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Skills */}
                <div style={s.infoRow}>
                  <span style={s.infoIcon}>🛠️</span>
                  <div style={{ flex:1 }}>
                    <p style={s.infoLabel}>Skills</p>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:4 }}>
                      {profile.skills?.length > 0
                        ? profile.skills.map(sk => (
                          <span key={sk} style={s.skillTag}>{sk}</span>
                        ))
                        : <span style={s.infoVal}>—</span>
                      }
                    </div>
                  </div>
                </div>

                {/* Availability */}
                <div style={s.infoRow}>
                  <span style={s.infoIcon}>📅</span>
                  <div>
                    <p style={s.infoLabel}>Available Days</p>
                    <p style={s.infoVal}>
                      {profile.availability?.days?.length > 0
                        ? profile.availability.days.map(d => d.charAt(0).toUpperCase() + d.slice(1,3)).join(", ")
                        : "—"}
                    </p>
                  </div>
                </div>

                {/* Rate */}
                <div style={s.infoRow}>
                  <span style={s.infoIcon}>💰</span>
                  <div>
                    <p style={s.infoLabel}>Hourly Rate</p>
                    <p style={{ ...s.infoVal, color:"#6ee7b7", fontWeight:600 }}>
                      PKR {profile.hourlyRate}/hr
                    </p>
                  </div>
                </div>

                {/* Bio */}
                {profile.bio && (
                  <div style={{ ...s.infoRow, alignItems:"flex-start" }}>
                    <span style={s.infoIcon}>📝</span>
                    <div>
                      <p style={s.infoLabel}>Bio</p>
                      <p style={{ ...s.infoVal, whiteSpace:"normal", lineHeight:1.5 }}>
                        {profile.bio}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {/* Quick Actions */}
            <div style={s.card}>
              <p style={s.cardTitle}>⚡ Quick Actions</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:12 }}>
                {[
                  { icon:"🔍", label:"Browse Jobs",     path:"/worker/jobs",     color:"#7dd3fc" },
                  { icon:"👤", label:"Edit Profile",    path:"/worker/profile",  color:"#c4b5fd" },
                  { icon:"⭐", label:"My Reviews",      path:"/worker/reviews",  color:"#fcd34d" },
                  { icon:"⚙️", label:"Settings",        path:"/worker/settings", color:"rgba(255,255,255,0.5)" },
                ].map(action => (
                  <button key={action.path} style={s.actionBtn}
                    onClick={() => navigate(action.path)}>
                    <span style={{ fontSize:16 }}>{action.icon}</span>
                    <span style={{ fontSize:13, color:action.color }}>{action.label}</span>
                    <span style={{ marginLeft:"auto", color:"rgba(255,255,255,0.3)", fontSize:12 }}>→</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips Card */}
            <div style={s.tipsCard}>
              <p style={s.cardTitle}>💡 Tips</p>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:12 }}>
                {[
                  "Add all your skills to get more job matches",
                  "Keep your availability updated",
                  "Set a competitive hourly rate",
                ].map((tip, i) => (
                  <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start" }}>
                    <span style={{ fontSize:12, color:"#a78bfa", flexShrink:0, marginTop:1 }}>✦</span>
                    <p style={{ fontSize:12, color:"rgba(255,255,255,0.45)", margin:0, lineHeight:1.5 }}>
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const s = {
  header:      { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:12, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"clamp(14px,3vw,20px)" },
  headerLeft:  { display:"flex", alignItems:"center", gap:14 },
  avatarLg:    { width:52, height:52, borderRadius:14, background:"rgba(14,165,233,0.2)", border:"1px solid rgba(14,165,233,0.3)", color:"#7dd3fc", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:600, flexShrink:0 },
  greet:       { fontFamily:"'Sora',sans-serif", fontSize:"clamp(15px,3vw,18px)", fontWeight:600, color:"#fff", margin:0 },
  greetSub:    { fontSize:"clamp(10px,2.5vw,12px)", color:"rgba(255,255,255,0.4)", margin:"4px 0 0", maxWidth:400 },
  headerRight: { flexShrink:0 },
  statusBadge: { padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:500 },
  banner:      { background:"rgba(124,58,237,0.1)", border:"1px solid rgba(124,58,237,0.25)", borderRadius:14, padding:"16px 20px", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" },
  bannerLeft:  { display:"flex", alignItems:"center", gap:14 },
  bannerTitle: { fontSize:14, fontWeight:500, color:"#c4b5fd", margin:"0 0 3px" },
  bannerSub:   { fontSize:12, color:"rgba(255,255,255,0.4)", margin:0, maxWidth:380 },
  bannerBtn:   { padding:"9px 20px", borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#4f46e5)", border:"none", color:"#fff", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", flexShrink:0 },
  statCard:    { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"clamp(12px,3vw,16px)" },
  statLabel:   { fontSize:11, color:"rgba(255,255,255,0.45)", margin:0 },
  card:        { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"clamp(14px,3vw,20px)" },
  cardTitle:   { fontSize:14, fontWeight:500, color:"#fff", margin:0 },
  editBtn:     { padding:"5px 14px", borderRadius:8, background:"rgba(124,58,237,0.2)", border:"1px solid rgba(124,58,237,0.3)", color:"#c4b5fd", fontSize:11, cursor:"pointer", fontFamily:"inherit" },
  emptyBox:    { textAlign:"center", padding:"24px 0" },
  createBtn:   { padding:"9px 20px", borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#4f46e5)", border:"none", color:"#fff", fontSize:12, cursor:"pointer", fontFamily:"inherit" },
  loadText:    { color:"rgba(255,255,255,0.4)", fontSize:13 },
  infoRow:     { display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" },
  infoIcon:    { fontSize:18, flexShrink:0 },
  infoLabel:   { fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 2px" },
  infoVal:     { fontSize:13, color:"#fff", margin:0, fontWeight:500 },
  skillTag:    { padding:"3px 10px", borderRadius:20, background:"rgba(124,58,237,0.2)", border:"1px solid rgba(124,58,237,0.3)", color:"#c4b5fd", fontSize:11 },
  actionBtn:   { display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", cursor:"pointer", fontFamily:"inherit", transition:"background 0.2s", width:"100%" },
  tipsCard:    { background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,0.15)", borderRadius:16, padding:"clamp(14px,3vw,18px)" },
};