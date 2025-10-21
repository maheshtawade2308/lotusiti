import React, { useState } from 'react';
import FarmerIdCard from './FarmerIdCard';
import {generateJPGBothSides, downloadFrontSide, downloadBackSide } from '../components/utils/generateJPGBothSides';

function CardPreview({ formData, landRecords, setFormData, setLandRecords }) {
   const [showFront, setShowFront] = useState(true); // Controls which button is shown

  const handleFrontDownload = () => {
    downloadFrontSide();
    setShowFront(false); // Show Back Side button
  };

  const handleBackDownload = () => {
    downloadBackSide();
    setShowFront(true); // Show Front Side button again
  };

   const handleReset = () => {
    window.location.href= "/kamgarid";
  };

  return (
    <div>
      <div>
        <h5 className="text-center mb-3">Card Preview</h5>
        <FarmerIdCard formData={formData} landRecords={landRecords} />
      </div>

      <div className="d-flex gap-3 mt-5 mb-3 justify-content-center">
    
          <button className="btn btn-success btn-lg" onClick={generateJPGBothSides}>
            Download
          </button>

        <button className="btn btn-danger btn-lg" onClick={handleReset}>
          Reset All
        </button>
      </div>
    </div>
  );
}

export default CardPreview;
