import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function RegisterUser({ isModal = false, onSuccess = null }) {
  const { signup, profile } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    gender: "",
    password: "",
    balance_points: "",
    center_name: ""
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // If non-admin tries to open this page
  if (profile?.role !== "admin") {
    return null;
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
        password: "",
        balance_points: "",
        center_name: ""
      });

      if (onSuccess) {
        // Embedded in modal — notify parent to refresh & close
        setTimeout(() => { setMsg(""); onSuccess(); }, 1500);
      } else {
        // Standalone page — navigate back to user list
        setTimeout(() => navigate("/user-list"), 1500);
      }

    } catch (err) {
      console.error(err);
      setMsg("❌ " + err.message);
    }

    setLoading(false);
  };

  const formContent = (
    <>
      {msg && (
        <div className={`alert ${msg.startsWith("❌") ? "alert-danger" : "alert-success"}`}>
          {msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className={isModal ? "row g-3" : "border p-4 rounded shadow"}>

        <div className={isModal ? "col-md-6" : "mb-3"}>
          <label className="form-label fw-bold">Full Name</label>
          <input type="text" name="name" value={form.name} onChange={handleChange}
            className="form-control" required />
        </div>

        <div className={isModal ? "col-md-6" : "mb-3"}>
          <label className="form-label fw-bold">Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange}
            className="form-control" required />
        </div>

        <div className={isModal ? "col-md-6" : "mb-3"}>
          <label className="form-label fw-bold">Mobile Number</label>
          <input type="text" name="mobile" value={form.mobile} onChange={handleChange}
            className="form-control" required />
        </div>

        <div className={isModal ? "col-md-6" : "mb-3"}>
          <label className="form-label fw-bold">City / Address</label>
          <textarea name="address" value={form.address} onChange={handleChange}
            className="form-control" rows="2" required></textarea>
        </div>

        <div className={isModal ? "col-md-6" : "mb-3"}>
          <label className="form-label fw-bold">Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange}
            className="form-select" required>
            <option value="">Select Gender</option>
            <option value="Male">Male 👨</option>
            <option value="Female">Female 👩</option>
          </select>
        </div>

        <div className={isModal ? "col-md-6" : "mb-3"}>
          <label className="form-label fw-bold">Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange}
            className="form-control" required minLength={6} />
        </div>

        <div className={isModal ? "col-md-6" : "mb-3"}>
          <label className="form-label fw-bold">Initial Balance Points</label>
          <input type="number" name="balance_points" value={form.balance_points} onChange={handleChange}
            className="form-control" min="0" />
        </div>

        <div className={isModal ? "col-md-6" : "mb-3"}>
          <label className="form-label fw-bold">Center Name</label>
          <input type="text" name="center_name" value={form.center_name} onChange={handleChange}
            className="form-control" placeholder="e.g. Lotus Computer Institute" />
        </div>

        <div className={isModal ? "col-12 d-flex justify-content-end" : ""}>
          <button className={isModal ? "btn btn-primary" : "btn btn-primary w-100"}
            type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register User"}
          </button>
        </div>
      </form>
    </>
  );

  if (isModal) return formContent;

  return (
    <div className="container mt-5" style={{ maxWidth: "600px" }}>
      <h2 className="text-center mb-4">👤 Register New User</h2>
      {formContent}
    </div>
  );
}
