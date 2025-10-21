 import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import FormSection from '../components/FormSection';
import CardPreview from '../components/CardPreview';
import { ToastContainer, toast } from 'react-toastify';  // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css';  // Import the CSS
import { useNavigate } from 'react-router-dom';
 function FarmerCardGenerator(){
  const navigate = useNavigate();
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

  const handlePrint = () => {
  const printContents = document.getElementById('print-area').innerHTML;
  const originalContents = document.body.innerHTML;

  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;
};
  // const handleDownload = () => generatePDF(formData);

  return (
    <div className="container mt-4">
      <ToastContainer />
      <div className="row">
        <div className="col-md-6 mb-3">
        <h2 className="text-danger ">Generate Farmer ID Card</h2>
        </div>
        <div className="col-md-2 mb-3 ms-auto btn text-end ">
        <button className="btn-warning btn" onClick={()=> navigate("/kamgarId")}>कामगार ओळखपत्र</button>
        </div>
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