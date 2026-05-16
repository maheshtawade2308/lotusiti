// components/IdCardBack.js
import React from "react";
import leaves from "../assets/leaves.png";

function IdCardBack({ formData, landRecords = [] }) {
  const { address } = formData;

  return (
    <div className="id-card back" id="card-back" style={{ position: "relative" }}>
      {/* Watermark overlay - hidden during download */}
      <div id="farmer-watermark-back" style={{
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 10,
      }}>
        <span style={{
          fontSize: "28px",
          fontWeight: "bold",
          color: "rgba(180, 0, 0, 0.22)",
          transform: "rotate(-35deg)",
          whiteSpace: "nowrap",
          userSelect: "none",
          letterSpacing: "2px",
        }}>Lotus Online Services</span>
      </div>

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