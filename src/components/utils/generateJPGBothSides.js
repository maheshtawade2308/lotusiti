import html2canvas from 'html2canvas';

export const generateJPGBothSides = async () => {
  const frontElement = document.getElementById('card-front');
  const backElement = document.getElementById('card-back');

  if (!frontElement || !backElement) return;

  // Capture both sides
  const frontCanvas = await html2canvas(frontElement, { scale: 3, useCORS: true });
  const backCanvas = await html2canvas(backElement, { scale: 3, useCORS: true });

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
  link.download = 'farmer-id-card.jpg';
  link.click();
};

export const downloadFrontSide = async () => {
  const element = document.getElementById('card-front');
  if (!element) return;

  const canvas = await html2canvas(element, { scale: 3, useCORS: true });
  const imgData = canvas.toDataURL('image/jpeg', 1.0);

  const link = document.createElement('a');
  link.href = imgData;
  link.download = 'card-front.jpg';
  link.click();
};

export const downloadBackSide = async () => {
  const element = document.getElementById('card-back');
  if (!element) return;

  const canvas = await html2canvas(element, { scale: 3, useCORS: true });
  const imgData = canvas.toDataURL('image/jpeg', 1.0);

  const link = document.createElement('a');
  link.href = imgData;
  link.download = 'card-back.jpg';
  link.click();
};