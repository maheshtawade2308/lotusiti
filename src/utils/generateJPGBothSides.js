import html2canvas from 'html2canvas';

// Helper: hide watermark → capture → restore
const captureWithoutWatermark = async (element, watermarkId) => {
  const watermark = document.getElementById(watermarkId);
  if (watermark) watermark.style.display = 'none';

  const canvas = await html2canvas(element, { scale: 3, useCORS: true });

  if (watermark) watermark.style.display = 'flex';
  return canvas;
};

export const generateJPGBothSides = async (name) => {
  const frontElement = document.getElementById('card-front');
  const backElement = document.getElementById('card-back');

  if (!frontElement || !backElement) return;

  // Capture both sides without watermarks
  const frontCanvas = await captureWithoutWatermark(frontElement, 'farmer-watermark');
  const backCanvas = await captureWithoutWatermark(backElement, 'farmer-watermark-back');

  // Determine combined dimensions
  const width = Math.max(frontCanvas.width, backCanvas.width);
  const height = frontCanvas.height + backCanvas.height;

  // Create a new canvas to combine both
  const combinedCanvas = document.createElement('canvas');
  combinedCanvas.width = width;
  combinedCanvas.height = height;
  const ctx = combinedCanvas.getContext('2d');

  // Draw both canvases onto the combined canvas
  ctx.drawImage(frontCanvas, 0, 0);
  ctx.drawImage(backCanvas, 0, frontCanvas.height);

  // Export as JPG
  const imgData = combinedCanvas.toDataURL('image/jpeg', 1.0);
  const link = document.createElement('a');
  link.href = imgData;
  const safeName = name.trim().replace(/\s+/g, '_').replace(/[^\w-]/g, '');
  link.download = `${safeName}_FarmerId.jpg`;
  link.click();
};

export const downloadFrontSide = async (name) => {
  const element = document.getElementById('card-front');
  if (!element) return;

  // Capture without kamgar watermark
  const canvas = await captureWithoutWatermark(element, 'kamgar-watermark');

  const imgData = canvas.toDataURL('image/jpeg', 1.0);
  const link = document.createElement('a');
  link.href = imgData;
  const safeName = name;
  link.download = `${safeName}_Id.jpg`;
  link.click();
};

export const downloadBackSide = async () => {
  const element = document.getElementById('card-back');
  if (!element) return;

  // Capture without back side watermark
  const canvas = await captureWithoutWatermark(element, 'farmer-watermark-back');
  const imgData = canvas.toDataURL('image/jpeg', 1.0);

  const link = document.createElement('a');
  link.href = imgData;
  link.download = 'card-back.jpg';
  link.click();
};

