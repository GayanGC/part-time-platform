import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const UNIVERSITIES = [
  "Any", "University of Colombo", "University of Peradeniya", "University of Kelaniya",
  "University of Moratuwa", "University of Sri Jayewardenepura", "University of Ruhuna",
  "Eastern University", "Rajarata University", "Sabaragamuwa University",
  "South Eastern University", "Wayamba University", "Open University of Sri Lanka",
  "NSBM Green University", "SLIIT", "Other",
];

export default function PostJobPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: "", salary: "", location: "", university: "Any",
    boysNeeded: 0, girlsNeeded: 0, description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  function set(field) {
    return (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.salary || !form.location)
      return setError("Title, Salary, and Location are required.");
    if (Number(form.boysNeeded) + Number(form.girlsNeeded) < 1)
      return setError("Specify at least 1 person needed (Boys or Girls).");

    try {
      setError("");
      setLoading(true);
      await addDoc(collection(db, "jobs"), {
        title:       form.title.trim(),
        salary:      Number(form.salary),
        location:    form.location.trim(),
        university:  form.university,
        boysNeeded:  Number(form.boysNeeded),
        girlsNeeded: Number(form.girlsNeeded),
        description: form.description.trim(),
        posterUid:   currentUser.uid,
        status:      "open",
        createdAt:   serverTimestamp(),
      });
      setSuccess("✓ Job posted successfully! Redirecting…");
      setTimeout(() => navigate("/poster/dashboard"), 1400);
    } catch (err) {
      setError("Failed to post job: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 animate-fade-up">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-100">Post a New Job</h1>
        <p className="text-slate-500 text-sm mt-1">Fill in the details to publish your listing to students.</p>
      </div>

      <div className="bg-dark-600/60 border border-white/[0.08] rounded-2xl p-7 shadow-card">
        {error   && <div className="alert alert-error   mb-5">{error}</div>}
        {success && <div className="alert alert-success mb-5">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Title */}
          <div>
            <label className="form-label" htmlFor="job-title">Job Title *</label>
            <input id="job-title" type="text" className="input"
              placeholder="e.g. Event Helper, Data Entry Operator"
              value={form.title} onChange={set("title")} required />
          </div>

          {/* Salary + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label" htmlFor="job-salary">Salary (LKR) *</label>
              <input id="job-salary" type="number" className="input"
                placeholder="e.g. 15000" min="0"
                value={form.salary} onChange={set("salary")} required />
            </div>
            <div>
              <label className="form-label" htmlFor="job-location">Location *</label>
              <input id="job-location" type="text" className="input"
                placeholder="e.g. Colombo 03"
                value={form.location} onChange={set("location")} required />
            </div>
          </div>

          {/* University */}
          <div>
            <label className="form-label" htmlFor="job-university">University Preference</label>
            <select id="job-university" className="input"
              value={form.university} onChange={set("university")}>
              {UNIVERSITIES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          {/* Boys / Girls */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label" htmlFor="job-boys">Boys Needed 👦</label>
              <input id="job-boys" type="number" className="input"
                placeholder="0" min="0" max="99"
                value={form.boysNeeded} onChange={set("boysNeeded")} />
            </div>
            <div>
              <label className="form-label" htmlFor="job-girls">Girls Needed 👧</label>
              <input id="job-girls" type="number" className="input"
                placeholder="0" min="0" max="99"
                value={form.girlsNeeded} onChange={set("girlsNeeded")} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="form-label" htmlFor="job-description">Job Description</label>
            <textarea id="job-description" className="input" rows={4}
              placeholder="Describe duties, timings, requirements…"
              value={form.description} onChange={set("description")} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" className="btn btn-ghost"
              onClick={() => navigate("/poster/dashboard")}>
              Cancel
            </button>
            <button id="post-job-btn" type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Posting…" : "🚀 Post Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
