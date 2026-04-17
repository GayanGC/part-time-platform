import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function PosterDashboard() {
  const { currentUser, userProfile } = useAuth();
  const [jobs, setJobs]       = useState([]);
  const [appCounts, setAppCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const q    = query(collection(db, "jobs"), where("posterUid","==", currentUser.uid), orderBy("createdAt","desc"));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setJobs(list);

        const counts = {};
        await Promise.all(list.map(async (job) => {
          const aq   = query(collection(db, "applications"), where("jobId","==", job.id));
          const asnap = await getDocs(aq);
          counts[job.id] = asnap.size;
        }));
        setAppCounts(counts);
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [currentUser]);

  const totalApps = Object.values(appCounts).reduce((a, b) => a + b, 0);
  const openJobs  = jobs.filter((j) => j.status === "open").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-up">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-100">
            Welcome back, {userProfile?.name?.split(" ")[0] || "Poster"} 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Manage your job listings and review applicants.</p>
        </div>
        <Link to="/poster/post-job" className="btn btn-primary self-start sm:self-auto">
          ＋ Post New Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
        {[
          { label: "Total Jobs",    value: jobs.length,  icon: "📋" },
          { label: "Open Jobs",     value: openJobs,     icon: "🟢" },
          { label: "Applications",  value: totalApps,    icon: "📩" },
        ].map(({ label, value, icon }) => (
          <div key={label}
            className="bg-dark-600/60 border border-white/[0.08] rounded-2xl p-5 text-center">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-4xl font-black text-brand-300">{value}</div>
            <div className="text-xs uppercase tracking-widest text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Job grid */}
      <h2 className="text-xl font-bold text-slate-200 mb-4">Your Listings</h2>

      {loading ? (
        <div className="spinner" />
      ) : jobs.length === 0 ? (
        <div className="text-center py-24 text-slate-500">
          <div className="text-5xl mb-4 opacity-40">📋</div>
          <p className="font-semibold text-slate-400">No jobs posted yet.</p>
          <p className="text-sm mt-1">Click "Post New Job" to publish your first listing.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} appCount={appCounts[job.id] || 0} />
          ))}
        </div>
      )}
    </div>
  );
}

function JobCard({ job, appCount }) {
  return (
    <div className="card flex flex-col gap-4">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className={`badge ${job.status === "open" ? "badge-approved" : "badge-rejected"}`}>
          {job.status === "open" ? "● Open" : "● Closed"}
        </span>
        <span className="text-xs text-slate-600">
          {job.createdAt?.toDate?.()?.toLocaleDateString() ?? "—"}
        </span>
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-100">{job.title}</h3>
        <div className="mt-2 space-y-1.5 text-sm text-slate-400">
          <Row icon="📍" text={job.location} />
          <Row icon="💰" text={`LKR ${Number(job.salary).toLocaleString()}`} />
          <Row icon="🎓" text={job.university || "Any university"} />
          <Row icon="👥" text={`👦 ${job.boysNeeded}  👧 ${job.girlsNeeded}`} />
        </div>
      </div>

      <div className="border-t border-white/[0.06] pt-3 flex items-center justify-between">
        <span className="text-xs text-slate-500">🗂 {appCount} Applicant{appCount !== 1 ? "s" : ""}</span>
        <Link
          to={`/poster/applications/${job.id}`}
          className="btn btn-ghost btn-sm"
        >
          View Apps →
        </Link>
      </div>
    </div>
  );
}

function Row({ icon, text }) {
  return (
    <div className="flex items-center gap-2">
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}
