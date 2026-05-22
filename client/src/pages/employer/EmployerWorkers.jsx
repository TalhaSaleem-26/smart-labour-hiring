/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

const CATEGORIES = [
  { value:"",            label:"All Categories" },
  { value:"plumber",     label:"🔧 Plumber" },
  { value:"electrician", label:"⚡ Electrician" },
  { value:"painter",     label:"🎨 Painter" },
  { value:"cleaner",     label:"🧹 Cleaner" },
  { value:"carpenter",   label:"🪚 Carpenter" },
  { value:"welder",      label:"🔩 Welder" },
  { value:"mason",       label:"🧱 Mason" },
  { value:"driver",      label:"🚗 Driver" },
  { value:"gardener",    label:"🌿 Gardener" },
  { value:"other",       label:"💼 Other" },
];

const CITIES = [
  "Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad",
  "Multan","Peshawar","Quetta","Sialkot","Gujranwala",
];

const CATEGORY_ICONS = {
  plumber:"🔧", electrician:"⚡", painter:"🎨", cleaner:"🧹",
  carpenter:"🪚", welder:"🔩", mason:"🧱", driver:"🚗",
  gardener:"🌿", other:"💼",
};

const DAYS_SHORT = {
  monday:"Mon", tuesday:"Tue", wednesday:"Wed",
  thursday:"Thu", friday:"Fri", saturday:"Sat", sunday:"Sun",
};

export default function EmployerWorkers() {
  const [workers,  setWorkers]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [total,    setTotal]    = useState(0);
  const [selected, setSelected] = useState(null); // profile modal
  const [hiring,   setHiring]   = useState(null); // hire modal
  const [myJobs,   setMyJobs]   = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [hiringLoading, setHiringLoading] = useState(false);

  const [filters, setFilters] = useState({
    search:   "",
    category: "",
    city:     "",
    minRate:  "",
    maxRate:  "",
    experience: "",
  });

  // eslint-disable-next-line react-hooks/immutability
  useEffect(() => { fetchWorkers(); }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await api.get("/api/worker/all", { params });
      setWorkers(res.data.workers || []);
      setTotal(res.data.count || 0);
    } catch {
      toast.error("Failed to load workers.");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyJobs = async () => {
    try {
      const res = await api.get("/api/job/my-jobs", { params: { status:"open", limit:20 } });
      setMyJobs(res.data.jobs || []);
    } catch {
      toast.error("Failed to load your jobs.");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchWorkers();
  };

  const updateFilter = (key, val) =>
    setFilters(p => ({ ...p, [key]: val }));

  const openProfile = (worker) => setSelected(worker);
  const closeProfile = () => setSelected(null);

  const openHire = async (worker) => {
    setHiring(worker);
    setSelectedJob("");
    await fetchMyJobs();
  };
  const closeHire = () => { setHiring(null); setSelectedJob(""); };

  const handleHire = async () => {
    if (!selectedJob) return toast.error("Please select a job first.");
    setHiringLoading(true);
    const tid = toast.loading("Sending hire request...");
    try {
      // Update job status to hired and set hiredWorker
      await api.put(`/api/job/update/${selectedJob}`, {
        status:      "hired",
        hiredWorker: hiring._id,
      });
      toast.success(`${hiring.user?.name} hired successfully! 🎉`, { id: tid });
      closeHire();
      fetchWorkers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to hire.", { id: tid });
    } finally {
      setHiringLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({ search:"", category:"", city:"", minRate:"", maxRate:"", experience:"" });
    setTimeout(fetchWorkers, 100);
  };

  return (
    <>
      <style>{`
        .ew-page   { font-family:'DM Sans',sans-serif; padding-bottom:24px; }
        .ew-layout { display:grid; grid-template-columns:240px 1fr; gap:16px; align-items:start; }
        .ew-sidebar { position:sticky; top:80px; display:flex; flex-direction:column; gap:10px; }
        .ew-grid   { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }

        /* Profile Modal */
        .ew-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.75); z-index:200;
          display:flex; align-items:center; justify-content:center; padding:16px; }
        .ew-modal  { background:#0d0d1f; border:1px solid rgba(255,255,255,0.12);
          border-radius:20px; width:100%; max-width:520px;
          max-height:88vh; overflow-y:auto; padding:clamp(20px,4vw,28px); }

        .ew-worker-card:hover { border-color:rgba(124,58,237,0.4) !important; }

        select option { background:#1a1a35; color:#fff; }

        @media(max-width:1100px) { .ew-grid { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:900px)  {
          .ew-layout  { grid-template-columns:1fr; }
          .ew-sidebar { position:static; flex-direction:row; flex-wrap:wrap; }
          .ew-sidebar > * { flex:1; min-width:200px; }
        }
        @media(max-width:640px)  {
          .ew-grid { grid-template-columns:1fr; }
          .ew-sidebar { flex-direction:column; }
          .ew-sidebar > * { min-width:unset; }
        }
      `}</style>

      <div className="ew-page">

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:10 }}>
          <div>
            <p style={s.title}>👷 Browse Workers</p>
            <p style={s.sub}>{total} approved workers available for hire</p>
          </div>
          <div style={s.totalBadge}>{total} workers</div>
        </div>

        <div className="ew-layout">

          {/* ── LEFT — Filters ── */}
          <div className="ew-sidebar">

            <form onSubmit={handleSearch} style={{ display:"contents" }}>

              <div style={s.filterCard}>
                <p style={s.filterTitle}>🔍 Search</p>
                <input style={s.inp}
                  placeholder="Name, skill, title..."
                  value={filters.search}
                  onChange={e => updateFilter("search", e.target.value)}
                />
              </div>

              <div style={s.filterCard}>
                <p style={s.filterTitle}>📂 Category</p>
                <select style={{ ...s.inp, appearance:"none" }}
                  value={filters.category}
                  onChange={e => updateFilter("category", e.target.value)}>
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div style={s.filterCard}>
                <p style={s.filterTitle}>📍 City</p>
                <select style={{ ...s.inp, appearance:"none" }}
                  value={filters.city}
                  onChange={e => updateFilter("city", e.target.value)}>
                  <option value="">All Cities</option>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={s.filterCard}>
                <p style={s.filterTitle}>💰 Rate (PKR/hr)</p>
                <div style={{ display:"flex", gap:8 }}>
                  <input style={{ ...s.inp, flex:1 }} type="number"
                    placeholder="Min" value={filters.minRate}
                    onChange={e => updateFilter("minRate", e.target.value)} />
                  <input style={{ ...s.inp, flex:1 }} type="number"
                    placeholder="Max" value={filters.maxRate}
                    onChange={e => updateFilter("maxRate", e.target.value)} />
                </div>
              </div>

              <div style={s.filterCard}>
                <p style={s.filterTitle}>⭐ Min Experience (yrs)</p>
                <input style={s.inp} type="number" min={0}
                  placeholder="e.g. 2"
                  value={filters.experience}
                  onChange={e => updateFilter("experience", e.target.value)} />
              </div>

              <button type="submit" style={s.searchBtn}>🔍 Search</button>
              <button type="button" style={s.resetBtn} onClick={resetFilters}>Reset</button>
            </form>
          </div>

          {/* ── RIGHT — Workers Grid ── */}
          <div>
            {loading ? (
              <p style={s.loadText}>Loading workers...</p>
            ) : workers.length === 0 ? (
              <div style={s.emptyCard}>
                <span style={{ fontSize:40 }}>👷</span>
                <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, margin:"12px 0 0" }}>
                  No workers found. Try different filters.
                </p>
              </div>
            ) : (
              <div className="ew-grid">
                {workers.map(worker => (
                  <div key={worker._id}
                    className="ew-worker-card"
                    style={s.workerCard}>

                    {/* Avatar + Name */}
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                      <div style={s.avatar}>
                        {worker.user?.name?.charAt(0)?.toUpperCase() || "W"}
                      </div>
                      <div style={{ minWidth:0 }}>
                        <p style={s.workerName}>{worker.user?.name}</p>
                        <p style={s.workerTitle}>
                          {worker.title
                            ? (worker.title.length > 28 ? worker.title.slice(0,28)+"..." : worker.title)
                            : worker.category}
                        </p>
                      </div>
                    </div>

                    {/* Category + Location */}
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                      <span style={s.badge}>
                        {CATEGORY_ICONS[worker.category]} {worker.category}
                      </span>
                      {worker.location?.city && (
                        <span style={s.badge}>📍 {worker.location.city}</span>
                      )}
                    </div>

                    {/* Rate + Experience */}
                    <div style={{ display:"flex", gap:12, marginBottom:10 }}>
                      <div>
                        <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"0 0 2px" }}>RATE</p>
                        <p style={{ fontSize:14, fontWeight:600, color:"#6ee7b7", margin:0 }}>
                          PKR {worker.hourlyRate}/hr
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"0 0 2px" }}>EXP</p>
                        <p style={{ fontSize:14, fontWeight:600, color:"#7dd3fc", margin:0 }}>
                          {worker.experience} yrs
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"0 0 2px" }}>RATING</p>
                        <p style={{ fontSize:14, fontWeight:600, color:"#fcd34d", margin:0 }}>
                          ⭐ {worker.rating || "New"}
                        </p>
                      </div>
                    </div>

                    {/* Skills */}
                    {worker.skills?.length > 0 && (
                      <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:12 }}>
                        {worker.skills.slice(0,3).map(sk => (
                          <span key={sk} style={s.skillTag}>{sk}</span>
                        ))}
                        {worker.skills.length > 3 && (
                          <span style={s.skillTag}>+{worker.skills.length - 3}</span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:12, display:"flex", gap:8 }}>
                      <button style={s.profileBtn} onClick={() => openProfile(worker)}>
                        View Profile
                      </button>
                      <button style={s.hireBtn} onClick={() => openHire(worker)}>
                        🤝 Hire
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Profile Detail Modal ── */}
      {selected && (
        <div className="ew-overlay" onClick={e => e.target.className==="ew-overlay" && closeProfile()}>
          <div className="ew-modal">

            {/* Modal Header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ ...s.avatar, width:52, height:52, fontSize:20, borderRadius:14 }}>
                  {selected.user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:600, color:"#fff", margin:0 }}>
                    {selected.user?.name}
                  </p>
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:"3px 0 0" }}>
                    {selected.title || selected.category}
                  </p>
                </div>
              </div>
              <button style={s.closeBtn} onClick={closeProfile}>×</button>
            </div>

            {/* Stats Row */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16 }}>
              {[
                { label:"Hourly Rate", value:`PKR ${selected.hourlyRate}`, color:"#6ee7b7" },
                { label:"Experience",  value:`${selected.experience} yrs`,  color:"#7dd3fc" },
                { label:"Rating",      value:selected.rating ? `⭐ ${selected.rating}` : "New", color:"#fcd34d" },
              ].map(item => (
                <div key={item.label} style={s.statBox}>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 4px" }}>{item.label}</p>
                  <p style={{ fontSize:14, fontWeight:600, color:item.color, margin:0 }}>{item.value}</p>
                </div>
              ))}
            </div>

            {/* Category + Location */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
              <span style={{ ...s.badge, fontSize:12 }}>
                {CATEGORY_ICONS[selected.category]} {selected.category}
              </span>
              {selected.location?.city && (
                <span style={{ ...s.badge, fontSize:12 }}>
                  📍 {selected.location.city}{selected.location.area ? `, ${selected.location.area}` : ""}
                </span>
              )}
            </div>

            {/* Bio */}
            {selected.bio && (
              <div style={{ marginBottom:14 }}>
                <p style={s.sectionLabel}>About</p>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", lineHeight:1.6, margin:0 }}>
                  {selected.bio}
                </p>
              </div>
            )}

            {/* Skills */}
            {selected.skills?.length > 0 && (
              <div style={{ marginBottom:14 }}>
                <p style={s.sectionLabel}>Skills</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                  {selected.skills.map(sk => (
                    <span key={sk} style={s.skillTag}>{sk}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            {selected.availability?.days?.length > 0 && (
              <div style={{ marginBottom:14 }}>
                <p style={s.sectionLabel}>Availability</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:6 }}>
                  {selected.availability.days.map(d => (
                    <span key={d} style={{ ...s.skillTag, background:"rgba(14,165,233,0.15)", borderColor:"rgba(14,165,233,0.3)", color:"#7dd3fc" }}>
                      {DAYS_SHORT[d]}
                    </span>
                  ))}
                </div>
                {selected.availability.startTime && (
                  <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0 }}>
                    ⏰ {selected.availability.startTime} — {selected.availability.endTime}
                  </p>
                )}
              </div>
            )}

            {/* Contact */}
            <div style={{ marginBottom:20 }}>
              <p style={s.sectionLabel}>Contact</p>
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {selected.user?.phone && (
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:14 }}>📞</span>
                    <span style={{ fontSize:13, color:"rgba(255,255,255,0.6)" }}>{selected.user.phone}</span>
                  </div>
                )}
                {selected.user?.email && (
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:14 }}>📧</span>
                    <span style={{ fontSize:13, color:"rgba(255,255,255,0.6)" }}>{selected.user.email}</span>
                  </div>
                )}
                {selected.cnic && (
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:14 }}>🪪</span>
                    <span style={{ fontSize:13, color:"rgba(255,255,255,0.6)" }}>{selected.cnic}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display:"flex", gap:10 }}>
              <button style={{ ...s.profileBtn, flex:1 }} onClick={closeProfile}>Close</button>
              <button style={{ ...s.hireBtn, flex:2 }} onClick={() => { closeProfile(); openHire(selected); }}>
                🤝 Hire This Worker →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Hire Modal ── */}
      {hiring && (
        <div className="ew-overlay" onClick={e => e.target.className==="ew-overlay" && closeHire()}>
          <div className="ew-modal">

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div>
                <p style={{ fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:600, color:"#fff", margin:0 }}>
                  🤝 Hire Worker
                </p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:"4px 0 0" }}>
                  Select one of your open jobs for {hiring.user?.name}
                </p>
              </div>
              <button style={s.closeBtn} onClick={closeHire}>×</button>
            </div>

            {/* Worker Summary */}
            <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, marginBottom:16 }}>
              <div style={{ ...s.avatar, flexShrink:0 }}>
                {hiring.user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:"#fff", margin:0 }}>{hiring.user?.name}</p>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"2px 0 0" }}>
                  {CATEGORY_ICONS[hiring.category]} {hiring.category} · PKR {hiring.hourlyRate}/hr · {hiring.experience} yrs exp
                </p>
              </div>
            </div>

            {/* Job Selection */}
            <div style={{ marginBottom:16 }}>
              <p style={s.sectionLabel}>Select Job</p>
              {myJobs.length === 0 ? (
                <div style={{ padding:"16px", background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, textAlign:"center" }}>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", margin:0 }}>
                    No open jobs found. Post a job first.
                  </p>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {myJobs.map(job => (
                    <div key={job._id}
                      style={{
                        padding:"12px 14px", borderRadius:10, cursor:"pointer",
                        transition:"all .2s",
                        background: selectedJob === job._id ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
                        border:`1px solid ${selectedJob === job._id ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"}`,
                      }}
                      onClick={() => setSelectedJob(job._id)}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <p style={{ fontSize:13, fontWeight:500, color:"#fff", margin:0 }}>{job.title}</p>
                          <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"3px 0 0" }}>
                            📍 {job.location?.city} · PKR {job.budget?.toLocaleString()} · {job.paymentType}
                          </p>
                        </div>
                        <div style={{
                          width:20, height:20, borderRadius:"50%",
                          border:`2px solid ${selectedJob === job._id ? "#c4b5fd" : "rgba(255,255,255,0.2)"}`,
                          background: selectedJob === job._id ? "rgba(124,58,237,0.4)" : "transparent",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          flexShrink:0,
                        }}>
                          {selectedJob === job._id && (
                            <span style={{ fontSize:10, color:"#c4b5fd" }}>✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hire Actions */}
            <div style={{ display:"flex", gap:10 }}>
              <button style={{ ...s.profileBtn, flex:1 }} onClick={closeHire}>Cancel</button>
              <button
                style={{
                  ...s.hireBtn, flex:2,
                  opacity: (!selectedJob || hiringLoading) ? 0.55 : 1,
                  cursor: (!selectedJob || hiringLoading) ? "not-allowed" : "pointer",
                }}
                onClick={handleHire}
                disabled={!selectedJob || hiringLoading}>
                {hiringLoading ? "Processing..." : "✅ Confirm Hire →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const s = {
  title:       { fontFamily:"'Sora',sans-serif", fontSize:"clamp(16px,4vw,20px)", fontWeight:600, color:"#fff", margin:0 },
  sub:         { fontSize:12, color:"rgba(255,255,255,0.35)", margin:"4px 0 0" },
  totalBadge:  { background:"rgba(124,58,237,0.2)", border:"1px solid rgba(124,58,237,0.3)", borderRadius:20, padding:"5px 14px", fontSize:12, color:"#c4b5fd", fontWeight:500 },
  filterCard:  { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:"12px 14px" },
  filterTitle: { fontSize:11, color:"rgba(255,255,255,0.45)", margin:"0 0 8px", fontWeight:500 },
  inp:         { width:"100%", boxSizing:"border-box", padding:"9px 12px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, color:"#fff", fontSize:12, fontFamily:"inherit", outline:"none" },
  searchBtn:   { padding:"10px", borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#4f46e5)", border:"none", color:"#fff", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit", width:"100%" },
  resetBtn:    { padding:"9px", borderRadius:10, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)", fontSize:12, cursor:"pointer", fontFamily:"inherit", width:"100%" },
  workerCard:  { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"clamp(14px,3vw,18px)", transition:"border-color .2s", display:"flex", flexDirection:"column" },
  avatar:      { width:42, height:42, borderRadius:12, background:"rgba(110,231,183,0.2)", border:"1px solid rgba(110,231,183,0.3)", color:"#6ee7b7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:600, flexShrink:0 },
  workerName:  { fontSize:13, fontWeight:600, color:"#fff", margin:0 },
  workerTitle: { fontSize:10, color:"rgba(255,255,255,0.4)", margin:"2px 0 0", textTransform:"capitalize" },
  badge:       { padding:"3px 9px", borderRadius:20, fontSize:11, background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.55)", border:"1px solid rgba(255,255,255,0.08)" },
  skillTag:    { padding:"3px 9px", borderRadius:20, fontSize:11, background:"rgba(124,58,237,0.15)", color:"#c4b5fd", border:"1px solid rgba(124,58,237,0.25)" },
  profileBtn:  { padding:"8px 14px", borderRadius:9, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", fontSize:12, cursor:"pointer", fontFamily:"inherit" },
  hireBtn:     { flex:1, padding:"8px 14px", borderRadius:9, background:"linear-gradient(135deg,#059669,#10b981)", border:"none", color:"#fff", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit" },
  emptyCard:   { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:40, textAlign:"center" },
  loadText:    { color:"rgba(255,255,255,0.4)", fontSize:13, textAlign:"center", padding:40 },
  closeBtn:    { background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:22, padding:0, lineHeight:1 },
  statBox:     { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"10px 12px" },
  sectionLabel:{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 8px", letterSpacing:0.5, fontWeight:500 },
};