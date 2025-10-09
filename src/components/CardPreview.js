import React from 'react';
import QRCodeGenerator from './QRCodeGenerator';
import FarmerIdCard from './FarmerIdCard';

function CardPreview({ formData, landRecords }) {
  const {
    name_en,
    name_mr,
    id,
    age,
    address,
    photo,
    mobile,
    aadhaar,
    dob,
    gender,
    district,
    taluka,
    village,
    accountNo,
    surveyNo,
    area,
  } = formData;

  return (
    <div>
      <h5 className="text-center mb-3">Card Preview</h5>
      <FarmerIdCard formData={formData} landRecords={landRecords} />
    </div>
  );
}

export default CardPreview;