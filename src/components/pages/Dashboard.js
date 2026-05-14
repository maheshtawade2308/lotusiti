import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const Dashboard = () => {
  const { profile } = useAuth();

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Dashboard</h2>
          <h5 className="text-muted">Welcome, {profile?.name || "User"}!</h5>
        </div>
        {profile?.role === "user" && (
          <div className="alert alert-warning mb-0 fw-bold shadow-sm py-2 px-4 rounded-pill">
            ⭐ Balance Points: {profile?.balance_points || 0}
          </div>
        )}
      </div>

      <div className="row g-4">
        {/* Card: Farmer ID */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0 bg-light text-center">
            <div className="card-body py-5">
              <h1 className="display-4 mb-3">👨‍🌾</h1>
              <h3 className="card-title fw-bold">Farmer ID</h3>
              <p className="card-text text-muted mb-4">Generate and download Farmer Identity Cards.</p>
              <Link to="/farmeridcard" className="btn btn-primary btn-lg rounded-pill px-4">
                Open Farmer ID
              </Link>
            </div>
          </div>
        </div>

        {/* Card: Kamgar ID */}
        <div className="col-md-6 col-lg-4">
          <div className="card h-100 shadow-sm border-0 bg-light text-center">
            <div className="card-body py-5">
              <h1 className="display-4 mb-3">👷‍♂️</h1>
              <h3 className="card-title fw-bold">Kamgar ID</h3>
              <p className="card-text text-muted mb-4">Generate and download Kamgar Identity Cards.</p>
              <Link to="/kamgarId" className="btn btn-success btn-lg rounded-pill px-4">
                Open Kamgar ID
              </Link>
            </div>
          </div>
        </div>

        {/* Admin Cards */}
        {profile?.role === "admin" && (
          <>
            <div className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0 bg-light text-center">
                <div className="card-body py-5">
                  <h1 className="display-4 mb-3">👤</h1>
                  <h3 className="card-title fw-bold">Register User</h3>
                  <p className="card-text text-muted mb-4">Add a new user to the system.</p>
                  <Link to="/register" className="btn btn-dark btn-lg rounded-pill px-4">
                    Register User
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0 bg-light text-center">
                <div className="card-body py-5">
                  <h1 className="display-4 mb-3">📋</h1>
                  <h3 className="card-title fw-bold">User List</h3>
                  <p className="card-text text-muted mb-4">View and manage registered users and their points.</p>
                  <Link to="/user-list" className="btn btn-info btn-lg rounded-pill px-4 text-white">
                    View Users
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
