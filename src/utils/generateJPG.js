// utils/generateJPG.js
import html2canvas from 'html2canvas';

export const generateJPG = async () => {
  const cardElement = document.getElementById('card-front'); // or 'print-area' or 'card-back'

  if (!cardElement) {
    alert('Unable to find the ID card.');
    return;
  }

  const canvas = await html2canvas(cardElement, {
    scale: 3, // higher scale for better quality
    useCORS: true,
  });

  const imgData = canvas.toDataURL('image/jpeg', 1.0); // Get JPG with full quality

  // Create a temporary link to download the image
  const link = document.createElement('a');
  link.href = imgData;
  link.download = 'farmer_id_card.jpg';
  link.click();
};