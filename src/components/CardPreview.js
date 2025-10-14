import React from 'react';
import QRCodeGenerator from './QRCodeGenerator';
import FarmerIdCard from './FarmerIdCard';
import { downloadFrontSide, downloadBackSide } from '../utils/generateJPGBothSides';

function CardPreview({ formData, landRecords }) {

  return (
    <div >
      <div >
      <h5 className="text-center mb-3">Card Preview</h5>
      <FarmerIdCard formData={formData} landRecords={landRecords} />
      </div>
       <div className="d-flex gap-3 mt-5 mb-3 justify-content-center">
        <button className="btn btn-success btn-lg" onClick={downloadFrontSide}>
          Download Front Side
        </button>

        <button className="btn btn-primary btn-lg" onClick={downloadBackSide}>
          Download Back Side
        </button>
      </div>
    </div>
  );
}

export default CardPreview;