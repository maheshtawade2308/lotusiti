import React from 'react';
import { ToastContainer, toast } from 'react-toastify';  // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css';  // Import the CSS
import axios from "axios";

function FormSection({ formData, setFormData, landRecords, setLandRecords }) {
  const handleChange = async (e) => {
    const { name, value, files } = e.target;


    if (name === "mobile") {
      // Remove non-digit characters
      let digits = value.replace(/\D/g, "");

      // Limit to 10 digits
      if (digits.length > 10) digits = digits.substring(0, 10);

      setFormData((prev) => ({
        ...prev,
        mobile: digits,
      }));
    }
    else

      if (name === "name_en") {
        setFormData((prev) => ({
          ...prev,
          name_en: value,
        }));

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

            setFormData((prev) => ({
              ...prev,
              name_mr: marathiText,
            }));
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
    toast.success("Record added successfully");

    setLandRecords((prev) => [...prev, landData]);

    // Clear land fields
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

  const handleFormerIdChange = (e) => {
    let input = e.target.value;

    // Remove all non-digit characters
    input = input.replace(/\D/g, "");

    // Add space after every 3rd or 2nd group pattern (customize if needed)
    // Example pattern: 3-2-2-2-2 like 564 56 45 65 46
    const groups = [];
    if (input.length > 0) groups.push(input.substring(0, 4)); // first 4 digits
    if (input.length > 4) groups.push(input.substring(4, 8)); // next 4
    if (input.length > 8) groups.push(input.substring(8, 11)); // next 2
    const formatted = groups.join(" ");

    setFormData((prev) => ({
      ...prev,
      id: formatted,
    }));
  }
  const setAddharNo = (e) => {
    let input = e.target.value;

    // Remove all non-digit characters
    input = input.replace(/\D/g, "");

    // Format as groups of 4 digits
    const formatted = input.match(/.{1,4}/g)?.join(" ") || "";

    setFormData((prev) => ({
      ...prev,
      aadhaar: formatted,
    }));
  }

  return (
    <form>
      <ToastContainer />
      {/* Farmer ID */}
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


      {/* Land Details */}
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
        {/* Add Land Record Button */}
        <button type="button" className="btn btn-outline-success" onClick={handleAddLandRecord}>
          + Add Land Record
        </button>
      </div>
    </form>
  );
}

export default FormSection;