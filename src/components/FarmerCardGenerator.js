 import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link } from 'react-router-dom';
import FormSection from '../components/FormSection';
import CardPreview from '../components/CardPreview';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../components/auth/AuthContext';
import '../components/css/global.css';
 function FarmerCardGenerator(){
 const [formData, setFormData] = useState({
    id: '',
    aadhaar: '',
    mobile: '',
    name_mr: '',
    name_en: '',
    dob: '',
    gender: '',
    address: '',
    photo: '',
    district: '',
    taluka: '',
    village: '',
    accountNo: '',
    surveyNo: '',
    area: '',
  });

  const [landRecords, setLandRecords] = useState([]);
  const { profile } = useAuth();

  // Block regular users with insufficient balance
  const isBlocked = profile?.role === 'user' && (profile?.balance_points ?? 0) < 10;

  if (isBlocked) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-danger p-5 shadow rounded">
          <h2>⚠️ Insufficient Balance</h2>
          <p className="fs-5 mt-3">
            You need at least <strong>10 balance points</strong> to generate a Farmer ID card.
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
    <div className="container mt-4 pb-5">
      <ToastContainer />

      {/* Page Header with cross-nav */}
      <div className="lotus-page-header mb-4">
        <div>
          <h4>👨‍🌾 Farmer ID Generator</h4>
          <p className="mb-0 opacity-75" style={{ fontSize: "0.85rem" }}>Fill the form to generate & download a Farmer Identity Card</p>
        </div>
        <Link to="/kamgarId" className="btn-switch-module">
          👷‍♂️ Switch to Kamgar ID
        </Link>
      </div>
      <div className="row">
        <div className="col-md-7">
          <FormSection formData={formData}
            setFormData={setFormData}
            landRecords={landRecords}
            setLandRecords={setLandRecords} />
        </div>
        <div className="col-md-5 card-preview-scale">
          <CardPreview formData={formData} landRecords={landRecords} setFormData={setFormData} setLandRecords={setLandRecords} />
        </div>
      </div>
    </div>
 )}

 export default FarmerCardGenerator;