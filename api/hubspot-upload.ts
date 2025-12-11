// Vercel Serverless Function: Upload PDF to HubSpot
// POST /api/hubspot-upload

import type { VercelRequest, VercelResponse } from '@vercel/node';

const HUBSPOT_ACCESS_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

interface UploadRequest {
  fileData: string; // Base64 encoded PDF
  fileName: string;
  contactEmail: string;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check for access token
  if (!HUBSPOT_ACCESS_TOKEN) {
    console.error('HUBSPOT_ACCESS_TOKEN not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const { fileData, fileName, contactEmail } = req.body as UploadRequest;

    if (!fileData || !fileName || !contactEmail) {
      return res.status(400).json({
        error: 'Missing required fields: fileData, fileName, contactEmail',
      });
    }

    console.log(`Processing PDF upload for ${contactEmail}: ${fileName}`);

    // Step 1: Find the contact by email
    const contactId = await findContactByEmail(contactEmail);

    if (!contactId) {
      console.log(`Contact not found for ${contactEmail}, creating engagement without contact association`);
    }

    // Step 2: Upload file to HubSpot Files API
    const fileResult = await uploadFileToHubSpot(fileData, fileName);

    if (!fileResult.success) {
      return res.status(500).json({
        success: false,
        error: fileResult.error,
      });
    }

    // Step 3: Create a note with the file attached to the contact
    if (contactId && fileResult.fileId) {
      await createNoteWithAttachment(contactId, fileResult.fileId, fileName);
    }

    return res.status(200).json({
      success: true,
      message: 'PDF uploaded and attached to contact',
      fileUrl: fileResult.url,
      fileId: fileResult.fileId,
    });
  } catch (error) {
    console.error('HubSpot upload error:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Find a HubSpot contact by email
 */
async function findContactByEmail(email: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts/search`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: 'email',
                  operator: 'EQ',
                  value: email,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error('Contact search failed:', await response.text());
      return null;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      console.log(`Found contact: ${data.results[0].id}`);
      return data.results[0].id;
    }

    return null;
  } catch (error) {
    console.error('Error finding contact:', error);
    return null;
  }
}

/**
 * Upload a file to HubSpot Files API
 */
async function uploadFileToHubSpot(
  base64Data: string,
  fileName: string
): Promise<{ success: boolean; fileId?: string; url?: string; error?: string }> {
  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Create form data
    const formData = new FormData();

    // Create a Blob from the buffer
    const blob = new Blob([buffer], { type: 'application/pdf' });

    formData.append('file', blob, fileName);
    formData.append(
      'options',
      JSON.stringify({
        access: 'PRIVATE',
        overwrite: false,
      })
    );
    formData.append('folderPath', '/EQUIP360-Results');

    const response = await fetch('https://api.hubapi.com/files/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('File upload failed:', response.status, errorText);
      return {
        success: false,
        error: `File upload failed: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    console.log('File uploaded:', data.id, data.url);

    return {
      success: true,
      fileId: data.id,
      url: data.url,
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create a note engagement with the PDF attached
 */
async function createNoteWithAttachment(
  contactId: string,
  fileId: string,
  fileName: string
): Promise<boolean> {
  try {
    const response = await fetch(
      'https://api.hubapi.com/crm/v3/objects/notes',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            hs_timestamp: new Date().toISOString(),
            hs_note_body: `E.Q.U.I.P. 360 Assessment Results - ${fileName}\n\nThis PDF contains the leadership assessment results for this contact.`,
            hs_attachment_ids: fileId,
          },
          associations: [
            {
              to: { id: contactId },
              types: [
                {
                  associationCategory: 'HUBSPOT_DEFINED',
                  associationTypeId: 202, // Note to Contact
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Note creation failed:', response.status, errorText);
      return false;
    }

    console.log('Note created with attachment for contact:', contactId);
    return true;
  } catch (error) {
    console.error('Error creating note:', error);
    return false;
  }
}
