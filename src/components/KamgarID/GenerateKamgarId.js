import React from 'react';
import '../css/kamgarId.css';
import leftLogo from '../../assets/mbocw-logo-left1.png';
import rightLogo from '../../assets/bocw_logo_right.png';
import watermark from '../../assets/kamgaridbg.png';
import QRCodeGenerator from "../utils/QRCodeGeneratorKid";

const GenerateKamgarId = ({ details }) => {
  const { photo } = details;
    function formatDate(dateStr) {
    if (!dateStr) return "-----------";
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  return (
    <div className='container d-flex justify-content-center align-items-center'>
      <div className="k-idcard-container" style={{
        backgroundImage: `url(${watermark})`,
        backgroundSize: "contain"
      }} id="card-front" >
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
              <p><strong>नोंदणी क्रमांक:</strong> {details.registrationNumber || "-----------"}</p>
              <p><strong>नोंदणी दिनांक:</strong> {formatDate(details.registrationDate) || "-----------"}</p>
            </div>
            <p><strong>नाव:</strong> {details.name || "-----------"}</p>
            <p><strong>लिंग:</strong> {details.gender || "-----------"}</p>
            <p><strong>जन्मतारीख:</strong> {formatDate(details.dob) || "-----------"}</p>
            <p><strong>भ्रमणध्वनी क्रमांक:</strong> {details.mobile || "-----------"}</p>
            <p><strong>कामाचा प्रकार:</strong> {details.workType || "-----------"}</p>
            <div className="k-row">
              <p><strong>राहिवास:</strong> {details.residence || "-----------"}</p>
              <p><strong>जिल्हा:</strong> {details.district|| "-----------"}</p>
            </div>

          </div>
         <div>
            <div className="k-photo-box">
              {photo ? <img src={photo} alt="Photo" /> : <span>Photo</span>}
            </div>
            <div className="k-qr">
              <QRCodeGenerator mobile={details.mobile} regId={details.registrationNumber} />
            </div>  
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateKamgarId;