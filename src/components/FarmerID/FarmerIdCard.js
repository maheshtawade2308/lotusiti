import React from "react";
import "../../styles/FarmerIdCard.css";
import IdCardFront from "./IdCardFront";
import IdCardBack from "./IdCardBack";

function FarmerIdCard({ formData, landRecords }) {
  return (
    <div className="id-card-wrapper" id="print-area">
      <IdCardFront formData={formData} />
      <IdCardBack formData={formData} landRecords={landRecords} />
    </div>
  );
}

export default FarmerIdCard;