import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const role = userProfile?.role;

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  /* Active link style helper */
  const navLink = ({ isActive }) =>
    `btn btn-ghost btn-sm ${isActive ? "!bg-brand-500/15 !text-brand-300 !border-brand-500/40" : ""}`;

  return (
    <nav className="sticky top-0 z-50 bg-dark-900/85 border-b border-white/[0.07] backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16 gap-4">

        {/* ── Brand ── */}
        <Link to="/"
          className="text-xl font-black bg-gradient-to-r from-brand-400 to-pink-400 bg-clip-text text-transparent shrink-0">
          ⚡ Part Time
        </Link>

        {/* ── Nav Links ── */}
        <div className="flex items-center gap-1 overflow-x-auto">

          {/* Student navigation */}
          {role === "student" && (
            <>
              <NavLink to="/student/feed"         className={navLink} id="nav-find-jobs">
                🔍 Find Jobs
              </NavLink>
              <NavLink to="/student/applications" className={navLink} id="nav-my-apps">
                📋 My Apps
              </NavLink>
            </>
          )}

          {/* Poster navigation */}
          {role === "poster" && (
            <>
              <NavLink to="/poster/dashboard"  className={navLink} id="nav-dashboard">
                📊 My Dashboard
              </NavLink>
              <NavLink to="/poster/post-job"   className={navLink} id="nav-post-job">
                ＋ Post Job
              </NavLink>
              <NavLink to="/poster/scan-qr"    className={navLink} id="nav-scan-qr">
                📷 Scan QR
              </NavLink>
            </>
          )}
        </div>

        {/* ── User info ── */}
        <div className="flex items-center gap-2 shrink-0">
          <span className={`badge text-[11px] hidden sm:inline-flex
            ${role === "poster" ? "badge-poster" : "badge-student"}`}>
            {role === "poster" ? "📋 Poster" : "🎓 Student"}
          </span>
          <span className="text-slate-400 text-sm max-w-[130px] truncate hidden md:block">
            {userProfile?.name || currentUser.email}
          </span>
          <button id="logout-btn" className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
