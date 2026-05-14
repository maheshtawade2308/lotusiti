import React from 'react';
import FarmerIdCard from './FarmerIdCard';
import {generateJPGBothSides } from '../components/utils/generateJPGBothSides';
import { useAuth } from '../components/auth/AuthContext';
import { toast } from 'react-toastify';

function CardPreview({ formData, landRecords, setFormData, setLandRecords }) {
   const { profile, deductPoints } = useAuth();

   const handleReset = () => {
    window.location.href= "/kamgarid";
  };

  const handleDownloadClick = async (e) => {
    e.preventDefault();

    if (profile?.role === 'admin') {
      await generateJPGBothSides(formData.name_en);
      return;
    }

    if (profile?.role === 'user') {
      if (profile.balance_points < 10) {
        toast.error("Insufficient Balance Points! You need 10 points to download.");
        return;
      }
      
      const deducted = await deductPoints(10);
      if (deducted) {
        await generateJPGBothSides(formData.name_en);
        toast.success("Downloaded successfully! 10 points deducted.");
      } else {
        toast.error("Failed to deduct points. Please try again.");
      }
    }
  };

  return (
    <div>
      <div>
        <h5 className="text-center mb-3">Card Preview</h5>
        <FarmerIdCard formData={formData} landRecords={landRecords} />
      </div>

      <div className="d-flex gap-3 mt-5 mb-3 justify-content-center">
    
          <button className="btn btn-success btn-lg" onClick={handleDownloadClick}>
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
