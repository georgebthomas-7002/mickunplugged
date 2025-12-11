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
    // Optional: Add legal consent if needed
    // legalConsentOptions: {
    //   consent: {
    //     consentToProcess: true,
    //     text: 'I agree to allow E.Q.U.I.P. 360 to store and process my personal data.',
    //   },
    // },
  };

  try {
    const response = await fetch(HUBSPOT_FORMS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await response.json();
      return {
        success: true,
        message: 'Form submitted successfully to HubSpot',
        inlineMessage: result.inlineMessage,
      };
    } else {
      // Handle specific error codes
      const errorData = await response.json().catch(() => ({}));
      console.error('HubSpot submission failed:', response.status, errorData);

      return {
        success: false,
        message: `HubSpot submission failed: ${response.status}`,
      };
    }
  } catch (error) {
    // Network or other errors - don't block the user flow
    console.error('HubSpot submission error:', error);

    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
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
