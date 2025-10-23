import html2canvas from 'html2canvas';
export const generateJPGBothSides = async () => {
  const sides = ['card-front', 'card-back'];

  for (const side of sides) {
    const element = document.getElementById(side);
    if (!element) continue;

    const canvas = await html2canvas(element, { scale: 3, useCORS: true });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);

    const link = document.createElement('a');
    link.href = imgData;
    link.download = `${side}.jpg`;
    link.click();
  }
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