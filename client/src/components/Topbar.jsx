// eslint-disable-next-line no-unused-vars
import React from "react";
import { useSelector } from "react-redux";

const ROLE_COLORS = {
  admin:    { text: "#fcd34d", bg: "rgba(245,158,11,0.15)" },
  employer: { text: "#c4b5fd", bg: "rgba(124,58,237,0.15)" },
  worker:   { text: "#7dd3fc", bg: "rgba(14,165,233,0.15)" },
};

// eslint-disable-next-line no-unused-vars
export default function Topbar({ collapsed, setCollapsed, isMobile, setSidebarOpen, sidebarOpen }) {
  const { user } = useSelector(s => s.auth);
  const role     = user?.role || "worker";
  const colors   = ROLE_COLORS[role];

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleHamburger = () => {
    if (isMobile) {
      setSidebarOpen(p => !p); // ✅ Mobile pe sidebar toggle
    } else {
      setCollapsed(p => !p);   // ✅ Desktop pe collapse
    }
  };

  return (
    <div style={s.bar}>
      <div style={s.left}>
        {/* Hamburger */}
        <button style={s.hamburger} onClick={handleHamburger}>
          <span style={s.hLine}/>
          <span style={s.hLine}/>
          <span style={s.hLine}/>
        </button>
        <div>
          <p style={s.greet}>
            {greet()}, <strong>{user?.name?.split(" ")[0] || "User"}</strong> 👋
          </p>
          <p style={s.sub}>Welcome to your dashboard</p>
        </div>
      </div>

      <div style={s.right}>
        <div style={{ ...s.roleBadge, background: colors.bg, color: colors.text }}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </div>
        <div style={{ ...s.avatar, background: colors.bg, color: colors.text }}>
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </div>
    </div>
  );
}

const s = {
  bar:       { height:60, background:"#0d0d1f", borderBottom:"1px solid rgba(255,255,255,0.06)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 clamp(12px,3vw,24px)", position:"sticky", top:0, zIndex:98 },
  left:      { display:"flex", alignItems:"center", gap:12 },
  hamburger: { background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", gap:5, padding:6 },
  hLine:     { display:"block", width:20, height:2, background:"rgba(255,255,255,0.6)", borderRadius:2 },
  greet:     { fontSize:"clamp(12px,3vw,14px)", color:"#fff", margin:0, fontWeight:400 },
  sub:       { fontSize:"clamp(9px,2vw,11px)", color:"rgba(255,255,255,0.35)", margin:0 },
  right:     { display:"flex", alignItems:"center", gap:10 },
  roleBadge: { fontSize:11, fontWeight:500, padding:"4px 12px", borderRadius:20, display:"none" },
  avatar:    { width:34, height:34, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:600 },
};