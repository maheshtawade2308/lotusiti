import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const QRCodeGenerator = ({ mobile, regId }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const registrationNumber = regId?.trim() || 'NA';
    const mobileNo = mobile?.trim() || 'NA';
    const qrData = `${registrationNumber},${mobileNo}`;

    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrData, { width: 90, margin: 0 }, (error) => {
        if (error) console.error('QR Code generation error:', error);
      });
    }
  }, [mobile, regId]);

  return <canvas ref={canvasRef} />;
};

export default QRCodeGenerator;