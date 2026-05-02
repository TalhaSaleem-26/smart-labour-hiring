import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

const CATEGORIES = [
  { value: "plumber",     icon: "🔧", label: "Plumber" },
  { value: "electrician", icon: "⚡", label: "Electrician" },
  { value: "painter",     icon: "🎨", label: "Painter" },
  { value: "cleaner",     icon: "🧹", label: "Cleaner" },
  { value: "carpenter",   icon: "🪚", label: "Carpenter" },
  { value: "welder",      icon: "🔩", label: "Welder" },
  { value: "mason",       icon: "🧱", label: "Mason" },
  { value: "driver",      icon: "🚗", label: "Driver" },
  { value: "gardener",    icon: "🌿", label: "Gardener" },
  { value: "other",       icon: "💼", label: "Other" },
];

const DAYS = [
  { value: "monday",    label: "Mon" },
  { value: "tuesday",   label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday",  label: "Thu" },
  { value: "friday",    label: "Fri" },
  { value: "saturday",  label: "Sat" },
  { value: "sunday",    label: "Sun" },
];

const CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad",
  "Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala",
];

const STEPS = ["Basic Info", "Skills & Rate", "Location & Availability"];

export default function WorkerRegistration() {
  const navigate = useNavigate();
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const [form, setForm] = useState({
    title:        "",
    bio:          "",
    category:     "",
    skills:       [],
    experience:   0,
    hourlyRate:   "",
    cnic:         "",
    location: {
      city:    "",
      area:    "",
      address: "",
    },
    availability: {
      days:      [],
      startTime: "09:00",
      endTime:   "18:00",
    },
  });

  const update = (field, value) =>
    setForm(p => ({ ...p, [field]: value }));

  const updateLocation = (field, value) =>
    setForm(p => ({ ...p, location: { ...p.location, [field]: value } }));

  const updateAvailability = (field, value) =>
    setForm(p => ({ ...p, availability: { ...p.availability, [field]: value } }));

  // Add skill
  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;
    if (form.skills.includes(s)) return toast.error("Skill already added.");
    if (form.skills.length >= 10) return toast.error("Max 10 skills.");
    update("skills", [...form.skills, s]);
    setSkillInput("");
  };

  const removeSkill = (skill) =>
    update("skills", form.skills.filter(s => s !== skill));

  const toggleDay = (day) => {
    const days = form.availability.days.includes(day)
      ? form.availability.days.filter(d => d !== day)
      : [...form.availability.days, day];
    updateAvailability("days", days);
  };

  // Step validation
  const validateStep = () => {
    if (step === 0) {
      if (!form.category) return toast.error("Please select a category.");
      if (!form.title.trim()) return toast.error("Please enter a title.");
    }
    if (step === 1) {
      if (form.skills.length === 0) return toast.error("Add at least one skill.");
      if (!form.hourlyRate || form.hourlyRate <= 0) return toast.error("Enter a valid hourly rate.");
    }
    if (step === 2) {
      if (!form.location.city) return toast.error("Please select your city.");
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep() !== true) return;
    setStep(p => p + 1);
  };

  const prevStep = () => setStep(p => p - 1);

  const handleSubmit = async () => {
    if (validateStep() !== true) return;
    setLoading(true);
    const tid = toast.loading("Creating your profile...");
    try {
      await api.post("/api/worker/register", form);
      toast.success("Profile created! Pending admin approval. 🎉", { id: tid });
      navigate("/worker/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.", { id: tid });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <p style={s.h1}>Complete Your Worker Profile</p>
        <p style={s.sub}>Fill in your details to start receiving job offers</p>
      </div>

      {/* Progress Steps */}
      <div style={s.stepRow}>
        {STEPS.map((label, i) => (
          <React.Fragment key={i}>
            <div style={s.stepItem}>
              <div style={{
                ...s.stepCircle,
                background: i <= step
                  ? "linear-gradient(135deg,#7c3aed,#4f46e5)"
                  : "rgba(255,255,255,0.06)",
                border: i <= step
                  ? "none"
                  : "1px solid rgba(255,255,255,0.1)",
                color: i <= step ? "#fff" : "rgba(255,255,255,0.3)",
              }}>
                {i < step ? "✓" : i + 1}
              </div>
              <p style={{
                ...s.stepLabel,
                color: i === step ? "#c4b5fd" : "rgba(255,255,255,0.3)",
              }}>{label}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                ...s.stepLine,
                background: i < step
                  ? "rgba(124,58,237,0.6)"
                  : "rgba(255,255,255,0.08)",
              }}/>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Card */}
      <div style={s.card}>

        {/* ── STEP 0 — Basic Info ── */}
        {step === 0 && (
          <div>
            <p style={s.sectionTitle}>Select Your Category</p>
            <div style={s.catGrid}>
              {CATEGORIES.map(c => (
                <div key={c.value}
                  style={{
                    ...s.catCard,
                    background: form.category === c.value
                      ? "rgba(124,58,237,0.25)"
                      : "rgba(255,255,255,0.04)",
                    border: `1px solid ${form.category === c.value
                      ? "rgba(124,58,237,0.65)"
                      : "rgba(255,255,255,0.08)"}`,
                  }}
                  onClick={() => update("category", c.value)}>
                  <span style={{ fontSize: 22 }}>{c.icon}</span>
                  <p style={{
                    fontSize: 11, margin: 0, fontWeight: 500,
                    color: form.category === c.value
                      ? "#c4b5fd"
                      : "rgba(255,255,255,0.6)",
                  }}>{c.label}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16 }}>
              <p style={s.lbl}>Professional Title</p>
              <input style={s.inp}
                type="text"
                placeholder="e.g. Expert Plumber with 5 years experience"
                value={form.title}
                onChange={e => update("title", e.target.value)}
              />
            </div>

            <div style={{ marginTop: 12 }}>
              <p style={s.lbl}>Bio <span style={s.optional}>(Optional)</span></p>
              <textarea style={{ ...s.inp, height: 90, resize: "none" }}
                placeholder="Tell employers about yourself..."
                value={form.bio}
                onChange={e => update("bio", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ── STEP 1 — Skills & Rate ── */}
        {step === 1 && (
          <div>
            <p style={s.sectionTitle}>Your Skills</p>

            {/* Skill Input */}
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input style={{ ...s.inp, flex: 1, marginBottom: 0 }}
                type="text"
                placeholder="e.g. Pipe fitting, Leak repair..."
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
              />
              <button style={s.addBtn} onClick={addSkill}>+ Add</button>
            </div>

            {/* Skills Tags */}
            {form.skills.length > 0 && (
              <div style={s.tagsWrap}>
                {form.skills.map(skill => (
                  <div key={skill} style={s.tag}>
                    <span>{skill}</span>
                    <button style={s.tagX} onClick={() => removeSkill(skill)}>×</button>
                  </div>
                ))}
              </div>
            )}

            {/* Experience */}
            <div style={{ marginTop: 16 }}>
              <p style={s.lbl}>Years of Experience</p>
              <input style={s.inp}
                type="number" min={0} max={50}
                placeholder="0"
                value={form.experience}
                onChange={e => update("experience", Number(e.target.value))}
              />
            </div>

            {/* Hourly Rate */}
            <div style={{ marginTop: 12 }}>
              <p style={s.lbl}>Hourly Rate (PKR)</p>
              <input style={s.inp}
                type="number" min={1}
                placeholder="e.g. 500"
                value={form.hourlyRate}
                onChange={e => update("hourlyRate", Number(e.target.value))}
              />
            </div>

            {/* CNIC */}
            <div style={{ marginTop: 12 }}>
              <p style={s.lbl}>CNIC <span style={s.optional}>(Optional — 00000-0000000-0)</span></p>
              <input style={s.inp}
                type="text"
                placeholder="00000-0000000-0"
                value={form.cnic}
                onChange={e => update("cnic", e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ── STEP 2 — Location & Availability ── */}
        {step === 2 && (
          <div>
            <p style={s.sectionTitle}>Location</p>

            {/* City */}
            <div style={{ marginBottom: 12 }}>
              <p style={s.lbl}>City</p>
              <select style={s.inp}
                value={form.location.city}
                onChange={e => updateLocation("city", e.target.value)}>
                <option value="">Select city</option>
                {CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Area */}
            <div style={{ marginBottom: 12 }}>
              <p style={s.lbl}>Area <span style={s.optional}>(Optional)</span></p>
              <input style={s.inp}
                type="text"
                placeholder="e.g. Gulshan, DHA, F-10"
                value={form.location.area}
                onChange={e => updateLocation("area", e.target.value)}
              />
            </div>

            {/* Address */}
            <div style={{ marginBottom: 20 }}>
              <p style={s.lbl}>Full Address <span style={s.optional}>(Optional)</span></p>
              <input style={s.inp}
                type="text"
                placeholder="Street, Block, House No."
                value={form.location.address}
                onChange={e => updateLocation("address", e.target.value)}
              />
            </div>

            {/* Availability Days */}
            <p style={s.sectionTitle}>Availability</p>
            <p style={s.lbl}>Available Days</p>
            <div style={s.daysRow}>
              {DAYS.map(d => (
                <div key={d.value}
                  style={{
                    ...s.dayBtn,
                    background: form.availability.days.includes(d.value)
                      ? "rgba(124,58,237,0.3)"
                      : "rgba(255,255,255,0.05)",
                    border: `1px solid ${form.availability.days.includes(d.value)
                      ? "rgba(124,58,237,0.65)"
                      : "rgba(255,255,255,0.1)"}`,
                    color: form.availability.days.includes(d.value)
                      ? "#c4b5fd"
                      : "rgba(255,255,255,0.45)",
                  }}
                  onClick={() => toggleDay(d.value)}>
                  {d.label}
                </div>
              ))}
            </div>

            {/* Time */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
              <div>
                <p style={s.lbl}>Start Time</p>
                <input style={s.inp} type="time"
                  value={form.availability.startTime}
                  onChange={e => updateAvailability("startTime", e.target.value)}
                />
              </div>
              <div>
                <p style={s.lbl}>End Time</p>
                <input style={s.inp} type="time"
                  value={form.availability.endTime}
                  onChange={e => updateAvailability("endTime", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation Buttons ── */}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          {step > 0 && (
            <button style={s.backBtn} onClick={prevStep}>
              ← Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button style={s.nextBtn} onClick={nextStep}>
              Next →
            </button>
          ) : (
            <button style={s.submitBtn}
              onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit Profile →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  page:         { maxWidth: 680, margin: "0 auto", fontFamily: "'DM Sans',sans-serif" },
  header:       { marginBottom: 24 },
  h1:           { fontFamily: "'Sora',sans-serif", fontSize: "clamp(20px,4vw,24px)", fontWeight: 600, color: "#fff", margin: "0 0 6px" },
  sub:          { fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 },
  stepRow:      { display: "flex", alignItems: "center", marginBottom: 28 },
  stepItem:     { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  stepCircle:   { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 },
  stepLabel:    { fontSize: 11, margin: 0, whiteSpace: "nowrap" },
  stepLine:     { flex: 1, height: 2, margin: "0 8px", marginBottom: 20, borderRadius: 2 },
  card:         { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, padding: "clamp(20px,4vw,28px)" },
  sectionTitle: { fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 14px" },
  catGrid:      { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 },
  catCard:      { padding: "12px 6px", borderRadius: 12, cursor: "pointer", textAlign: "center", transition: "all .2s", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  lbl:          { fontSize: 11, color: "rgba(255,255,255,0.48)", marginBottom: 5, letterSpacing: 0.4 },
  optional:     { color: "rgba(255,255,255,0.25)", fontSize: 10 },
  inp:          { width: "100%", boxSizing: "border-box", padding: "10px 12px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#fff", fontSize: 13, fontFamily: "inherit", outline: "none", marginBottom: 0 ,appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none" },
  addBtn:       { padding: "10px 16px", background: "rgba(124,58,237,0.3)", border: "1px solid rgba(124,58,237,0.5)", borderRadius: 10, color: "#c4b5fd", cursor: "pointer", fontSize: 13, fontFamily: "inherit", whiteSpace: "nowrap" },
  tagsWrap:     { display: "flex", flexWrap: "wrap", gap: 8 },
  tag:          { display: "flex", alignItems: "center", gap: 6, background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", borderRadius: 20, padding: "4px 12px", fontSize: 12, color: "#c4b5fd" },
  tagX:         { background: "none", border: "none", color: "#c4b5fd", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1 },
  daysRow:      { display: "flex", gap: 8, flexWrap: "wrap" },
  dayBtn:       { padding: "8px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 500, transition: "all .2s" },
  backBtn:      { flex: 1, padding: 11, borderRadius: 11, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", fontSize: 13, fontFamily: "inherit", cursor: "pointer" },
  nextBtn:      { flex: 1, padding: 11, borderRadius: 11, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", border: "none", color: "#fff", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer" },
  submitBtn:    { flex: 1, padding: 11, borderRadius: 11, background: "linear-gradient(135deg,#059669,#10b981)", border: "none", color: "#fff", fontSize: 13, fontWeight: 500, fontFamily: "inherit", cursor: "pointer" },
};