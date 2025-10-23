import React from 'react';
import './kamgarId.css';
import leftLogo from '../../assets/farmer.png';
import rightLogo from '../../assets/farmer.png';
import centerImage from '../../assets/farmer.png';
import photo from '../../assets/farmer.png';
import qrCode from '../../assets/farmer.png';

const GenerateKamgarId = () => {
  const details = {
    registrationNumber: "MH080570074182",
    registrationDate: "16/06/2025",
    name: "योगिता जगदीश बडघे",
    gender: "स्त्री",
    dob: "19/08/1991",
    aadhaar: "9764457665",
    workType: "मेसन काम",
    residence: "मालेगाव",
    district: "नाशिक",
  };

  return (
    <div className="idcard-container">
      <div className="idcard-header">
        <img src={leftLogo} alt="Left Logo" className="logo left" />
        <img src={centerImage} alt="Center Image" className="center-image" />
        <img src={rightLogo} alt="Right Logo" className="logo right" />
      </div>

      <div className="idcard-title">IDCARD</div>

      <div className="idcard-body">
        <div className="details-section">
          <p><strong>नोंदणी क्रमांक:</strong> {details.registrationNumber}</p>
          <p><strong>नोंदणी दिनांक:</strong> {details.registrationDate}</p>
          <p><strong>नाव:</strong> {details.name}</p>
          <p><strong>लिंग:</strong> {details.gender}</p>
          <p><strong>जन्मतारीख:</strong> {details.dob}</p>
          <p><strong>आधार क्रमांक:</strong> {details.aadhaar}</p>
          <p><strong>कामाचा प्रकार:</strong> {details.workType}</p>
          <p><strong>राहिवास:</strong> {details.residence}</p>
          <p><strong>जिल्हा:</strong> {details.district}</p>
        </div>

        <div className="photo-section">
          <img src={photo} alt="Photo" className="photo" />
          <img src={qrCode} alt="QR Code" className="qr" />
        </div>
      </div>
    </div>
  );
};

export default GenerateKamgarId;