// utils/pdfUtils.js
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generatePDF = async () => {
  const front = document.getElementById("card-front");
  const back = document.getElementById("card-back");

  if (!front || !back) {
    alert("Unable to find front or back side of the ID card.");
    return;
  }

  const cardWidthMM = 85.6;
  const cardHeightMM = 54;

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [cardWidthMM, cardHeightMM],
  });

  const renderToPDFPage = async (element, isFirstPage = false) => {
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = cardWidthMM;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    const yOffset = (cardHeightMM - pdfHeight) / 2;

    if (!isFirstPage) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, yOffset, pdfWidth, pdfHeight);
  };

  await renderToPDFPage(front, true); // First page
  await renderToPDFPage(back);        // Second page

  pdf.save("farmer_id_card.pdf");
};