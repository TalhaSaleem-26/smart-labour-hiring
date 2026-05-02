/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export default function AdminAnalytics() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/admin/analytics")
      .then(res => setData(res.data.analytics))
      .catch(() => toast.error("Failed to load analytics."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, padding:40, textAlign:"center" }}>
      Loading analytics...
    </p>
  );

  const totalUsers  = data?.users?.total   || 1;
  const totalWorkers = (data?.workers?.approved||0) + (data?.workers?.pending||0) + (data?.workers?.rejected||0) || 1;

  const STATS = [
    { label:"Total Users",      value:data?.users?.total       ||0, color:"#c4b5fd", icon:"👥" },
    { label:"Workers",          value:data?.users?.workers     ||0, color:"#7dd3fc", icon:"🔧" },
    { label:"Employers",        value:data?.users?.employers   ||0, color:"#6ee7b7", icon:"💼" },
    { label:"Admins",           value:data?.users?.admins      ||0, color:"#fcd34d", icon:"🛡️" },
    { label:"New This Week",    value:data?.users?.newThisWeek ||0, color:"#f0abfc", icon:"📈" },
    { label:"Approved Workers", value:data?.workers?.approved  ||0, color:"#6ee7b7", icon:"✅" },
    { label:"Pending Workers",  value:data?.workers?.pending   ||0, color:"#fcd34d", icon:"⏳" },
    { label:"Rejected Workers", value:data?.workers?.rejected  ||0, color:"#f87171", icon:"❌" },
  ];

  const BAR_DATA = [
    { label:"Workers",   value:data?.users?.workers   ||0, color:"#7dd3fc" },
    { label:"Employers", value:data?.users?.employers ||0, color:"#6ee7b7" },
    { label:"Admins",    value:data?.users?.admins    ||0, color:"#fcd34d" },
  ];
  const maxBar = Math.max(...BAR_DATA.map(b => b.value), 1);

  const WORKER_STATUS = [
    { label:"Approved", value:data?.workers?.approved||0, color:"#6ee7b7" },
    { label:"Pending",  value:data?.workers?.pending ||0, color:"#fcd34d" },
    { label:"Rejected", value:data?.workers?.rejected||0, color:"#f87171" },
  ];

  return (
    <>
      <style>{`
        .aa-wrap { font-family:'DM Sans',sans-serif; padding-bottom:20px; }
        .aa-stats {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:12px; margin-bottom:16px;
        }
        .aa-charts {
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:14px; margin-bottom:16px;
        }
        .aa-summary {
          display:grid;
          grid-template-columns:repeat(4,1fr);
          gap:12px; margin-top:16px;
        }
        @media(max-width:1024px) {
          .aa-stats   { grid-template-columns:repeat(2,1fr); }
          .aa-charts  { grid-template-columns:1fr; }
          .aa-summary { grid-template-columns:repeat(2,1fr); }
        }
        @media(max-width:480px) {
          .aa-stats   { grid-template-columns:1fr 1fr; }
          .aa-summary { grid-template-columns:1fr 1fr; }
        }
      `}</style>

      <div className="aa-wrap">
        <div style={{ marginBottom:24 }}>
          <p style={s.title}>📊 Analytics</p>
          <p style={s.sub}>Platform overview and statistics</p>
        </div>

        {/* Stats */}
        <div className="aa-stats">
          {STATS.map(st => (
            <div key={st.label} style={s.statCard}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <p style={s.statLabel}>{st.label}</p>
                <span style={{ fontSize:16 }}>{st.icon}</span>
              </div>
              <p style={{ fontSize:"clamp(18px,3vw,24px)", fontWeight:600, color:st.color, margin:"4px 0 8px" }}>
                {st.value}
              </p>
              <div style={s.bar}>
                <div style={{
                  height:"100%", borderRadius:4, background:st.color,
                  width:`${Math.min((st.value/totalUsers)*100,100)}%`,
                  transition:"width 1s ease",
                }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="aa-charts">
          {/* User Distribution */}
          <div style={s.card}>
            <p style={s.cardTitle}>User Distribution</p>
            <div style={{ display:"flex", flexDirection:"column", gap:14, marginTop:16 }}>
              {BAR_DATA.map(b => (
                <div key={b.label}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>{b.label}</span>
                    <span style={{ fontSize:12, color:b.color, fontWeight:600 }}>{b.value}</span>
                  </div>
                  <div style={s.barBg}>
                    <div style={{
                      height:"100%", borderRadius:4, background:b.color,
                      width:`${(b.value/maxBar)*100}%`,
                      transition:"width 1s ease",
                    }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Worker Status */}
          <div style={s.card}>
            <p style={s.cardTitle}>Worker Status</p>
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginTop:16 }}>
              {WORKER_STATUS.map(w => {
                const pct = Math.round((w.value/totalWorkers)*100);
                return (
                  <div key={w.label}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                      <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)" }}>{w.label}</span>
                      <div style={{ display:"flex", gap:8 }}>
                        <span style={{ fontSize:12, color:"rgba(255,255,255,0.35)" }}>{pct}%</span>
                        <span style={{ fontSize:12, color:w.color, fontWeight:600 }}>{w.value}</span>
                      </div>
                    </div>
                    <div style={s.barBg}>
                      <div style={{
                        height:"100%", borderRadius:4, background:w.color,
                        width:`${pct}%`, transition:"width 1s ease",
                      }}/>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ display:"flex", gap:14, marginTop:20, flexWrap:"wrap" }}>
              {WORKER_STATUS.map(w => (
                <div key={w.label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:8, height:8, borderRadius:"50%", background:w.color }}/>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.45)" }}>{w.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div style={s.card}>
          <p style={s.cardTitle}>Platform Summary</p>
          <div className="aa-summary">
            {[
              { label:"Total Registered", value:data?.users?.total       ||0, color:"#c4b5fd" },
              { label:"New This Week",    value:data?.users?.newThisWeek ||0, color:"#f0abfc" },
              { label:"Active Workers",   value:data?.workers?.approved  ||0, color:"#6ee7b7" },
              { label:"Awaiting Review",  value:data?.workers?.pending   ||0, color:"#fcd34d" },
            ].map(item => (
              <div key={item.label} style={s.summaryItem}>
                <p style={{ fontSize:"clamp(18px,3vw,22px)", fontWeight:600, color:item.color, margin:"0 0 4px" }}>
                  {item.value}
                </p>
                <p style={{ fontSize:11, color:"rgba(255,255,255,0.4)", margin:0 }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

const s = {
  title:      { fontFamily:"'Sora',sans-serif", fontSize:"clamp(16px,4vw,20px)", fontWeight:600, color:"#fff", margin:0 },
  sub:        { fontSize:12, color:"rgba(255,255,255,0.35)", margin:"4px 0 0" },
  statCard:   { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:"clamp(12px,3vw,16px)" },
  statLabel:  { fontSize:11, color:"rgba(255,255,255,0.45)", margin:0 },
  bar:        { height:4, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden" },
  barBg:      { height:8, background:"rgba(255,255,255,0.06)", borderRadius:4, overflow:"hidden" },
  card:       { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"clamp(14px,3vw,20px)" },
  cardTitle:  { fontSize:14, fontWeight:500, color:"#fff", margin:0 },
  summaryItem:{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"clamp(10px,3vw,14px)", textAlign:"center" },
};