import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/global.css";

const Dashboard = () => {
  const { profile } = useAuth();

  return (
    <div className="container mt-4 pb-5">

      {/* Welcome Header */}
      <div className="lotus-page-header mb-4">
        <div>
          <h4>📊 Dashboard</h4>
          <p className="mb-0 text-light opacity-75" style={{ fontSize: "0.9rem" }}>
            Welcome back, <strong>{profile?.name || "User"}</strong>! 👋
          </p>
        </div>
        {profile?.role === "user" && (
          <div className="balance-badge">
            ⭐ Balance Points: {profile?.balance_points || 0}
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="row g-4">

        {/* Farmer ID */}
        <div className="col-sm-6 col-lg-4">
          <div className="lotus-dash-card card-farmer h-100 p-4 text-center">
            <div className="card-icon">👨‍🌾</div>
            <h5 className="fw-bold mb-1">Farmer ID</h5>
            <p className="text-muted small mb-4">Generate & download Farmer Identity Cards instantly.</p>
            <Link to="/farmeridcard" className="btn btn-success rounded-pill px-4 fw-semibold">
              Open Farmer ID →
            </Link>
          </div>
        </div>

        {/* Kamgar ID */}
        <div className="col-sm-6 col-lg-4">
          <div className="lotus-dash-card card-kamgar h-100 p-4 text-center">
            <div className="card-icon">👷‍♂️</div>
            <h5 className="fw-bold mb-1">Kamgar ID</h5>
            <p className="text-muted small mb-4">Generate & download Kamgar Identity Cards easily.</p>
            <Link to="/kamgarId" className="btn btn-primary rounded-pill px-4 fw-semibold">
              Open Kamgar ID →
            </Link>
          </div>
        </div>

        {/* Admin-only cards */}
        {profile?.role === "admin" && (
          <>
            <div className="col-sm-6 col-lg-4">
              <div className="lotus-dash-card card-register h-100 p-4 text-center">
                <div className="card-icon">👤</div>
                <h5 className="fw-bold mb-1">Register User</h5>
                <p className="text-muted small mb-4">Create and add a new user account to the system.</p>
                <Link to="/register" className="btn btn-dark rounded-pill px-4 fw-semibold">
                  Register User →
                </Link>
              </div>
            </div>

            <div className="col-sm-6 col-lg-4">
              <div className="lotus-dash-card card-users h-100 p-4 text-center">
                <div className="card-icon">📋</div>
                <h5 className="fw-bold mb-1">User List</h5>
                <p className="text-muted small mb-4">View, edit, manage users and track their balance points.</p>
                <Link to="/user-list" className="btn btn-info rounded-pill px-4 fw-semibold text-white">
                  View Users →
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
