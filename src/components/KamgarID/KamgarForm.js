import React, { useState } from 'react';
import '../css/kamgarId.css';
import '../css/global.css';
import { Link } from 'react-router-dom';
import GenerateKamgarId from './GenerateKamgarId';
import { downloadFrontSide } from '../utils/generateJPGBothSides';
import { useAuth } from '../auth/AuthContext';
import { toast } from 'react-toastify';
import backSideImg from '../../assets/back side.png';


const KamgarForm = () => {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    registrationDate: '',
    name: '',
    gender: '',
    dob: '',
    mobile: '',
    workType: '',
    regplace: '',
    district: '',
    photo: null,
  });

  const { profile, deductPoints } = useAuth();

  // Block regular users with insufficient balance
  const isBlocked = profile?.role === 'user' && (profile?.balance_points ?? 0) < 10;

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? URL.createObjectURL(files[0]) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleReset = () => {
    window.location.href = "/kamgarid";
  };

  const handleDownloadClick = async (e) => {
    e.preventDefault();

    if (profile?.role === 'admin') {
      await downloadFrontSide(formData.name);
      return;
    }

    if (profile?.role === 'user') {
      if (profile.balance_points < 10) {
        toast.error("Insufficient Balance Points! You need 10 points to download.");
        return;
      }

      const deducted = await deductPoints(10);
      if (deducted) {
        await downloadFrontSide(formData.name);
        toast.success("Downloaded successfully! 10 points deducted.");
      } else {
        toast.error("Failed to deduct points. Please try again.");
      }
    }
  };

  const handleDownloadBackSide = (e) => {
    e.preventDefault();
    const link = document.createElement('a');
    link.href = backSideImg;
    link.download = "back side.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  if (isBlocked) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger p-5 shadow rounded">
          <h2>⚠️ Insufficient Balance</h2>
          <p className="fs-5 mt-3">
            You need at least <strong>10 balance points</strong> to generate a Kamgar ID card.
          </p>
          <p className="text-muted">
            Your current balance: <strong>{profile?.balance_points ?? 0} points</strong>
          </p>
          <p>Please contact your administrator to recharge your balance.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='container mt-4 pb-5'>

      {/* Page Header with cross-nav */}
      <div className="lotus-page-header mb-4">
        <div>
          <h4>👷‍♂️ Kamgar ID Generator</h4>
          <p className="mb-0 opacity-75" style={{ fontSize: "0.85rem" }}>Fill the form to generate & download a Kamgar Identity Card</p>
        </div>
        <Link to="/farmeridcard" className="btn-switch-module">
          👨‍🌾 Switch to Farmer ID
        </Link>
      </div>
      <div className="row">
        <form onSubmit={handleSubmit} className="row g-3">
          {/* Form Section */}
          <div className="col-md-7">
            <form className="row g-2">
              <div className="col-md-6">
                <label className="form-label">नोंदणी क्रमांक</label>
                <input type="text" className="form-control" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">नोंदणी दिनांक</label>
                <input type="date" className="form-control" name="registrationDate" value={formData.registrationDate} onChange={handleChange} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">नाव</label>
                <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">लिंग</label>
                <select name="gender" className="form-select" value={formData.gender} onChange={handleChange} required>
                  <option ></option>
                  <option value="पुरुष">पुरुष </option>
                  <option value="स्त्री">स्त्री</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">जन्मतारीख</label>
                <input type="date" className="form-control" name="dob" value={formData.dob} onChange={handleChange} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">भ्रमणध्वनी क्रमांक</label>
                <input type="text" className="form-control" name="mobile" value={formData.mobile} onChange={handleChange} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">कामाचा प्रकार</label>
                <input type="text" className="form-control" name="workType" value={formData.workType} onChange={handleChange} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">नोंदणीचे ठिकाण</label>
                <input type="text" className="form-control" name="regplace" value={formData.regplace} onChange={handleChange} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">जिल्हा</label>
                <input type="text" className="form-control" name="district" value={formData.district} onChange={handleChange} required />
              </div>

              <div className="col-md-6">
                <label className="form-label">Upload Photo</label>
                <input type="file" name="photo" className="form-control" accept="image/*" onChange={handleChange} />
              </div>
            </form>
          </div>


          <div className="col-md-5">
            <GenerateKamgarId details={formData} />
          </div>

          <div className="d-flex gap-3 mt-5 mb-3 justify-content-center">
            <button className="btn btn-primary btn-lg" onClick={handleDownloadClick}>
              Download
            </button>
            <button className="btn btn-secondary btn-lg" onClick={handleDownloadBackSide}>
              Download Back Side
            </button>
            <button className="btn btn-danger btn-lg" onClick={handleReset}>
              Reset All
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KamgarForm;