/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

const CATEGORIES = [
  { value:"plumber",     icon:"🔧", label:"Plumber" },
  { value:"electrician", icon:"⚡", label:"Electrician" },
  { value:"painter",     icon:"🎨", label:"Painter" },
  { value:"cleaner",     icon:"🧹", label:"Cleaner" },
  { value:"carpenter",   icon:"🪚", label:"Carpenter" },
  { value:"welder",      icon:"🔩", label:"Welder" },
  { value:"mason",       icon:"🧱", label:"Mason" },
  { value:"driver",      icon:"🚗", label:"Driver" },
  { value:"gardener",    icon:"🌿", label:"Gardener" },
  { value:"other",       icon:"💼", label:"Other" },
];

const DAYS = [
  { value:"monday",    label:"Mon" },
  { value:"tuesday",   label:"Tue" },
  { value:"wednesday", label:"Wed" },
  { value:"thursday",  label:"Thu" },
  { value:"friday",    label:"Fri" },
  { value:"saturday",  label:"Sat" },
  { value:"sunday",    label:"Sun" },
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

export default function WorkerProfile() {
  const [profile,    setProfile]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [form,       setForm]       = useState(null);
  const [areaTab,    setAreaTab]    = useState(false); // toggle service areas panel

  useEffect(() => {
    // Try both endpoints — use whichever your backend has
    api.get("/api/worker/me")
      .then(res => { setProfile(res.data.worker); setForm(res.data.worker); })
      .catch(() =>
        api.get("/api/worker/my-profile")
          .then(res => { setProfile(res.data.worker); setForm(res.data.worker); })
          .catch(() => setProfile(null))
      )
      .finally(() => setLoading(false));
  }, []);

  const update             = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const updateLocation     = (f, v) => setForm(p => ({ ...p, location: { ...p.location, [f]: v } }));
  const updateAvailability = (f, v) => setForm(p => ({ ...p, availability: { ...p.availability, [f]: v } }));

  const addSkill = () => {
    const sk = skillInput.trim();
    if (!sk) return;
    if (form.skills?.includes(sk)) return toast.error("Already added.");
    if (form.skills?.length >= 10) return toast.error("Max 10 skills.");
    update("skills", [...(form.skills || []), sk]);
    setSkillInput("");
  };

  const removeSkill = skill => update("skills", form.skills.filter(s => s !== skill));

  const toggleDay = day => {
    const days = form.availability?.days || [];
    updateAvailability("days", days.includes(day) ? days.filter(d => d !== day) : [...days, day]);
  };

  // Service area toggle
  const toggleArea = (area) => {
    const current = form.serviceAreas || [];
    update("serviceAreas", current.includes(area)
      ? current.filter(a => a !== area)
      : [...current, area]);
  };

  const toggleAllAreas = () => {
    const cityAreas = CITY_AREAS[form?.location?.city] || [];
    const allSelected = cityAreas.every(a => (form.serviceAreas || []).includes(a));
    update("serviceAreas", allSelected ? [] : cityAreas);
  };

  // When city changes, reset service areas
  const handleCityChange = (city) => {
    updateLocation("city", city);
    update("serviceAreas", []);
  };

  const handleSave = async () => {
    if ((form.serviceAreas || []).length === 0)
      return toast.error("Select at least one service area.");
    setSaving(true);
    const tid = toast.loading("Saving profile...");
    try {
      // Try both update endpoints
      await api.put("/api/worker/update", form)
        .catch(() => api.put("/api/worker/update-profile", form));
      toast.success("Profile updated!", { id: tid });
      setProfile(form);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.", { id: tid });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, padding:40, textAlign:"center" }}>
      Loading profile...
    </p>
  );

  if (!profile) return (
    <div style={{ textAlign:"center", padding:40 }}>
      <span style={{ fontSize:40 }}>👷</span>
      <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, margin:"12px 0 16px" }}>No profile found.</p>
      <a href="/worker/register" style={{ color:"#a78bfa", fontSize:13 }}>Create Profile →</a>
    </div>
  );

  const cityAreas   = CITY_AREAS[form?.location?.city] || [];
  const allSelected = cityAreas.length > 0 && cityAreas.every(a => (form?.serviceAreas || []).includes(a));
  const areaCount   = (form?.serviceAreas || []).length;

  const completenessChecks = [
    !!form?.title,
    !!form?.category,
    (form?.skills?.length || 0) > 0,
    form?.hourlyRate > 0,
    !!form?.location?.city,
    (form?.serviceAreas?.length || 0) > 0,
    (form?.availability?.days?.length || 0) > 0,
  ];
  const donePct = Math.round((completenessChecks.filter(Boolean).length / completenessChecks.length) * 100);

  return (
    <>
      <style>{`
        .wp-page    { font-family:'DM Sans',sans-serif; padding-bottom:32px; }
        .wp-layout  { display:grid; grid-template-columns:1fr 340px; gap:16px; align-items:start; }
        .wp-left    { display:flex; flex-direction:column; gap:14px; }
        .wp-right   { display:flex; flex-direction:column; gap:14px; position:sticky; top:80px; }
        .wp-2col    { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .wp-catgrid { display:grid; grid-template-columns:repeat(5,1fr); gap:8px; margin-top:14px; }
        .wp-areagrid{ display:grid; grid-template-columns:repeat(auto-fill,minmax(130px,1fr)); gap:8px; margin-top:12px; }
        .wp-area-chip:hover { border-color:rgba(14,165,233,0.5) !important; }
        select option { background:#1a1a35; color:#fff; }
        @media(max-width:1024px){
          .wp-layout { grid-template-columns:1fr; }
          .wp-right  { position:static; }
        }
        @media(max-width:580px){
          .wp-2col    { grid-template-columns:1fr; }
          .wp-catgrid { grid-template-columns:repeat(4,1fr); }
          .wp-areagrid{ grid-template-columns:repeat(3,1fr); }
        }
        @media(max-width:400px){
          .wp-catgrid  { grid-template-columns:repeat(3,1fr); }
          .wp-areagrid { grid-template-columns:repeat(2,1fr); }
        }
      `}</style>

      <div className="wp-page">

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:10 }}>
          <div>
            <p style={s.title}>👤 My Profile</p>
            <p style={s.sub}>Update your worker profile information</p>
          </div>
          <div style={{
            padding:"5px 14px", borderRadius:20, fontSize:12, fontWeight:500,
            background: profile.status==="approved" ? "rgba(110,231,183,0.15)" : "rgba(252,211,77,0.15)",
            color:      profile.status==="approved" ? "#6ee7b7" : "#fcd34d",
            border:     `1px solid ${profile.status==="approved" ? "rgba(110,231,183,0.3)" : "rgba(252,211,77,0.3)"}`,
          }}>
            {profile.status==="approved" ? "✅ Approved" : "⏳ Pending Review"}
          </div>
        </div>

        <div className="wp-layout">

          {/* ── LEFT ── */}
          <div className="wp-left">

            {/* Basic Info */}
            <div style={s.card}>
              <p style={s.cardTitle}>📝 Basic Information</p>
              <div style={{ marginTop:14, display:"flex", flexDirection:"column", gap:12 }}>
                <div>
                  <p style={s.lbl}>Professional Title</p>
                  <input style={s.inp} placeholder="e.g. Expert Plumber with 5 years experience"
                    value={form?.title || ""} onChange={e => update("title", e.target.value)} />
                </div>
                <div>
                  <p style={s.lbl}>Bio <span style={s.opt}>(Optional)</span></p>
                  <textarea style={{ ...s.inp, height:90, resize:"none" }}
                    placeholder="Tell employers about yourself..."
                    value={form?.bio || ""} onChange={e => update("bio", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Category */}
            <div style={s.card}>
              <p style={s.cardTitle}>🔧 Category</p>
              <div className="wp-catgrid">
                {CATEGORIES.map(c => (
                  <div key={c.value}
                    style={{
                      padding:"10px 4px", borderRadius:10, cursor:"pointer",
                      textAlign:"center", transition:"all .2s",
                      background: form?.category===c.value ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.04)",
                      border:`1px solid ${form?.category===c.value ? "rgba(124,58,237,0.65)" : "rgba(255,255,255,0.08)"}`,
                    }}
                    onClick={() => update("category", c.value)}>
                    <div style={{ fontSize:20, marginBottom:4 }}>{c.icon}</div>
                    <div style={{ fontSize:10, fontWeight:500, color: form?.category===c.value ? "#c4b5fd" : "rgba(255,255,255,0.5)" }}>
                      {c.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills & Rate */}
            <div style={s.card}>
              <p style={s.cardTitle}>🛠️ Skills & Rate</p>
              <div style={{ marginTop:14, display:"flex", flexDirection:"column", gap:12 }}>
                <div>
                  <p style={s.lbl}>Skills</p>
                  <div style={{ display:"flex", gap:8 }}>
                    <input style={{ ...s.inp, flex:1 }}
                      placeholder="Add a skill & press Enter..."
                      value={skillInput} onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={e => e.key==="Enter" && (e.preventDefault(), addSkill())} />
                    <button style={s.addBtn} onClick={addSkill}>+ Add</button>
                  </div>
                  {form?.skills?.length > 0 && (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginTop:10 }}>
                      {form.skills.map(sk => (
                        <div key={sk} style={s.tag}>
                          <span>{sk}</span>
                          <button style={s.tagX} onClick={() => removeSkill(sk)}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="wp-2col">
                  <div>
                    <p style={s.lbl}>Experience (years)</p>
                    <input style={s.inp} type="number" min={0} max={50}
                      value={form?.experience || 0} onChange={e => update("experience", Number(e.target.value))} />
                  </div>
                  <div>
                    <p style={s.lbl}>Hourly Rate (PKR)</p>
                    <input style={s.inp} type="number" min={1}
                      value={form?.hourlyRate || ""} onChange={e => update("hourlyRate", Number(e.target.value))} />
                  </div>
                </div>
                <div>
                  <p style={s.lbl}>CNIC <span style={s.opt}>(Optional — 00000-0000000-0)</span></p>
                  <input style={s.inp} placeholder="00000-0000000-0"
                    value={form?.cnic || ""} onChange={e => update("cnic", e.target.value)} />
                </div>
              </div>
            </div>

            {/* Location + Service Areas */}
            <div style={s.card}>
              <p style={s.cardTitle}>📍 Location & Service Areas</p>
              <div style={{ marginTop:14, display:"flex", flexDirection:"column", gap:12 }}>
                <div>
                  <p style={s.lbl}>City</p>
                  <select style={{ ...s.inp, appearance:"none", WebkitAppearance:"none" }}
                    value={form?.location?.city || ""}
                    onChange={e => handleCityChange(e.target.value)}>
                    <option value="">Select city</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <p style={s.lbl}>Full Address <span style={s.opt}>(Optional)</span></p>
                  <input style={s.inp} placeholder="Street, Block, House No."
                    value={form?.location?.address || ""} onChange={e => updateLocation("address", e.target.value)} />
                </div>

                {/* ── Service Areas ── */}
                {form?.location?.city && (
                  <div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                      <div>
                        <p style={{ ...s.lbl, marginBottom:2 }}>
                          Areas You Can Work In
                          {areaCount > 0 && (
                            <span style={s.areaBadge}> ✓ {areaCount} selected</span>
                          )}
                        </p>
                        <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)", margin:0 }}>
                          Select all areas in {form.location.city} where you're available
                        </p>
                      </div>
                      <button style={s.selectAllBtn} onClick={toggleAllAreas}>
                        {allSelected ? "Deselect All" : "Select All"}
                      </button>
                    </div>
                    <div className="wp-areagrid">
                      {cityAreas.map(area => {
                        const active = (form.serviceAreas || []).includes(area);
                        return (
                          <div key={area} className="wp-area-chip"
                            style={{
                              display:"flex", alignItems:"center", gap:6,
                              padding:"9px 12px", borderRadius:10, cursor:"pointer",
                              fontSize:12, fontWeight:500, transition:"all .2s",
                              background: active ? "rgba(14,165,233,0.2)"  : "rgba(255,255,255,0.04)",
                              border:`1px solid ${active ? "rgba(14,165,233,0.55)" : "rgba(255,255,255,0.08)"}`,
                              color: active ? "#7dd3fc" : "rgba(255,255,255,0.5)",
                            }}
                            onClick={() => toggleArea(area)}>
                            <span style={{ fontSize:11 }}>{active ? "✓" : "+"}</span>
                            {area}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Availability */}
            <div style={s.card}>
              <p style={s.cardTitle}>📅 Availability</p>
              <div style={{ marginTop:14 }}>
                <p style={s.lbl}>Available Days</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:14 }}>
                  {DAYS.map(d => (
                    <div key={d.value}
                      style={{
                        padding:"8px 14px", borderRadius:8, cursor:"pointer",
                        fontSize:12, fontWeight:500, transition:"all .2s",
                        background: form?.availability?.days?.includes(d.value) ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.05)",
                        border:`1px solid ${form?.availability?.days?.includes(d.value) ? "rgba(124,58,237,0.65)" : "rgba(255,255,255,0.1)"}`,
                        color: form?.availability?.days?.includes(d.value) ? "#c4b5fd" : "rgba(255,255,255,0.45)",
                      }}
                      onClick={() => toggleDay(d.value)}>
                      {d.label}
                    </div>
                  ))}
                </div>
                <div className="wp-2col">
                  <div>
                    <p style={s.lbl}>Start Time</p>
                    <input style={s.inp} type="time"
                      value={form?.availability?.startTime || "09:00"}
                      onChange={e => updateAvailability("startTime", e.target.value)} />
                  </div>
                  <div>
                    <p style={s.lbl}>End Time</p>
                    <input style={s.inp} type="time"
                      value={form?.availability?.endTime || "18:00"}
                      onChange={e => updateAvailability("endTime", e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT ── */}
          <div className="wp-right">

            {/* Profile Preview */}
            <div style={s.card}>
              <p style={s.cardTitle}>👁️ Profile Preview</p>
              <div style={{ marginTop:14, textAlign:"center" }}>
                <div style={{
                  width:64, height:64, borderRadius:18,
                  background:"rgba(14,165,233,0.2)", border:"1px solid rgba(14,165,233,0.3)",
                  color:"#7dd3fc", display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:26, fontWeight:600, margin:"0 auto 12px",
                }}>
                  {form?.title?.charAt(0)?.toUpperCase() || "W"}
                </div>
                <p style={{ fontSize:14, fontWeight:600, color:"#fff", margin:"0 0 4px" }}>
                  {form?.title || "Your Title"}
                </p>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"0 0 4px" }}>
                  📍 {form?.location?.city || "City"}
                </p>
                {(form?.serviceAreas || []).length > 0 && (
                  <p style={{ fontSize:10, color:"rgba(14,165,233,0.7)", margin:"0 0 10px" }}>
                    Covers: {(form.serviceAreas || []).slice(0,3).join(", ")}
                    {(form.serviceAreas || []).length > 3 && ` +${form.serviceAreas.length - 3} more`}
                  </p>
                )}
                <div style={{ display:"flex", justifyContent:"center", gap:6, flexWrap:"wrap", marginBottom:12 }}>
                  {form?.skills?.slice(0,4).map(sk => (
                    <span key={sk} style={s.tag}>{sk}</span>
                  ))}
                </div>
                <div style={{ display:"flex", justifyContent:"space-around", padding:"12px 0", borderTop:"1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ textAlign:"center" }}>
                    <p style={{ fontSize:16, fontWeight:600, color:"#6ee7b7", margin:0 }}>PKR {form?.hourlyRate || 0}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>per hour</p>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <p style={{ fontSize:16, fontWeight:600, color:"#7dd3fc", margin:0 }}>{form?.experience || 0} yrs</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>experience</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Completeness */}
            <div style={s.card}>
              <p style={s.cardTitle}>📊 Profile Completeness</p>
              <div style={{ marginTop:14, display:"flex", flexDirection:"column", gap:10 }}>
                {[
                  { label:"Title",         done: !!form?.title },
                  { label:"Category",      done: !!form?.category },
                  { label:"Skills",        done: (form?.skills?.length || 0) > 0 },
                  { label:"Hourly Rate",   done: (form?.hourlyRate || 0) > 0 },
                  { label:"City",          done: !!form?.location?.city },
                  { label:"Service Areas", done: (form?.serviceAreas?.length || 0) > 0 },
                  { label:"Availability",  done: (form?.availability?.days?.length || 0) > 0 },
                ].map(item => (
                  <div key={item.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.55)" }}>{item.label}</span>
                    <span style={{ fontSize:11, fontWeight:500, color: item.done ? "#6ee7b7" : "#f87171" }}>
                      {item.done ? "✓ Done" : "✕ Missing"}
                    </span>
                  </div>
                ))}
                <div style={{ marginTop:6 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>Overall</span>
                    <span style={{ fontSize:11, color:"#c4b5fd", fontWeight:600 }}>{donePct}%</span>
                  </div>
                  <div style={{ height:6, background:"rgba(255,255,255,0.07)", borderRadius:4, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${donePct}%`, borderRadius:4, background:"linear-gradient(90deg,#7c3aed,#4f46e5)", transition:"width .5s ease" }}/>
                  </div>
                </div>
              </div>
            </div>

            {/* Save */}
            <button style={{ ...s.saveBtn, opacity: saving ? 0.65 : 1 }}
              onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "💾 Save Changes →"}
            </button>

            {/* Status */}
            <div style={{
              ...s.card,
              background: profile.status==="approved" ? "rgba(110,231,183,0.06)" : "rgba(252,211,77,0.06)",
              border:`1px solid ${profile.status==="approved" ? "rgba(110,231,183,0.2)" : "rgba(252,211,77,0.2)"}`,
            }}>
              <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", margin:"0 0 6px" }}>Account Status</p>
              <p style={{ fontSize:13, fontWeight:500, color: profile.status==="approved" ? "#6ee7b7" : "#fcd34d", margin:0 }}>
                {profile.status==="approved"
                  ? "✅ Your profile is visible to employers"
                  : "⏳ Admin is reviewing your profile"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const s = {
  title:        { fontSize:"clamp(16px,4vw,20px)", fontWeight:600, color:"#fff", margin:0 },
  sub:          { fontSize:12, color:"rgba(255,255,255,0.35)", margin:"4px 0 0" },
  card:         { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"clamp(14px,3vw,20px)" },
  cardTitle:    { fontSize:14, fontWeight:500, color:"#fff", margin:"0 0 2px" },
  lbl:          { fontSize:11, color:"rgba(255,255,255,0.48)", marginBottom:5, letterSpacing:0.4 },
  opt:          { color:"rgba(255,255,255,0.25)", fontSize:10 },
  inp:          { width:"100%", boxSizing:"border-box", padding:"10px 12px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, color:"#fff", fontSize:13, fontFamily:"inherit", outline:"none" },
  addBtn:       { padding:"10px 16px", background:"rgba(124,58,237,0.3)", border:"1px solid rgba(124,58,237,0.5)", borderRadius:10, color:"#c4b5fd", cursor:"pointer", fontSize:13, fontFamily:"inherit", whiteSpace:"nowrap", flexShrink:0 },
  tag:          { display:"inline-flex", alignItems:"center", gap:6, background:"rgba(124,58,237,0.2)", border:"1px solid rgba(124,58,237,0.4)", borderRadius:20, padding:"3px 10px", fontSize:11, color:"#c4b5fd" },
  tagX:         { background:"none", border:"none", color:"#c4b5fd", cursor:"pointer", fontSize:16, padding:0, lineHeight:1 },
  selectAllBtn: { padding:"5px 12px", borderRadius:8, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.45)", fontSize:11, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" },
  areaBadge:    { display:"inline-block", marginLeft:6, padding:"2px 8px", borderRadius:20, fontSize:10, background:"rgba(14,165,233,0.15)", color:"#7dd3fc", border:"1px solid rgba(14,165,233,0.25)" },
  saveBtn:      { width:"100%", padding:13, borderRadius:12, background:"linear-gradient(135deg,#7c3aed,#4f46e5)", border:"none", color:"#fff", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer" },
};