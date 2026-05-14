import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { useAuth } from "../auth/AuthContext";

const Navbar = () => {
  const { logout, profile } = useAuth();


  const handleLogout = () => {
    logout();
    // navigate("/");
  };

  return (
    <>
      {/* ===== NAVBAR ===== */}
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm px-4 py-3"
    >
      <div className="container-fluid d-flex align-items-center">
        {/* Home Button (Shifted Left) */}
        <Link
          to="/dashboard"
          className="btn btn-outline-light fw-semibold px-4 py-2 rounded-pill nav-btn me-3"
        >
          🏠 Home
        </Link>

        {/* Brand Logo / Dynamic Title */}
        <Link className="navbar-brand fw-bold text-white fs-4" to="/dashboard">
          🧑‍💻 {profile?.role === 'user' ? (profile?.center_name || 'Lotus Computer Institute') : 'Lotus Computer Institute'}
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

        {/* Left side links */}
        <div
          className="collapse navbar-collapse"
          id="navbarMenu"
        >
          <ul className="navbar-nav me-auto align-items-center gap-3">
          </ul>

          <ul className="navbar-nav ms-auto align-items-center gap-3">

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
