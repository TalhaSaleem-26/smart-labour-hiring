import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";

// Auth Pages
import PostJob          from "./pages/employer/PostJob";
import EmployerJobs     from "./pages/employer/EmployerJobs";
import WorkerFindJobs   from "./pages/worker/WorkerFindJobs";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import VerifyOtp from "./pages/VerifyOtp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import WorkerRegistration from "./pages/worker/WorkerRegistration";
import WorkerProfile      from "./pages/worker/WorkerProfile";
import WorkerSettings     from "./pages/worker/WorkerSettings";
import EmployerSettings from "./pages/employer/EmployerSettings";
import EmployerWorkers from "./pages/employer/EmployerWorkers";
// Dashboard Pages
import AdminDashboard from "./pages/AdminDashboard";
import EmployerDashboard from "./pages/EmployerDashboard";
import WorkerDashboard from "./pages/WorkerDashboard";
import LocationWorkerPage from "./pages/employer/LocationWorkerPage";

// Components
// import ProtectedRoute  from "./components/ProtectedRoute";
import ProtectedRoute from "./components/ProctectedRoute";
import useCurrentUser from "./hooks/useCurrentUser";
import { getRolePath } from "./utils/roleNavigate";
//Admin Dashboard
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
// import WorkerMyApplications from "./pages/worker/WorkerMyApplications";
import EmployerApplications from "./pages/employer/EmployerApplications";
// import EmployerApplications from "./pages/employer/EmployerApplications";

export default function App() {
  useCurrentUser();
  const { user, isAuthenticated } = useSelector((s) => s.auth);
  
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1e1b4b",
            color: "#fff",
            border: "1px solid rgba(139,92,246,0.4)",
            fontSize: "13px",
          },
          success: { iconTheme: { primary: "#a78bfa", secondary: "#fff" } },
          error: { iconTheme: { primary: "#f87171", secondary: "#fff" } },
        }}
      />

      <Routes>
        {/* ── Public Routes ── */}
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Signin />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* ── Root Redirect ── */}
        <Route
          path="/"
          element={
            isAuthenticated && user ? (
              <Navigate to={getRolePath(user.role)} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* ── Protected Dashboard Routes ── */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Admin */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminSettings />
              </ProtectedRoute>
            }
          />
          {/* Employer */}
          <Route
            path="/employer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["employer"]}>
                <EmployerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/employer/workers" element={
  <ProtectedRoute allowedRoles={["employer"]}>
    <EmployerWorkers />
  </ProtectedRoute>
}/>

          <Route path="/employer/post-job" element={
  <ProtectedRoute allowedRoles={["employer"]}>
    <PostJob />
  </ProtectedRoute>
}/>
<Route path="/employer/jobs" element={
  <ProtectedRoute allowedRoles={["employer"]}>
    <EmployerJobs />
  </ProtectedRoute>
}/>
<Route path="/employer/settings" element={
  <ProtectedRoute allowedRoles={["employer"]}>
    <EmployerSettings />
  </ProtectedRoute>
}/>
          {/* Worker */}
         {/* ── Worker Routes ── */}
<Route path="/worker/dashboard" element={
  <ProtectedRoute allowedRoles={["worker"]}>
    <WorkerDashboard />
  </ProtectedRoute>
}/>


<Route path="/employer/applications/:jobId" element={
  <ProtectedRoute allowedRoles={["employer"]}>
    <EmployerApplications />
  </ProtectedRoute>
}/>

<Route path="/employer/location-workers" element={
  <ProtectedRoute allowedRoles={["employer"]}>
    <LocationWorkerPage />
  </ProtectedRoute>
}/>

<Route path="/worker/register" element={
  <ProtectedRoute allowedRoles={["worker"]}>
    <WorkerRegistration />
  </ProtectedRoute>
}/>
<Route path="/worker/jobs" element={
  <ProtectedRoute allowedRoles={["worker"]}>
    <WorkerFindJobs />
  </ProtectedRoute>
}/>

<Route path="/worker/profile" element={
  <ProtectedRoute allowedRoles={["worker"]}>
    <WorkerProfile />
  </ProtectedRoute>
}/>

<Route path="/worker/settings" element={
  <ProtectedRoute allowedRoles={["worker"]}>
    <WorkerSettings />
  </ProtectedRoute>
}/>


{/* <Route path="/worker/jobs" element={
  <ProtectedRoute allowedRoles={["worker"]}>
    <div style={{ textAlign:"center", padding:40 }}>
      <p style={{ fontSize:32 }}>🚧</p>
      <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13 }}>
        Jobs module coming in P1 Final
      </p>
    </div>
  </ProtectedRoute>
}/> */}

{/* <Route path="/worker/reviews" element={
  <ProtectedRoute allowedRoles={["worker"]}>
    <div style={{ textAlign:"center", padding:40 }}>
      <p style={{ fontSize:32 }}>🚧</p>
      <p style={{ color:"rgba(255,255,255,0.4)", fontSize:13 }}>
        Reviews module coming in P2 Mid
      </p>
    </div>
  </ProtectedRoute>
}/> */}
        </Route>

        {/* ── Unauthorized ── */}
        <Route
          path="/unauthorized"
          element={
            <div
              style={{
                minHeight: "100vh",
                background: "#0a0a1a",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <p style={{ color: "#f87171", fontSize: 20 }}>⛔ Access Denied</p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
                You don't have permission to view this page.
              </p>
              <a href="/login" style={{ color: "#a78bfa", fontSize: 13 }}>
                Go to Login
              </a>
            </div>
          }
        />

        {/* ── 404 ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
