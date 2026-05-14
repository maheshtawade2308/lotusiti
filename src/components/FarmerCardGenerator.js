 import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import FormSection from '../components/FormSection';
import CardPreview from '../components/CardPreview';
import { ToastContainer } from 'react-toastify';  // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css';  // Import the CSS

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

  return (
    <div className="container mt-4">
      <ToastContainer />
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