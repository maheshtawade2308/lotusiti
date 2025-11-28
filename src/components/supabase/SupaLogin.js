
import React, { useState } from "react";
// import { useAuth } from "./AuthContext";
import { supabase } from "./supabaseClient";
import { useNavigate } from "react-router-dom";
export default function SupaLogin() {
  // const { login, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
      // fetch profile from context, wait a moment
      setTimeout(() => {
      
        navigate("/");
      }, 400);
    } catch (err) {
      alert(err.message || "Login failed");
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "60px auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)} />
        <input type="password" className="form-control mb-2" placeholder="Password"
          value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn btn-primary w-100">Login</button>
      </form>
    </div>
  );
}
