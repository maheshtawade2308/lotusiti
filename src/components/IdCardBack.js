// components/IdCardBack.js
import React from "react";
import leaves from "../assets/leaves.png";

function IdCardBack({ formData, landRecords = [] }) {
  const { address } = formData;

  return (
    <div className="id-card back" id="card-back">
      <div className="address-section">
        <h5>संपूर्ण पत्ता / Address</h5>
        <p>{address || "-----------"}</p>
      </div>

      <div className="land-section">
        <h5>जमिनीची माहिती / Land Details</h5>
        {landRecords.length > 0 ? (
          <table className="land-table">
            <thead>
              <tr>
                <th>जिल्हा</th>
                <th>तालुका</th>
                <th>गाव</th>
                <th>गट नं.</th>
                <th>खाते नं.</th>
                <th>क्षेत्रफळ</th>
              </tr>
            </thead>
            <tbody>
              {landRecords.map((record, index) => (
                <tr key={index}>
                  <td>{record.district || "-"}</td>
                  <td>{record.taluka || "-"}</td>
                  <td>{record.village || "-"}</td>
                  <td>{record.surveyNo || "-"}</td>
                  <td>{record.accountNo || "-"}</td>
                  <td>{record.area || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="no-data">No land records available</p>
        )}
      </div>
      <div>
      <img src={leaves} alt="leaves" className="leaves-bottom-left" />
      <div className="note">
        हे कार्ड वैयक्तिक वापरासाठी असून सरकारी ओळखपत्र म्हणून मान्य नाही.
      </div>
      <img src={leaves} alt="leaves" className="leaves-bottom" />
      </div>
    </div>
  );
}

export default IdCardBack;