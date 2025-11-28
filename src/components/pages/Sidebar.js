import React from "react";
import { Link } from "react-router-dom";
// import { useAuth } from "../auth/AuthContext";
import "../css/Sidebar.css";  // style file

const Sidebar = ({ isOpen, onClose }) => {
//   const { profile } = useAuth();

  return (
    <>
      {/* Overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="profile-icon">👤</div>
          <div className="profile-text">
            Hello, <strong>{"User"}</strong> {/*profile?.name || "User"*/}
          </div>
        </div>

        <div className="sidebar-section">
          <h6 className="section-title">General</h6>

          <Link to="/farmeridcard" className="sidebar-link">
            🏠 Home
          </Link>

          <Link to="/farmeridcard" className="sidebar-link">
            👨‍🌾 Farmer ID
          </Link>

          <Link to="/kamgarId" className="sidebar-link">
            👷‍♂️ Kamgar ID
          </Link>
        </div>

        {/* ⭐ Admin-only section */}
        {/* profile?.role === "admin" && */}
        { (
          <div className="sidebar-section">
            <h6 className="section-title">Admin</h6>

            <Link to="/register" className="sidebar-link">
              🛠 Register New User
            </Link>

            <Link to="/user-list" className="sidebar-link">
              📋 View All Users
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
