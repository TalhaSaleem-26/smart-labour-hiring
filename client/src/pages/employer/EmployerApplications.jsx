/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams, useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

const STATUS_COLORS = {
  pending:  { bg:"rgba(252,211,77,0.15)",  color:"#fcd34d", border:"rgba(252,211,77,0.3)"  },
  accepted: { bg:"rgba(110,231,183,0.15)", color:"#6ee7b7", border:"rgba(110,231,183,0.3)" },
  rejected: { bg:"rgba(248,113,113,0.15)", color:"#f87171", border:"rgba(248,113,113,0.3)" },
};

export default function EmployerApplications() {
  const { jobId }   = useParams();
  const navigate    = useNavigate();
  const [job,       setJob]       = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [updating,  setUpdating]  = useState(null); // which app is being updated
  const [filter,    setFilter]    = useState("all");
  const [selected,  setSelected]  = useState(null); // detail modal

  useEffect(() => { fetchJob(); }, [jobId]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/job/single/${jobId}`);
      setJob(res.data.job);
    } catch {
      toast.error("Failed to load job applications.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (applicationId, status) => {
    setUpdating(applicationId);
    const tid = toast.loading(`${status === "accepted" ? "Accepting" : "Rejecting"}...`);
    try {
        await api.patch(`/api/job/applications/${jobId}/${applicationId}/status`, { status });

      toast.success(
        status === "accepted" ? "Application accepted! 🎉" : "Application rejected.",
        { id: tid }
      );
      fetchJob();
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.", { id: tid });
    } finally {
      setUpdating(null);
    }
  };

  const applications = job?.applications || [];
  const filtered = filter === "all"
    ? applications
    : applications.filter(a => a.status === filter);

  const counts = {
    all:      applications.length,
    pending:  applications.filter(a => a.status === "pending").length,
    accepted: applications.filter(a => a.status === "accepted").length,
    rejected: applications.filter(a => a.status === "rejected").length,
  };

  return (
    <>
      <style>{`
        .ea-page  { font-family:'DM Sans',sans-serif; padding-bottom:24px; }
        .ea-grid  { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
        .ea-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.78); z-index:200;
          display:flex; align-items:center; justify-content:center; padding:16px; }
        .ea-modal { background:#0d0d1f; border:1px solid rgba(255,255,255,0.12);
          border-radius:20px; width:100%; max-width:500px;
          max-height:88vh; overflow-y:auto; padding:clamp(20px,4vw,28px); }
        .ea-app-card:hover { border-color:rgba(124,58,237,0.35) !important; }
        @media(max-width:800px)  { .ea-grid { grid-template-columns:1fr; } }
      `}</style>

      <div className="ea-page">

        {/* Back + Header */}
        <div style={{ marginBottom:20 }}>
          <button style={s.backBtn} onClick={() => navigate("/employer/jobs")}>
            ← Back to My Jobs
          </button>

          {loading ? (
            <p style={{ color:"rgba(255,255,255,0.4)", marginTop:12 }}>Loading...</p>
          ) : job ? (
            <div style={{ marginTop:14 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}>
                <p style={s.title}>{job.title}</p>
                <span style={{
                  padding:"3px 12px", borderRadius:20, fontSize:11, fontWeight:500,
                  background:"rgba(110,231,183,0.15)", color:"#6ee7b7",
                  border:"1px solid rgba(110,231,183,0.3)", textTransform:"capitalize",
                }}>
                  {job.status}
                </span>
              </div>
              <p style={s.sub}>
                📍 {job.location?.city} · 💰 PKR {job.budget?.toLocaleString()}/{job.paymentType}
                · 👥 {applications.length} application{applications.length !== 1 ? "s" : ""}
              </p>
            </div>
          ) : null}
        </div>

        {/* Stats Row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:18 }}>
          {[
            { key:"all",      label:"Total",    icon:"📋", color:"#c4b5fd" },
            { key:"pending",  label:"Pending",  icon:"⏳", color:"#fcd34d" },
            { key:"accepted", label:"Accepted", icon:"✅", color:"#6ee7b7" },
            { key:"rejected", label:"Rejected", icon:"❌", color:"#f87171" },
          ].map(m => (
            <div key={m.key}
              onClick={() => setFilter(m.key)}
              style={{
                borderRadius:12, padding:"12px 14px", cursor:"pointer", transition:"all .2s",
                background: filter === m.key ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.04)",
                border:`1px solid ${filter === m.key ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"}`,
              }}>
              <div style={{ display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:10, color:"rgba(255,255,255,0.4)" }}>{m.label}</span>
                <span style={{ fontSize:14 }}>{m.icon}</span>
              </div>
              <p style={{ fontSize:22, fontWeight:600, color:m.color, margin:"6px 0 0" }}>
                {loading ? "—" : counts[m.key]}
              </p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
          {["all","pending","accepted","rejected"].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding:"6px 16px", borderRadius:20, fontSize:12,
              cursor:"pointer", fontFamily:"inherit", textTransform:"capitalize",
              background: filter === f ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.05)",
              border:`1px solid ${filter === f ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.08)"}`,
              color: filter === f ? "#c4b5fd" : "rgba(255,255,255,0.5)",
            }}>
              {f === "all" ? `All (${counts.all})` : `${f.charAt(0).toUpperCase()+f.slice(1)} (${counts[f]})`}
            </button>
          ))}
        </div>

        {/* Applications Grid */}
        {loading ? (
          <p style={s.loadText}>Loading applications...</p>
        ) : filtered.length === 0 ? (
          <div style={s.emptyCard}>
            <span style={{ fontSize:40 }}>📭</span>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, margin:"12px 0 0" }}>
              {filter === "all"
                ? "No applications received yet."
                : `No ${filter} applications.`}
            </p>
          </div>
        ) : (
          <div className="ea-grid">
            {filtered.map(app => {
              const st = STATUS_COLORS[app.status] || STATUS_COLORS.pending;
              return (
                <div key={app._id}
                  className="ea-app-card"
                  style={s.appCard}>

                  {/* Top Row */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      {/* Worker Avatar */}
                      <div style={s.avatar}>
                        {app.worker?.user?.name?.charAt(0)?.toUpperCase() || "W"}
                      </div>
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:"#fff", margin:0 }}>
                          {app.worker?.user?.name || "Worker"}
                        </p>
                        <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0", textTransform:"capitalize" }}>
                          {app.worker?.category || "—"}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      padding:"3px 10px", borderRadius:20, fontSize:10, fontWeight:500,
                      background:st.bg, color:st.color,
                      border:`1px solid ${st.border}`,
                      textTransform:"capitalize", flexShrink:0,
                    }}>
                      {app.status}
                    </span>
                  </div>

                  {/* Worker Stats */}
                  <div style={{ display:"flex", gap:12, marginBottom:10 }}>
                    <div>
                      <p style={{ fontSize:9, color:"rgba(255,255,255,0.35)", margin:"0 0 2px" }}>RATE</p>
                      <p style={{ fontSize:12, fontWeight:600, color:"#6ee7b7", margin:0 }}>
                        PKR {app.worker?.hourlyRate || "—"}/hr
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize:9, color:"rgba(255,255,255,0.35)", margin:"0 0 2px" }}>EXP</p>
                      <p style={{ fontSize:12, fontWeight:600, color:"#7dd3fc", margin:0 }}>
                        {app.worker?.experience ?? "—"} yrs
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize:9, color:"rgba(255,255,255,0.35)", margin:"0 0 2px" }}>RATING</p>
                      <p style={{ fontSize:12, fontWeight:600, color:"#fcd34d", margin:0 }}>
                        ⭐ {app.worker?.rating || "New"}
                      </p>
                    </div>
                    {app.worker?.location?.city && (
                      <div>
                        <p style={{ fontSize:9, color:"rgba(255,255,255,0.35)", margin:"0 0 2px" }}>CITY</p>
                        <p style={{ fontSize:12, color:"rgba(255,255,255,0.6)", margin:0 }}>
                          {app.worker.location.city}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Cover Letter Preview */}
                  {app.coverLetter && (
                    <div style={s.coverPreview}>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.45)", margin:0, lineHeight:1.5 }}>
                        "{app.coverLetter.length > 80
                          ? app.coverLetter.slice(0,80) + "..."
                          : app.coverLetter}"
                      </p>
                    </div>
                  )}

                  {/* Applied Date */}
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.25)", margin:"8px 0 12px" }}>
                    Applied: {new Date(app.appliedAt).toLocaleDateString("en-PK", {
                      day:"numeric", month:"short", year:"numeric"
                    })}
                  </p>

                  {/* Actions */}
                  <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:10, display:"flex", gap:8 }}>
                    <button style={s.detailBtn} onClick={() => setSelected(app)}>
                      View Details
                    </button>
                    {app.status === "pending" && (
                      <>
                        <button
                          style={{ ...s.acceptBtn, opacity: updating === app._id ? 0.6 : 1 }}
                          disabled={updating === app._id}
                          onClick={() => handleStatus(app._id, "accepted")}>
                          ✅ Accept
                        </button>
                        <button
                          style={{ ...s.rejectBtn, opacity: updating === app._id ? 0.6 : 1 }}
                          disabled={updating === app._id}
                          onClick={() => handleStatus(app._id, "rejected")}>
                          ✕
                        </button>
                      </>
                    )}
                    {app.status === "accepted" && (
                      <span style={{ fontSize:12, color:"#6ee7b7", display:"flex", alignItems:"center", gap:4 }}>
                        🎉 Accepted
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
        <div className="ea-overlay"
          onClick={e => e.target.className === "ea-overlay" && setSelected(null)}>
          <div className="ea-modal">

            {/* Modal Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ ...s.avatar, width:50, height:50, fontSize:20, borderRadius:14 }}>
                  {selected.worker?.user?.name?.charAt(0)?.toUpperCase() || "W"}
                </div>
                <div>
                  <p style={{ fontFamily:"'Sora',sans-serif", fontSize:15, fontWeight:600, color:"#fff", margin:0 }}>
                    {selected.worker?.user?.name || "Worker"}
                  </p>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"3px 0 0", textTransform:"capitalize" }}>
                    {selected.worker?.category} · {selected.worker?.location?.city}
                  </p>
                </div>
              </div>
              <button style={s.closeBtn} onClick={() => setSelected(null)}>×</button>
            </div>

            {/* Status Banner */}
            {(() => {
              const st = STATUS_COLORS[selected.status] || STATUS_COLORS.pending;
              return (
                <div style={{
                  padding:"10px 14px", borderRadius:10, marginBottom:16,
                  background:st.bg, border:`1px solid ${st.border}`,
                }}>
                  <p style={{ fontSize:12, fontWeight:500, color:st.color, margin:0, textTransform:"capitalize" }}>
                    Application Status: {selected.status}
                  </p>
                </div>
              );
            })()}

            {/* Worker Stats */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:16 }}>
              {[
                { label:"Hourly Rate", value:`PKR ${selected.worker?.hourlyRate}/hr`, color:"#6ee7b7" },
                { label:"Experience",  value:`${selected.worker?.experience} yrs`,    color:"#7dd3fc" },
                { label:"Rating",      value:selected.worker?.rating ? `⭐ ${selected.worker.rating}` : "New", color:"#fcd34d" },
              ].map(item => (
                <div key={item.label} style={s.statBox}>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 4px" }}>{item.label}</p>
                  <p style={{ fontSize:13, fontWeight:600, color:item.color, margin:0 }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Bio */}
            {selected.worker?.bio && (
              <div style={{ marginBottom:14 }}>
                <p style={s.secLabel}>About Worker</p>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", lineHeight:1.6, margin:0 }}>
                  {selected.worker.bio}
                </p>
              </div>
            )}

            {/* Skills */}
            {selected.worker?.skills?.length > 0 && (
              <div style={{ marginBottom:14 }}>
                <p style={s.secLabel}>Skills</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {selected.worker.skills.map(sk => (
                    <span key={sk} style={s.skillTag}>{sk}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Cover Letter */}
            {selected.coverLetter && (
              <div style={{ marginBottom:14 }}>
                <p style={s.secLabel}>Cover Letter</p>
                <div style={{ padding:"12px 14px", background:"rgba(124,58,237,0.08)", border:"1px solid rgba(124,58,237,0.2)", borderRadius:10 }}>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.65)", lineHeight:1.6, margin:0 }}>
                    {selected.coverLetter}
                  </p>
                </div>
              </div>
            )}

            {/* Contact */}
            <div style={{ marginBottom:18 }}>
              <p style={s.secLabel}>Contact</p>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {selected.worker?.user?.email && (
                  <div style={{ display:"flex", gap:8 }}>
                    <span>📧</span>
                    <span style={{ fontSize:13, color:"rgba(255,255,255,0.6)" }}>
                      {selected.worker.user.email}
                    </span>
                  </div>
                )}
                {selected.worker?.user?.phone && (
                  <div style={{ display:"flex", gap:8 }}>
                    <span>📞</span>
                    <span style={{ fontSize:13, color:"rgba(255,255,255,0.6)" }}>
                      {selected.worker.user.phone}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display:"flex", gap:10 }}>
              <button style={{ ...s.detailBtn, flex:1 }} onClick={() => setSelected(null)}>
                Close
              </button>
              {selected.status === "pending" && (
                <>
                  <button
                    style={{ ...s.acceptBtn, flex:2, padding:"10px", opacity: updating === selected._id ? 0.6 : 1 }}
                    disabled={updating === selected._id}
                    onClick={() => handleStatus(selected._id, "accepted")}>
                    ✅ Accept Application
                  </button>
                  <button
                    style={{ ...s.rejectBtn, flex:1, padding:"10px", opacity: updating === selected._id ? 0.6 : 1 }}
                    disabled={updating === selected._id}
                    onClick={() => handleStatus(selected._id, "rejected")}>
                    ✕ Reject
                  </button>
                </>
              )}
              {selected.status === "accepted" && (
                <div style={{
                  flex:2, padding:"10px", borderRadius:9, textAlign:"center",
                  background:"rgba(110,231,183,0.1)", border:"1px solid rgba(110,231,183,0.3)",
                }}>
                  <span style={{ fontSize:13, color:"#6ee7b7", fontWeight:500 }}>🎉 Already Accepted</span>
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
  title:       { fontFamily:"'Sora',sans-serif", fontSize:"clamp(15px,4vw,19px)", fontWeight:600, color:"#fff", margin:0 },
  sub:         { fontSize:12, color:"rgba(255,255,255,0.35)", margin:"5px 0 0" },
  backBtn:     { padding:"7px 14px", borderRadius:9, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", fontSize:12, cursor:"pointer", fontFamily:"inherit" },
  appCard:     { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"clamp(14px,3vw,18px)", transition:"border-color .2s" },
  avatar:      { width:42, height:42, borderRadius:12, background:"rgba(110,231,183,0.2)", border:"1px solid rgba(110,231,183,0.3)", color:"#6ee7b7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:600, flexShrink:0 },
  coverPreview:{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:8, padding:"8px 12px", borderLeft:"2px solid rgba(124,58,237,0.4)" },
  detailBtn:   { padding:"7px 14px", borderRadius:9, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", fontSize:12, cursor:"pointer", fontFamily:"inherit" },
  acceptBtn:   { padding:"7px 14px", borderRadius:9, background:"rgba(110,231,183,0.15)", border:"1px solid rgba(110,231,183,0.4)", color:"#6ee7b7", fontSize:12, cursor:"pointer", fontFamily:"inherit", fontWeight:500 },
  rejectBtn:   { padding:"7px 12px", borderRadius:9, background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", color:"#f87171", fontSize:12, cursor:"pointer", fontFamily:"inherit" },
  statBox:     { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"10px 12px" },
  skillTag:    { padding:"3px 9px", borderRadius:20, fontSize:11, background:"rgba(124,58,237,0.15)", color:"#c4b5fd", border:"1px solid rgba(124,58,237,0.25)" },
  secLabel:    { fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 8px", letterSpacing:0.5, fontWeight:500 },
  closeBtn:    { background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:22, padding:0, lineHeight:1 },
  emptyCard:   { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:40, textAlign:"center" },
  loadText:    { color:"rgba(255,255,255,0.4)", fontSize:13, textAlign:"center", padding:40 },
};