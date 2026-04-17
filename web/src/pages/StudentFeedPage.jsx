import { useEffect, useState } from "react";
import {
  collection, query, getDocs, orderBy, where, addDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";

const UNIVERSITIES = [
  "Any",
  "University of Colombo",
  "University of Peradeniya",
  "University of Kelaniya",
  "University of Moratuwa",
  "University of Sri Jayewardenepura",
  "University of Ruhuna",
  "Eastern University",
  "Rajarata University",
  "Sabaragamuwa University",
  "South Eastern University",
  "Wayamba University",
  "Open University of Sri Lanka",
  "NSBM Green University",
  "SLIIT",
  "Other",
];

export default function StudentFeedPage() {
  const { currentUser, userProfile } = useAuth();

  const [jobs, setJobs]             = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [applying, setApplying]     = useState(null);
  const [appliedSet, setAppliedSet] = useState(new Set());
  const [toast, setToast]           = useState(null); // { msg, type }

  const [filterUni, setFilterUni] = useState("Any");
  const [filterLoc, setFilterLoc] = useState("");

  /* ── fetch jobs + already-applied set ── */
  useEffect(() => {
    async function fetchAll() {
      try {
        const snap = await getDocs(
          query(collection(db, "jobs"), where("status", "==", "open"), orderBy("createdAt", "desc"))
        );
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setJobs(list);
        setFiltered(list);

        const myAppsSnap = await getDocs(
          query(collection(db, "applications"), where("studentUid", "==", currentUser.uid))
        );
        setAppliedSet(new Set(myAppsSnap.docs.map((d) => d.data().jobId)));
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [currentUser]);

  /* ── filtering ── */
  useEffect(() => {
    let list = [...jobs];
    if (filterUni && filterUni !== "Any") {
      list = list.filter((j) => j.university === "Any" || j.university === filterUni);
    }
    if (filterLoc.trim()) {
      list = list.filter((j) =>
        j.location.toLowerCase().includes(filterLoc.trim().toLowerCase())
      );
    }
    setFiltered(list);
  }, [filterUni, filterLoc, jobs]);

  /* ── apply ── */
  async function handleApply(job) {
    if (appliedSet.has(job.id)) return;
    try {
      setApplying(job.id);
      await addDoc(collection(db, "applications"), {
        jobId:       job.id,
        jobTitle:    job.title,
        studentUid:  currentUser.uid,
        studentName: userProfile?.name || "Unknown",
        university:  userProfile?.university || "",
        status:      "pending",
        qrCode:      null,
        appliedAt:   new Date().toISOString(),
      });
      setAppliedSet((prev) => new Set([...prev, job.id]));
      showToast("✓ Application sent! The poster will review it soon.", "success");
    } catch (err) {
      showToast("❌ Failed to apply: " + err.message, "error");
    } finally {
      setApplying(null);
    }
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const clearFilters = () => { setFilterUni("Any"); setFilterLoc(""); };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-up">

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-sm shadow-glow animate-fade-up
          alert ${toast.type === "success" ? "alert-success" : "alert-error"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-100">Find Part-Time Jobs 🎓</h1>
        <p className="text-slate-500 text-sm mt-1">
          Browse open opportunities across Sri Lanka. Apply in one click.
        </p>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-dark-600/60 border border-white/[0.08] rounded-2xl p-5 mb-6
                      flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="form-label" htmlFor="filter-uni">University</label>
          <select id="filter-uni" className="input"
            value={filterUni} onChange={(e) => setFilterUni(e.target.value)}>
            {UNIVERSITIES.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>

        <div className="flex-1">
          <label className="form-label" htmlFor="filter-loc">Location</label>
          <input id="filter-loc" type="text" className="input"
            placeholder="e.g. Colombo, Kandy…"
            value={filterLoc} onChange={(e) => setFilterLoc(e.target.value)} />
        </div>

        {(filterUni !== "Any" || filterLoc) && (
          <button className="btn btn-ghost btn-sm h-[46px] shrink-0" onClick={clearFilters}>
            Clear ✕
          </button>
        )}
      </div>

      {/* Result count */}
      <p className="text-slate-500 text-sm mb-6">
        Showing{" "}
        <span className="text-slate-200 font-bold">{filtered.length}</span>{" "}
        job{filtered.length !== 1 ? "s" : ""}
        {(filterUni !== "Any" || filterLoc) && (
          <span className="text-brand-400"> (filtered)</span>
        )}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="spinner" />
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4 opacity-30">🔍</div>
          <p className="text-slate-400 font-semibold">No jobs match your filters.</p>
          <p className="text-slate-600 text-sm mt-1">Try clearing the filters or check back later.</p>
          {(filterUni !== "Any" || filterLoc) && (
            <button className="btn btn-ghost btn-sm mt-4" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              applied={appliedSet.has(job.id)}
              applying={applying === job.id}
              onApply={() => handleApply(job)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Job Card component ─────────────────────────────────────── */
function JobCard({ job, applied, applying, onApply }) {
  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6
                    flex flex-col gap-4 transition-all duration-200
                    hover:bg-white/[0.07] hover:-translate-y-0.5 hover:shadow-card">
      {/* Title + badge */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-bold text-slate-100 leading-snug">{job.title}</h3>
        <span className="badge badge-approved shrink-0 text-[10px]">Open</span>
      </div>

      {/* Metadata */}
      <div className="space-y-1.5 text-sm text-slate-400 flex-1">
        <InfoRow icon="📍" text={job.location} />
        <InfoRow icon="💰" text={`LKR ${Number(job.salary).toLocaleString()}`} />
        <InfoRow
          icon="🎓"
          text={job.university === "Any" ? "Open to all universities" : job.university}
        />
        <InfoRow icon="👥" text={`👦 ${job.boysNeeded}  ·  👧 ${job.girlsNeeded}`} />
      </div>

      {/* Description */}
      {job.description && (
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {job.description}
        </p>
      )}

      {/* Apply button */}
      <button
        id={`apply-${job.id}`}
        className={`btn btn-full mt-1 transition-all ${
          applied ? "btn-ghost cursor-default opacity-70" : "btn-primary"
        }`}
        onClick={onApply}
        disabled={applied || applying}
      >
        {applying ? "Applying…" : applied ? "✓ Applied" : "Apply Now →"}
      </button>
    </div>
  );
}

function InfoRow({ icon, text }) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}
