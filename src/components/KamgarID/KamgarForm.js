import React, { useState } from 'react';
import '../../styles/kamgarId.css';
import '../../styles/global.css';
import { Link } from 'react-router-dom';
import GenerateKamgarId from './GenerateKamgarId';
import { downloadFrontSide } from '../../utils/generateJPGBothSides';
import { useAuth } from '../auth/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
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

  const handleReset = () => {
    window.location.href = "/kamgarid";
  };

  const handleDownloadClick = async (e) => {
    e.preventDefault();

    // Mandatory fields validation
    const requiredFields = [
      { key: 'registrationNumber', label: 'नोंदणी क्रमांक' },
      { key: 'registrationDate',   label: 'नोंदणी दिनांक' },
      { key: 'name',               label: 'नाव' },
      { key: 'gender',             label: 'लिंग' },
      { key: 'dob',                label: 'जन्मतारीख' },
      { key: 'mobile',             label: 'भ्रमणध्वनी क्रमांक' },
      { key: 'workType',           label: 'कामाचा प्रकार' },
      { key: 'regplace',           label: 'नोंदणीचे ठिकाण' },
      { key: 'district',           label: 'जिल्हा' },
      { key: 'photo',              label: 'Photo' },
    ];

    for (const field of requiredFields) {
      if (!formData[field.key] || !formData[field.key].toString().trim()) {
        toast.error(`कृपया आवश्यक माहिती भरा: ${field.label}`);
        return;
      }
    }

    if (profile?.role === 'admin') {
      await downloadFrontSide(formData.name);
      return;
    }

    if (profile?.role === 'user') {
      if (profile.balance_points < 10) {
        toast.error("Insufficient Balance Points! You need 10 points to download.");
        return;
      }

      const deducted = await deductPoints(10, `Kamgar ID - ${formData.name}`);
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
      <ToastContainer />

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
        {/* Form Section */}
        <div className="col-md-7">
          <div className="row g-2">
            <div className="col-md-6">
              <label className="form-label">
                नोंदणी क्रमांक <span className="text-danger">*</span>
              </label>
              <input type="text" className="form-control" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                नोंदणी दिनांक <span className="text-danger">*</span>
              </label>
              <input type="date" className="form-control" name="registrationDate" value={formData.registrationDate} onChange={handleChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                नाव <span className="text-danger">*</span>
              </label>
              <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                लिंग <span className="text-danger">*</span>
              </label>
              <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                <option value="">लिंग निवडा</option>
                <option value="पुरुष">पुरुष </option>
                <option value="स्त्री">स्त्री</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">
                जन्मतारीख <span className="text-danger">*</span>
              </label>
              <input type="date" className="form-control" name="dob" value={formData.dob} onChange={handleChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                भ्रमणध्वनी क्रमांक <span className="text-danger">*</span>
              </label>
              <input type="text" className="form-control" name="mobile" value={formData.mobile} onChange={handleChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                कामाचा प्रकार <span className="text-danger">*</span>
              </label>
              <input type="text" className="form-control" name="workType" value={formData.workType} onChange={handleChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                नोंदणीचे ठिकाण <span className="text-danger">*</span>
              </label>
              <input type="text" className="form-control" name="regplace" value={formData.regplace} onChange={handleChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                जिल्हा <span className="text-danger">*</span>
              </label>
              <input type="text" className="form-control" name="district" value={formData.district} onChange={handleChange} />
            </div>

            <div className="col-md-6">
              <label className="form-label">
                Upload Photo <span className="text-danger">*</span>
              </label>
              <input type="file" name="photo" className="form-control" accept="image/*" onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="col-md-5">
          <GenerateKamgarId details={formData} />
        </div>

        <div className="d-flex gap-3 mt-5 mb-3 justify-content-center">
          <button type="button" className="btn btn-primary btn-lg" onClick={handleDownloadClick}>
            Download
          </button>
          <button type="button" className="btn btn-secondary btn-lg" onClick={handleDownloadBackSide}>
            Download Back Side
          </button>
          <button type="button" className="btn btn-danger btn-lg" onClick={handleReset}>
            Reset All
          </button>
        </div>
      </div>
    </div>
  );
};

export default KamgarForm;