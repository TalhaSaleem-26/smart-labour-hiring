/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// ─── Constants ─────────────────────────────────────────────────────────────────
const CATEGORY_ICONS = {
  plumber: "🔧", electrician: "⚡", painter: "🎨", cleaner: "🧹",
  carpenter: "🪚", welder: "🔩", mason: "🧱", driver: "🚗",
  gardener: "🌿", other: "💼",
};

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "plumber",     label: "🔧 Plumber" },
  { value: "electrician", label: "⚡ Electrician" },
  { value: "painter",     label: "🎨 Painter" },
  { value: "cleaner",     label: "🧹 Cleaner" },
  { value: "carpenter",   label: "🪚 Carpenter" },
  { value: "welder",      label: "🔩 Welder" },
  { value: "mason",       label: "🧱 Mason" },
  { value: "driver",      label: "🚗 Driver" },
  { value: "gardener",    label: "🌿 Gardener" },
  { value: "other",       label: "💼 Other" },
];

 const CITY_AREAS = {
  Karachi:    ["Saddar","DHA","Clifton","Gulshan-e-Iqbal","North Nazimabad","Korangi","Malir","Lyari","PECHS","Gulistan-e-Johar"],
  Lahore:     ["DHA","Gulberg","Model Town","Johar Town","Bahria Town","Wapda Town","Cantt","Iqbal Town","Faisal Town","Garden Town"],
  Islamabad:  ["F-7","F-10","G-9","G-11","E-11","Blue Area","I-8","H-9","Bahria Town","DHA Phase 2"],
  Rawalpindi: ["Saddar","Bahria Town","Murree Road","Chaklala","Peshawar Road","Westridge","Dhoke Syedan","Gulraiz","Adiala Road","Taxila"],
  Faisalabad: ["Samanabad","Jinnah Colony","Madina Town","People's Colony","Civil Lines","D-Ground","Ghulam Muhammad Abad","Millat Town"],
  Multan:     ["Gulgasht","Cantt","Shah Rukn-e-Alam","Bosan Road","Qasim Bela","New Multan","Vehari Chowk","Abdali Road"],
  Peshawar:   ["Hayatabad","University Town","Saddar","Cantonment","Gulbahar","Warsak Road","Ring Road","Chamkani"],
  Quetta:     ["Satellite Town","Jinnah Town","Cantt","Brewery Road","Airport Road","Spinny Road","New Sariab"],
  Sialkot:    ["Cantt","Civil Lines","Paris Road","Aziz Shaheed Road","Iqbal Stadium Area","Sambrial","Daska"],
  Gujranwala: ["Model Town","DHA","Peoples Colony","Rahwali","GT Road","Satellite Town","Wazirabad Road"],
};

const CITIES = Object.keys(CITY_AREAS);

// ─── Responsive Hook ───────────────────────────────────────────────────────────
function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return w;
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function WorkerFindJobs() {
  const width    = useWindowWidth();
  const isMobile = width < 768;
  const isTablet = width < 1024;

  const [jobs,       setJobs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [applying,   setApplying]   = useState(null);
  const [total,      setTotal]      = useState(0);
  const [page,       setPage]       = useState(1);
  const [pages,      setPages]      = useState(1);
  const [showFilter, setShowFilter] = useState(false); // mobile filter drawer

  // Apply modal
  const [selected,    setSelected]    = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [showModal,   setShowModal]   = useState(false);

  const [filters, setFilters] = useState({
    search:    "",
    category:  "",
    city:      "",
    area:      "",       // ← NEW: specific area within city
    minBudget: "",
    maxBudget: "",
    jobType:   "",
    sortBy:    "createdAt",
    order:     "desc",
  });

  const updateFilter = (key, val) => setFilters(p => ({ ...p, [key]: val }));

  // When city changes, reset area
  const handleCityChange = (city) => {
    setFilters(p => ({ ...p, city, area: "" }));
  };

  const availableAreas = CITY_AREAS[filters.city] || [];

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchJobs = useCallback(async (pageNum = page) => {
    setLoading(true);
    try {
      const params = { ...filters, page: pageNum, limit: 9 };
      // Remove empty params
      Object.keys(params).forEach(k => {
        if (params[k] === "" || params[k] === null || params[k] === undefined) delete params[k];
      });
      const res = await api.get("/api/job/all", { params });
      setJobs(res.data.jobs || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch {
      toast.error("Failed to load jobs.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchJobs(page); }, [page]);

  const handleSearch = (e) => {
    e?.preventDefault();
    setPage(1);
    fetchJobs(1);
    if (isMobile) setShowFilter(false);
  };

  const handleReset = () => {
    setFilters({ search: "", category: "", city: "", area: "", minBudget: "", maxBudget: "", jobType: "", sortBy: "createdAt", order: "desc" });
    setPage(1);
    setTimeout(() => fetchJobs(1), 80);
  };

  // ── Apply ──────────────────────────────────────────────────────────────────
  const handleApply = async () => {
    if (!selected) return;
    setApplying(selected._id);
    const tid = toast.loading("Submitting application...");
    try {
      await api.post(`/api/job/apply/${selected._id}`, { coverLetter });
      toast.success("Application submitted! 🎉", { id: tid });
      setShowModal(false);
      setCoverLetter("");
      setSelected(null);
      fetchJobs(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply.", { id: tid });
    } finally {
      setApplying(null);
    }
  };

  // ── Filter Panel (shared between sidebar & mobile drawer) ──────────────────
  const filterPanelProps = {
    filters,
    updateFilter,
    handleCityChange,
    availableAreas,
    handleSearch,
    handleReset,
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .wj-jobcard:hover { border-color: rgba(124,58,237,0.4) !important; transform: translateY(-2px); }
        .wj-applybtn:hover { opacity: 0.88; }
        .wj-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.55); z-index:300; display:flex; align-items:flex-end; justify-content:center; }
        .wj-drawer { background:#0f0f1e; border-top:1px solid rgba(255,255,255,0.1); border-radius:20px 20px 0 0; width:100%; max-width:500px; max-height:85vh; overflow-y:auto; padding:20px; }
        select option { background:#1a1a35; color:#fff; }
        @media (max-width:480px){
          .wj-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      <div style={{ fontFamily: "'DM Sans',sans-serif", paddingBottom: 32 }}>

        {/* ── Header ── */}
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 10,
        }}>
          <div>
            <p style={{ fontSize: isMobile ? 18 : 22, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.3px" }}>
              Find Jobs
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "4px 0 0" }}>
              {total} jobs available
              {filters.city && ` in ${filters.city}`}
              {filters.area && ` › ${filters.area}`}
            </p>
          </div>

          {/* Active filters chips */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
            {filters.city && (
              <span style={chip}>
                📍 {filters.area ? `${filters.city} › ${filters.area}` : filters.city}
                <button onClick={() => setFilters(p => ({ ...p, city: "", area: "" }))} style={chipX}>✕</button>
              </span>
            )}
            {filters.category && (
              <span style={chip}>
                {CATEGORY_ICONS[filters.category]} {filters.category}
                <button onClick={() => updateFilter("category", "")} style={chipX}>✕</button>
              </span>
            )}
            {isMobile && (
              <button
                onClick={() => setShowFilter(true)}
                style={{
                  padding: "7px 14px", borderRadius: 10,
                  background: "rgba(124,58,237,0.2)",
                  border: "1px solid rgba(124,58,237,0.4)",
                  color: "#c4b5fd", fontSize: 12, fontWeight: 600,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                ⚙ Filters
              </button>
            )}
          </div>
        </div>

        {/* ── Layout ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isTablet ? "1fr" : "260px 1fr",
          gap: 16,
          alignItems: "start",
        }}>

          {/* Sidebar (desktop/tablet) */}
          {!isTablet && (
            <div style={{ position: "sticky", top: 80 }}>
              <FilterPanel {...filterPanelProps} />
            </div>
          )}

          {/* Jobs Grid */}
          <div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div style={{
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16, padding: "60px 20px", textAlign: "center",
              }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
                <p style={{ color: "#fff", fontSize: 15, fontWeight: 600, margin: "0 0 6px" }}>No jobs found</p>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, margin: 0 }}>
                  Try different filters or{" "}
                  <button onClick={handleReset} style={{ background: "none", border: "none", color: "#a78bfa", cursor: "pointer", fontSize: 13, padding: 0, textDecoration: "underline" }}>
                    reset all
                  </button>
                </p>
              </div>
            ) : (
              <div className="wj-grid" style={{
                display: "grid",
                gridTemplateColumns: width < 480 ? "1fr" : "repeat(2,1fr)",
                gap: 14,
              }}>
                {jobs.map(job => <JobCard key={job._id} job={job} onApply={() => { setSelected(job); setShowModal(true); }} />)}
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
                <PgBtn disabled={page === 1} onClick={() => setPage(1)}>«</PgBtn>
                <PgBtn disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</PgBtn>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", padding: "0 4px" }}>
                  {page} / {pages}
                </span>
                <PgBtn disabled={page === pages} onClick={() => setPage(p => p + 1)}>Next →</PgBtn>
                <PgBtn disabled={page === pages} onClick={() => setPage(pages)}>»</PgBtn>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Filter Drawer ── */}
      {isMobile && showFilter && (
        <div className="wj-overlay" onClick={e => e.target.className === "wj-overlay" && setShowFilter(false)}>
          <div className="wj-drawer">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ color: "#fff", fontSize: 15, fontWeight: 700, margin: 0 }}>Filters</p>
              <button onClick={() => setShowFilter(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 20, cursor: "pointer", padding: 0 }}>✕</button>
            </div>
            <FilterPanel {...filterPanelProps} />
          </div>
        </div>
      )}

      {/* ── Apply Modal ── */}
      {showModal && selected && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
          onClick={e => e.currentTarget === e.target && setShowModal(false)}
        >
          <div style={{
            background: "#0d0d1f", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 20, padding: "clamp(18px,4vw,28px)",
            width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto",
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>Apply for Job</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>{selected.title}</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 22, padding: 0, lineHeight: 1 }}>×</button>
            </div>

            {/* Job Summary */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 14px", marginBottom: 16 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <Badge>📍 {selected.location?.city}{selected.location?.area ? ` › ${selected.location.area}` : ""}</Badge>
                <Badge green>💰 PKR {selected.budget?.toLocaleString()}/{selected.paymentType}</Badge>
                {selected.jobType && <Badge>{selected.jobType}</Badge>}
              </div>
            </div>

            {/* Cover Letter */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                Cover Letter <span style={{ color: "rgba(255,255,255,0.25)", textTransform: "none", fontWeight: 400, fontSize: 10 }}>(Optional · max 500 chars)</span>
              </p>
              <textarea
                style={{
                  width: "100%", boxSizing: "border-box", height: 120, padding: "11px 14px",
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10, color: "#fff", fontSize: 13, fontFamily: "inherit",
                  outline: "none", resize: "none",
                }}
                placeholder="Tell the employer why you're the right fit..."
                value={coverLetter}
                maxLength={500}
                onChange={e => setCoverLetter(e.target.value)}
              />
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", textAlign: "right", margin: "4px 0 0" }}>
                {coverLetter.length}/500
              </p>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: 12, borderRadius: 11,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)", fontSize: 13, cursor: "pointer", fontFamily: "inherit",
              }}>
                Cancel
              </button>
              <button onClick={handleApply} disabled={!!applying} style={{
                flex: 2, padding: 12, borderRadius: 11,
                background: applying ? "rgba(124,58,237,0.4)" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
                border: "none", color: "#fff", fontSize: 13, fontWeight: 600,
                cursor: applying ? "not-allowed" : "pointer", fontFamily: "inherit",
                boxShadow: applying ? "none" : "0 4px 18px rgba(124,58,237,0.35)",
              }}>
                {applying ? "Submitting..." : "Submit Application →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Job Card ──────────────────────────────────────────────────────────────────
function JobCard({ job, onApply }) {
  return (
    <div className="wj-jobcard" style={{
      background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 16, padding: "clamp(14px,3vw,18px)",
      display: "flex", flexDirection: "column",
      transition: "border-color .2s, transform .2s",
      cursor: "default",
    }}>
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: "rgba(124,58,237,0.18)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: 18,
          }}>
            {CATEGORY_ICONS[job.category] || "💼"}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {job.title}
            </p>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "2px 0 0", textTransform: "capitalize" }}>
              {job.category}
            </p>
          </div>
        </div>
      </div>

      {/* Description */}
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: "0 0 10px", flex: 1 }}>
        {job.description?.slice(0, 90)}{job.description?.length > 90 ? "…" : ""}
      </p>

      {/* Meta Badges */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
        {/* Location — show area if available, otherwise city */}
        <Badge>
          📍 {job.location?.area
            ? `${job.location.city} › ${job.location.area}`
            : job.location?.city}
        </Badge>
        <Badge green>💰 PKR {job.budget?.toLocaleString()}/{job.paymentType}</Badge>
        {job.jobType && <Badge>{job.jobType}</Badge>}
        {job.experienceRequired > 0 && <Badge>{job.experienceRequired}+ yrs</Badge>}
      </div>

      {/* Skills */}
      {job.skillsRequired?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 10 }}>
          {job.skillsRequired.slice(0, 3).map(sk => (
            <span key={sk} style={{
              padding: "2px 9px", borderRadius: 20, fontSize: 10,
              background: "rgba(124,58,237,0.15)", color: "#c4b5fd",
              border: "1px solid rgba(124,58,237,0.28)",
            }}>{sk}</span>
          ))}
          {job.skillsRequired.length > 3 && (
            <span style={{
              padding: "2px 9px", borderRadius: 20, fontSize: 10,
              background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>+{job.skillsRequired.length - 3}</span>
          )}
        </div>
      )}

      {/* Employer Row */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "9px 0 0", borderTop: "1px solid rgba(255,255,255,0.06)", marginTop: "auto",
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: "rgba(110,231,183,0.18)", color: "#6ee7b7",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700,
        }}>
          {job.employer?.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {job.employer?.name || "Employer"}
          </p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: 0 }}>
            {new Date(job.createdAt).toLocaleDateString()}
            {job.deadline && ` · Due: ${new Date(job.deadline).toLocaleDateString()}`}
          </p>
        </div>
      </div>

      {/* Apply Button */}
      <button className="wj-applybtn" onClick={onApply} style={{
        width: "100%", padding: "10px", marginTop: 12, borderRadius: 10,
        background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
        border: "none", color: "#fff", fontSize: 12, fontWeight: 600,
        cursor: "pointer", fontFamily: "inherit", transition: "opacity .2s",
        boxShadow: "0 3px 14px rgba(124,58,237,0.3)",
      }}>
        Apply Now →
      </button>
    </div>
  );
}

// ─── Filter Panel ──────────────────────────────────────────────────────────────
function FilterPanel({ filters, updateFilter, handleCityChange, availableAreas, handleSearch, handleReset }) {
  return (
    <form onSubmit={handleSearch} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <FilterCard title="Search">
        <Inp
          placeholder="Job title, skill..."
          value={filters.search}
          onChange={e => updateFilter("search", e.target.value)}
        />
      </FilterCard>

      <FilterCard title="Category">
        <Sel value={filters.category} onChange={e => updateFilter("category", e.target.value)}>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </Sel>
      </FilterCard>

      <FilterCard title="Location">
        <Sel value={filters.city} onChange={e => handleCityChange(e.target.value)}>
          <option value="">All Cities</option>
          {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Sel>
        {filters.city && availableAreas.length > 0 && (
          <Sel value={filters.area} onChange={e => updateFilter("area", e.target.value)} style={{ marginTop: 8 }}>
            <option value="">All Areas</option>
            {availableAreas.map(a => <option key={a} value={a}>{a}</option>)}
          </Sel>
        )}
      </FilterCard>

      <FilterCard title="Budget (PKR)">
        <div style={{ display: "flex", gap: 8 }}>
          <Inp
            type="number"
            placeholder="Min"
            value={filters.minBudget}
            onChange={e => updateFilter("minBudget", e.target.value)}
          />
          <Inp
            type="number"
            placeholder="Max"
            value={filters.maxBudget}
            onChange={e => updateFilter("maxBudget", e.target.value)}
          />
        </div>
      </FilterCard>

      <FilterCard title="Job Type">
        <Sel value={filters.jobType} onChange={e => updateFilter("jobType", e.target.value)}>
          <option value="">Any</option>
          <option value="One-time">One-time</option>
          <option value="Recurring">Recurring</option>
        </Sel>
      </FilterCard>

      <FilterCard title="Sort By">
        <Sel value={filters.sortBy} onChange={e => updateFilter("sortBy", e.target.value)}>
          <option value="createdAt">Newest</option>
          <option value="budget">Budget</option>
        </Sel>
        <Sel value={filters.order} onChange={e => updateFilter("order", e.target.value)} style={{ marginTop: 8 }}>
          <option value="desc">High to Low</option>
          <option value="asc">Low to High</option>
        </Sel>
      </FilterCard>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" style={{
          flex: 1, padding: 11, borderRadius: 10,
          background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
          border: "none", color: "#fff", fontSize: 12, fontWeight: 600,
          cursor: "pointer", fontFamily: "inherit",
        }}>
          Search
        </button>
        <button type="button" onClick={handleReset} style={{
          flex: 1, padding: 11, borderRadius: 10,
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
        }}>
          Reset
        </button>
      </div>
    </form>
  );
}

// ─── Tiny helpers ──────────────────────────────────────────────────────────────
function FilterCard({ title, children, accent }) {
  return (
    <div style={{
      background: accent ? "rgba(14,165,233,0.06)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${accent ? "rgba(14,165,233,0.2)" : "rgba(255,255,255,0.08)"}`,
      borderRadius: 12, padding: "12px 14px",
    }}>
      <p style={{ fontSize: 10, color: accent ? "#7dd3fc" : "rgba(255,255,255,0.4)", margin: "0 0 8px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function Inp({ style, ...props }) {
  return (
    <input style={{
      width: "100%", boxSizing: "border-box", padding: "9px 11px",
      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 9, color: "#fff", fontSize: 12, fontFamily: "inherit",
      outline: "none", appearance: "none", WebkitAppearance: "none",
      ...style,
    }} {...props} />
  );
}

function Sel({ children, ...props }) {
  return (
    <select style={{
      width: "100%", boxSizing: "border-box", padding: "9px 11px",
      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 9, color: "#fff", fontSize: 12, fontFamily: "inherit",
      outline: "none", appearance: "none", WebkitAppearance: "none",
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.35)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", paddingRight: 30,
      cursor: "pointer",
    }} {...props}>
      {children}
    </select>
  );
}

function Badge({ children, green }) {
  return (
    <span style={{
      padding: "3px 9px", borderRadius: 20, fontSize: 11,
      background: green ? "rgba(110,231,183,0.1)" : "rgba(255,255,255,0.06)",
      color: green ? "#6ee7b7" : "rgba(255,255,255,0.55)",
      border: `1px solid ${green ? "rgba(110,231,183,0.25)" : "rgba(255,255,255,0.08)"}`,
      whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

function PgBtn({ children, disabled, onClick }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: "7px 14px", borderRadius: 9,
      background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
      color: "rgba(255,255,255,0.6)", fontSize: 12, cursor: disabled ? "not-allowed" : "pointer",
      fontFamily: "inherit", opacity: disabled ? 0.4 : 1, transition: "opacity .2s",
    }}>
      {children}
    </button>
  );
}

const chip = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500,
  background: "rgba(124,58,237,0.18)", color: "#c4b5fd",
  border: "1px solid rgba(124,58,237,0.35)",
};

const chipX = {
  background: "none", border: "none", color: "rgba(196,181,253,0.55)",
  cursor: "pointer", fontSize: 12, padding: 0, lineHeight: 1,
};