import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useSelector(s => s.auth);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0a0a1a", display:"flex", alignItems:"center", justifyContent:"center", color:"#a78bfa", fontSize:14 }}>
      Loading...
    </div>
  );

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}