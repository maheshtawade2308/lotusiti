import React from 'react';
import './kamgarId.css';
import leftLogo from '../../assets/mbocw-logo-left1.png';
import rightLogo from '../../assets/bocw_logo_right.png';
import centerImage from '../../assets/farmer.png';
import photo from '../../assets/images.webp';
import qrCode from '../../assets/farmer.png';
import watermark from '../../assets/kamgaridbg.png';

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
    <div className="k-idcard-container" style={{
         backgroundImage: `url(${watermark})`,
          backgroundSize: "contain"
        }}>
      <div className="k-idcard-header">
        <img src={leftLogo} alt="Left Logo" className="k-logo left" />
        <div className="k-header-text">
          <span>महाराष्ट्र शासन</span>
          <span>कामगार विभाग</span>
          <span>महाराष्ट्र इमारत व इतर बांधकाम कामगार कल्याणकारी मंडळ</span>
        </div>
        <img src={rightLogo} alt="Right Logo" className="k-logo right" />
      </div>

      <div className="k-idcard-title">ओळखपत्र</div>

      <div className="k-idcard-body" >
        <div className="k-details-section">
          <div className="k-row">
            <p><strong>नोंदणी क्रमांक:</strong> {details.registrationNumber}</p>
            <p><strong>नोंदणी दिनांक:</strong> {details.registrationDate}</p>
          </div>
          <p><strong>नाव:</strong> {details.name}</p>
          <p><strong>लिंग:</strong> {details.gender}</p>
          <p><strong>जन्मतारीख:</strong> {details.dob}</p>
          <p><strong>आधार क्रमांक:</strong> {details.aadhaar}</p>
          <p><strong>कामाचा प्रकार:</strong> {details.workType}</p>
          <div className="k-row">
            <p><strong>राहिवास:</strong> {details.residence}</p>
            <p><strong>जिल्हा:</strong> {details.district}</p>
          </div>

        </div>

        <div className="k-photo-section">
          <img src={photo} alt="Photo" className="k-photo" />
          <img src={qrCode} alt="QR Code" className="k-qr" />
        </div>
      </div>
    </div>
  );
};

export default GenerateKamgarId;