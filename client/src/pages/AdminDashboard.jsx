/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/immutability */
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [workers,   setWorkers]   = useState([]);
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [a, w, u] = await Promise.all([
        api.get("/api/admin/analytics"),
        api.get("/api/admin/workers?status=pending"),
        api.get("/api/admin/users?limit=5"),
      ]);
      setAnalytics(a.data.analytics);
      setWorkers(w.data.workers);
      setUsers(u.data.users);
    } catch {
      toast.error("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, name) => {
    const tid = toast.loading(`Approving ${name}...`);
    try {
      await api.patch(`/api/admin/workers/${id}/approve`);
      toast.success(`${name} approved!`, { id: tid });
      fetchAll();
    } catch {
      toast.error("Failed to approve.", { id: tid });
    }
  };

  const handleReject = async (id, name) => {
    const tid = toast.loading(`Rejecting ${name}...`);
    try {
      await api.patch(`/api/admin/workers/${id}/reject`);
      toast.success(`${name} rejected.`, { id: tid });
      fetchAll();
    } catch {
      toast.error("Failed to reject.", { id: tid });
    }
  };

  if (loading) return (
    <div style={{ color:"rgba(255,255,255,0.4)", fontSize:13, padding:40, textAlign:"center" }}>
      Loading dashboard...
    </div>
  );

  const METRICS = [
    { label:"Total Users",       value: analytics?.users?.total     || 0, sub:`+${analytics?.users?.newThisWeek || 0} this week`, color:"#c4b5fd", icon:"👥" },
    { label:"Workers",           value: analytics?.users?.workers   || 0, sub:"Registered workers",   color:"#7dd3fc", icon:"🔧" },
    { label:"Employers",         value: analytics?.users?.employers || 0, sub:"Registered employers", color:"#6ee7b7", icon:"💼" },
    { label:"Pending Approvals", value: analytics?.workers?.pending || 0, sub:"Needs review",          color:"#fcd34d", icon:"⏳" },
  ];

  return (
    <>
      {/* Responsive styles */}
      <style>{`
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }
        .status-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }
        .table-wrap {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        @media (max-width: 1024px) {
          .metrics-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 640px) {
          .metrics-grid {
            grid-template-columns: 1fr 1fr;
          }
          .status-grid {
            grid-template-columns: 1fr;
          }
        }
        .admin-tr:hover { background: rgba(255,255,255,0.03); }
      `}</style>

      <div style={s.page}>

        {/* ── Header ── */}
        <div style={s.topbar}>
          <div>
            <p style={s.title}>Admin Dashboard</p>
            <p style={s.sub}>
              {new Date().toLocaleDateString("en-PK", {
                weekday:"long", year:"numeric",
                month:"long", day:"numeric",
              })}
            </p>
          </div>
          {analytics?.workers?.pending > 0 && (
            <div style={s.alertBadge}>
              ⚠️ {analytics.workers.pending} pending approval{analytics.workers.pending > 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* ── Metrics ── */}
        <div className="metrics-grid">
          {METRICS.map(m => (
            <div key={m.label} style={s.metricCard}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <p style={s.metricLabel}>{m.label}</p>
                <span style={{ fontSize:20 }}>{m.icon}</span>
              </div>
              <p style={{ ...s.metricVal, color: m.color }}>{m.value.toLocaleString()}</p>
              <p style={s.metricSub}>{m.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Worker Status ── */}
        <div className="status-grid">
          {[
            { label:"Approved", value: analytics?.workers?.approved || 0, color:"#6ee7b7", bg:"rgba(110,231,183,0.08)", icon:"✅" },
            { label:"Pending",  value: analytics?.workers?.pending  || 0, color:"#fcd34d", bg:"rgba(252,211,77,0.08)",  icon:"⏳" },
            { label:"Rejected", value: analytics?.workers?.rejected || 0, color:"#f87171", bg:"rgba(248,113,113,0.08)", icon:"❌" },
          ].map(item => (
            <div key={item.label} style={{
              borderRadius:14, padding:"16px 18px",
              background: item.bg,
              border:`1px solid ${item.color}33`,
              display:"flex", alignItems:"center",
              justifyContent:"space-between",
            }}>
              <div>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.45)", margin:"0 0 6px" }}>
                  {item.label} Workers
                </p>
                <p style={{ fontSize:26, fontWeight:600, color:item.color, margin:0 }}>
                  {item.value}
                </p>
              </div>
              <span style={{ fontSize:28 }}>{item.icon}</span>
            </div>
          ))}
        </div>

        {/* ── Pending Approvals ── */}
        {workers.length > 0 && (
          <div style={s.card}>
            <div style={s.cardHeader}>
              <p style={s.cardTitle}>⏳ Pending Worker Approvals</p>
              <span style={s.countBadge}>{workers.length}</span>
            </div>
            <div className="table-wrap">
              <table style={s.table}>
                <thead>
                  <tr>
                    {["Worker","Category","City","Rate/hr","Submitted","Actions"].map(h => (
                      <th key={h} style={s.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {workers.map(w => (
                    <tr key={w._id} className="admin-tr">
                      <td style={s.td}>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={s.avatar}>
                            {w.user?.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p style={{ margin:0, fontSize:12, color:"#fff", fontWeight:500 }}>
                              {w.user?.name}
                            </p>
                            <p style={{ margin:0, fontSize:10, color:"rgba(255,255,255,0.35)" }}>
                              {w.user?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={s.td}>
                        <span style={s.pill}>{w.category}</span>
                      </td>
                      <td style={s.td}>{w.location?.city || "—"}</td>
                      <td style={s.td}>
                        <span style={{ color:"#6ee7b7", fontWeight:500 }}>
                          PKR {w.hourlyRate}/hr
                        </span>
                      </td>
                      <td style={s.td}>
                        {new Date(w.createdAt).toLocaleDateString()}
                      </td>
                      <td style={s.td}>
                        <div style={{ display:"flex", gap:6 }}>
                          <button style={s.approveBtn}
                            onClick={() => handleApprove(w._id, w.user?.name)}>
                            ✓ Approve
                          </button>
                          <button style={s.rejectBtn}
                            onClick={() => handleReject(w._id, w.user?.name)}>
                            ✕ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── No Pending ── */}
        {workers.length === 0 && (
          <div style={s.emptyCard}>
            <span style={{ fontSize:32 }}>✅</span>
            <p style={{ color:"rgba(255,255,255,0.5)", fontSize:13, margin:"8px 0 0" }}>
              No pending approvals
            </p>
          </div>
        )}

        {/* ── Recent Users ── */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <p style={s.cardTitle}>👥 Recent Users</p>
            <span style={s.countBadge}>{users.length}</span>
          </div>
          <div className="table-wrap">
            <table style={s.table}>
              <thead>
                <tr>
                  {["User","Role","Verified","Auth","Joined"].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} className="admin-tr">
                    <td style={s.td}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{
                          ...s.avatar,
                          background: u.role === "admin"
                            ? "rgba(252,211,77,0.2)"
                            : u.role === "employer"
                            ? "rgba(110,231,183,0.2)"
                            : "rgba(196,181,253,0.2)",
                          color: u.role === "admin"
                            ? "#fcd34d"
                            : u.role === "employer"
                            ? "#6ee7b7"
                            : "#c4b5fd",
                        }}>
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p style={{ margin:0, fontSize:12, color:"#fff", fontWeight:500 }}>
                            {u.name}
                          </p>
                          <p style={{ margin:0, fontSize:10, color:"rgba(255,255,255,0.35)" }}>
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={s.td}>
                      <span style={{
                        ...s.pill,
                        background: u.role === "admin"
                          ? "rgba(252,211,77,0.15)"
                          : u.role === "employer"
                          ? "rgba(110,231,183,0.15)"
                          : "rgba(196,181,253,0.15)",
                        color: u.role === "admin"
                          ? "#fcd34d"
                          : u.role === "employer"
                          ? "#6ee7b7"
                          : "#c4b5fd",
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{
                        ...s.pill,
                        background: u.isVerified
                          ? "rgba(110,231,183,0.1)"
                          : "rgba(248,113,113,0.1)",
                        color: u.isVerified ? "#6ee7b7" : "#f87171",
                      }}>
                        {u.isVerified ? "✓ Verified" : "✕ No"}
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{
                        ...s.pill,
                        background: u.authType === "google"
                          ? "rgba(66,133,244,0.15)"
                          : "rgba(255,255,255,0.08)",
                        color: u.authType === "google"
                          ? "#7dd3fc"
                          : "rgba(255,255,255,0.5)",
                      }}>
                        {u.authType === "google" ? "🔵 Google" : "📧 Email"}
                      </span>
                    </td>
                    <td style={s.td}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}

const s = {
  page:       { fontFamily:"'DM Sans',sans-serif", paddingBottom:20 },
  topbar:     { display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:24, flexWrap:"wrap", gap:12 },
  title:      { fontFamily:"'Sora',sans-serif", fontSize:"clamp(18px,4vw,22px)", fontWeight:600, color:"#fff", margin:0 },
  sub:        { fontSize:12, color:"rgba(255,255,255,0.35)", margin:"4px 0 0" },
  alertBadge: { background:"rgba(252,211,77,0.12)", border:"1px solid rgba(252,211,77,0.3)", borderRadius:20, padding:"6px 14px", fontSize:12, color:"#fcd34d", fontWeight:500 },
  metricCard: { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:16 },
  metricLabel:{ fontSize:11, color:"rgba(255,255,255,0.45)", margin:0 },
  metricVal:  { fontSize:"clamp(22px,4vw,28px)", fontWeight:600, margin:"6px 0 4px" },
  metricSub:  { fontSize:11, color:"rgba(255,255,255,0.3)", margin:0 },
  card:       { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"18px 20px", marginBottom:16 },
  cardHeader: { display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 },
  cardTitle:  { fontSize:14, fontWeight:500, color:"#fff", margin:0 },
  countBadge: { background:"rgba(124,58,237,0.2)", border:"1px solid rgba(124,58,237,0.3)", borderRadius:20, padding:"2px 10px", fontSize:11, color:"#c4b5fd" },
  emptyCard:  { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:16, padding:32, textAlign:"center", marginBottom:16 },
  table:      { width:"100%", borderCollapse:"collapse", minWidth:500 },
  th:         { textAlign:"left", padding:"8px 12px", fontSize:11, color:"rgba(255,255,255,0.4)", fontWeight:500, borderBottom:"1px solid rgba(255,255,255,0.07)", whiteSpace:"nowrap" },
  td:         { padding:"10px 12px", fontSize:12, color:"rgba(255,255,255,0.65)", borderBottom:"1px solid rgba(255,255,255,0.04)", whiteSpace:"nowrap" },
  avatar:     { width:32, height:32, borderRadius:8, background:"rgba(196,181,253,0.2)", color:"#c4b5fd", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:600, flexShrink:0 },
  pill:       { display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:500, background:"rgba(196,181,253,0.15)", color:"#c4b5fd" },
  approveBtn: { padding:"5px 12px", borderRadius:8, border:"1px solid rgba(110,231,183,0.4)", background:"rgba(110,231,183,0.1)", color:"#6ee7b7", fontSize:11, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" },
  rejectBtn:  { padding:"5px 12px", borderRadius:8, border:"1px solid rgba(248,113,113,0.4)", background:"rgba(248,113,113,0.1)", color:"#f87171", fontSize:11, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" },
};
<style>{`
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }
  .status-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 16px;
  }
  .table-wrap {
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  @media (max-width: 1024px) {
    .metrics-grid { grid-template-columns: repeat(2, 1fr); }
    .status-grid  { grid-template-columns: repeat(3, 1fr); }
  }
  @media (max-width: 640px) {
    .metrics-grid { grid-template-columns: 1fr 1fr; }
    .status-grid  { grid-template-columns: 1fr; }
  }
  @media (max-width: 400px) {
    .metrics-grid { grid-template-columns: 1fr; }
  }
  .admin-tr:hover { background: rgba(255,255,255,0.03); }
`}</style>