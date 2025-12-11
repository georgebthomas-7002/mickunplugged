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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!HUBSPOT_ACCESS_TOKEN) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const { fileData, fileName, contactEmail } = req.body as UploadRequest;

    if (!fileData || !fileName || !contactEmail) {
      return res.status(400).json({
        error: 'Missing required fields: fileData, fileName, contactEmail',
      });
    }

    // Step 1: Find the contact by email
    const contactId = await findContactByEmail(contactEmail);

    if (!contactId) {
      return res.status(404).json({
        success: false,
        error: 'Contact not found in HubSpot',
      });
    }

    // Step 2: Upload file to HubSpot Files API
    const fileResult = await uploadFileToHubSpot(fileData, fileName);

    if (!fileResult.success) {
      return res.status(500).json({
        success: false,
        error: fileResult.error,
      });
    }

    // Step 3: Create an engagement (note) with the file attached to the contact
    const engagementResult = await createEngagementWithAttachment(
      contactId,
      fileResult.fileId!,
      fileName
    );

    if (!engagementResult) {
      return res.status(500).json({
        success: false,
        error: 'Failed to attach file to contact',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'PDF uploaded and attached to contact record',
      fileUrl: fileResult.url,
      fileId: fileResult.fileId,
    });
  } catch (error) {
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
      return null;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      return data.results[0].id;
    }

    return null;
  } catch {
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
    const buffer = Buffer.from(base64Data, 'base64');
    const formData = new FormData();
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
      return {
        success: false,
        error: `File upload failed: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();

    return {
      success: true,
      fileId: data.id,
      url: data.url,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create an engagement (note) with the PDF attached to the contact
 * Uses the Engagements API to attach file directly to contact record
 */
async function createEngagementWithAttachment(
  contactId: string,
  fileId: string,
  fileName: string
): Promise<boolean> {
  try {
    const response = await fetch(
      'https://api.hubapi.com/engagements/v1/engagements',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${HUBSPOT_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          engagement: {
            active: true,
            type: 'NOTE',
            timestamp: Date.now(),
          },
          associations: {
            contactIds: [parseInt(contactId, 10)],
            companyIds: [],
            dealIds: [],
            ownerIds: [],
          },
          attachments: [
            {
              id: parseInt(fileId, 10),
            },
          ],
          metadata: {
            body: `<h3>E.Q.U.I.P. 360 Assessment Results</h3><p>File: ${fileName}</p><p>This PDF contains the complete leadership assessment results for this contact.</p>`,
          },
        }),
      }
    );

    return response.ok;
  } catch {
    return false;
  }
}
