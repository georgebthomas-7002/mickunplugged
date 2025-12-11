// HubSpot Forms API Integration Service
// Submits form data to HubSpot for lead capture and CRM integration

const HUBSPOT_PORTAL_ID = '48149617';
const HUBSPOT_FORM_GUID = 'ad3d590a-2620-4b5a-8ee2-f908fe94dc7c';

// HubSpot Forms API endpoint
const HUBSPOT_FORMS_API_URL = `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`;

export interface HubSpotFormData {
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  jobTitle?: string;
}

export interface HubSpotSubmissionResult {
  success: boolean;
  message: string;
  inlineMessage?: string;
  debugInfo?: {
    status?: number;
    statusText?: string;
    responseBody?: unknown;
    error?: string;
  };
}

/**
 * Submit form data to HubSpot Forms API
 * @param formData - User form data to submit
 * @returns Promise with submission result
 */
export async function submitToHubSpot(
  formData: HubSpotFormData
): Promise<HubSpotSubmissionResult> {
  // Build the fields array for HubSpot
  const fields = [
    { name: 'email', value: formData.email },
    { name: 'firstname', value: formData.firstName },
    { name: 'lastname', value: formData.lastName },
  ];

  // Add optional fields if provided
  if (formData.company) {
    fields.push({ name: 'company', value: formData.company });
  }

  if (formData.jobTitle) {
    fields.push({ name: 'jobtitle', value: formData.jobTitle });
  }

  // HubSpot submission payload
  const payload = {
    fields,
    context: {
      pageUri: window.location.href,
      pageName: 'E.Q.U.I.P. 360 Assessment - Start',
    },
  };

  // DEBUG: Log what we're sending
  console.group('🔵 HubSpot Form Submission Debug');
  console.log('Portal ID:', HUBSPOT_PORTAL_ID);
  console.log('Form GUID:', HUBSPOT_FORM_GUID);
  console.log('API URL:', HUBSPOT_FORMS_API_URL);
  console.log('Payload:', JSON.stringify(payload, null, 2));
  console.groupEnd();

  try {
    console.log('🔵 Sending request to HubSpot...');

    const response = await fetch(HUBSPOT_FORMS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('🔵 Response received:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    // Try to get response body
    const responseText = await response.text();
    let responseBody: unknown;

    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = responseText;
    }

    console.log('🔵 Response body:', responseBody);

    if (response.ok) {
      console.log('✅ HubSpot submission SUCCESS');
      return {
        success: true,
        message: 'Form submitted successfully to HubSpot',
        inlineMessage: typeof responseBody === 'object' && responseBody !== null
          ? (responseBody as Record<string, unknown>).inlineMessage as string | undefined
          : undefined,
        debugInfo: {
          status: response.status,
          statusText: response.statusText,
          responseBody,
        },
      };
    } else {
      console.error('❌ HubSpot submission FAILED');
      console.error('Status:', response.status, response.statusText);
      console.error('Response:', responseBody);

      return {
        success: false,
        message: `HubSpot submission failed: ${response.status} ${response.statusText}`,
        debugInfo: {
          status: response.status,
          statusText: response.statusText,
          responseBody,
        },
      };
    }
  } catch (error) {
    // Network or other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    console.error('❌ HubSpot submission ERROR (network/fetch failed)');
    console.error('Error:', error);

    return {
      success: false,
      message: errorMessage,
      debugInfo: {
        error: errorMessage,
      },
    };
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
