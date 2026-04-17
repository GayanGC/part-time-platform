import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { QRCodeSVG } from "qrcode.react";

/* ── Status pill ────────────────────────────────────────────── */
const STATUS_CONFIG = {
  pending:   { label: "Pending Review", badge: "badge-pending",  icon: "⏳" },
  approved:  { label: "Approved",       badge: "badge-approved", icon: "✅" },
  rejected:  { label: "Rejected",       badge: "badge-rejected", icon: "❌" },
  completed: { label: "Attended",       badge: "badge-approved", icon: "🏁" },
};

export default function MyApplicationsPage() {
  const { currentUser } = useAuth();

  const [apps, setApps]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQR, setActiveQR] = useState(null); // app whose QR is expanded

  useEffect(() => {
    async function fetchApps() {
      try {
        const q    = query(
          collection(db, "applications"),
          where("studentUid", "==", currentUser.uid),
          orderBy("appliedAt", "desc")
        );
        const snap = await getDocs(q);
        setApps(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } finally {
        setLoading(false);
      }
    }
    fetchApps();
  }, [currentUser]);

  const counts = {
    pending:   apps.filter((a) => a.status === "pending").length,
    approved:  apps.filter((a) => a.status === "approved").length,
    rejected:  apps.filter((a) => a.status === "rejected").length,
    completed: apps.filter((a) => a.status === "completed").length,
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 animate-fade-up">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-100">My Applications 📋</h1>
        <p className="text-slate-500 text-sm mt-1">
          Track the status of all your job applications.
        </p>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3 mb-8">
        {[
          { label: "Pending",  count: counts.pending,   color: "text-amber-400"   },
          { label: "Approved", count: counts.approved,  color: "text-emerald-400" },
          { label: "Rejected", count: counts.rejected,  color: "text-red-400"     },
          { label: "Attended", count: counts.completed, color: "text-sky-400"     },
        ].map(({ label, count, color }) => (
          <div key={label}
            className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-2">
            <span className={`font-black text-lg ${color}`}>{count}</span>
            <span className="text-slate-500 text-xs uppercase tracking-widest">{label}</span>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="spinner" />
      ) : apps.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4 opacity-30">📭</div>
          <p className="text-slate-400 font-semibold">No applications yet.</p>
          <p className="text-slate-600 text-sm mt-1">
            Head to the Job Feed to find and apply for jobs.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              isQROpen={activeQR === app.id}
              onToggleQR={() => setActiveQR(activeQR === app.id ? null : app.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Application Card ─────────────────────────────────────────── */
function AppCard({ app, isQROpen, onToggleQR }) {
  const config = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;

  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6
                    transition-all duration-200 hover:bg-white/[0.06]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        {/* Left: job info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-base font-bold text-slate-100 truncate">
              {app.jobTitle || "Job Application"}
            </h3>
            <span className={`badge ${config.badge}`}>
              {config.icon} {config.label}
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
            <span>🎓 {app.university || "—"}</span>
            <span>
              📅 Applied {app.appliedAt
                ? new Date(app.appliedAt).toLocaleDateString("en-LK", {
                    day: "numeric", month: "short", year: "numeric",
                  })
                : "—"}
            </span>
            {app.approvedAt && (
              <span>
                ✅ Approved{" "}
                {new Date(app.approvedAt).toLocaleDateString("en-LK", {
                  day: "numeric", month: "short",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Right: action */}
        {app.status === "approved" && app.qrCode && (
          <button
            id={`show-qr-${app.id}`}
            className="btn btn-primary btn-sm shrink-0"
            onClick={onToggleQR}
          >
            {isQROpen ? "Hide QR" : "Show QR Code 📲"}
          </button>
        )}

        {app.status === "pending" && (
          <span className="text-xs text-amber-400 font-medium shrink-0">
            Awaiting poster review…
          </span>
        )}

        {app.status === "completed" && (
          <span className="text-xs text-sky-400 font-bold shrink-0">🏁 Attendance Recorded</span>
        )}
      </div>

      {/* QR Code Panel */}
      {app.status === "approved" && isQROpen && app.qrCode && (
        <div className="mt-6 pt-6 border-t border-white/[0.08] flex flex-col items-center gap-4 animate-fade-up">
          <p className="text-sm text-slate-400 text-center">
            Show this QR code to the Job Poster at the event for attendance.
          </p>
          <div className="p-5 bg-white rounded-2xl shadow-glow">
            <QRCodeSVG value={app.qrCode} size={200} />
          </div>
          <p className="text-[11px] text-slate-600 font-mono text-center break-all max-w-xs">
            {app.qrCode}
          </p>
          <span className="badge badge-approved">✓ Approved Attendance QR</span>
        </div>
      )}
    </div>
  );
}
