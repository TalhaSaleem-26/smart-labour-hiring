/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
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
const STEPS = ["Basic Info", "Skills & Rate", "Location & Availability"];

// ─── Responsive hook ───────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 600 : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

// ─── Reusable field components ─────────────────────────────────────────────────
function Label({ children }) {
  return (
    <p style={{
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.45)",
      margin: "0 0 6px",
    }}>
      {children}
    </p>
  );
}

function Input({ style, ...props }) {
  return (
    <input
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "11px 14px",
        background: "rgba(255,255,255,0.055)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        color: "#fff",
        fontSize: 13,
        fontFamily: "inherit",
        outline: "none",
        transition: "border-color .2s",
        appearance: "none",
        WebkitAppearance: "none",
        MozAppearance: "none",
        ...style,
      }}
      onFocus={e => (e.target.style.borderColor = "rgba(124,58,237,0.55)")}
      onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
      {...props}
    />
  );
}

function Textarea({ style, ...props }) {
  return (
    <textarea
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "11px 14px",
        background: "rgba(255,255,255,0.055)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        color: "#fff",
        fontSize: 13,
        fontFamily: "inherit",
        outline: "none",
        resize: "none",
        transition: "border-color .2s",
        ...style,
      }}
      onFocus={e => (e.target.style.borderColor = "rgba(124,58,237,0.55)")}
      onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
      {...props}
    />
  );
}

function Select({ style, children, ...props }) {
  return (
    <select
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "11px 14px",
        background: "rgba(255,255,255,0.055)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10,
        color: "#fff",
        fontSize: 13,
        fontFamily: "inherit",
        outline: "none",
        appearance: "none",
        WebkitAppearance: "none",
        MozAppearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        paddingRight: 36,
        cursor: "pointer",
        transition: "border-color .2s",
        ...style,
      }}
      onFocus={e => (e.target.style.borderColor = "rgba(124,58,237,0.55)")}
      onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
      {...props}
    >
      {children}
    </select>
  );
}

// ─── Progress bar ──────────────────────────────────────────────────────────────
function StepBar({ step }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 28, gap: 0 }}>
      {STEPS.map((label, i) => (
        <React.Fragment key={i}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
            <div style={{
              width: isMobile ? 30 : 36,
              height: isMobile ? 30 : 36,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: isMobile ? 11 : 13,
              fontWeight: 700,
              background: i <= step
                ? "linear-gradient(135deg,#7c3aed,#4f46e5)"
                : "rgba(255,255,255,0.06)",
              border: i <= step ? "none" : "1px solid rgba(255,255,255,0.1)",
              color: i <= step ? "#fff" : "rgba(255,255,255,0.3)",
              transition: "all .3s",
              flexShrink: 0,
            }}>
              {i < step ? "✓" : i + 1}
            </div>
            {!isMobile && (
              <p style={{
                fontSize: 10,
                margin: 0,
                whiteSpace: "nowrap",
                color: i === step ? "#c4b5fd" : "rgba(255,255,255,0.28)",
                fontWeight: i === step ? 600 : 400,
                transition: "color .3s",
              }}>
                {label}
              </p>
            )}
          </div>
          {i < STEPS.length - 1 && (
            <div style={{
              flex: 1,
              height: 2,
              margin: isMobile ? "0 6px 0" : "0 8px 16px",
              borderRadius: 2,
              background: i < step
                ? "linear-gradient(90deg,#7c3aed,#4f46e5)"
                : "rgba(255,255,255,0.08)",
              transition: "background .3s",
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function WorkerRegistration() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [step, setStep]             = useState(0);
  const [loading, setLoading]       = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const [form, setForm] = useState({
    title:        "",
    bio:          "",
    category:     "",
    skills:       [],
    experience:   0,
    hourlyRate:   "",
    cnic:         "",
    location:     { city: "", address: "" },
    serviceAreas: [],
    availability: { days: [], startTime: "09:00", endTime: "18:00" },
  });

  const update = (field, value) =>
    setForm(p => ({ ...p, [field]: value }));

  const updateLocation = (field, value) =>
    setForm(p => ({ ...p, location: { ...p.location, [field]: value } }));

  const updateAvailability = (field, value) =>
    setForm(p => ({ ...p, availability: { ...p.availability, [field]: value } }));

  // ── Skills ──────────────────────────────────────────────────────────────────
  const addSkill = () => {
    const sk = skillInput.trim();
    if (!sk) return;
    if (form.skills.includes(sk)) { toast.error("Skill already added."); return; }
    if (form.skills.length >= 10) { toast.error("Max 10 skills allowed."); return; }
    update("skills", [...form.skills, sk]);
    setSkillInput("");
  };

  const removeSkill = (skill) =>
    update("skills", form.skills.filter(s => s !== skill));

  // ── Days ────────────────────────────────────────────────────────────────────
  const toggleDay = (day) => {
    const days = form.availability.days.includes(day)
      ? form.availability.days.filter(d => d !== day)
      : [...form.availability.days, day];
    updateAvailability("days", days);
  };

  // ── Service Areas ───────────────────────────────────────────────────────────
  const toggleArea = (area) => {
    const areas = form.serviceAreas.includes(area)
      ? form.serviceAreas.filter(a => a !== area)
      : [...form.serviceAreas, area];
    update("serviceAreas", areas);
  };

  const toggleAllAreas = () => {
    const cityAreas = CITY_AREAS[form.location.city] || [];
    const allSelected = cityAreas.every(a => form.serviceAreas.includes(a));
    update("serviceAreas", allSelected ? [] : [...cityAreas]);
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateStep = () => {
    if (step === 0) {
      if (!form.category)       { toast.error("Please select a category."); return false; }
      if (!form.title.trim())   { toast.error("Please enter a title."); return false; }
    }
    if (step === 1) {
      if (form.skills.length === 0)               { toast.error("Add at least one skill."); return false; }
      if (!form.hourlyRate || Number(form.hourlyRate) <= 0) { toast.error("Enter a valid hourly rate."); return false; }
    }
    if (step === 2) {
      if (!form.location.city)            { toast.error("Please select your city."); return false; }
      if (form.serviceAreas.length === 0) { toast.error("Select at least one area you can work in."); return false; }
    }
    return true;
  };

  const nextStep = () => { if (validateStep()) setStep(p => p + 1); };
  const prevStep = () => setStep(p => p - 1);

  const handleSubmit = async () => {
    if (!validateStep()) return;
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

  const cityAreas = CITY_AREAS[form.location.city] || [];
  const allAreasSelected = cityAreas.length > 0 && cityAreas.every(a => form.serviceAreas.includes(a));

  // ── Styles (dynamic) ────────────────────────────────────────────────────────
  const cardPad = isMobile ? 16 : 28;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", fontFamily: "'DM Sans', sans-serif", padding: isMobile ? "0 4px" : 0 }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.3px" }}>
          Complete Your Worker Profile
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>
          Fill in your details to start receiving job offers
        </p>
      </div>

      {/* Progress */}
      <StepBar step={step} />

      {/* Card */}
      <div style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 20,
        padding: cardPad,
      }}>

        {/* ══ STEP 0 — Basic Info ══ */}
        {step === 0 && (
          <div>
            <SectionTitle>Select Your Category</SectionTitle>
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(5,1fr)" : "repeat(5,1fr)",
              gap: isMobile ? 6 : 8,
              marginBottom: 20,
            }}>
              {CATEGORIES.map(c => {
                const active = form.category === c.value;
                return (
                  <div
                    key={c.value}
                    role="button"
                    tabIndex={0}
                    onClick={() => update("category", c.value)}
                    onKeyDown={e => e.key === "Enter" && update("category", c.value)}
                    style={{
                      padding: isMobile ? "10px 4px" : "12px 6px",
                      borderRadius: 12,
                      cursor: "pointer",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 5,
                      background: active ? "rgba(124,58,237,0.22)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${active ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.07)"}`,
                      transition: "all .2s",
                      outline: "none",
                    }}
                  >
                    <span style={{ fontSize: isMobile ? 18 : 22 }}>{c.icon}</span>
                    <p style={{
                      fontSize: isMobile ? 9 : 11,
                      margin: 0,
                      fontWeight: 600,
                      color: active ? "#c4b5fd" : "rgba(255,255,255,0.5)",
                      lineHeight: 1.2,
                    }}>
                      {c.label}
                    </p>
                  </div>
                );
              })}
            </div>

            <FieldGroup>
              <Label>Professional Title</Label>
              <Input
                type="text"
                placeholder="e.g. Expert Plumber with 5 years experience"
                value={form.title}
                onChange={e => update("title", e.target.value)}
              />
            </FieldGroup>

            <FieldGroup>
              <Label>Bio <Opt>(Optional)</Opt></Label>
              <Textarea
                rows={3}
                style={{ height: 88 }}
                placeholder="Tell clients about yourself, your expertise and work style..."
                value={form.bio}
                onChange={e => update("bio", e.target.value)}
              />
            </FieldGroup>
          </div>
        )}

        {/* ══ STEP 1 — Skills & Rate ══ */}
        {step === 1 && (
          <div>
            <SectionTitle>Your Skills</SectionTitle>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <Input
                style={{ flex: 1 }}
                type="text"
                placeholder="e.g. Pipe fitting, Leak repair..."
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") { e.preventDefault(); addSkill(); }
                }}
              />
              <button
                onClick={addSkill}
                style={{
                  flexShrink: 0,
                  padding: "11px 16px",
                  background: "rgba(124,58,237,0.25)",
                  border: "1px solid rgba(124,58,237,0.45)",
                  borderRadius: 10,
                  color: "#c4b5fd",
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "inherit",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  transition: "background .2s",
                }}
              >
                + Add
              </button>
            </div>

            {form.skills.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
                {form.skills.map(skill => (
                  <div key={skill} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(124,58,237,0.18)",
                    border: "1px solid rgba(124,58,237,0.35)",
                    borderRadius: 20,
                    padding: "5px 12px",
                    fontSize: 12,
                    color: "#c4b5fd",
                    fontWeight: 500,
                  }}>
                    <span>{skill}</span>
                    <button
                      onClick={() => removeSkill(skill)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(196,181,253,0.6)",
                        cursor: "pointer",
                        fontSize: 15,
                        padding: 0,
                        lineHeight: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                      aria-label={`Remove ${skill}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
              <FieldGroup>
                <Label>Years of Experience</Label>
                <Input
                  type="number"
                  min={0}
                  max={50}
                  placeholder="0"
                  value={form.experience}
                  onChange={e => update("experience", Math.max(0, Number(e.target.value)))}
                />
              </FieldGroup>

              <FieldGroup>
                <Label>Hourly Rate (PKR)</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 500"
                  value={form.hourlyRate}
                  onChange={e => update("hourlyRate", Math.max(0, Number(e.target.value)))}
                />
              </FieldGroup>
            </div>

            <FieldGroup>
              <Label>CNIC <Opt>(Optional)</Opt></Label>
              <Input
                type="text"
                placeholder="00000-0000000-0"
                value={form.cnic}
                maxLength={15}
                onChange={e => {
                  // Auto-format CNIC as user types
                  let val = e.target.value.replace(/[^0-9]/g, "");
                  if (val.length > 5) val = val.slice(0,5) + "-" + val.slice(5);
                  if (val.length > 13) val = val.slice(0,13) + "-" + val.slice(13);
                  update("cnic", val.slice(0, 15));
                }}
              />
            </FieldGroup>
          </div>
        )}

        {/* ══ STEP 2 — Location & Availability ══ */}
        {step === 2 && (
          <div>
            <SectionTitle>Location</SectionTitle>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 4 }}>
              <FieldGroup>
                <Label>City</Label>
                <Select
                  value={form.location.city}
                  onChange={e => {
                    updateLocation("city", e.target.value);
                    update("serviceAreas", []);
                  }}
                >
                  <option value="" style={{ background: "#1a1a2e" }}>Select city</option>
                  {CITIES.map(c => (
                    <option key={c} value={c} style={{ background: "#1a1a2e" }}>{c}</option>
                  ))}
                </Select>
              </FieldGroup>

              <FieldGroup>
                <Label>Full Address <Opt>(Optional)</Opt></Label>
                <Input
                  type="text"
                  placeholder="Street, Block, House No."
                  value={form.location.address}
                  onChange={e => updateLocation("address", e.target.value)}
                />
              </FieldGroup>
            </div>

            {/* Service Areas */}
            {form.location.city && (
              <div style={{
                marginTop: 20,
                marginBottom: 24,
                padding: 16,
                background: "rgba(14,165,233,0.05)",
                border: "1px solid rgba(14,165,233,0.15)",
                borderRadius: 14,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#7dd3fc", margin: "0 0 3px" }}>
                      Areas You Can Work In
                    </p>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: 0 }}>
                      Select areas in {form.location.city} where you're available
                    </p>
                  </div>
                  <button
                    onClick={toggleAllAreas}
                    style={{
                      flexShrink: 0,
                      padding: "5px 12px",
                      borderRadius: 8,
                      background: allAreasSelected ? "rgba(14,165,233,0.2)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${allAreasSelected ? "rgba(14,165,233,0.4)" : "rgba(255,255,255,0.1)"}`,
                      color: allAreasSelected ? "#7dd3fc" : "rgba(255,255,255,0.45)",
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      whiteSpace: "nowrap",
                      transition: "all .2s",
                    }}
                  >
                    {allAreasSelected ? "Deselect All" : "Select All"}
                  </button>
                </div>

                {form.serviceAreas.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <span style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      background: "rgba(14,165,233,0.15)",
                      color: "#7dd3fc",
                      border: "1px solid rgba(14,165,233,0.25)",
                    }}>
                      ✓ {form.serviceAreas.length} area{form.serviceAreas.length !== 1 ? "s" : ""} selected
                    </span>
                  </div>
                )}

                <div style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
                    ? "repeat(2, 1fr)"
                    : "repeat(auto-fill, minmax(130px,1fr))",
                  gap: 8,
                }}>
                  {cityAreas.map(area => {
                    const active = form.serviceAreas.includes(area);
                    return (
                      <div
                        key={area}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleArea(area)}
                        onKeyDown={e => e.key === "Enter" && toggleArea(area)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "8px 11px",
                          borderRadius: 9,
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 500,
                          background: active ? "rgba(14,165,233,0.18)" : "rgba(255,255,255,0.04)",
                          border: `1px solid ${active ? "rgba(14,165,233,0.5)" : "rgba(255,255,255,0.07)"}`,
                          color: active ? "#7dd3fc" : "rgba(255,255,255,0.5)",
                          transition: "all .18s",
                          outline: "none",
                          userSelect: "none",
                        }}
                      >
                        <span style={{ fontSize: 10, lineHeight: 1 }}>{active ? "✓" : "+"}</span>
                        {area}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Availability */}
            <SectionTitle style={{ marginTop: 4 }}>Availability</SectionTitle>

            <FieldGroup>
              <Label>Available Days</Label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {DAYS.map(d => {
                  const active = form.availability.days.includes(d.value);
                  return (
                    <div
                      key={d.value}
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleDay(d.value)}
                      onKeyDown={e => e.key === "Enter" && toggleDay(d.value)}
                      style={{
                        padding: isMobile ? "7px 10px" : "8px 14px",
                        borderRadius: 8,
                        cursor: "pointer",
                        fontSize: isMobile ? 11 : 12,
                        fontWeight: 600,
                        background: active ? "rgba(124,58,237,0.28)" : "rgba(255,255,255,0.05)",
                        border: `1px solid ${active ? "rgba(124,58,237,0.6)" : "rgba(255,255,255,0.09)"}`,
                        color: active ? "#c4b5fd" : "rgba(255,255,255,0.4)",
                        transition: "all .18s",
                        outline: "none",
                        userSelect: "none",
                      }}
                    >
                      {d.label}
                    </div>
                  );
                })}
              </div>
            </FieldGroup>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 4 }}>
              <FieldGroup>
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={form.availability.startTime}
                  onChange={e => updateAvailability("startTime", e.target.value)}
                />
              </FieldGroup>
              <FieldGroup>
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={form.availability.endTime}
                  onChange={e => updateAvailability("endTime", e.target.value)}
                />
              </FieldGroup>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
          {step > 0 && (
            <button
              onClick={prevStep}
              style={{
                flex: 1,
                padding: 13,
                borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.55)",
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: "pointer",
                transition: "background .2s",
              }}
            >
              ← Back
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button
              onClick={nextStep}
              style={{
                flex: 1,
                padding: 13,
                borderRadius: 12,
                background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                border: "none",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(124,58,237,0.35)",
                transition: "opacity .2s",
              }}
              onMouseOver={e => (e.currentTarget.style.opacity = "0.88")}
              onMouseOut={e => (e.currentTarget.style.opacity = "1")}
            >
              Next Step →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                flex: 1,
                padding: 13,
                borderRadius: 12,
                background: loading
                  ? "rgba(16,185,129,0.4)"
                  : "linear-gradient(135deg,#059669,#10b981)",
                border: "none",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "inherit",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 20px rgba(16,185,129,0.35)",
                transition: "all .2s",
              }}
            >
              {loading ? "Submitting..." : "Submit Profile →"}
            </button>
          )}
        </div>

        {/* Step indicator dots (mobile) */}
        {isMobile && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 16 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                width: i === step ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === step
                  ? "linear-gradient(90deg,#7c3aed,#4f46e5)"
                  : "rgba(255,255,255,0.15)",
                transition: "all .3s",
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Tiny helpers ──────────────────────────────────────────────────────────────
function SectionTitle({ children, style }) {
  return (
    <p style={{
      fontSize: 14,
      fontWeight: 700,
      color: "#fff",
      margin: "0 0 14px",
      letterSpacing: "-0.1px",
      ...style,
    }}>
      {children}
    </p>
  );
}

function FieldGroup({ children }) {
  return <div style={{ marginBottom: 14 }}>{children}</div>;
}

function Opt({ children }) {
  return (
    <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 400 }}>
      {" "}{children}
    </span>
  );
}