import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../auth/AuthContext";
import Sidebar from "./Sidebar"
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const { logout, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);


  const handleLogout = () => {
    logout();
    // navigate("/");
  };

  return (
    <>
    {/* ===== SIDEBAR ===== */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {/* ===== NAVBAR ===== */}
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm px-4 py-3"
    >
       {/* Sidebar Toggle Button (Left side) */}
          <button
            className="btn btn-outline-light me-3 "
             type="button"
            onClick={() => setSidebarOpen(true)}
          >
          <span className="navbar-toggler-icon"></span>
          </button>
      <div className="container-fluid">
        {/* Brand Logo / Title */}
        <Link className="navbar-brand fw-bold text-white fs-4" to="/dashboard">
          🧑‍💻 Lotus Computer Institute
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMenu"
          aria-controls="navbarMenu"
          aria-expanded="false" 
          aria-label="Toggle navigation"
          
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Right side links */}
        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarMenu"
        >
          <ul className="navbar-nav align-items-center gap-3">

            {/* Home Button */}
            <li className="nav-item">
              <Link
                to="/dashboard"
                className="btn btn-outline-light fw-semibold px-4 py-2 rounded-pill nav-btn"
              >
                🏠 Home
              </Link>
            </li>

            {/* Balance Points (For normal users) */}
            {profile?.role === "user" && (
              <li className="nav-item">
                <span className="btn btn-warning fw-bold px-4 py-2 rounded-pill shadow-sm" style={{ cursor: "default" }}>
                  ⭐ Balance: {profile.balance_points || 0}
                </span>
              </li>
            )}

            {/* Logout Button */}
            <li className="nav-item">
              <button
                onClick={handleLogout}
                className="btn  btn-danger fw-semibold px-4 py-2 rounded-pill nav-btn"
              >
                🚪 Logout
              </button>
            </li>

          </ul>
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navbar;
