/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [role,    setRole]    = useState("");
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);
  const [pages,   setPages]   = useState(1);

  useEffect(() => { fetchUsers(); }, [page, role]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/users", {
        params: { page, limit: 10, role, search },
      });
      setUsers(res.data.users);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;
    const tid = toast.loading(`Deleting ${name}...`);
    try {
      await api.delete(`/api/admin/users/${id}`);
      toast.success(`${name} deleted.`, { id: tid });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.", { id: tid });
    }
  };

  const RC = {
    admin:    { bg:"rgba(252,211,77,0.15)",  color:"#fcd34d" },
    employer: { bg:"rgba(110,231,183,0.15)", color:"#6ee7b7" },
    worker:   { bg:"rgba(196,181,253,0.15)", color:"#c4b5fd" },
  };

  return (
    <>
      <style>{`
        .au-wrap { font-family:'DM Sans',sans-serif; padding-bottom:20px; }
        .au-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px; flex-wrap:wrap; gap:10px; }
        .au-filters { display:flex; gap:10px; flex-wrap:wrap; }
        .au-filters input, .au-filters select { flex:1; min-width:140px; }
        .au-table-wrap { width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch; }
        .au-table { width:100%; border-collapse:collapse; min-width:580px; }
        .au-th { text-align:left; padding:8px 12px; font-size:11px; color:rgba(255,255,255,0.4); font-weight:500; border-bottom:1px solid rgba(255,255,255,0.07); white-space:nowrap; }
        .au-td { padding:10px 12px; font-size:12px; color:rgba(255,255,255,0.65); border-bottom:1px solid rgba(255,255,255,0.04); white-space:nowrap; }
        .au-tr:hover { background:rgba(255,255,255,0.03); }
        .au-pagination { display:flex; align-items:center; justify-content:center; gap:12px; margin-top:16px; flex-wrap:wrap; }

        /* Mobile Cards — show on small screens */
        .au-mobile-cards { display:none; }
        .au-desktop-table { display:block; }

        @media(max-width:640px) {
          .au-mobile-cards  { display:flex; flex-direction:column; gap:10px; }
          .au-desktop-table { display:none; }
          .au-filters { flex-direction:column; }
          .au-filters input, .au-filters select { width:100%; min-width:unset; }
        }
      `}</style>

      <div className="au-wrap">
        {/* Header */}
        <div className="au-header">
          <div>
            <p style={s.title}>👥 Manage Users</p>
            <p style={s.sub}>{total} total users registered</p>
          </div>
        </div>

        {/* Filters */}
        <div style={s.card}>
          <form onSubmit={handleSearch} className="au-filters">
            <input style={s.inp}
              placeholder="Search name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <select style={s.inp} value={role}
              onChange={e => { setRole(e.target.value); setPage(1); }}>
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="employer">Employer</option>
              <option value="worker">Worker</option>
            </select>
            <button type="submit" style={s.searchBtn}>🔍 Search</button>
            <button type="button" style={s.resetBtn}
              onClick={() => { setSearch(""); setRole(""); setPage(1); setTimeout(fetchUsers,100); }}>
              Reset
            </button>
          </form>
        </div>

        {/* Table Card */}
        <div style={s.card}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:8 }}>
            <p style={s.cardTitle}>All Users</p>
            <span style={s.countBadge}>{total} users</span>
          </div>

          {loading ? (
            <p style={s.loadingText}>Loading users...</p>
          ) : users.length === 0 ? (
            <div style={s.empty}>
              <span style={{ fontSize:32 }}>🔍</span>
              <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13, margin:"8px 0 0" }}>No users found</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="au-desktop-table">
                <div className="au-table-wrap">
                  <table className="au-table">
                    <thead>
                      <tr>
                        {["User","Role","Phone","Verified","Auth","Joined","Action"].map(h => (
                          <th key={h} className="au-th">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u._id} className="au-tr">
                          <td className="au-td">
                            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                              <div style={{ ...s.avatar, background:RC[u.role]?.bg, color:RC[u.role]?.color }}>
                                {u.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <p style={{ margin:0, fontSize:12, color:"#fff", fontWeight:500 }}>{u.name}</p>
                                <p style={{ margin:0, fontSize:10, color:"rgba(255,255,255,0.35)" }}>{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="au-td">
                            <span style={{ ...s.pill, background:RC[u.role]?.bg, color:RC[u.role]?.color }}>
                              {u.role}
                            </span>
                          </td>
                          <td className="au-td">{u.phone || "—"}</td>
                          <td className="au-td">
                            <span style={{ ...s.pill, background:u.isVerified?"rgba(110,231,183,0.1)":"rgba(248,113,113,0.1)", color:u.isVerified?"#6ee7b7":"#f87171" }}>
                              {u.isVerified ? "✓ Yes" : "✕ No"}
                            </span>
                          </td>
                          <td className="au-td">
                            <span style={{ ...s.pill, background:u.authType==="google"?"rgba(66,133,244,0.15)":"rgba(255,255,255,0.08)", color:u.authType==="google"?"#7dd3fc":"rgba(255,255,255,0.5)" }}>
                              {u.authType === "google" ? "🔵 Google" : "📧 Email"}
                            </span>
                          </td>
                          <td className="au-td">{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td className="au-td">
                            <button style={s.deleteBtn} onClick={() => handleDelete(u._id, u.name)}>
                              🗑 Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="au-mobile-cards">
                {users.map(u => (
                  <div key={u._id} style={s.mobileCard}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ ...s.avatar, background:RC[u.role]?.bg, color:RC[u.role]?.color }}>
                          {u.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p style={{ margin:0, fontSize:13, color:"#fff", fontWeight:500 }}>{u.name}</p>
                          <p style={{ margin:0, fontSize:10, color:"rgba(255,255,255,0.35)" }}>{u.email}</p>
                        </div>
                      </div>
                      <span style={{ ...s.pill, background:RC[u.role]?.bg, color:RC[u.role]?.color }}>
                        {u.role}
                      </span>
                    </div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
                      <span style={{ ...s.pill, background:u.isVerified?"rgba(110,231,183,0.1)":"rgba(248,113,113,0.1)", color:u.isVerified?"#6ee7b7":"#f87171" }}>
                        {u.isVerified ? "✓ Verified" : "✕ Unverified"}
                      </span>
                      <span style={{ ...s.pill, background:u.authType==="google"?"rgba(66,133,244,0.15)":"rgba(255,255,255,0.08)", color:u.authType==="google"?"#7dd3fc":"rgba(255,255,255,0.5)" }}>
                        {u.authType === "google" ? "🔵 Google" : "📧 Email"}
                      </span>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,0.35)" }}>
                        Joined: {new Date(u.createdAt).toLocaleDateString()}
                      </p>
                      <button style={s.deleteBtn} onClick={() => handleDelete(u._id, u.name)}>
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="au-pagination">
              <button style={{ ...s.pageBtn, opacity: page===1 ? 0.4 : 1 }}
                disabled={page===1} onClick={() => setPage(p => p-1)}>← Prev</button>
              <span style={{ fontSize:12, color:"rgba(255,255,255,0.4)" }}>Page {page} of {pages}</span>
              <button style={{ ...s.pageBtn, opacity: page===pages ? 0.4 : 1 }}
                disabled={page===pages} onClick={() => setPage(p => p+1)}>Next →</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const s = {
  title:      { fontFamily:"'Sora',sans-serif", fontSize:"clamp(16px,4vw,20px)", fontWeight:600, color:"#fff", margin:0 },
  sub:        { fontSize:12, color:"rgba(255,255,255,0.35)", margin:"4px 0 0" },
  card:       { background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:16, padding:"16px 20px", marginBottom:14 },
  cardTitle:  { fontSize:14, fontWeight:500, color:"#fff", margin:0 },
  countBadge: { background:"rgba(124,58,237,0.2)", border:"1px solid rgba(124,58,237,0.3)", borderRadius:20, padding:"2px 10px", fontSize:11, color:"#c4b5fd" },
  inp:        { padding:"9px 12px", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:10, color:"#fff", fontSize:12, fontFamily:"inherit", outline:"none", appearance:"none", WebkitAppearance:"none" },
  searchBtn:  { padding:"9px 18px", borderRadius:10, background:"linear-gradient(135deg,#7c3aed,#4f46e5)", border:"none", color:"#fff", fontSize:12, cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" },
  resetBtn:   { padding:"9px 18px", borderRadius:10, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.5)", fontSize:12, cursor:"pointer", fontFamily:"inherit" },
  avatar:     { width:32, height:32, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:600, flexShrink:0 },
  pill:       { display:"inline-block", padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:500 },
  deleteBtn:  { padding:"5px 12px", borderRadius:8, border:"1px solid rgba(248,113,113,0.4)", background:"rgba(248,113,113,0.1)", color:"#f87171", fontSize:11, cursor:"pointer", fontFamily:"inherit" },
  pageBtn:    { padding:"7px 16px", borderRadius:9, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(255,255,255,0.6)", fontSize:12, cursor:"pointer", fontFamily:"inherit" },
  loadingText:{ color:"rgba(255,255,255,0.4)", fontSize:13, textAlign:"center", padding:20 },
  empty:      { textAlign:"center", padding:32 },
  mobileCard: { background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:12, padding:"14px 16px" },
};