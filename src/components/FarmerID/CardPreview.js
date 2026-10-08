import React from 'react';
import FarmerIdCard from './FarmerIdCard';
import { generateJPGBothSides } from '../../utils/generateJPGBothSides';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';

function CardPreview({ formData, landRecords, setFormData, setLandRecords }) {
   const { profile, deductPoints } = useAuth();

   const handleReset = () => {
    window.location.href= "/kamgarid";
  };

  const handleDownloadClick = async (e) => {
    e.preventDefault();

    // Mandatory fields validation (excluding Land Details)
    const requiredFields = [
      { key: 'id', label: 'Farmer ID' },
      { key: 'aadhaar', label: 'Aadhaar Number' },
      { key: 'mobile', label: 'Mobile Number' },
      { key: 'name_en', label: 'Name (English)' },
      { key: 'name_mr', label: 'Name (Marathi)' },
      { key: 'dob', label: 'Date of Birth' },
      { key: 'gender', label: 'Gender' },
      { key: 'address', label: 'Address' },
      { key: 'photo', label: 'Photo' },
    ];

    for (const field of requiredFields) {
      if (!formData[field.key] || !formData[field.key].toString().trim()) {
        toast.error(`Please fill in compulsory field: ${field.label}`);
        return;
      }
    }

    if (profile?.role === 'admin') {
      await generateJPGBothSides(formData.name_en);
      return;
    }

    if (profile?.role === 'user') {
      if (profile.balance_points < 10) {
        toast.error("Insufficient Balance Points! You need 10 points to download.");
        return;
      }
      
      const deducted = await deductPoints(10, `Farmer ID - ${formData.name_en}`);
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
