import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateReport = async (experimentName, elementId) => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Cover Page
    pdf.setFontSize(24);
    pdf.setTextColor(30, 41, 59);
    pdf.text("Clinical AI Report", 20, 40);

    pdf.setFontSize(36);
    pdf.setTextColor(14, 165, 233); // Primary Blue
    pdf.text(experimentName, 20, 60);

    pdf.setFontSize(14);
    pdf.setTextColor(100);
    pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 80);

    pdf.setLineWidth(0.5);
    pdf.line(20, 90, 190, 90);

    pdf.setFontSize(12);
    pdf.text("This report summarizes the performance, fairness, and safety", 20, 110);
    pdf.text("of the federated learning model training session.", 20, 118);

    // Add the Dashboard Image (scaled to fit)
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);

    pdf.save(`${experimentName.replace(/\s+/g, '_')}_Report.pdf`);
};
