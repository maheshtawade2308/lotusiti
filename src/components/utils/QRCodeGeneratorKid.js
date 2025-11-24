import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const QRCodeGenerator = ({ mobile, regId }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const registrationNumber = regId?.trim() || 'NA';
    const mobileNo = mobile?.trim() || 'NA';
    const qrData = `${registrationNumber},${mobileNo}`;

    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrData, { width: 75, margin: 0 ,  color: {
            dark: '#000000',       // QR code dots
            light: '#0000'   // Background
          }
}, (error) => {
        if (error) console.error('QR Code generation error:', error);
      });
    }
  }, [mobile, regId]);

  return <canvas ref={canvasRef} />;
};

export default QRCodeGenerator;