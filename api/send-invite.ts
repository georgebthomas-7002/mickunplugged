import type { VercelRequest, VercelResponse } from '@vercel/node';

interface InviteEmailRequest {
  to: string;
  organizationName: string;
  inviteLink: string;
  memberType: 'team' | 'candidate';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  const { to, organizationName, inviteLink, memberType } =
    req.body as InviteEmailRequest;

  if (!to || !organizationName || !inviteLink) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const isCandidate = memberType === 'candidate';
  const subject = isCandidate
    ? `You're invited to complete an E.Q.U.I.P. 360 Assessment`
    : `You're invited to join ${organizationName} on E.Q.U.I.P. 360`;

  const emailHtml = generateEmailHtml({
    organizationName,
    inviteLink,
    isCandidate,
  });

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // TODO: Change back to 'E.Q.U.I.P. 360 <noreply@equip360.io>' after domain verification
        from: 'E.Q.U.I.P. 360 <onboarding@resend.dev>',
        to: [to],
        subject,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Resend API error:', errorData);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
}

interface EmailTemplateParams {
  organizationName: string;
  inviteLink: string;
  isCandidate: boolean;
}

function generateEmailHtml({
  organizationName,
  inviteLink,
  isCandidate,
}: EmailTemplateParams): string {
  const headline = isCandidate
    ? 'Complete Your Leadership Assessment'
    : `Join ${organizationName}`;

  const bodyText = isCandidate
    ? `<p>You've been invited by <strong>${organizationName}</strong> to complete the E.Q.U.I.P. 360 Leadership Assessment.</p>
       <p>This assessment measures emotional intelligence and leadership potential through scenario-based questions. It takes approximately 15-20 minutes to complete.</p>`
    : `<p>You've been invited to join <strong>${organizationName}</strong> on E.Q.U.I.P. 360 as a team member.</p>
       <p>As a team member, you'll be able to view team assessment results and collaborate with your colleagues.</p>`;

  const buttonText = isCandidate ? 'Start Assessment' : 'Accept Invitation';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${headline}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #1a1a2e; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #C9A227; font-family: 'Playfair Display', Georgia, serif;">
                E.Q.U.I.P. 360
              </h1>
              <p style="margin: 8px 0 0; font-size: 14px; color: #9ca3af;">
                Leadership Assessment Tool
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #ffffff;">
                ${headline}
              </h2>

              <div style="font-size: 16px; line-height: 1.6; color: #d1d5db;">
                ${bodyText}
              </div>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; margin: 32px 0;">
                <tr>
                  <td style="text-align: center;">
                    <a href="${inviteLink}"
                       style="display: inline-block; padding: 16px 32px; background-color: #C9A227; color: #000000; text-decoration: none; font-weight: 600; font-size: 16px; border-radius: 8px;">
                      ${buttonText}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; color: #9ca3af; margin: 24px 0 0;">
                Or copy and paste this link into your browser:
              </p>
              <p style="font-size: 14px; color: #C9A227; word-break: break-all; margin: 8px 0 0;">
                ${inviteLink}
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #0f0f1a; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                This invitation was sent by ${organizationName}.
              </p>
              <p style="margin: 8px 0 0; font-size: 12px; color: #6b7280;">
                If you didn't expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
