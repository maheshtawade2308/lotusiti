import React from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/global.css";
import { useAuth } from "../auth/AuthContext";

const Navbar = () => {
  const { logout, profile } = useAuth();

  const handleLogout = () => logout();

  return (
    <nav className="navbar navbar-expand-lg lotus-navbar px-3">
      <div className="container-fluid d-flex align-items-center gap-3">

        {/* Home */}
        <Link to="/dashboard" className="nav-pill">
          🏠 Home
        </Link>

        {/* Brand */}
        <Link className="navbar-brand me-auto" to="/dashboard">
          🧑‍💻 {profile?.role === "user"
            ? (profile?.center_name || "Lotus Computer Institute")
            : "Lotus Computer Institute"}
        </Link>

        {/* Toggler */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMenu"
          aria-controls="navbarMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ filter: "invert(1)" }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarMenu">
          <ul className="navbar-nav ms-auto align-items-center gap-2">

            {/* Balance — users only */}
            {profile?.role === "user" && (
              <li className="nav-item">
                <span className="balance-badge">
                  ⭐ Balance: {profile.balance_points || 0}
                </span>
              </li>
            )}

            {/* Logout */}
            <li className="nav-item">
              <button onClick={handleLogout} className="btn-logout">
                🚪 Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
