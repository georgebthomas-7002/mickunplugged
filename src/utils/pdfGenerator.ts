// PDF Generator Utility
// Generates a PDF of the assessment results page

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface PDFGenerationResult {
  success: boolean;
  blob?: Blob;
  base64?: string;
  error?: string;
}

/**
 * Generate a PDF from the results page content
 * @param elementId - The ID of the element to capture (defaults to 'results-content')
 * @param fileName - The name for the PDF file
 * @returns Promise with the PDF blob and base64 data
 */
export async function generateResultsPDF(
  elementId: string = 'results-pdf-content',
  _fileName: string = 'EQUIP360-Results'
): Promise<PDFGenerationResult> {
  try {
    const element = document.getElementById(elementId);

    if (!element) {
      return {
        success: false,
        error: `Element with ID "${elementId}" not found`,
      };
    }

    // Apply PDF mode styling (white background, no gradients, compact)
    element.classList.add('pdf-mode');

    // Small delay for styles to apply
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Capture the element as a canvas
    let canvas;
    try {
      canvas = await html2canvas(element, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: 900,
      });
    } finally {
      // Always remove PDF mode after capture (even on error)
      element.classList.remove('pdf-mode');
    }

    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF with compression
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    // Use JPEG with compression for smaller file size
    const imgData = canvas.toDataURL('image/jpeg', 0.4);

    // Add pages as needed
    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pageHeight;

    // Additional pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;
    }

    // Get blob for upload
    const blob = pdf.output('blob');

    // Get base64 for API transmission
    const base64 = pdf.output('datauristring').split(',')[1];

    return {
      success: true,
      blob,
      base64,
    };
  } catch (error) {
    console.error('PDF generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during PDF generation',
    };
  }
}

/**
 * Download the PDF locally
 * @param blob - The PDF blob
 * @param fileName - The file name
 */
export function downloadPDF(blob: Blob, fileName: string = 'EQUIP360-Results'): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${fileName}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Upload PDF to HubSpot via our API endpoint
 * @param base64Data - The PDF as base64 string
 * @param fileName - The file name
 * @param contactEmail - The email to associate the file with
 * @returns Promise with upload result
 */
export async function uploadPDFToHubSpot(
  base64Data: string,
  fileName: string,
  contactEmail: string
): Promise<{ success: boolean; message: string; fileUrl?: string }> {
  try {
    const response = await fetch('/api/hubspot-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileData: base64Data,
        fileName: `${fileName}.pdf`,
        contactEmail,
      }),
    });

    const responseText = await response.text();

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      return {
        success: false,
        message: 'Invalid response from server',
      };
    }

    if (response.ok && result.success) {
      return {
        success: true,
        message: 'PDF uploaded successfully',
        fileUrl: result.fileUrl,
      };
    } else {
      return {
        success: false,
        message: result.error || `Upload failed: ${response.status}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    };
  }
}
