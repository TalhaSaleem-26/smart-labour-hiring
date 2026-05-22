/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

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

const CITIES = Object.keys(CITY_AREAS).map(name => ({ name }));

const CITY_ICONS = {
  Karachi:"🏙️", Lahore:"🕌", Islamabad:"🏛️", Rawalpindi:"🏘️",
  Faisalabad:"🏭", Multan:"🌴", Peshawar:"⛰️", Quetta:"🗻",
  Sialkot:"⚽", Gujranwala:"🏗️",
};

const CATEGORIES = [
  { value:"", label:"All Categories" },
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

const CATEGORY_ICONS = {
  plumber:"🔧", electrician:"⚡", painter:"🎨", cleaner:"🧹",
  carpenter:"🪚", welder:"🔩", mason:"🧱", driver:"🚗",
  gardener:"🌿", other:"💼",
};

export default function LocationWorkerPage() {
  const [selectedCity, setSelectedCity]     = useState("");
  const [selectedArea, setSelectedArea]     = useState("");
  const [areaSearch, setAreaSearch]         = useState("");
  const [areaStats, setAreaStats]           = useState({});
  const [areaStatsLoading, setAreaStatsLoading] = useState(false);
  const [category, setCategory]             = useState("");
  const [minRate, setMinRate]               = useState("");
  const [maxRate, setMaxRate]               = useState("");
  const [experience, setExperience]         = useState("");
  const [workers, setWorkers]               = useState([]);
  const [cityStats, setCityStats]           = useState({});
  const [loading, setLoading]               = useState(false);
  const [statsLoading, setStatsLoading]     = useState(true);
  const [selected, setSelected]             = useState(null);
  const [hiring, setHiring]                 = useState(null);
  const [myJobs, setMyJobs]                 = useState([]);
  const [selectedJob, setSelectedJob]       = useState("");
  const [hiringLoading, setHiringLoading]   = useState(false);
  const [searched, setSearched]             = useState(false);
  const [step, setStep]                     = useState("city"); // "city" | "area" | "results"

  useEffect(() => { fetchCityStats(); }, []);

  // Fetch worker count per city
  const fetchCityStats = async () => {
    setStatsLoading(true);
    try {
      const results = await Promise.all(
        CITIES.map(c =>
          api.get("/api/worker/all", { params: { city: c.name, limit: 1 } })
            .then(r => [c.name, r.data.count || 0])
            .catch(() => [c.name, 0])
        )
      );
      setCityStats(Object.fromEntries(results));
    } catch {
      setCityStats({});
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch worker count per area when city selected
  const fetchAreaStats = async (city) => {
    setAreaStatsLoading(true);
    const areas = CITY_AREAS[city] || [];
    try {
      const results = await Promise.all(
        areas.map(area =>
          api.get("/api/worker/all", { params: { city, area, limit: 1 } })
            .then(r => [area, r.data.count || 0])
            .catch(() => [area, 0])
        )
      );
      setAreaStats(Object.fromEntries(results));
    } catch {
      setAreaStats({});
    } finally {
      setAreaStatsLoading(false);
    }
  };

  const handleCityClick = (cityName) => {
    setSelectedCity(cityName);
    setSelectedArea("");
    setAreaSearch("");
    setWorkers([]);
    setSearched(false);
    setStep("area");
    fetchAreaStats(cityName);
  };

  const handleAreaClick = (area) => {
    setSelectedArea(area);
    setStep("results");
    setWorkers([]);
    setSearched(false);
  };

  const handleSearch = async () => {
    if (!selectedCity) return toast.error("Please select a city first.");
    setLoading(true);
    setSearched(true);
    try {
      const params = { city: selectedCity };
      if (selectedArea) params.area = selectedArea;
      if (category)     params.category   = category;
      if (minRate)      params.minRate     = minRate;
      if (maxRate)      params.maxRate     = maxRate;
      if (experience)   params.experience  = experience;
      const res = await api.get("/api/worker/all", { params });
      setWorkers(res.data.workers || []);
    } catch {
      toast.error("Failed to search workers.");
    } finally {
      setLoading(false);
    }
  };

  const openHire = async (worker) => {
    setHiring(worker);
    setSelectedJob("");
    try {
      const res = await api.get("/api/job/my-jobs", { params: { status: "open", limit: 20 } });
      setMyJobs(res.data.jobs || []);
    } catch {
      toast.error("Failed to load jobs.");
    }
  };

  const handleHire = async () => {
    if (!selectedJob) return toast.error("Please select a job.");
    setHiringLoading(true);
    const tid = toast.loading("Processing...");
    try {
      await api.put(`/api/job/update/${selectedJob}`, {
        status: "hired", hiredWorker: hiring._id,
      });
      toast.success(`${hiring.user?.name} hired! 🎉`, { id: tid });
      setHiring(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.", { id: tid });
    } finally {
      setHiringLoading(false);
    }
  };

  const filteredAreas = (CITY_AREAS[selectedCity] || []).filter(a =>
    a.toLowerCase().includes(areaSearch.toLowerCase())
  );

  const sortedCities = CITIES.slice().sort(
    (a, b) => (cityStats[b.name] || 0) - (cityStats[a.name] || 0)
  );

  return (
    <>
      <style>{`
        .lw-page { padding-bottom: 32px; }
        .lw-cities { display: grid; grid-template-columns: repeat(5,1fr); gap: 10px; margin-bottom: 24px; }
        .lw-areas  { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-top: 14px; }
        .lw-grid   { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
        .lw-filters { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 10px; margin-bottom: 16px; }
        .lw-city-card:hover  { border-color: rgba(124,58,237,0.5) !important; transform: translateY(-2px); }
        .lw-area-card:hover  { border-color: rgba(14,165,233,0.5) !important; transform: translateY(-2px); }
        .lw-worker-card:hover{ border-color: rgba(124,58,237,0.4) !important; }
        .lw-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 200;
          display: flex; align-items: center; justify-content: center; padding: 16px; }
        .lw-modal { background: #0d0d1f; border: 1px solid rgba(255,255,255,0.12);
          border-radius: 20px; width: 100%; max-width: 520px;
          max-height: 88vh; overflow-y: auto; padding: clamp(20px,4vw,28px); }
        select option { background: #1a1a35; color: #fff; }
        @media(max-width:1100px){
          .lw-cities { grid-template-columns: repeat(4,1fr); }
          .lw-areas  { grid-template-columns: repeat(3,1fr); }
          .lw-grid   { grid-template-columns: repeat(2,1fr); }
          .lw-filters{ grid-template-columns: 1fr 1fr; }
        }
        @media(max-width:768px){
          .lw-cities { grid-template-columns: repeat(3,1fr); }
          .lw-areas  { grid-template-columns: repeat(2,1fr); }
          .lw-filters{ grid-template-columns: 1fr 1fr; }
        }
        @media(max-width:480px){
          .lw-cities { grid-template-columns: repeat(2,1fr); }
          .lw-areas  { grid-template-columns: repeat(2,1fr); }
          .lw-grid   { grid-template-columns: 1fr; }
          .lw-filters{ grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="lw-page">

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <p style={s.title}>📍 Location-Based Worker Search</p>
          <p style={s.sub}>Find skilled workers by city and area</p>
        </div>

        {/* Breadcrumb trail */}
        {(selectedCity || selectedArea) && (
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:16, flexWrap:"wrap" }}>
            <button style={s.crumb} onClick={() => { setStep("city"); setSelectedCity(""); setSelectedArea(""); setWorkers([]); setSearched(false); }}>
              All Cities
            </button>
            {selectedCity && (
              <>
                <span style={{ color:"rgba(255,255,255,0.2)", fontSize:12 }}>›</span>
                <button style={{
                  ...s.crumb,
                  color: step === "area" ? "#c4b5fd" : "rgba(255,255,255,0.5)",
                  borderColor: step === "area" ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.08)",
                }} onClick={() => { setStep("area"); setSelectedArea(""); setWorkers([]); setSearched(false); }}>
                  {CITY_ICONS[selectedCity]} {selectedCity}
                </button>
              </>
            )}
            {selectedArea && (
              <>
                <span style={{ color:"rgba(255,255,255,0.2)", fontSize:12 }}>›</span>
                <span style={{ ...s.crumb, color:"#7dd3fc", borderColor:"rgba(14,165,233,0.3)", cursor:"default" }}>
                  📍 {selectedArea}
                </span>
              </>
            )}
          </div>
        )}

        {/* STEP 1 — City Selection */}
        {step === "city" && (
          <div style={s.sectionCard}>
            <p style={s.sectionTitle}>🗺️ Select a City</p>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", margin:"4px 0 16px" }}>
              Click a city to browse its areas
            </p>
            <div className="lw-cities">
              {sortedCities.map(city => (
                <div key={city.name}
                  className="lw-city-card"
                  onClick={() => handleCityClick(city.name)}
                  style={{
                    padding:"14px 10px", borderRadius:14, cursor:"pointer",
                    textAlign:"center", transition:"all .2s",
                    background:"rgba(255,255,255,0.04)",
                    border:"1px solid rgba(255,255,255,0.08)",
                  }}>
                  <div style={{ fontSize:24, marginBottom:6 }}>{CITY_ICONS[city.name]}</div>
                  <p style={{ fontSize:12, fontWeight:600, margin:"0 0 4px", color:"#fff" }}>
                    {city.name}
                  </p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>
                    {statsLoading ? "..." : `${cityStats[city.name] || 0} workers`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2 — Area Selection */}
        {step === "area" && selectedCity && (
          <div style={s.sectionCard}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
              <p style={s.sectionTitle}>
                {CITY_ICONS[selectedCity]} {selectedCity} — Select an Area
              </p>
              <button style={s.skipBtn} onClick={() => { setSelectedArea(""); setStep("results"); setSearched(false); }}>
                Skip → Search All of {selectedCity}
              </button>
            </div>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.35)", margin:"4px 0 14px" }}>
              Choose a specific area for more targeted results, or skip to search the whole city
            </p>

            {/* Area search */}
            <div style={{ position:"relative", marginBottom:14 }}>
              <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:13, color:"rgba(255,255,255,0.3)" }}>🔍</span>
              <input
                style={{ ...s.inp, paddingLeft:30 }}
                placeholder={`Search areas in ${selectedCity}...`}
                value={areaSearch}
                onChange={e => setAreaSearch(e.target.value)}
              />
            </div>

            {/* Area grid */}
            <div className="lw-areas">
              {filteredAreas.map(area => {
                const count = areaStats[area];
                return (
                  <div key={area}
                    className="lw-area-card"
                    onClick={() => handleAreaClick(area)}
                    style={{
                      padding:"12px 14px", borderRadius:12, cursor:"pointer",
                      transition:"all .2s",
                      background:"rgba(14,165,233,0.05)",
                      border:"1px solid rgba(14,165,233,0.12)",
                    }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                      <p style={{ fontSize:13, fontWeight:500, color:"#fff", margin:0 }}>{area}</p>
                      {count !== undefined && (
                        <span style={{
                          fontSize:10, padding:"2px 7px", borderRadius:20,
                          background: count > 0 ? "rgba(14,165,233,0.15)" : "rgba(255,255,255,0.05)",
                          color: count > 0 ? "#7dd3fc" : "rgba(255,255,255,0.25)",
                          border: count > 0 ? "1px solid rgba(14,165,233,0.2)" : "1px solid rgba(255,255,255,0.06)",
                          flexShrink:0, marginLeft:6,
                        }}>
                          {areaStatsLoading ? "..." : `${count}`}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:"4px 0 0" }}>
                      {areaStatsLoading ? "Loading..." : count === 0 ? "No workers yet" : `${count} worker${count !== 1 ? "s" : ""} available`}
                    </p>
                  </div>
                );
              })}
            </div>

            {filteredAreas.length === 0 && (
              <p style={{ textAlign:"center", fontSize:13, color:"rgba(255,255,255,0.3)", padding:"20px 0" }}>
                No areas match "{areaSearch}"
              </p>
            )}
          </div>
        )}

        {/* STEP 3 — Filters + Results */}
        {step === "results" && (
          <>
            {/* Filter Panel */}
            <div style={s.sectionCard}>
              <p style={s.sectionTitle}>
                🔍 Workers in{" "}
                <span style={{ color:"#c4b5fd" }}>{selectedCity}</span>
                {selectedArea && (
                  <> › <span style={{ color:"#7dd3fc" }}>{selectedArea}</span></>
                )}
              </p>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.3)", margin:"4px 0 16px" }}>
                Refine by category, rate, and experience
              </p>

              <div className="lw-filters">
                <div>
                  <p style={s.lbl}>Category</p>
                  <select style={{ ...s.inp, appearance:"none" }}
                    value={category} onChange={e => setCategory(e.target.value)}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <p style={s.lbl}>Min Rate (PKR/hr)</p>
                  <input style={s.inp} type="number" placeholder="e.g. 500"
                    value={minRate} onChange={e => setMinRate(e.target.value)} />
                </div>
                <div>
                  <p style={s.lbl}>Max Rate (PKR/hr)</p>
                  <input style={s.inp} type="number" placeholder="e.g. 3000"
                    value={maxRate} onChange={e => setMaxRate(e.target.value)} />
                </div>
                <div>
                  <p style={s.lbl}>Min Experience (yrs)</p>
                  <input style={s.inp} type="number" placeholder="e.g. 2"
                    value={experience} onChange={e => setExperience(e.target.value)} />
                </div>
              </div>

              <div style={{ display:"flex", gap:8 }}>
                <button style={s.searchBtn} onClick={handleSearch} disabled={loading}>
                  {loading ? "Searching..." : "🔍 Search Workers"}
                </button>
                <button style={s.resetBtn} onClick={() => {
                  setCategory(""); setMinRate(""); setMaxRate("");
                  setExperience(""); setWorkers([]); setSearched(false);
                }}>
                  Reset Filters
                </button>
                {selectedArea && (
                  <button style={s.resetBtn} onClick={() => {
                    setSelectedArea("");
                    setWorkers([]); setSearched(false);
                  }}>
                    📍 Clear Area
                  </button>
                )}
              </div>
            </div>

            {/* Results */}
            {searched && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                  <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", margin:0 }}>
                    {loading ? "Searching..." : `${workers.length} workers found`}
                    {selectedArea ? ` in ${selectedArea}, ${selectedCity}` : ` in ${selectedCity}`}
                    {category && ` · ${category}`}
                  </p>
                  {workers.length > 0 && (
                    <span style={s.countBadge}>{workers.length} results</span>
                  )}
                </div>

                {loading ? (
                  <p style={s.loadText}>Searching workers...</p>
                ) : workers.length === 0 ? (
                  <div style={s.emptyCard}>
                    <span style={{ fontSize:40 }}>🔍</span>
                    <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, margin:"12px 0 4px" }}>
                      No workers found{selectedArea ? ` in ${selectedArea}` : ""} with these filters.
                    </p>
                    {selectedArea && (
                      <button style={{ ...s.resetBtn, marginTop:12 }} onClick={() => {
                        setSelectedArea(""); handleSearch();
                      }}>
                        Try searching all of {selectedCity} →
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="lw-grid">
                    {workers.map(worker => (
                      <div key={worker._id} className="lw-worker-card" style={s.workerCard}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                          <div style={s.avatar}>
                            {worker.user?.name?.charAt(0)?.toUpperCase() || "W"}
                          </div>
                          <span style={s.locationPill}>
                            📍 {worker.location?.area
                              ? `${worker.location.area}, ${worker.location.city}`
                              : worker.location?.city}
                          </span>
                        </div>

                        <p style={{ fontSize:13, fontWeight:600, color:"#fff", margin:"0 0 2px" }}>
                          {worker.user?.name}
                        </p>
                        <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 10px", textTransform:"capitalize" }}>
                          {CATEGORY_ICONS[worker.category]} {worker.title || worker.category}
                        </p>

                        <div style={{ display:"flex", gap:12, marginBottom:10 }}>
                          <div>
                            <p style={{ fontSize:9, color:"rgba(255,255,255,0.35)", margin:"0 0 2px" }}>RATE</p>
                            <p style={{ fontSize:13, fontWeight:600, color:"#6ee7b7", margin:0 }}>PKR {worker.hourlyRate}/hr</p>
                          </div>
                          <div>
                            <p style={{ fontSize:9, color:"rgba(255,255,255,0.35)", margin:"0 0 2px" }}>EXP</p>
                            <p style={{ fontSize:13, fontWeight:600, color:"#7dd3fc", margin:0 }}>{worker.experience} yrs</p>
                          </div>
                          <div>
                            <p style={{ fontSize:9, color:"rgba(255,255,255,0.35)", margin:"0 0 2px" }}>RATING</p>
                            <p style={{ fontSize:13, fontWeight:600, color:"#fcd34d", margin:0 }}>⭐ {worker.rating || "New"}</p>
                          </div>
                        </div>

                        {worker.skills?.length > 0 && (
                          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:10 }}>
                            {worker.skills.slice(0,3).map(sk => (
                              <span key={sk} style={s.skillTag}>{sk}</span>
                            ))}
                            {worker.skills.length > 3 && (
                              <span style={s.skillTag}>+{worker.skills.length - 3}</span>
                            )}
                          </div>
                        )}

                        <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", paddingTop:10, display:"flex", gap:8 }}>
                          <button style={s.profileBtn} onClick={() => setSelected(worker)}>Profile</button>
                          <button style={s.hireBtn} onClick={() => openHire(worker)}>🤝 Hire</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!searched && (
              <div style={{ ...s.emptyCard, marginTop:0 }}>
                <span style={{ fontSize:40 }}>🔍</span>
                <p style={{ color:"rgba(255,255,255,0.5)", fontSize:13, margin:"12px 0 4px" }}>
                  Press Search to find workers
                  {selectedArea ? ` in ${selectedArea}, ${selectedCity}` : ` in ${selectedCity}`}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Profile Modal */}
      {selected && (
        <div className="lw-overlay" onClick={e => e.target.className === "lw-overlay" && setSelected(null)}>
          <div className="lw-modal">
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ ...s.avatar, width:50, height:50, fontSize:20, borderRadius:14 }}>
                  {selected.user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p style={{ fontSize:15, fontWeight:600, color:"#fff", margin:0 }}>{selected.user?.name}</p>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"3px 0 0" }}>
                    📍 {selected.location?.area
                      ? `${selected.location.area}, ${selected.location.city}`
                      : selected.location?.city}
                  </p>
                </div>
              </div>
              <button style={s.closeBtn} onClick={() => setSelected(null)}>×</button>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
              {[
                { label:"Rate",   value:`PKR ${selected.hourlyRate}/hr`, color:"#6ee7b7" },
                { label:"Exp",    value:`${selected.experience} yrs`,    color:"#7dd3fc" },
                { label:"Rating", value:selected.rating ? `⭐ ${selected.rating}` : "New", color:"#fcd34d" },
              ].map(item => (
                <div key={item.label} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:"10px 12px" }}>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 4px" }}>{item.label}</p>
                  <p style={{ fontSize:13, fontWeight:600, color:item.color, margin:0 }}>{item.value}</p>
                </div>
              ))}
            </div>

            {selected.bio && (
              <div style={{ marginBottom:14 }}>
                <p style={s.sectionLabel}>About</p>
                <p style={{ fontSize:13, color:"rgba(255,255,255,0.6)", lineHeight:1.6, margin:0 }}>{selected.bio}</p>
              </div>
            )}

            {selected.skills?.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <p style={s.sectionLabel}>Skills</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {selected.skills.map(sk => <span key={sk} style={s.skillTag}>{sk}</span>)}
                </div>
              </div>
            )}

            <div style={{ display:"flex", gap:10 }}>
              <button style={{ ...s.profileBtn, flex:1 }} onClick={() => setSelected(null)}>Close</button>
              <button style={{ ...s.hireBtn, flex:2 }} onClick={() => { setSelected(null); openHire(selected); }}>
                🤝 Hire This Worker →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hire Modal */}
      {hiring && (
        <div className="lw-overlay" onClick={e => e.target.className === "lw-overlay" && setHiring(null)}>
          <div className="lw-modal">
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
              <div>
                <p style={{ fontSize:15, fontWeight:600, color:"#fff", margin:0 }}>🤝 Hire Worker</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:"4px 0 0" }}>
                  Select a job for {hiring.user?.name}
                </p>
              </div>
              <button style={s.closeBtn} onClick={() => setHiring(null)}>×</button>
            </div>

            {myJobs.length === 0 ? (
              <p style={{ fontSize:13, color:"rgba(255,255,255,0.4)", textAlign:"center", padding:20 }}>
                No open jobs. Post a job first.
              </p>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
                {myJobs.map(job => (
                  <div key={job._id}
                    style={{
                      padding:"12px 14px", borderRadius:10, cursor:"pointer", transition:"all .2s",
                      background: selectedJob === job._id ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.04)",
                      border:`1px solid ${selectedJob === job._id ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.08)"}`,
                    }}
                    onClick={() => setSelectedJob(job._id)}>
                    <p style={{ fontSize:13, fontWeight:500, color:"#fff", margin:"0 0 3px" }}>{job.title}</p>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>
                      📍 {job.location?.city} · PKR {job.budget?.toLocaleString()} · {job.paymentType}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display:"flex", gap:10 }}>
              <button style={{ ...s.profileBtn, flex:1 }} onClick={() => setHiring(null)}>Cancel</button>
              <button
                style={{ ...s.hireBtn, flex:2, opacity:(!selectedJob || hiringLoading) ? 0.5 : 1 }}
                onClick={handleHire} disabled={!selectedJob || hiringLoading}>
                {hiringLoading ? "Processing..." : "✅ Confirm Hire"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const s = {
  title:       { fontSize:"clamp(16px,4vw,20px)", fontWeight:600, color:"#fff", margin:0 },
  sub:         { fontSize:12, color:"rgba(255,255,255,0.35)", margin:"4px 0 0" },
  sectionCard: { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"clamp(14px,3vw,20px)", marginBottom:16 },
  sectionTitle:{ fontSize:14, fontWeight:500, color:"#fff", margin:0 },
  lbl:         { fontSize:11, color:"rgba(255,255,255,0.45)", marginBottom:5, margin:0 },
  inp:         { width:"100%", boxSizing:"border-box", padding:"9px 12px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:9, color:"#fff", fontSize:12, fontFamily:"inherit", outline:"none" },
  searchBtn:   { padding:"10px 20px", borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#4f46e5)", border:"none", color:"#fff", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" },
  resetBtn:    { padding:"10px 14px", borderRadius:10, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)", fontSize:12, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" },
  skipBtn:     { padding:"6px 12px", borderRadius:8, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(255,255,255,0.4)", fontSize:11, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" },
  workerCard:  { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"clamp(14px,3vw,18px)", transition:"border-color .2s" },
  avatar:      { width:42, height:42, borderRadius:12, background:"rgba(110,231,183,0.2)", border:"1px solid rgba(110,231,183,0.3)", color:"#6ee7b7", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:600, flexShrink:0 },
  locationPill:{ padding:"3px 9px", borderRadius:20, fontSize:10, background:"rgba(14,165,233,0.15)", color:"#7dd3fc", border:"1px solid rgba(14,165,233,0.25)" },
  skillTag:    { padding:"3px 9px", borderRadius:20, fontSize:11, background:"rgba(124,58,237,0.15)", color:"#c4b5fd", border:"1px solid rgba(124,58,237,0.25)" },
  profileBtn:  { padding:"7px 14px", borderRadius:9, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", fontSize:12, cursor:"pointer", fontFamily:"inherit" },
  hireBtn:     { flex:1, padding:"7px 14px", borderRadius:9, background:"linear-gradient(135deg,#059669,#10b981)", border:"none", color:"#fff", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit" },
  countBadge:  { background:"rgba(124,58,237,0.2)", border:"1px solid rgba(124,58,237,0.3)", borderRadius:20, padding:"4px 12px", fontSize:11, color:"#c4b5fd" },
  emptyCard:   { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:40, textAlign:"center" },
  loadText:    { color:"rgba(255,255,255,0.4)", fontSize:13, textAlign:"center", padding:40 },
  closeBtn:    { background:"none", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:22, padding:0, lineHeight:1 },
  sectionLabel:{ fontSize:10, color:"rgba(255,255,255,0.4)", margin:"0 0 8px", letterSpacing:0.5, fontWeight:500 },
  crumb:       { background:"none", border:"1px solid rgba(255,255,255,0.08)", borderRadius:20, padding:"4px 12px", fontSize:12, color:"rgba(255,255,255,0.5)", cursor:"pointer", fontFamily:"inherit" },
};
