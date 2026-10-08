import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const QRCodeGenerator = ({ name, id }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const safeName = name?.trim() || 'NA';
    const safeId = id?.trim() || 'NA';
    const qrData = JSON.stringify({ name: safeName, id: safeId });

    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, qrData, { width: 100 }, (error) => {
        if (error) console.error('QR Code generation error:', error);
      });
    }
  }, [name, id]);

  return <canvas ref={canvasRef} />;
};

export default QRCodeGenerator;