import React, { useState } from 'react';
import './kamgarId.css';
import GenerateKamgarId from './GenerateKamgarId';
import { generateJPGBothSides } from '../../utils/generateJPGBothSides';


const KamgarForm = () => {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    registrationDate: '',
    name: '',
    gender: '',
    dob: '',
    mobile: '',
    workType: '',
    residence: '',
    district: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    window.location.href = "/kamgarid";
  };

  const handleFrontDownload = () => {
    generateJPGBothSides();
  };


  return (
    <div className='container mt-5'>
      <div className="row">
        <div className='col-md-7'>
          <form onSubmit={handleSubmit} className="row g-3">
            {Object.keys(formData).map((key) => (
              <div className="col-md-6" key={key}>
                <label className="form-label">{key}</label>
                <input
                  type="text"
                  className="form-control"
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}

            <div className="mb-3">
      <div className="row">
        {/* Form Section */}
        <div className="col-md-6">
          <form className="row g-3">
            <div className="col-12">
              <label className="form-label">नोंदणी क्रमांक</label>
              <input type="text" className="form-control" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} required />
            </div>

            <div className="col-12">
              <label className="form-label">नोंदणी दिनांक</label>
              <input type="text" className="form-control" name="registrationDate" value={formData.registrationDate} onChange={handleChange} required />
            </div>

            <div className="col-12">
              <label className="form-label">नाव</label>
              <input type="text" className="form-control" name="name" value={formData.name} onChange={handleChange} required />
            </div>

            <div className="col-12">
              <label className="form-label">लिंग</label>
              <input type="text" className="form-control" name="gender" value={formData.gender} onChange={handleChange} required />
            </div>

            <div className="col-12">
              <label className="form-label">जन्मतारीख</label>
              <input type="text" className="form-control" name="dob" value={formData.dob} onChange={handleChange} required />
            </div>

            <div className="col-12">
              <label className="form-label">भ्रमणध्वनी क्रमांक</label>
              <input type="text" className="form-control" name="mobile" value={formData.mobile} onChange={handleChange} required />
            </div>

            <div className="col-12">
              <label className="form-label">कामाचा प्रकार</label>
              <input type="text" className="form-control" name="workType" value={formData.workType} onChange={handleChange} required />
            </div>

            <div className="col-12">
              <label className="form-label">राहिवास</label>
              <input type="text" className="form-control" name="residence" value={formData.residence} onChange={handleChange} required />
            </div>

            <div className="col-12">
              <label className="form-label">जिल्हा</label>
              <input type="text" className="form-control" name="district" value={formData.district} onChange={handleChange} required />
            </div>
          </form>
        </div>

        {/* ID Card Preview */}
        <div className="col-md-6 d-flex justify-content-center align-items-start">
          <GenerateKamgarId details={formData} />
        </div>
      </div>
    </div>

            <div className="d-flex gap-3 mt-5 mb-3 justify-content-center">
              <button  className="btn btn-primary btn-lg" onclick={handleFrontDownload}>
                Download
              </button>
              <button className="btn btn-danger btn-lg" onClick={handleReset}>
                Reset All
              </button>
            </div>
          </form>
        </div>
        <div className='col-md-5' id="print-area">
          <GenerateKamgarId details={formData}  />
        </div>
      </div>
    </div>
  );
};

export default KamgarForm;