import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        position: "fixed",
        bottom: "12px",
        right: "12px",
        color: "white",
        padding: "10px 18px",
        boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
        zIndex: 200,
        maxWidth: "300px",
        borderRadius: "10px",
         pointerEvents: "none",
         animation: "hardBlink 2s infinite",
      }}
    >
      <div className="text-center text-secondary">
        <h6 className="fw-bold m-0" style={{ fontSize: "14px" }}>
          Developed By : <span >Mahesh Tawade</span>
        </h6>
        <small >
          💻 Software Engineer
        </small>

        <div className="mt-1">
          <small className="text-secondary">
            © {new Date().getFullYear()} LotusITI
          </small>
        </div>
      </div>
    </footer>
  );
}
