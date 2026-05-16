import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../components/auth/AuthContext";
import { toast, ToastContainer } from 'react-toastify';
import '../components/css/global.css';

function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      toast.success("यशस्वी लॉगिन!");
      navigate("/dashboard");
    } catch (err) {
      console.error("Supabase error:", err.message);
      if (err.message.includes("Invalid login credentials")) {
        toast.error("चुकीचा ईमेल किंवा पासवर्ड");
      } else {
        toast.error("Login failed. Please try again.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="lotus-login-bg">
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="lotus-login-card">
        {/* Logo / Title */}
        <div className="text-center mb-4">
          <div style={{
            fontSize: "3rem", lineHeight: 1,
            background: "linear-gradient(135deg, #818cf8, #c084fc)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: "0.75rem"
          }}>
            🌾
          </div>
          <h2 style={{
            fontWeight: 800, fontSize: "1.6rem",
            background: "linear-gradient(90deg, #818cf8, #c084fc)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: "0.25rem"
          }}>
            Lotus ITI Portal
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.875rem", margin: 0 }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label htmlFor="email" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", fontWeight: 500 }}>
              Email / ईमेल
            </label>
            <input
              type="email"
              className="form-control mt-1"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.875rem", fontWeight: 500 }}>
              Password / पासवर्ड
            </label>
            <input
              type="password"
              className="form-control mt-1"
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? "Signing in..." : "Login / लॉगिन करा"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
