import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import html2canvasPro from 'html2canvas-pro';

export async function generatePdfFromElement(
  elementId: string,
  filename: string = 'Student-Evaluation-Report.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    window.print();
    return;
  }

  try {
    let imgData = '';
    let imgWidthPx = 0;
    let imgHeightPx = 0;

    try {
      imgData = await toPng(element, {
        quality: 0.98,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        skipFonts: true,
      });

      const img = new Image();
      img.src = imgData;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image failed to load from toPng'));
      });
      imgWidthPx = img.width;
      imgHeightPx = img.height;
    } catch (toPngErr) {
      console.warn('toPng failed, attempting html2canvas-pro fallback...', toPngErr);
      const canvas = await html2canvasPro(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
      });
      imgData = canvas.toDataURL('image/png');
      imgWidthPx = canvas.width;
      imgHeightPx = canvas.height;
    }

    if (!imgData || !imgWidthPx || !imgHeightPx) {
      throw new Error('Failed to render report element to image');
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210; // A4 size width in mm
    const pageHeight = 297; // A4 size height in mm
    const imgWidth = pageWidth;
    const imgHeight = (imgHeightPx * imgWidth) / imgWidthPx;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    while (heightLeft > 5) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
  } catch (err) {
    console.error('PDF Generation encountered an error, falling back to print:', err);
    window.print();
  }
}
