import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from "axios";

function FormSection({ formData, setFormData, landRecords, setLandRecords }) {

  const handleChange = async (e) => {
    const { name, value, files } = e.target;

    if (name === "mobile") {
      let digits = value.replace(/\D/g, "");
      if (digits.length > 10) digits = digits.substring(0, 10);
      setFormData((prev) => ({ ...prev, mobile: digits }));
    }
    else if (name === "name_en") {
      setFormData((prev) => ({ ...prev, name_en: value }));
      try {
        const response = await axios.get(
          `https://inputtools.google.com/request?text=${value}&itc=mr-t-i0-und&num=1`
        );
        if (
          response.data &&
          response.data[0] === "SUCCESS" &&
          response.data[1]?.[0]?.[1]?.[0]
        ) {
          const marathiText = response.data[1][0][1][0];
          setFormData((prev) => ({ ...prev, name_mr: marathiText }));
        }
      } catch (err) {
        console.error("Transliteration Error:", err);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: files ? URL.createObjectURL(files[0]) : value,
      }));
    }
  };

  const handleAddLandRecord = () => {
    const landData = {
      district: formData.district,
      taluka: formData.taluka,
      village: formData.village,
      accountNo: formData.accountNo,
      surveyNo: formData.surveyNo,
      area: formData.area,
    };

    // Ensure no empty fields
    const isEmpty = Object.values(landData).some(val => val === '');
    if (isEmpty) {
      toast.error("Please fill in all land fields.");
      return;
    }

    setLandRecords((prev) => [...prev, landData]);
    toast.success("Record added successfully");

    // Clear form fields
    setFormData((prev) => ({
      ...prev,
      district: '',
      taluka: '',
      village: '',
      accountNo: '',
      surveyNo: '',
      area: '',
    }));
  };

  const handleDeleteRecord = (index) => {
    const updatedRecords = [...landRecords];
    updatedRecords.splice(index, 1);
    setLandRecords(updatedRecords);
    toast.info("Record deleted");
  };

  const handleFormerIdChange = (e) => {
    let input = e.target.value.replace(/\D/g, "");
    const groups = [];
    if (input.length > 0) groups.push(input.substring(0, 4));
    if (input.length > 4) groups.push(input.substring(4, 8));
    if (input.length > 8) groups.push(input.substring(8, 11));
    const formatted = groups.join(" ");
    setFormData((prev) => ({ ...prev, id: formatted }));
  };

  const setAddharNo = (e) => {
    let input = e.target.value.replace(/\D/g, "");
    const formatted = input.match(/.{1,4}/g)?.join(" ") || "";
    setFormData((prev) => ({ ...prev, aadhaar: formatted }));
  };

  return (

    <>
      <form>
        <div className="mb-3">
          <label className="form-label">Farmer ID</label>
          <input type="text" name="id" className="form-control" value={formData.id} onChange={handleFormerIdChange} />
        </div>
        <div className="row">
          {/* Mobile & Aadhaar */}
          <div className="col-md-6 mb-3">
            <label className="form-label">Aadhaar Number</label>
            <input type="text" name="aadhaar" className="form-control" value={formData.aadhaar} maxLength={14} onChange={setAddharNo} />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Mobile Number</label>
            <input type="text" name="mobile" className="form-control" value={formData.mobile} onChange={handleChange} />
          </div>

        </div>
        <div className="row">
          {/* Name Fields */}
          <div className="col-md-6 mb-3">
            <label className="form-label">Name (English)</label>
            <input
              type="text"
              name="name_en"
              className="form-control"
              value={formData.name_en}
              onChange={handleChange}
            />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Name (Marathi)</label>
            <input
              type="text"
              name="name_mr"
              className="form-control"
              value={formData.name_mr}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name_mr: e.target.value, // Allow manual edit
                }))
              }
            />
          </div>
        </div>

        {/* DOB & Gender */}
        <div className="row">
          <div className="col-md-6 mb-3">
            <label className="form-label">Date of Birth</label>
            <input type="date" name="dob" className="form-control" value={formData.dob} onChange={handleChange} />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Gender</label>
            <select name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
              <option ></option>
              <option value="Male">पुरुष / Male</option>
              <option value="Female">स्त्री / Female</option>
            </select>
          </div>
        </div>
        <div className="row">
          {/* Address & Photo */}
          <div className="col-md-6 mb-3">
            <label className="form-label">Address</label>
            <textarea name="address" className="form-control" value={formData.address} onChange={handleChange} />
          </div>
          <div className="col-md-6 mb-3">
            <label className="form-label">Upload Photo</label>
            <input type="file" name="photo" className="form-control" accept="image/*" onChange={handleChange} />
          </div>

        </div>

        {/* === Land Details Fields and Add Button === */}
        <div className="mb-3">
          <h4 className=" text-danger">Land Details</h4>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">District</label>
              <input type="text" name="district" className="form-control" value={formData.district} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Taluka</label>
              <input type="text" name="taluka" className="form-control" value={formData.taluka} onChange={handleChange} />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Village</label>
              <input type="text" name="village" className="form-control" value={formData.village} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">खाते नं. (Account No.)</label>
              <input type="text" name="accountNo" className="form-control" value={formData.accountNo} onChange={handleChange} />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label">Survey No.</label>
              <input type="text" name="surveyNo" className="form-control" value={formData.surveyNo} onChange={handleChange} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label">Area (Hectare)</label>
              <input type="text" name="area" className="form-control" value={formData.area} onChange={handleChange} />
            </div>
          </div>
        </div>

        <div className="mb-3">
          <button type="button" className="btn btn-outline-success" onClick={handleAddLandRecord}>
            + Add Land Record
          </button>
        </div>
      </form>
      <div className="mb-4">
        {landRecords.length > 0 && (
          <>
            <h4 className="text-primary">Added Land Records</h4>
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>District</th>
                  <th>Taluka</th>
                  <th>Village</th>
                  <th>Account No.</th>
                  <th>Survey No.</th>
                  <th>Area</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {landRecords.map((record, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{record.district}</td>
                    <td>{record.taluka}</td>
                    <td>{record.village}</td>
                    <td>{record.accountNo}</td>
                    <td>{record.surveyNo}</td>
                    <td>{record.area}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteRecord(index)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </>

  );
}

export default FormSection;
