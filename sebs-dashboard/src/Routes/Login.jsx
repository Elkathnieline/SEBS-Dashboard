// src/components/Login.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import useAuth from "../Hooks/UseAuth";
import WavePattern from "../Components/Common/WavePatter";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState();
  const [showPassword, setShowPassword] = useState(false);
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to intended page after login, or dashboard by default
  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleSubmit = e => {
    e.preventDefault();
    setError(null);

    login(username.trim(), password)
      .then(() => {
        navigate("/dashboard", { replace: true });
      })
      .catch(err => {
        setError(err?.message === "Login failed" ? "Invalid credentials" : err?.message || "Login failed");
      });
  };

  return (
    <div className="h-screen relative flex items-center justify-center bg-base-200 overflow-hidden">
      {/* Wave Pattern Background */}
      <div className="absolute inset-0 z-0">
        <WavePattern />
      </div>
      {/* Outer Glass Container */}
      <div className="absolute z-10 max-w-md w-full mx-4 h-auto rounded-3xl bg-white/90 opacity-90 shadow-xl border border-white/30 py-80 px-170" />
      {/* Inner Login Form Card */}
      <div className="card relative z-20 max-w-md w-full mx-4 bg-base-300 shadow-xl">
        <div className="card-body p-8 w-full">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-secondary mb-2">logo</h1>
            <h2 className="text-lg font-medium text-black ">Admin Dashboard</h2>
          </div>
          {/* Error Message */}
          {error && (
            <div className="alert alert-error mb-4">
              <span className="text-sm">{error}</span>
            </div>
          )}
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div className="form-control">
              <label className="label pb-2">
                <span className="label-text text-base-content font-medium">Username</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="input input-bordered w-full bg-base-100/60 focus:border-primary"
                required
              />
            </div>
            {/* Password Field */}
            <div className="form-control">
              <label className="label pb-2">
                <span className="label-text text-base-content font-medium">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input input-bordered w-full pr-12 bg-base-100/60 focus:border-primary"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-base-content/60 hover:text-base-content transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              <label className="label justify-end pt-2">
                <a href="#" className="label-text-alt text-base-content/70 hover:text-primary transition-colors">
                  Forgot password?
                </a>
              </label>
            </div>
            {/* Submit Button */}
            <div className="form-control mt-8">
              <button
                type="submit"
                className="btn btn-primary w-full text-white font-semibold hover:bg-primary-focus transition-colors rounded-3xl shadow-lg"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
