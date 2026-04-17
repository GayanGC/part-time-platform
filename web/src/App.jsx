import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";

// Pages
import LoginPage               from "./pages/LoginPage";
import RegisterPage            from "./pages/RegisterPage";
import PosterDashboard         from "./pages/PosterDashboard";
import PostJobPage             from "./pages/PostJobPage";
import ManageApplicationsPage  from "./pages/ManageApplicationsPage";
import AttendanceScannerPage   from "./pages/AttendanceScannerPage";
import StudentFeedPage         from "./pages/StudentFeedPage";
import MyApplicationsPage      from "./pages/MyApplicationsPage";

/* ── Guards ─────────────────────────────────────────────────── */
function RequireAuth({ children }) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" replace />;
}

function RequireRole({ role, children }) {
  const { userProfile } = useAuth();
  if (!userProfile) return <div className="spinner mt-32" />;
  return userProfile.role === role
    ? children
    : <Navigate to="/" replace />;
}

/* ── Root redirect ───────────────────────────────────────────── */
function RootRedirect() {
  const { currentUser, userProfile } = useAuth();
  if (!currentUser)                      return <Navigate to="/login"           replace />;
  if (userProfile?.role === "poster")    return <Navigate to="/poster/dashboard" replace />;
  if (userProfile?.role === "student")   return <Navigate to="/student/feed"     replace />;
  return <div className="spinner mt-32" />;
}

/* ── App Shell ───────────────────────────────────────────────── */
function AppShell() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Root */}
          <Route path="/" element={<RequireAuth><RootRedirect /></RequireAuth>} />

          {/* ── Poster routes ───────────────────────────────── */}
          <Route path="/poster/dashboard"
            element={
              <RequireAuth><RequireRole role="poster">
                <PosterDashboard />
              </RequireRole></RequireAuth>
            }
          />
          <Route path="/poster/post-job"
            element={
              <RequireAuth><RequireRole role="poster">
                <PostJobPage />
              </RequireRole></RequireAuth>
            }
          />
          <Route path="/poster/applications/:jobId"
            element={
              <RequireAuth><RequireRole role="poster">
                <ManageApplicationsPage />
              </RequireRole></RequireAuth>
            }
          />
          <Route path="/poster/scan-qr"
            element={
              <RequireAuth><RequireRole role="poster">
                <AttendanceScannerPage />
              </RequireRole></RequireAuth>
            }
          />

          {/* ── Student routes ───────────────────────────────── */}
          <Route path="/student/feed"
            element={
              <RequireAuth><RequireRole role="student">
                <StudentFeedPage />
              </RequireRole></RequireAuth>
            }
          />
          <Route path="/student/applications"
            element={
              <RequireAuth><RequireRole role="student">
                <MyApplicationsPage />
              </RequireRole></RequireAuth>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
