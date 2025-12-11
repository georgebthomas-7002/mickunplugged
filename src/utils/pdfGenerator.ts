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

    // Capture the element as a canvas (reduced scale for smaller file size)
    const canvas = await html2canvas(element, {
      scale: 1, // Minimum scale for smallest file size
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#0a0a0a', // Match the dark background
      logging: false,
      windowWidth: 900, // Narrower width for smaller output
    });

    console.log('🔵 Canvas captured, creating PDF...');
    console.log('🔵 Canvas size:', canvas.width, 'x', canvas.height);

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

    // Use JPEG with heavy compression for smaller file size
    const imgData = canvas.toDataURL('image/jpeg', 0.4); // 40% quality JPEG for maximum compression
    console.log('🔵 Image data length:', imgData.length);

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

    console.log('🔵 PDF created successfully');

    // Get blob for upload
    const blob = pdf.output('blob');
    console.log('🔵 PDF blob size:', blob.size, 'bytes');

    // Get base64 for API transmission
    const base64 = pdf.output('datauristring').split(',')[1];
    console.log('🔵 PDF base64 length:', base64.length);

    // Check if PDF is too large (Vercel limit is ~4.5MB)
    if (base64.length > 4000000) {
      console.warn('⚠️ PDF is large, may hit upload limits');
    }

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
): Promise<{ success: boolean; message: string; fileUrl?: string; debugInfo?: unknown }> {
  try {
    console.log('🔵 Uploading PDF to HubSpot API...');
    console.log('🔵 API endpoint: /api/hubspot-upload');
    console.log('🔵 File name:', `${fileName}.pdf`);
    console.log('🔵 Contact email:', contactEmail);
    console.log('🔵 Base64 data length:', base64Data.length);

    const requestBody = {
      fileData: base64Data,
      fileName: `${fileName}.pdf`,
      contactEmail,
    };

    console.log('🔵 Sending request...');

    const response = await fetch('/api/hubspot-upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🔵 Response status:', response.status, response.statusText);

    const responseText = await response.text();
    console.log('🔵 Response body (raw):', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch {
      console.error('❌ Failed to parse response as JSON');
      return {
        success: false,
        message: `Invalid JSON response: ${responseText.substring(0, 200)}`,
      };
    }

    console.log('🔵 Response body (parsed):', result);

    if (response.ok && result.success) {
      console.log('✅ PDF uploaded to HubSpot successfully!');
      return {
        success: true,
        message: 'PDF uploaded successfully',
        fileUrl: result.fileUrl,
        debugInfo: result,
      };
    } else {
      console.error('❌ HubSpot upload failed:', result);
      return {
        success: false,
        message: result.error || `Upload failed: ${response.status}`,
        debugInfo: result,
      };
    }
  } catch (error) {
    console.error('❌ HubSpot upload error (exception):', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    };
  }
}
