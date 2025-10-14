import React, { useState } from 'react';
import FarmerIdCard from './FarmerIdCard';
import { downloadFrontSide, downloadBackSide } from '../utils/generateJPGBothSides';

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
    // Reset form fields to default (empty values)
    setFormData({
      id: '',
      aadhaar: '',
      mobile: '',
      name_en: '',
      name_mr: '',
      dob: '',
      gender: '',
      address: '',
      photo: '',
    });

    // Clear land records
    setLandRecords([]);
    
    // Optionally reset toggle to show front side button
    setShowFront(true);
  };

  return (
    <div>
      <div>
        <h5 className="text-center mb-3">Card Preview</h5>
        <FarmerIdCard formData={formData} landRecords={landRecords} />
      </div>

      <div className="d-flex gap-3 mt-5 mb-3 justify-content-center">
       {showFront ? (
          <button className="btn btn-success btn-lg" onClick={handleFrontDownload}>
            Download Front Side
          </button>
        ) : (
          <button className="btn btn-primary btn-lg" onClick={handleBackDownload}>
            Download Back Side
          </button>
        )}

        <button className="btn btn-danger btn-lg" onClick={handleReset}>
          Reset All
        </button>
      </div>
    </div>
  );
}

export default CardPreview;
