import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function RegisterUser() {
  const { signup, profile } = useAuth();
  const navigate = useNavigate();
 
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    gender: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // If non-admin tries to open this page
  if (profile?.role !== "admin") {
    return;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      await signup(form);
      setMsg("✅ User registered successfully!");
      setForm({
        name: "",
        email: "",
        mobile: "",
        address: "",
        gender: "",
        password: ""
      });

      setTimeout(() => navigate("/user-list"), 1500);

    } catch (err) {
      console.error(err);
      setMsg("❌ " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h2 className="text-center mb-4">👤 Register New User</h2>

      {msg && (
        <div className={`alert ${msg.startsWith("❌") ? "alert-danger" : "alert-success"}`}>
          {msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="border p-4 rounded shadow">

        <div className="mb-3">
          <label className="form-label fw-bold">Full Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Mobile Number</label>
          <input
            type="text"
            name="mobile"
            value={form.mobile}
            onChange={handleChange}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">City</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            className="form-control"
            rows="2"
            required
          ></textarea>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Gender</label>
          <select
            name="gender"
            value={form.gender}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male 👨</option>
            <option value="Female">Female 👩</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="form-control"
            required
            minLength={6}
          />
        </div>

        <button
          className="btn btn-primary w-100"
          type="submit"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register User"}
        </button>
      </form>
    </div>
  );
}
