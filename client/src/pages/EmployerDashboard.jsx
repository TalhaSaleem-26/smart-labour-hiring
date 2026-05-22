/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

const STATUS_COLORS = {
  open:   { bg:"rgba(110,231,183,0.15)", color:"#6ee7b7" },
  closed: { bg:"rgba(248,113,113,0.15)", color:"#f87171" },
  hired:  { bg:"rgba(196,181,253,0.15)", color:"#c4b5fd" },
};

const CATEGORY_ICONS = {
  plumber:"🔧", electrician:"⚡", painter:"🎨", cleaner:"🧹",
  carpenter:"🪚", welder:"🔩", mason:"🧱", driver:"🚗",
  gardener:"🌿", other:"💼",
};

export default function EmployerDashboard() {
  const { user }   = useSelector(s => s.auth);
  const navigate   = useNavigate();
  const [stats,    setStats]   = useState(null);
  const [jobs,     setJobs]    = useState([]);
  const [loading,  setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/api/job/my-jobs", { params: { limit: 4 } });
      setJobs(res.data.jobs || []);

      // Calculate stats from jobs
      const all = res.data.jobs || [];
      setStats({
        total:        res.data.total || 0,
        open:         all.filter(j => j.status === "open").length,
        hired:        all.filter(j => j.status === "hired").length,
        applications: all.reduce((acc, j) => acc + (j.applications?.length || 0), 0),
        views:        all.reduce((acc, j) => acc + (j.views || 0), 0),
      });
    } catch {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const METRICS = [
    { label:"Total Jobs",     value: stats?.total        || 0, color:"#c4b5fd", icon:"💼", sub:"All posted jobs" },
    { label:"Open Jobs",      value: stats?.open         || 0, color:"#6ee7b7", icon:"✅", sub:"Accepting applications" },
    { label:"Applications",   value: stats?.applications || 0, color:"#7dd3fc", icon:"👥", sub:"Total received" },
    { label:"Hired Workers",  value: stats?.hired        || 0, color:"#fcd34d", icon:"🤝", sub:"Successfully hired" },
  ];

  return (
    <>
      <style>{`
        .ed-wrap { font-family:'DM Sans',sans-serif; padding-bottom:24px; }
        .ed-metrics { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:16px; }
        .ed-bottom  { display:grid; grid-template-columns:2fr 1fr; gap:16px; }
        .ed-jobs-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        @media(max-width:1200px) { .ed-metrics { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:1024px) { .ed-bottom { grid-template-columns:1fr; } }
        @media(max-width:640px)  {
          .ed-metrics   { grid-template-columns:1fr 1fr; }
          .ed-jobs-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="ed-wrap">

        {/* ── Welcome Header ── */}
        <div style={s.header}>
          <div style={s.headerLeft}>
            <div style={s.avatarLg}>
              {user?.name?.charAt(0)?.toUpperCase() || "E"}
            </div>
            <div>
              <p style={s.greet}>{greet()}, <strong>{user?.name?.split(" ")[0]}</strong> 👋</p>
              <p style={s.greetSub}>Manage your job postings and find the right workers</p>
            </div>
          </div>
          <button style={s.postBtn} onClick={() => navigate("/employer/post-job")}>
            + Post New Job
          </button>
        </div>

        {/* ── Metrics ── */}
        <div className="ed-metrics">
          {METRICS.map(m => (
            <div key={m.label} style={s.metricCard}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <p style={s.metricLabel}>{m.label}</p>
                <span style={{ fontSize:20 }}>{m.icon}</span>
              </div>
              <p style={{ fontSize:"clamp(22px,3vw,28px)", fontWeight:600, color:m.color, margin:"4px 0 6px" }}>
                {loading ? "—" : m.value}
              </p>
              <p style={s.metricSub}>{m.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Bottom Section ── */}
        <div className="ed-bottom">

          {/* Recent Jobs */}
          <div style={s.card}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:8 }}>
              <p style={s.cardTitle}>📋 Recent Jobs</p>
              <button style={s.viewAllBtn} onClick={() => navigate("/employer/jobs")}>
                View All →
              </button>
            </div>

            {loading ? (
              <p style={s.loadText}>Loading...</p>
            ) : jobs.length === 0 ? (
              <div style={s.emptyBox}>
                <span style={{ fontSize:36 }}>📭</span>
                <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, margin:"10px 0 16px" }}>
                  No jobs posted yet. Post your first job!
                </p>
                <button style={s.postBtn} onClick={() => navigate("/employer/post-job")}>
                  Post First Job →
                </button>
              </div>
            ) : (
              <div className="ed-jobs-grid">
                {jobs.map(job => (
                  <div key={job._id} style={s.jobCard}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, marginBottom:8 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:20 }}>{CATEGORY_ICONS[job.category] || "💼"}</span>
                        <p style={{ fontSize:13, fontWeight:600, color:"#fff", margin:0, lineHeight:1.3 }}>
                          {job.title.length > 30 ? job.title.slice(0,30) + "..." : job.title}
                        </p>
                      </div>
                      <span style={{
                        ...s.statusBadge,
                        background: STATUS_COLORS[job.status]?.bg,
                        color:      STATUS_COLORS[job.status]?.color,
                      }}>
                        {job.status}
                      </span>
                    </div>

                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                      <span style={s.metaBadge}>📍 {job.location?.city}</span>
                      <span style={s.metaBadge}>💰 PKR {job.budget?.toLocaleString()}</span>
                    </div>

                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", margin:0 }}>
                        👥 {job.applications?.length || 0} applicants · 👁 {job.views || 0} views
                      </p>
                      <button style={s.viewBtn}
                        onClick={() => navigate(`/employer/applications/${job._id}`)}>
                        View
                      </button>
                    </div>
                  </div>
                ))}
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
                  { icon:"📝", label:"Post New Job",    path:"/employer/post-job",  color:"#c4b5fd" },
                  { icon:"📋", label:"My Jobs",         path:"/employer/jobs",      color:"#7dd3fc" },
                  { icon:"👷", label:"Browse Workers",  path:"/employer/workers",   color:"#6ee7b7" },
                  { icon:"⚙️", label:"Settings",        path:"/employer/settings",  color:"rgba(255,255,255,0.5)" },
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

            {/* Tips */}
            <div style={s.tipsCard}>
              <p style={s.cardTitle}>💡 Tips</p>
              <div style={{ display:"flex", flexDirection:"column", gap:10, marginTop:12 }}>
                {[
                  "Add detailed descriptions to attract better applicants",
                  "Set a competitive budget for faster responses",
                  "Specify required skills to filter the right workers",
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

            {/* Stats Summary */}
            <div style={s.card}>
              <p style={s.cardTitle}>📊 Summary</p>
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginTop:12 }}>
                {[
                  { label:"Total Views",   value: loading ? "—" : (stats?.views || 0),       color:"#7dd3fc" },
                  { label:"Total Applied", value: loading ? "—" : (stats?.applications || 0), color:"#c4b5fd" },
                  { label:"Hired",         value: loading ? "—" : (stats?.hired || 0),        color:"#6ee7b7" },
                ].map(item => (
                  <div key={item.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.45)" }}>{item.label}</span>
                    <span style={{ fontSize:14, fontWeight:600, color:item.color }}>{item.value}</span>
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
  avatarLg:    { width:52, height:52, borderRadius:14, background:"rgba(110,231,183,0.2)", border:"1px solid rgba(110,231,183,0.3)", color:"#6ee7b7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:600, flexShrink:0 },
  greet:       { fontFamily:"'Sora',sans-serif", fontSize:"clamp(15px,3vw,18px)", fontWeight:600, color:"#fff", margin:0 },
  greetSub:    { fontSize:"clamp(10px,2.5vw,12px)", color:"rgba(255,255,255,0.4)", margin:"4px 0 0" },
  postBtn:     { padding:"9px 20px", borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#4f46e5)", border:"none", color:"#fff", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap", flexShrink:0 },
  metricCard:  { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"clamp(12px,3vw,16px)" },
  metricLabel: { fontSize:11, color:"rgba(255,255,255,0.45)", margin:0 },
  metricSub:   { fontSize:10, color:"rgba(255,255,255,0.3)", margin:0 },
  card:        { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"clamp(14px,3vw,20px)" },
  cardTitle:   { fontSize:14, fontWeight:500, color:"#fff", margin:0 },
  viewAllBtn:  { padding:"5px 14px", borderRadius:8, background:"rgba(124,58,237,0.2)", border:"1px solid rgba(124,58,237,0.3)", color:"#c4b5fd", fontSize:11, cursor:"pointer", fontFamily:"inherit" },
  jobCard:     { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"14px 16px" },
  statusBadge: { padding:"3px 9px", borderRadius:20, fontSize:10, fontWeight:500, textTransform:"capitalize", flexShrink:0, border:"1px solid transparent" },
  metaBadge:   { padding:"3px 9px", borderRadius:20, fontSize:11, background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.55)", border:"1px solid rgba(255,255,255,0.08)" },
  viewBtn:     { padding:"5px 12px", borderRadius:8, background:"rgba(124,58,237,0.2)", border:"1px solid rgba(124,58,237,0.3)", color:"#c4b5fd", fontSize:11, cursor:"pointer", fontFamily:"inherit" },
  emptyBox:    { textAlign:"center", padding:"24px 0" },
  loadText:    { color:"rgba(255,255,255,0.4)", fontSize:13 },
  actionBtn:   { display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", cursor:"pointer", fontFamily:"inherit", width:"100%" },
  tipsCard:    { background:"rgba(124,58,237,0.06)", border:"1px solid rgba(124,58,237,0.15)", borderRadius:16, padding:"clamp(14px,3vw,18px)" },
};