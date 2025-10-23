import React from "react";
import "../components/css/FarmerIdCard.css";
import IdCardFront from "../components/IdCardFront";
import IdCardBack from "../components/IdCardBack";

function FarmerIdCard({ formData, landRecords }) {
  return (
    <div className="id-card-wrapper" id="print-area">
      <IdCardFront formData={formData} />
      <IdCardBack formData={formData} landRecords={landRecords} />
    </div>
  );
}

export default FarmerIdCard;