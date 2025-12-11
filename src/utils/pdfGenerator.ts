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
  fileName: string = 'EQUIP360-Results'
): Promise<PDFGenerationResult> {
  try {
    const element = document.getElementById(elementId);

    if (!element) {
      console.error(`Element with ID "${elementId}" not found`);
      return {
        success: false,
        error: `Element with ID "${elementId}" not found`,
      };
    }

    console.log(`🔵 Starting PDF generation for: ${fileName}`);

    // Capture the element as a canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher resolution
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#0a0a0a', // Match the dark background
      logging: false,
      windowWidth: 1200, // Fixed width for consistent output
    });

    console.log('🔵 Canvas captured, creating PDF...');

    // Calculate dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // Create PDF
    const pdf = new jsPDF({
      orientation: imgHeight > pageHeight ? 'portrait' : 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Add pages as needed
    let heightLeft = imgHeight;
    let position = 0;
    const imgData = canvas.toDataURL('image/png');

    // First page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    // Additional pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    console.log('🔵 PDF created successfully');

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
    console.error('❌ PDF generation error:', error);
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
  console.log('✅ PDF downloaded:', `${fileName}.pdf`);
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
    console.log('🔵 Uploading PDF to HubSpot...');

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

    const result = await response.json();

    if (response.ok && result.success) {
      console.log('✅ PDF uploaded to HubSpot:', result);
      return {
        success: true,
        message: 'PDF uploaded successfully',
        fileUrl: result.fileUrl,
      };
    } else {
      console.error('❌ HubSpot upload failed:', result);
      return {
        success: false,
        message: result.error || 'Upload failed',
      };
    }
  } catch (error) {
    console.error('❌ HubSpot upload error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    };
  }
}
