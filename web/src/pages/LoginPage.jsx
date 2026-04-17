import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError("");
      setLoading(true);
      await login(email, password);
      navigate("/");
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-dark-900 bg-hero-glow">
      <div className="w-full max-w-md animate-fade-up">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black bg-gradient-to-r from-brand-400 to-pink-400 bg-clip-text text-transparent">
            Part Time
          </h1>
          <p className="text-slate-500 text-sm mt-1">Sign in to continue to your dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-dark-600/80 border border-white/10 rounded-3xl p-8 shadow-card backdrop-blur-xl">

          {error && <div className="alert alert-error mb-5">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input id="login-email" type="email" className="input"
                placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div>
              <label className="form-label" htmlFor="login-password">Password</label>
              <input id="login-password" type="password" className="input"
                placeholder="Your password"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <button id="login-btn" type="submit" className="btn btn-primary btn-full mt-2" disabled={loading}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          {/* Demo hint */}
          <div className="alert alert-info mt-5 text-xs">
            <span className="font-bold">Tip:</span> Register first, then sign in. Firebase Auth is live with your project.
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            New to Part Time?{" "}
            <Link to="/register" className="text-brand-400 font-semibold hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
