// components/IdCardFront.js
import React from "react";
import QRCodeGenerator from "../utils/QRCodeGenerator";
import logo from "../assets/logo.png";
import farmerIcon from "../assets/farmer.png";
import leaves from "../assets/leaves.png";
import watermark from "../assets/watermark.png";

function IdCardFront({ formData }) {
  const { name_mr, name_en, dob, gender, mobile, aadhaar, id, photo } = formData;
  function formatDate(dateStr) {
    if (!dateStr) return "-----------";
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  return (
    <div className="id-card front" id="card-front">
      <div className="header green-bar">
        <div className="logo-title">
          <img src={logo} alt="Agri Record" className="logo" />
          <span className="title">शेतकरी ओळख पत्र</span>
        </div>
        <img src={farmerIcon} alt="Farmer Icon" className="farmer-icon" />
      </div>

      <div
        className="photo-section"
        style={{
          backgroundImage: `url(${watermark})`,
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <div className="photo-box">
          {photo ? <img src={photo} alt="Farmer" /> : <span>Photo</span>}
        </div>
        <div className="details">
          <p style={{ margin: "2px 0" }}><strong>नाव :</strong> {name_mr || "-----------"}</p>
          <p><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong> {name_en || "-----------"}</p>
          <p><strong>जन्म दिनांक / DOB :</strong> {formatDate(dob) || "-----------"}</p>
          <p><strong>लिंग / Gender :</strong> {gender || "-----------"}</p>
          <p><strong>मोबाईल / Mobile :</strong> {mobile || "-----------"}</p>
          <p style={{
            margin: "2px 0",
            whiteSpace: "nowrap",      // Prevent line breaks
            
          }}><strong>आधार नं / Aadhaar No. :</strong> {aadhaar || "-----------"}</p>
          <img src={leaves} alt="leaves" className="leaves" />
        </div>
        <div className="qr-section">
          <QRCodeGenerator name={name_mr} id={id} />
        </div>
      </div>

      <div className="bottom-bar">
        <div className="id-text" style={{
          display: "flex",
          alignItems: "baseline", // Aligns text on the same line
          justifyContent: "center",
          gap: "10px",
          fontSize: "35px",
          fontWeight: "600",
          color: "#fff",
        }}>
          <span style={{ color: "yellow" }}>फार्मर आयडी :</span>
          <span>{id || "-----------"}</span>
        </div>
      </div>

    </div>
  );
}

export default IdCardFront;