/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/exhaustive-deps */
// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

const STATUS_COLORS = {
  open:   { bg:"rgba(110,231,183,0.15)", color:"#6ee7b7", border:"rgba(110,231,183,0.3)" },
  closed: { bg:"rgba(248,113,113,0.15)", color:"#f87171", border:"rgba(248,113,113,0.3)" },
  hired:  { bg:"rgba(124,58,237,0.15)",  color:"#c4b5fd", border:"rgba(124,58,237,0.3)" },
};

const CATEGORY_ICONS = {
  plumber:"🔧", electrician:"⚡", painter:"🎨", cleaner:"🧹",
  carpenter:"🪚", welder:"🔩", mason:"🧱", driver:"🚗",
  gardener:"🌿", other:"💼",
};

export default function EmployerJobs() {
  const navigate        = useNavigate();
  const [jobs,   setJobs]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter] = useState("all");
  const [total,   setTotal]  = useState(0);

  useEffect(() => { fetchJobs(); }, [filter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const res    = await api.get("/api/job/my-jobs", { params });
      setJobs(res.data.jobs);
      setTotal(res.data.total);
    } catch {
      toast.error("Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    const tid = toast.loading("Deleting...");
    try {
      await api.delete(`/api/job/delete/${id}`);
      toast.success("Job deleted.", { id: tid });
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.", { id: tid });
    }
  };

  const handleStatusChange = async (id, status) => {
    const tid = toast.loading("Updating...");
    try {
      await api.put(`/api/job/update/${id}`, { status });
      toast.success("Status updated.", { id: tid });
      fetchJobs();
    } catch {
      toast.error("Failed.", { id: tid });
    }
  };

  return (
    <>
      <style>{`
        .ej-wrap  { font-family:'DM Sans',sans-serif; padding-bottom:24px; }
        .ej-filters { display:flex; gap:8px; flex-wrap:wrap; }
        .ej-grid  { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
        .ej-card-actions { display:flex; gap:8px; flex-wrap:wrap; }
        @media(max-width:900px) { .ej-grid { grid-template-columns:1fr; } }
        @media(max-width:480px) { .ej-filters { gap:6px; } }
      `}</style>

      <div className="ej-wrap">

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:12 }}>
          <div>
            <p style={s.title}>💼 My Jobs</p>
            <p style={s.sub}>{total} job{total !== 1 ? "s" : ""} posted</p>
          </div>
          <button style={s.postBtn} onClick={() => navigate("/employer/post-job")}>
            + Post New Job
          </button>
        </div>

        {/* Filter Tabs */}
        <div style={s.card}>
          <div className="ej-filters">
            {["all","open","closed","hired"].map(f => (
              <button key={f} style={{
                ...s.filterBtn,
                background: filter===f ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "rgba(255,255,255,0.05)",
                color: filter===f ? "#fff" : "rgba(255,255,255,0.5)",
                border: filter===f ? "none" : "1px solid rgba(255,255,255,0.1)",
              }} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Jobs Grid */}
        {loading ? (
          <p style={s.loadText}>Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <div style={s.emptyCard}>
            <span style={{ fontSize:40 }}>📋</span>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, margin:"12px 0 16px" }}>
              No jobs found. Post your first job!
            </p>
            <button style={s.postBtn} onClick={() => navigate("/employer/post-job")}>
              + Post Job
            </button>
          </div>
        ) : (
          <div className="ej-grid">
            {jobs.map(job => (
              <div key={job._id} style={s.jobCard}>

                {/* Card Header */}
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={s.catIcon}>
                      {CATEGORY_ICONS[job.category] || "💼"}
                    </div>
                    <div>
                      <p style={s.jobTitle}>{job.title}</p>
                      <p style={s.jobCat}>{job.category}</p>
                    </div>
                  </div>
                  <span style={{
                    ...s.statusBadge,
                    background: STATUS_COLORS[job.status]?.bg,
                    color:      STATUS_COLORS[job.status]?.color,
                    border:     `1px solid ${STATUS_COLORS[job.status]?.border}`,
                  }}>
                    {job.status}
                  </span>
                </div>

                {/* Description */}
                <p style={s.jobDesc}>
                  {job.description.length > 100
                    ? job.description.slice(0,100) + "..."
                    : job.description}
                </p>

                {/* Meta */}
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, margin:"12px 0" }}>
                  <span style={s.metaBadge}>📍 {job.location?.city}</span>
                  <span style={s.metaBadge}>💰 PKR {job.budget?.toLocaleString()}/{job.paymentType}</span>
                  <span style={s.metaBadge}>👥 {job.applications?.length || 0} applicants</span>
                  <span style={s.metaBadge}>👁 {job.views || 0} views</span>
                </div>

                {/* Skills */}
                {job.skillsRequired?.length > 0 && (
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
                    {job.skillsRequired.slice(0,3).map(sk => (
                      <span key={sk} style={s.skillTag}>{sk}</span>
                    ))}
                    {job.skillsRequired.length > 3 && (
                      <span style={s.skillTag}>+{job.skillsRequired.length - 3}</span>
                    )}
                  </div>
                )}

                <p style={{ fontSize:10, color:"rgba(255,255,255,0.25)", margin:"0 0 14px" }}>
                  Posted: {new Date(job.createdAt).toLocaleDateString()}
                  {job.deadline && ` · Deadline: ${new Date(job.deadline).toLocaleDateString()}`}
                </p>

                {/* Actions */}
                <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:12 }}>
                  <div className="ej-card-actions">
                    <button style={s.viewBtn}
                      onClick={() => navigate(`/employer/applications/${job._id}`)}>
                      👥 Applications ({job.applications?.length || 0})
                    </button>

                    {job.status === "open" && (
                      <button style={s.closeBtn}
                        onClick={() => handleStatusChange(job._id, "closed")}>
                        Close
                      </button>
                    )}
                    {job.status === "closed" && (
                      <button style={s.openBtn}
                        onClick={() => handleStatusChange(job._id, "open")}>
                        Reopen
                      </button>
                    )}
                    <button style={s.deleteBtn}
                      onClick={() => handleDelete(job._id, job.title)}>
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const s = {
  title:      { fontFamily:"'Sora',sans-serif", fontSize:"clamp(16px,4vw,20px)", fontWeight:600, color:"#fff", margin:0 },
  sub:        { fontSize:12, color:"rgba(255,255,255,0.35)", margin:"4px 0 0" },
  card:       { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"12px 16px", marginBottom:14 },
  postBtn:    { padding:"9px 20px", borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#4f46e5)", border:"none", color:"#fff", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" },
  filterBtn:  { padding:"7px 16px", borderRadius:8, fontSize:12, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" },
  jobCard:    { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"clamp(14px,3vw,20px)", transition:"border .2s" },
  catIcon:    { width:40, height:40, borderRadius:12, background:"rgba(124,58,237,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0 },
  jobTitle:   { fontSize:14, fontWeight:600, color:"#fff", margin:0, lineHeight:1.3 },
  jobCat:     { fontSize:11, color:"rgba(255,255,255,0.4)", margin:"3px 0 0", textTransform:"capitalize" },
  jobDesc:    { fontSize:12, color:"rgba(255,255,255,0.5)", lineHeight:1.6, margin:0 },
  statusBadge:{ padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:500, textTransform:"capitalize", flexShrink:0 },
  metaBadge:  { padding:"3px 10px", borderRadius:20, fontSize:11, background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.55)", border:"1px solid rgba(255,255,255,0.08)" },
  skillTag:   { padding:"2px 8px", borderRadius:20, fontSize:10, background:"rgba(124,58,237,0.15)", color:"#c4b5fd", border:"1px solid rgba(124,58,237,0.3)" },
  viewBtn:    { flex:1, padding:"7px 12px", borderRadius:8, background:"rgba(124,58,237,0.2)", border:"1px solid rgba(124,58,237,0.3)", color:"#c4b5fd", fontSize:11, cursor:"pointer", fontFamily:"inherit" },
  closeBtn:   { padding:"7px 12px", borderRadius:8, background:"rgba(248,113,113,0.1)", border:"1px solid rgba(248,113,113,0.3)", color:"#f87171", fontSize:11, cursor:"pointer", fontFamily:"inherit" },
  openBtn:    { padding:"7px 12px", borderRadius:8, background:"rgba(110,231,183,0.1)", border:"1px solid rgba(110,231,183,0.3)", color:"#6ee7b7", fontSize:11, cursor:"pointer", fontFamily:"inherit" },
  deleteBtn:  { padding:"7px 12px", borderRadius:8, background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", color:"#f87171", fontSize:12, cursor:"pointer", fontFamily:"inherit" },
  emptyCard:  { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:40, textAlign:"center" },
  loadText:   { color:"rgba(255,255,255,0.4)", fontSize:13, textAlign:"center", padding:40 },
};