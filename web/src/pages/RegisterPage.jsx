import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SRI_LANKA_UNIVERSITIES = [
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

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [role, setRole]         = useState("student");
  const [name, setName]         = useState("");
  const [university, setUniversity] = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !email || !password) return setError("Please fill in all required fields.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    try {
      setError("");
      setLoading(true);
      await register(email, password, { name, university, role });
      navigate(role === "poster" ? "/poster/dashboard" : "/student/feed");
    } catch (err) {
      const msg = err.code === "auth/email-already-in-use"
        ? "This email is already registered. Try logging in."
        : err.message.replace("Firebase:", "").trim();
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-dark-900 bg-hero-glow">
      <div className="w-full max-w-md animate-fade-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-brand-400 to-pink-400 bg-clip-text text-transparent">
            Part Time
          </h1>
          <p className="text-slate-500 text-sm mt-1">Create your account to get started</p>
        </div>

        {/* Card */}
        <div className="bg-dark-600/80 border border-white/10 rounded-3xl p-8 shadow-card backdrop-blur-xl">

          {/* Role Selector */}
          <div className="mb-6">
            <p className="form-label">I am a…</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "student", icon: "🎓", label: "Student" },
                { id: "poster",  icon: "📋", label: "Job Poster" },
              ].map(({ id, icon, label }) => (
                <button
                  key={id}
                  id={`role-${id}`}
                  type="button"
                  onClick={() => setRole(id)}
                  className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 text-sm font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer
                    ${role === id
                      ? "border-brand-500 bg-brand-500/10 text-brand-300 shadow-glow-sm"
                      : "border-white/10 text-slate-500 hover:border-brand-500/50 hover:text-brand-300 hover:bg-brand-500/5"
                    }`}
                >
                  <span className="text-2xl">{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="alert alert-error mb-5">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="form-label" htmlFor="reg-name">Full Name *</label>
              <input id="reg-name" type="text" className="input"
                placeholder="Kasun Perera"
                value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            {/* University */}
            {role === "student" && (
              <div>
                <label className="form-label" htmlFor="reg-uni">University</label>
                <select id="reg-uni" className="input"
                  value={university} onChange={(e) => setUniversity(e.target.value)}>
                  <option value="">Select your university…</option>
                  {SRI_LANKA_UNIVERSITIES.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="form-label" htmlFor="reg-email">Email Address *</label>
              <input id="reg-email" type="email" className="input"
                placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            {/* Password */}
            <div>
              <label className="form-label" htmlFor="reg-password">Password *</label>
              <input id="reg-password" type="password" className="input"
                placeholder="Min. 6 characters"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <button
              id="register-btn"
              type="submit"
              className="btn btn-primary btn-full mt-2"
              disabled={loading}
            >
              {loading
                ? "Creating account…"
                : `Register as ${role === "poster" ? "Job Poster" : "Student"}`}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-brand-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
