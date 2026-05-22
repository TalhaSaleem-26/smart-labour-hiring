/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

const STATUS_COLORS = {
  pending:  { bg:"rgba(252,211,77,0.15)",  color:"#fcd34d",  label:"⏳ Pending" },
  accepted: { bg:"rgba(110,231,183,0.15)", color:"#6ee7b7",  label:"✅ Accepted" },
  rejected: { bg:"rgba(248,113,113,0.15)", color:"#f87171",  label:"❌ Rejected" },
};

const CATEGORY_ICONS = {
  plumber:"🔧", electrician:"⚡", painter:"🎨", cleaner:"🧹",
  carpenter:"🪚", welder:"🔩", mason:"🧱", driver:"🚗",
  gardener:"🌿", other:"💼",
};

export default function WorkerMyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("all");
  const [selected, setSelected]         = useState(null); // detail modal

  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/job/my-applications");
      setApplications(res.data.applications || []);
    } catch {
      toast.error("Failed to load applications.");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (jobId) => {
    if (!window.confirm("Withdraw this application?")) return;
    const tid = toast.loading("Withdrawing...");
    try {
      await api.delete(`/api/job/${jobId}/withdraw`);
      toast.success("Application withdrawn.", { id: tid });
      fetchApplications();
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to withdraw.", { id: tid });
    }
  };

  const filtered = filter === "all"
    ? applications
    : applications.filter(a => a.myStatus === filter);

  const counts = {
    all:      applications.length,
    pending:  applications.filter(a => a.myStatus === "pending").length,
    accepted: applications.filter(a => a.myStatus === "accepted").length,
    rejected: applications.filter(a => a.myStatus === "rejected").length,
  };

  return (
    <>
      <style>{`
        .wma-page { font-family:'DM Sans',sans-serif; padding-bottom:24px; }
        .wma-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .wma-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:200;
          display:flex; align-items:center; justify-content:center; padding:16px; }
        .wma-modal { background:#0d0d1f; border:1px solid rgba(255,255,255,0.12);
          border-radius:20px; width:100%; max-width:520px;
          max-height:88vh; overflow-y:auto; padding:clamp(20px,4vw,28px); }
        .wma-app-card:hover { border-color:rgba(124,58,237,0.4) !important; }
        @media(max-width:1100px) { .wma-grid { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:640px)  { .wma-grid { grid-template-columns:1fr; } }
      `}</style>

      <div className="wma-page">

        {/* Header */}
        <div style={{ marginBottom:20 }}>
          <p style={s.title}>📋 My Applications</p>
          <p style={s.sub}>Track all jobs you've applied to</p>
        </div>

        {/* Stats Row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
          {[
            { label:"Total",    key:"all",      color:"#c4b5fd", icon:"📋" },
            { label:"Pending",  key:"pending",  color:"#fcd34d", icon:"⏳" },
            { label:"Accepted", key:"accepted", color:"#6ee7b7", icon:"✅" },
            { label:"Rejected", key:"rejected", color:"#f87171", icon:"❌" },
          ].map(m => (
            <div key={m.key} style={s.statCard}
              onClick={() => setFilter(m.key)}
              style={{
                ...s.statCard,
                cursor:"pointer",
                border:`1px solid ${filter === m.key ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"}`,
                background: filter === m.key ? "rgba(124,58,237,0.1)" : "rgba(255,255,255,0.04)",
              }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{m.label}</span>
                <span>{m.icon}</span>
              </div>
              <p style={{ fontSize:22, fontWeight:600, color:m.color, margin:"6px 0 0" }}>
                {loading ? "—" : counts[m.key]}
              </p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap" }}>
          {["all","pending","accepted","rejected"].map(f => (
            <button key={f} style={{
              padding:"6px 16px", borderRadius:20, fontSize:12, cursor:"pointer",
              fontFamily:"inherit", textTransform:"capitalize",
              background: filter === f ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.05)",
              border:`1px solid ${filter === f ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.08)"}`,
              color: filter === f ? "#c4b5fd" : "rgba(255,255,255,0.5)",
            }} onClick={() => setFilter(f)}>
              {f === "all" ? `All (${counts.all})` : `${STATUS_COLORS[f]?.label} (${counts[f]})`}
            </button>
          ))}
        </div>

        {/* Applications Grid */}
        {loading ? (
          <p style={s.loadText}>Loading applications...</p>
        ) : filtered.length === 0 ? (
          <div style={s.emptyCard}>
            <span style={{ fontSize:40 }}>📭</span>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, margin:"12px 0 16px" }}>
              {filter === "all" ? "You haven't applied to any jobs yet." : `No ${filter} applications.`}
            </p>
            {filter === "all" && (
              <button style={s.primaryBtn} onClick={() => navigate("/worker/find-jobs")}>
                Browse Jobs →
              </button>
            )}
          </div>
        ) : (
          <div className="wma-grid">
            {filtered.map(app => {
              const st = STATUS_COLORS[app.myStatus] || STATUS_COLORS.pending;
              return (
                <div key={app._id}
                  className="wma-app-card"
                  style={s.appCard}>

                  {/* Status Badge */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                    <span style={{ fontSize:20 }}>{CATEGORY_ICONS[app.category] || "💼"}</span>
                    <span style={{
                      padding:"3px 10px", borderRadius:20, fontSize:10, fontWeight:500,
                      background:st.bg, color:st.color,
                      border:`1px solid ${st.color}33`,
                    }}>
                      {st.label}
                    </span>
                  </div>

                  {/* Job Title */}
                  <p style={{ fontSize:13, fontWeight:600, color:"#fff", margin:"0 0 4px", lineHeight:1.3 }}>
                    {app.title?.length > 40 ? app.title.slice(0,40)+"..." : app.title}
                  </p>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"0 0 10px", textTransform:"capitalize" }}>
                    {app.category}
                  </p>

                  {/* Meta */}
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                    <span style={s.badge}>📍 {app.location?.city}</span>
                    <span style={s.badge}>💰 PKR {app.budget?.toLocaleString()}</span>
                    <span style={s.badge}>{app.paymentType}</span>
                  </div>

                  {/* Applied date */}
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:"0 0 12px" }}>
                    Applied: {new Date(app.appliedAt).toLocaleDateString("en-PK", { day:"numeric", month:"short", year:"numeric" })}
                  </p>

                  {/* Actions */}
                  <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:10, display:"flex", gap:8 }}>
                    <button style={s.viewBtn} onClick={() => setSelected(app)}>
                      View Details
                    </button>
                    {app.myStatus === "pending" && (
                      <button style={s.withdrawBtn} onClick={() => handleWithdraw(app._id)}>
                        Withdraw
                      </button>
                    )}
                    {app.myStatus === "accepted" && (
                      <span style={{ fontSize:11, color:"#6ee7b7", display:"flex", alignItems:"center", gap:4 }}>
                        🎉 Hired!
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="wma-overlay" onClick={e => e.target.className==="wma-overlay" && setSelected(null)}>
          <div className="wma-modal">

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <div>
                <p style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:600, color:"#fff", margin:0 }}>
                  {selected.title}
                </p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:"4px 0 0", textTransform:"capitalize" }}>
                  {CATEGORY_ICONS[selected.category]} {selected.category}
                </p>
              </div>
              <button style={s.closeBtn} onClick={() => setSelected(null)}>×</button>
            </div>

            {/* Status Banner */}
            {(() => {
              const st = STATUS_COLORS[selected.myStatus] || STATUS_COLORS.pending;
              return (
                <div style={{
                  padding:"12px 16px", borderRadius:12, marginBottom:16,
                  background:st.bg, border:`1px solid ${st.color}44`,
                  display:"flex", alignItems:"center", gap:10,
                }}>
                  <span style={{ fontSize:16 }}>{st.label.split(" ")[0]}</span>
                  <div>
                    <p style={{ fontSize:13, fontWeight:600, color:st.color, margin:0 }}>
                      Application {selected.myStatus?.charAt(0).toUpperCase() + selected.myStatus?.slice(1)}
                    </p>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>
                      Applied on {new Date(selected.appliedAt).toLocaleDateString("en-PK", { day:"numeric", month:"long", year:"numeric" })}
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* Job Details */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              {[
                { label:"Budget",   value:`PKR ${selected.budget?.toLocaleString()}`, color:"#6ee7b7" },
                { label:"Payment",  value:selected.paymentType, color:"#c4b5fd" },
                { label:"Location", value:selected.location?.city, color:"#7dd3fc" },
                { label:"Job Type", value:selected.jobType, color:"#fcd34d" },
              ].map(item => (
                <div key={item.label} style={s.detailBox}>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 4px" }}>{item.label}</p>
                  <p style={{ fontSize:13, fontWeight:600, color:item.color, margin:0, textTransform:"capitalize" }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {selected.description && (
              <div style={{ marginBottom:16 }}>
                <p style={s.sectionLabel}>Job Description</p>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", lineHeight:1.6, margin:0 }}>
                  {selected.description}
                </p>
              </div>
            )}

            {/* Cover Letter */}
            {selected.coverLetter && (
              <div style={{ marginBottom:16 }}>
                <p style={s.sectionLabel}>Your Cover Letter</p>
                <div style={{ padding:"12px 14px", background:"rgba(124,58,237,0.08)", border:"1px solid rgba(124,58,237,0.2)", borderRadius:10 }}>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", lineHeight:1.6, margin:0 }}>
                    {selected.coverLetter}
                  </p>
                </div>
              </div>
            )}

            {/* Skills Required */}
            {selected.skillsRequired?.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <p style={s.sectionLabel}>Skills Required</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {selected.skillsRequired.map(sk => (
                    <span key={sk} style={s.skillTag}>{sk}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button style={{ ...s.viewBtn, flex:1 }} onClick={() => setSelected(null)}>Close</button>
              {selected.myStatus === "pending" && (
                <button style={{ ...s.withdrawBtn, flex:1 }}
                  onClick={() => handleWithdraw(selected._id)}>
                  Withdraw Application
                </button>
              )}
              {selected.myStatus === "accepted" && (
                <div style={{ flex:1, padding:"8px 14px", borderRadius:9,
                  background:"rgba(110,231,183,0.15)", border:"1px solid rgba(110,231,183,0.3)",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  <span style={{ fontSize:12, color:"#6ee7b7", fontWeight:500 }}>🎉 You got hired!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const s = {
  title:      { fontFamily:"'Sora',sans-serif", fontSize:"clamp(16px,4vw,20px)", fontWeight:600, color:"#fff", margin:0 },
  sub:        { fontSize:12, color:"rgba(255,255,255,0.35)", margin:"4px 0 0" },
  statCard:   { borderRadius:12, padding:"clamp(10px,2vw,14px)", cursor:"pointer", transition:"all .2s" },
  appCard:    { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"clamp(14px,3vw,18px)", transition:"border-color .2s", display:"flex", flexDirection:"column" },
  badge:      { padding:"3px 9px", borderRadius:20, fontSize:10, background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.5)", border:"1px solid rgba(255,255,255,0.08)" },
  viewBtn:    { padding:"7px 14px", borderRadius:9, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", fontSize:12, cursor:"pointer", fontFamily:"inherit" },
  withdrawBtn:{ padding:"7px 14px", borderRadius:9, background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", color:"#f87171", fontSize:12, cursor:"pointer", fontFamily:"inherit" },
  primaryBtn: { padding:"9px 20px", borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#4f46e5)", border:"none", color:"#fff", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" },
  emptyCard:  { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:40, textAlign:"center" },
  loadText:   { color:"rgba(255,255,255,0.4)", fontSize:13, textAlign:"center", padding:40 },
  closeBtn:   { background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:22, padding:0, lineHeight:1 },
  detailBox:  { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"10px 12px" },
  sectionLabel:{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 8px", letterSpacing:0.5, fontWeight:500 },
  skillTag:   { padding:"3px 9px", borderRadius:20, fontSize:11, background:"rgba(124,58,237,0.15)", color:"#c4b5fd", border:"1px solid rgba(124,58,237,0.25)" },
};