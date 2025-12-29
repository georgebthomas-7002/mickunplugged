import { supabase } from '@/lib/supabase';
import type { Invitation, InvitationWithOrganization } from '@/types/database';

// Generate a secure random token
const generateToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

// Get the app URL for invite links
const getAppUrl = (): string => {
  return import.meta.env.VITE_APP_URL || window.location.origin;
};

export interface CreateInvitationParams {
  organizationId: string;
  email: string;
  memberType: 'team' | 'candidate';
  sendEmail?: boolean;
}

export interface InvitationResult {
  invitation: Invitation;
  inviteLink: string;
  emailSent: boolean;
}

/**
 * Create a new invitation and optionally send an email
 */
export async function createInvitation({
  organizationId,
  email,
  memberType,
  sendEmail = true,
}: CreateInvitationParams): Promise<InvitationResult> {
  const token = generateToken();

  // Check if there's already a pending invitation for this email/org
  const { data: existing } = await supabase
    .from('invitations')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('email', email.toLowerCase())
    .eq('status', 'pending')
    .single();

  if (existing) {
    // Return existing invitation
    const inviteLink = `${getAppUrl()}/invite/${existing.token}`;
    return {
      invitation: existing as Invitation,
      inviteLink,
      emailSent: false,
    };
  }

  // Create new invitation
  const { data, error } = await supabase
    .from('invitations')
    .insert({
      organization_id: organizationId,
      email: email.toLowerCase(),
      member_type: memberType,
      token,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create invitation: ${error.message}`);
  }

  const invitation = data as Invitation;
  const inviteLink = `${getAppUrl()}/invite/${token}`;

  // Attempt to send email if requested
  let emailSent = false;
  if (sendEmail) {
    try {
      emailSent = await sendInvitationEmail(invitation, inviteLink);
    } catch (emailError) {
      console.warn('Failed to send invitation email:', emailError);
      // Don't fail the whole operation if email fails
    }
  }

  return {
    invitation,
    inviteLink,
    emailSent,
  };
}

/**
 * Send invitation email via API endpoint
 * This calls a serverless function that uses Resend
 */
async function sendInvitationEmail(
  invitation: Invitation,
  inviteLink: string
): Promise<boolean> {
  // Get organization name for the email
  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', invitation.organization_id)
    .single();

  const organizationName = org?.name || 'an organization';

  try {
    const response = await fetch('/api/send-invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: invitation.email,
        organizationName,
        inviteLink,
        memberType: invitation.member_type,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.warn('Email API error:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.warn('Failed to call email API:', error);
    return false;
  }
}

/**
 * Get invitation by token
 */
export async function getInvitationByToken(
  token: string
): Promise<InvitationWithOrganization | null> {
  const { data, error } = await supabase
    .from('invitations')
    .select(
      `
      *,
      organization:organizations(*)
    `
    )
    .eq('token', token)
    .single();

  if (error || !data) {
    return null;
  }

  return data as unknown as InvitationWithOrganization;
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(
  token: string,
  userId: string
): Promise<{ success: boolean; organizationId?: string; error?: string }> {
  // Get the invitation
  const { data: invitation, error: fetchError } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .single();

  if (fetchError || !invitation) {
    return { success: false, error: 'Invitation not found' };
  }

  if (invitation.status !== 'pending') {
    return {
      success: false,
      error:
        invitation.status === 'accepted'
          ? 'This invitation has already been accepted'
          : 'This invitation has expired',
    };
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('organization_members')
    .select('id')
    .eq('organization_id', invitation.organization_id)
    .eq('user_id', userId)
    .single();

  if (existingMember) {
    // Update invitation status anyway
    await supabase
      .from('invitations')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
      .eq('id', invitation.id);

    return {
      success: true,
      organizationId: invitation.organization_id,
    };
  }

  // Add user as organization member
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: invitation.organization_id,
      user_id: userId,
      member_type: invitation.member_type,
      joined_at: new Date().toISOString(),
    });

  if (memberError) {
    return { success: false, error: `Failed to join organization: ${memberError.message}` };
  }

  // Update invitation status
  await supabase
    .from('invitations')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', invitation.id);

  return {
    success: true,
    organizationId: invitation.organization_id,
  };
}

/**
 * Get pending invitations for an organization
 */
export async function getOrganizationInvitations(
  organizationId: string
): Promise<Invitation[]> {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch invitations:', error);
    return [];
  }

  return data as Invitation[];
}

/**
 * Revoke/cancel an invitation
 */
export async function revokeInvitation(invitationId: string): Promise<boolean> {
  const { error } = await supabase
    .from('invitations')
    .update({ status: 'expired' })
    .eq('id', invitationId)
    .eq('status', 'pending');

  return !error;
}

/**
 * Resend an invitation (creates a new token)
 */
export async function resendInvitation(
  invitationId: string
): Promise<InvitationResult | null> {
  // Get existing invitation
  const { data: existing, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('id', invitationId)
    .single();

  if (error || !existing) {
    return null;
  }

  // Generate new token and update
  const newToken = generateToken();
  const { data: updated, error: updateError } = await supabase
    .from('invitations')
    .update({
      token: newToken,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .eq('id', invitationId)
    .select()
    .single();

  if (updateError || !updated) {
    return null;
  }

  const invitation = updated as Invitation;
  const inviteLink = `${getAppUrl()}/invite/${newToken}`;

  // Try to send email
  let emailSent = false;
  try {
    emailSent = await sendInvitationEmail(invitation, inviteLink);
  } catch (emailError) {
    console.warn('Failed to send invitation email:', emailError);
  }

  return {
    invitation,
    inviteLink,
    emailSent,
  };
}
