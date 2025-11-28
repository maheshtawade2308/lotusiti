// app/(protected)/admin/page.js
"use client";
import React from "react";
import { useAuth } from "../../AuthContext";

export default function AdminPage() {
  const { profile, logout } = useAuth();

  if (profile?.role !== "admin") return <div>Access denied</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {profile.username}</p>
      <button className="btn btn-danger" onClick={logout}>Logout</button>
    </div>
  );
}
