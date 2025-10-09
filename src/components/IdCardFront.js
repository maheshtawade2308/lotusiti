// components/IdCardFront.js
import React from "react";
import QRCodeGenerator from "./QRCodeGenerator";
import logo from "../assets/logo.png";
import farmerIcon from "../assets/farmer.png";
import leaves from "../assets/leaves.png";
import watermark from "../assets/watermark.png";

function IdCardFront({ formData }) {
  const { name_mr, name_en, dob, gender, mobile, aadhaar, id, photo } = formData;

  return (
    <div className="id-card front" id="card-front">
      <div className="header green-bar">
        <div className="logo-title">
          <img src={logo} alt="Agri Record" className="logo" />
          <span className="title">फार्मर आयडी कार्ड</span>
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
          <p><strong>नाव :</strong> {name_mr || "-----------"}</p>
          <p><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</strong> {name_en || "-----------"}</p>
          <p><strong>जन्म दिनांक / DOB :</strong> {dob || "-----------"}</p>
          <p><strong>लिंग / Gender :</strong> {gender || "-----------"}</p>
          <p><strong>मोबाईल / Mobile :</strong> {mobile || "-----------"}</p>
          <p><strong>आधार नं / Aadhaar No. :</strong> {aadhaar || "-----------"}</p>
          <img src={leaves} alt="leaves" className="leaves" />
        </div>
        <div className="qr-section">
          <QRCodeGenerator name={name_mr} id={id} />
        </div>
      </div>

      <div className="bottom-bar">
        <div className="id-text">
          <strong style={{ color: "yellow" }}>फार्मर आयडी :</strong> {id || "-----------"}
        </div>
      </div>
    </div>
  );
}

export default IdCardFront;