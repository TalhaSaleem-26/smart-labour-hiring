/* eslint-disable no-unused-vars */
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "../store/slices/authSlice";
import axios from "axios";
import toast from "react-hot-toast";

// Role based menu items
const MENUS = {
  admin: [
    { icon: "⚡", label: "Dashboard",   path: "/admin/dashboard" },
    { icon: "👥", label: "Users",        path: "/admin/users" },
    { icon: "💼", label: "Jobs",         path: "/admin/jobs" },
    { icon: "📊", label: "Analytics",   path: "/admin/analytics" },
    { icon: "⚙️", label: "Settings",    path: "/admin/settings" },
  ],
  employer: [
    { icon: "⚡", label: "Dashboard",   path: "/employer/dashboard" },
    { icon: "📝", label: "Post Job",    path: "/employer/post-job" },
    { icon: "📋", label: "My Jobs",     path: "/employer/jobs" },
    { icon: "👷", label: "Workers",     path: "/employer/workers" },
    { icon: "⚙️", label: "Settings",   path: "/employer/settings" },
    { icon:"📍", label:"Worker by Location", path:"/employer/location-workers" }
  ],
  worker: [
    { icon: "⚡", label: "Dashboard",   path: "/worker/dashboard" },
    { icon: "🔍", label: "Find Jobs",   path: "/worker/jobs" },
    { icon: "📋", label: "My Profile",  path: "/worker/profile" },
    { icon: "⭐", label: "Reviews",     path: "/worker/reviews" },
    { icon: "⚙️", label: "Settings",   path: "/worker/settings" },
  ],
};

const ROLE_COLORS = {
  admin:    { accent: "#f59e0b", bg: "rgba(245,158,11,0.15)",  text: "#fcd34d" },
  employer: { accent: "#7c3aed", bg: "rgba(124,58,237,0.15)", text: "#c4b5fd" },
  worker:   { accent: "#0ea5e9", bg: "rgba(14,165,233,0.15)", text: "#7dd3fc" },
};

export default function Sidebar({ collapsed, setCollapsed }) {
  const { user }  = useSelector(s => s.auth);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const role      = user?.role || "worker";
  const menu      = MENUS[role] || [];
  const colors    = ROLE_COLORS[role];

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      dispatch(clearUser());
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch {
      toast.error("Logout failed. Try again.");
    }
  };

  return (
    <div style={{
      ...s.sidebar,
      width: collapsed ? 72 : 240,
      transition: "width 0.3s ease",
    }}>
      {/* Logo */}
      <div style={s.logoWrap}>
        <div style={{ ...s.logoIcon, background: colors.bg, border: `1px solid ${colors.accent}33` }}>
          <span style={{ fontSize: 18 }}>⚒️</span>
        </div>
        {!collapsed && (
          <div>
            <p style={s.logoText}>SmartLabour</p>
            <p style={{ ...s.roleBadge, background: colors.bg, color: colors.text }}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={s.divider} />

      {/* Menu */}
      <nav style={s.nav}>
        {menu.map(item => (
          <NavLink key={item.path} to={item.path} style={({ isActive }) => ({
            ...s.navItem,
            background: isActive ? colors.bg : "transparent",
            borderLeft: isActive ? `3px solid ${colors.accent}` : "3px solid transparent",
            color: isActive ? colors.text : "rgba(255,255,255,0.5)",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "12px 0" : "11px 16px",
          })}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
            {!collapsed && <span style={s.navLabel}>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom — User + Logout */}
      <div style={s.bottom}>
        <div style={s.divider} />

        {/* User Info */}
        {!collapsed && (
          <div style={s.userBox}>
            <div style={{ ...s.avatar, background: colors.bg, color: colors.text }}>
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={s.userName}>{user?.name || "User"}</p>
              <p style={s.userEmail}>{user?.email?.slice(0, 22)}...</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button style={{
          ...s.logoutBtn,
          justifyContent: collapsed ? "center" : "flex-start",
          padding: collapsed ? "12px 0" : "11px 16px",
        }} onClick={handleLogout}>
          <span style={{ fontSize: 18 }}>🚪</span>
          {!collapsed && <span style={{ marginLeft: 10, fontSize: 13 }}>Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button style={s.collapseBtn} onClick={() => setCollapsed(p => !p)}>
        {collapsed ? "→" : "←"}
      </button>
    </div>
  );
}

const s = {
  sidebar:    { position:"fixed", top:0, left:0, height:"100vh", background:"#0d0d1f", borderRight:"1px solid rgba(255,255,255,0.07)", display:"flex", flexDirection:"column", zIndex:100, overflow:"hidden" },
  logoWrap:   { display:"flex", alignItems:"center", gap:10, padding:"20px 16px 16px" },
  logoIcon:   { width:36, height:36, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  logoText:   { fontSize:14, fontWeight:600, color:"#fff", margin:0, letterSpacing:-0.3 },
  roleBadge:  { fontSize:10, borderRadius:20, padding:"2px 8px", margin:"3px 0 0", display:"inline-block", fontWeight:500 },
  divider:    { height:1, background:"rgba(255,255,255,0.06)", margin:"0 12px" },
  nav:        { flex:1, padding:"12px 0", overflowY:"auto", display:"flex", flexDirection:"column", gap:2 },
  navItem:    { display:"flex", alignItems:"center", gap:12, textDecoration:"none", borderRadius:10, margin:"0 8px", fontSize:13, fontWeight:500, transition:"all 0.2s" },
  navLabel:   { fontSize:13, whiteSpace:"nowrap" },
  bottom:     { padding:"0 0 16px" },
  userBox:    { display:"flex", alignItems:"center", gap:10, padding:"12px 16px" },
  avatar:     { width:34, height:34, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:600, flexShrink:0 },
  userName:   { fontSize:12, fontWeight:500, color:"#fff", margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" },
  userEmail:  { fontSize:10, color:"rgba(255,255,255,0.35)", margin:0 },
  logoutBtn:  { display:"flex", alignItems:"center", width:"100%", background:"none", border:"none", color:"rgba(255,255,255,0.45)", cursor:"pointer", borderRadius:10, margin:"4px 8px 0", transition:"all 0.2s", fontFamily:"inherit" },
  collapseBtn:{ position:"absolute", bottom:80, right:-12, width:24, height:24, borderRadius:"50%", background:"#1a1a35", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)", cursor:"pointer", fontSize:11, display:"flex", alignItems:"center", justifyContent:"center" },
};