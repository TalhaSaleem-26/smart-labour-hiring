import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

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

const CITIES = [
  "Karachi","Lahore","Islamabad","Rawalpindi","Faisalabad",
  "Multan","Peshawar","Quetta","Sialkot","Gujranwala",
];

const STEPS = ["Basic Info", "Requirements", "Location & Budget"];

export default function PostJob() {
  const navigate        = useNavigate();
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const [form, setForm] = useState({
    title:              "",
    description:        "",
    category:           "",
    skillsRequired:     [],
    experienceRequired: 0,
    jobType:            "one-time",
    paymentType:        "hourly",
    budget:             "",
    duration:           "",
    deadline:           "",
    location: { city:"", area:"", address:"" },
  });

  const update         = (field, value) => setForm(p => ({ ...p, [field]: value }));
  const updateLocation = (field, value) => setForm(p => ({ ...p, location: { ...p.location, [field]: value } }));

  const addSkill = () => {
    const sk = skillInput.trim();
    if (!sk) return;
    if (form.skillsRequired.includes(sk)) return toast.error("Already added.");
    if (form.skillsRequired.length >= 10) return toast.error("Max 10 skills.");
    update("skillsRequired", [...form.skillsRequired, sk]);
    setSkillInput("");
  };

  const removeSkill = skill =>
    update("skillsRequired", form.skillsRequired.filter(s => s !== skill));

  const validateStep = () => {
    if (step === 0) {
      if (!form.title.trim())       { toast.error("Job title is required.");     return false; }
      if (!form.description.trim()) { toast.error("Description is required.");   return false; }
      if (!form.category)           { toast.error("Please select a category.");  return false; }
    }
    if (step === 2) {
      if (!form.location.city)               { toast.error("Please select a city.");         return false; }
      if (!form.budget || form.budget <= 0)  { toast.error("Please enter a valid budget.");  return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setLoading(true);
    const tid = toast.loading("Posting your job...");
    try {
      await api.post("/api/job/create", form);
      toast.success("Job posted successfully! 🎉", { id: tid });
      navigate("/employer/jobs");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = CATEGORIES.find(c => c.value === form.category);

  // Completeness check for sidebar
  const checks = [
    { label:"Title",       done: !!form.title.trim() },
    { label:"Description", done: !!form.description.trim() },
    { label:"Category",    done: !!form.category },
    { label:"City",        done: !!form.location.city },
    { label:"Budget",      done: form.budget > 0 },
  ];
  const completePct = Math.round((checks.filter(c => c.done).length / checks.length) * 100);

  return (
    <>
      <style>{`
        .pj-page    { font-family:'DM Sans',sans-serif; padding-bottom:24px; }
        .pj-layout  { display:grid; grid-template-columns:1fr 300px; gap:20px; align-items:start; }
        .pj-left    { min-width:0; }
        .pj-right   { position:sticky; top:80px; display:flex; flex-direction:column; gap:12px; }
        .pj-steps   { display:flex; align-items:center; margin-bottom:24px; }
        .pj-2col    { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        .pj-catgrid { display:grid; grid-template-columns:repeat(5,1fr); gap:8px; margin-top:12px; }
        .pj-btns    { display:flex; gap:10px; margin-top:24px; }
        select option { background:#1a1a35; color:#fff; }

        @media(max-width:1100px) {
          .pj-layout { grid-template-columns:1fr 260px; }
        }
        @media(max-width:900px) {
          .pj-layout { grid-template-columns:1fr; }
          .pj-right  { position:static; flex-direction:row; flex-wrap:wrap; }
          .pj-right > * { flex:1; min-width:240px; }
        }
        @media(max-width:640px) {
          .pj-2col    { grid-template-columns:1fr; }
          .pj-catgrid { grid-template-columns:repeat(4,1fr); }
          .pj-right   { flex-direction:column; }
          .pj-right > * { min-width:unset; }
        }
        @media(max-width:420px) {
          .pj-catgrid { grid-template-columns:repeat(3,1fr); }
          .pj-btns    { flex-direction:column; }
        }
      `}</style>

      <div className="pj-page">

        {/* Header */}
        <div style={{ marginBottom:20 }}>
          <p style={s.title}>📝 Post a Job</p>
          <p style={s.sub}>Fill in the details to find the right worker</p>
        </div>

        {/* Step Progress */}
        <div className="pj-steps">
          {STEPS.map((label, i) => (
            <React.Fragment key={i}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>
                <div style={{
                  width:34, height:34, borderRadius:"50%",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:12, fontWeight:600,
                  background: i <= step ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "rgba(255,255,255,0.06)",
                  border: i <= step ? "none" : "1px solid rgba(255,255,255,0.1)",
                  color: i <= step ? "#fff" : "rgba(255,255,255,0.3)",
                }}>
                  {i < step ? "✓" : i + 1}
                </div>
                <p style={{ fontSize:10, margin:0, whiteSpace:"nowrap", color: i===step ? "#c4b5fd" : "rgba(255,255,255,0.3)" }}>
                  {label}
                </p>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex:1, height:2, margin:"0 8px", marginBottom:18, borderRadius:2,
                  background: i < step ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.08)" }}/>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* ── 2 Column Layout ── */}
        <div className="pj-layout">

          {/* ── LEFT — Form ── */}
          <div className="pj-left">
            <div style={s.card}>

              {/* STEP 0 */}
              {step === 0 && (
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div>
                    <p style={s.lbl}>Job Title <span style={s.req}>*</span></p>
                    <input style={s.inp}
                      placeholder="e.g. Need an experienced plumber for bathroom repair"
                      value={form.title}
                      onChange={e => update("title", e.target.value)}
                    />
                  </div>

                  <div>
                    <p style={s.lbl}>Description <span style={s.req}>*</span></p>
                    <textarea style={{ ...s.inp, height:120, resize:"none" }}
                      placeholder="Describe the job — what needs to be done, tools required, special instructions..."
                      value={form.description}
                      onChange={e => update("description", e.target.value)}
                    />
                    <p style={s.charCount}>{form.description.length}/2000</p>
                  </div>

                  <div>
                    <p style={s.lbl}>Category <span style={s.req}>*</span></p>
                    <div className="pj-catgrid">
                      {CATEGORIES.map(c => (
                        <div key={c.value}
                          style={{
                            padding:"10px 4px", borderRadius:10, cursor:"pointer",
                            textAlign:"center", transition:"all .2s",
                            background: form.category===c.value ? "rgba(124,58,237,0.25)" : "rgba(255,255,255,0.04)",
                            border:`1px solid ${form.category===c.value ? "rgba(124,58,237,0.65)" : "rgba(255,255,255,0.08)"}`,
                          }}
                          onClick={() => update("category", c.value)}>
                          <div style={{ fontSize:20, marginBottom:4 }}>{c.icon}</div>
                          <div style={{ fontSize:10, fontWeight:500, color: form.category===c.value ? "#c4b5fd" : "rgba(255,255,255,0.5)" }}>
                            {c.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pj-2col">
                    <div>
                      <p style={s.lbl}>Job Type</p>
                      <select style={{ ...s.inp, appearance:"none", WebkitAppearance:"none" }}
                        value={form.jobType} onChange={e => update("jobType", e.target.value)}>
                        <option value="one-time">One Time</option>
                        <option value="full-time">Full Time</option>
                        <option value="part-time">Part Time</option>
                        <option value="contract">Contract</option>
                      </select>
                    </div>
                    <div>
                      <p style={s.lbl}>Duration <span style={s.opt}>(Optional)</span></p>
                      <input style={s.inp} placeholder="e.g. 2 days, 1 week"
                        value={form.duration} onChange={e => update("duration", e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 1 */}
              {step === 1 && (
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div>
                    <p style={s.lbl}>Required Skills <span style={s.opt}>(Optional)</span></p>
                    <div style={{ display:"flex", gap:8, marginBottom:10 }}>
                      <input style={{ ...s.inp, flex:1 }}
                        placeholder="Add a skill & press Enter..."
                        value={skillInput}
                        onChange={e => setSkillInput(e.target.value)}
                        onKeyDown={e => e.key==="Enter" && (e.preventDefault(), addSkill())}
                      />
                      <button style={s.addBtn} onClick={addSkill}>+ Add</button>
                    </div>
                    {form.skillsRequired.length > 0 && (
                      <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
                        {form.skillsRequired.map(sk => (
                          <div key={sk} style={s.tag}>
                            <span>{sk}</span>
                            <button style={s.tagX} onClick={() => removeSkill(sk)}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pj-2col">
                    <div>
                      <p style={s.lbl}>Experience Required (years)</p>
                      <input style={s.inp} type="number" min={0} max={50}
                        value={form.experienceRequired}
                        onChange={e => update("experienceRequired", Number(e.target.value))} />
                    </div>
                    <div>
                      <p style={s.lbl}>Application Deadline <span style={s.opt}>(Optional)</span></p>
                      <input style={s.inp} type="date"
                        value={form.deadline}
                        onChange={e => update("deadline", e.target.value)}
                        min={new Date().toISOString().split("T")[0]} />
                    </div>
                  </div>

                  {/* Mini Preview inside step */}
                  <div style={s.previewCard}>
                    <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"0 0 8px" }}>📋 So far</p>
                    <p style={{ fontSize:13, fontWeight:600, color:"#fff", margin:"0 0 6px" }}>{form.title}</p>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                      {form.category && <span style={s.tag}>{selectedCategory?.icon} {form.category}</span>}
                      {form.jobType  && <span style={s.tag}>{form.jobType}</span>}
                      {form.experienceRequired > 0 && <span style={s.tag}>{form.experienceRequired} yrs exp</span>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                  <div className="pj-2col">
                    <div>
                      <p style={s.lbl}>City <span style={s.req}>*</span></p>
                      <select style={{ ...s.inp, appearance:"none", WebkitAppearance:"none" }}
                        value={form.location.city} onChange={e => updateLocation("city", e.target.value)}>
                        <option value="">Select city</option>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <p style={s.lbl}>Area <span style={s.opt}>(Optional)</span></p>
                      <input style={s.inp} placeholder="e.g. DHA, Gulshan, F-10"
                        value={form.location.area} onChange={e => updateLocation("area", e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <p style={s.lbl}>Full Address <span style={s.opt}>(Optional)</span></p>
                    <input style={s.inp} placeholder="Street, Block, House No."
                      value={form.location.address} onChange={e => updateLocation("address", e.target.value)} />
                  </div>

                  <div className="pj-2col">
                    <div>
                      <p style={s.lbl}>Budget (PKR) <span style={s.req}>*</span></p>
                      <input style={s.inp} type="number" min={1} placeholder="e.g. 2000"
                        value={form.budget} onChange={e => update("budget", Number(e.target.value))} />
                    </div>
                    <div>
                      <p style={s.lbl}>Payment Type</p>
                      <select style={{ ...s.inp, appearance:"none", WebkitAppearance:"none" }}
                        value={form.paymentType} onChange={e => update("paymentType", e.target.value)}>
                        <option value="hourly">Hourly</option>
                        <option value="fixed">Fixed</option>
                        <option value="daily">Daily</option>
                      </select>
                    </div>
                  </div>

                  {form.budget > 0 && (
                    <div style={s.previewCard}>
                      <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"0 0 8px" }}>💰 Payment Summary</p>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <p style={{ fontSize:22, fontWeight:600, color:"#6ee7b7", margin:0 }}>
                            PKR {Number(form.budget).toLocaleString()}
                          </p>
                          <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"4px 0 0" }}>
                            {form.paymentType} rate · {form.location.city || "City not selected"}
                          </p>
                        </div>
                        <span style={{ fontSize:30 }}>💵</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Nav Buttons */}
              <div className="pj-btns">
                {step > 0 && (
                  <button style={s.backBtn} onClick={() => setStep(p => p-1)}>← Back</button>
                )}
                {step < STEPS.length - 1 ? (
                  <button style={s.nextBtn} onClick={() => validateStep() && setStep(p => p+1)}>
                    Next →
                  </button>
                ) : (
                  <button style={{ ...s.submitBtn, opacity: loading ? 0.65 : 1 }}
                    onClick={handleSubmit} disabled={loading}>
                    {loading ? "Posting..." : "🚀 Post Job →"}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT — Sidebar ── */}
          <div className="pj-right">

            {/* Live Preview Card */}
            <div style={s.card}>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"0 0 14px", fontWeight:500, letterSpacing:0.5 }}>
                👁️ LIVE PREVIEW
              </p>

              {/* Category Icon + Title */}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <div style={{
                  width:44, height:44, borderRadius:12, flexShrink:0,
                  background:"rgba(124,58,237,0.2)", border:"1px solid rgba(124,58,237,0.3)",
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:22,
                }}>
                  {selectedCategory?.icon || "💼"}
                </div>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, color: form.title ? "#fff" : "rgba(255,255,255,0.25)", margin:0, lineHeight:1.3, wordBreak:"break-word" }}>
                    {form.title || "Job title will appear here"}
                  </p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"3px 0 0", textTransform:"capitalize" }}>
                    {form.category || "Category"}
                  </p>
                </div>
              </div>

              {/* Budget */}
              {form.budget > 0 ? (
                <div style={{ marginBottom:10 }}>
                  <p style={{ fontSize:18, fontWeight:600, color:"#6ee7b7", margin:"0 0 2px" }}>
                    PKR {Number(form.budget).toLocaleString()}
                  </p>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 }}>
                    {form.paymentType} rate
                  </p>
                </div>
              ) : (
                <div style={{ marginBottom:10 }}>
                  <p style={{ fontSize:14, color:"rgba(255,255,255,0.2)", margin:0 }}>Budget not set</p>
                </div>
              )}

              {/* Location */}
              {form.location.city && (
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", margin:"0 0 10px" }}>
                  📍 {form.location.city}{form.location.area ? `, ${form.location.area}` : ""}
                </p>
              )}

              {/* Badges */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
                {form.jobType  && <span style={s.tag}>{form.jobType}</span>}
                {form.duration && <span style={s.tag}>⏱ {form.duration}</span>}
                {form.experienceRequired > 0 && <span style={s.tag}>{form.experienceRequired} yrs exp</span>}
                {form.deadline && <span style={s.tag}>📅 {new Date(form.deadline).toLocaleDateString()}</span>}
              </div>

              {/* Skills */}
              {form.skillsRequired.length > 0 && (
                <div style={{ marginBottom:10 }}>
                  <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", margin:"0 0 6px", letterSpacing:0.4 }}>REQUIRED SKILLS</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
                    {form.skillsRequired.map(sk => (
                      <span key={sk} style={{ ...s.tag, fontSize:10 }}>{sk}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description snippet */}
              {form.description && (
                <div style={{ marginTop:8, padding:"10px 12px", background:"rgba(255,255,255,0.03)", borderRadius:9, borderLeft:"2px solid rgba(124,58,237,0.4)" }}>
                  <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0, lineHeight:1.6 }}>
                    {form.description.slice(0, 100)}{form.description.length > 100 ? "..." : ""}
                  </p>
                </div>
              )}
            </div>

            {/* Completeness Card */}
            <div style={s.card}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0, fontWeight:500, letterSpacing:0.5 }}>
                  📊 COMPLETENESS
                </p>
                <span style={{ fontSize:13, fontWeight:600, color: completePct === 100 ? "#6ee7b7" : "#c4b5fd" }}>
                  {completePct}%
                </span>
              </div>

              {/* Progress Bar */}
              <div style={{ height:5, background:"rgba(255,255,255,0.07)", borderRadius:4, overflow:"hidden", marginBottom:12 }}>
                <div style={{
                  height:"100%", borderRadius:4,
                  width:`${completePct}%`,
                  background: completePct === 100
                    ? "linear-gradient(90deg,#059669,#10b981)"
                    : "linear-gradient(90deg,#7c3aed,#4f46e5)",
                  transition:"width .4s ease",
                }}/>
              </div>

              {/* Checklist */}
              <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                {checks.map(item => (
                  <div key={item.label} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>{item.label}</span>
                    <span style={{ fontSize:11, fontWeight:500, color: item.done ? "#6ee7b7" : "rgba(255,255,255,0.25)" }}>
                      {item.done ? "✓ Done" : "○ Empty"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps Guide */}
            <div style={s.card}>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:"0 0 12px", fontWeight:500, letterSpacing:0.5 }}>
                📌 STEPS
              </p>
              {STEPS.map((label, i) => (
                <div key={i} style={{
                  display:"flex", alignItems:"center", gap:10,
                  padding:"8px 0",
                  borderBottom: i < STEPS.length-1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}>
                  <div style={{
                    width:22, height:22, borderRadius:"50%", flexShrink:0,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:10, fontWeight:600,
                    background: i < step
                      ? "rgba(110,231,183,0.2)"
                      : i === step
                      ? "rgba(124,58,237,0.3)"
                      : "rgba(255,255,255,0.06)",
                    color: i < step ? "#6ee7b7" : i === step ? "#c4b5fd" : "rgba(255,255,255,0.3)",
                  }}>
                    {i < step ? "✓" : i + 1}
                  </div>
                  <p style={{
                    fontSize:12, margin:0,
                    color: i === step ? "#c4b5fd" : i < step ? "#6ee7b7" : "rgba(255,255,255,0.35)",
                    fontWeight: i === step ? 500 : 400,
                  }}>
                    {label}
                  </p>
                  {i === step && (
                    <span style={{ marginLeft:"auto", fontSize:10, color:"rgba(124,58,237,0.8)" }}>← Current</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

const s = {
  title:      { fontFamily:"'Sora',sans-serif", fontSize:"clamp(16px,4vw,20px)", fontWeight:600, color:"#fff", margin:0 },
  sub:        { fontSize:12, color:"rgba(255,255,255,0.35)", margin:"4px 0 0" },
  card:       { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"clamp(14px,3vw,20px)" },
  lbl:        { fontSize:11, color:"rgba(255,255,255,0.48)", marginBottom:5, letterSpacing:0.4 },
  req:        { color:"#f87171" },
  opt:        { color:"rgba(255,255,255,0.25)", fontSize:10 },
  inp:        { width:"100%", boxSizing:"border-box", padding:"10px 12px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, color:"#fff", fontSize:13, fontFamily:"inherit", outline:"none" },
  charCount:  { fontSize:10, color:"rgba(255,255,255,0.25)", textAlign:"right", margin:"4px 0 0" },
  addBtn:     { padding:"10px 16px", background:"rgba(124,58,237,0.3)", border:"1px solid rgba(124,58,237,0.5)", borderRadius:10, color:"#c4b5fd", cursor:"pointer", fontSize:13, fontFamily:"inherit", whiteSpace:"nowrap", flexShrink:0 },
  tag:        { display:"inline-flex", alignItems:"center", gap:6, background:"rgba(124,58,237,0.2)", border:"1px solid rgba(124,58,237,0.4)", borderRadius:20, padding:"3px 10px", fontSize:11, color:"#c4b5fd" },
  tagX:       { background:"none", border:"none", color:"#c4b5fd", cursor:"pointer", fontSize:16, padding:0, lineHeight:1 },
  previewCard:{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"14px 16px" },
  backBtn:    { flex:1, padding:11, borderRadius:11, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", fontSize:13, fontFamily:"inherit", cursor:"pointer" },
  nextBtn:    { flex:1, padding:11, borderRadius:11, background:"linear-gradient(135deg,#7c3aed,#4f46e5)", border:"none", color:"#fff", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer" },
  submitBtn:  { flex:1, padding:11, borderRadius:11, background:"linear-gradient(135deg,#059669,#10b981)", border:"none", color:"#fff", fontSize:13, fontWeight:500, fontFamily:"inherit", cursor:"pointer" },
};