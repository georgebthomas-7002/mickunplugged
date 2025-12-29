import { useState } from 'react';
import { createInvitation } from '@/services/invitations';
import type { Organization } from '@/types/database';
import './InviteMemberModal.css';

interface InviteMemberModalProps {
  organization: Organization;
  onClose: () => void;
  onInviteSent: () => void;
}

export default function InviteMemberModal({
  organization,
  onClose,
  onInviteSent,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [memberType, setMemberType] = useState<'team' | 'candidate'>('candidate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{
    inviteLink: string;
    emailSent: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await createInvitation({
        organizationId: organization.id,
        email: email.trim(),
        memberType,
        sendEmail: true,
      });

      setSuccess({
        inviteLink: result.inviteLink,
        emailSent: result.emailSent,
      });
      onInviteSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (success?.inviteLink) {
      try {
        await navigator.clipboard.writeText(success.inviteLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleSendAnother = () => {
    setEmail('');
    setSuccess(null);
    setError(null);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content invite-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        <h2>Invite to {organization.name}</h2>

        {success ? (
          <div className="invite-success">
            <div className="success-icon">✓</div>
            <h3>Invitation Created!</h3>

            {success.emailSent ? (
              <p className="success-message">
                An invitation email has been sent to <strong>{email}</strong>
              </p>
            ) : (
              <p className="success-message warning">
                Email could not be sent. Copy and share the link below instead:
              </p>
            )}

            <p className="share-link-label">Share this invite link:</p>
            <div className="invite-link-container">
              <input
                type="text"
                value={success.inviteLink}
                readOnly
                className="invite-link-input"
              />
              <button
                type="button"
                className="btn btn-secondary copy-btn"
                onClick={handleCopyLink}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="success-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSendAnother}
              >
                Invite Another
              </button>
              <button type="button" className="btn btn-primary" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="modal-subtitle">
              Send an invitation to join your team or take the assessment.
            </p>

            <form onSubmit={handleSubmit} className="invite-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label>Invite As</label>
                <div className="member-type-options">
                  <label
                    className={`member-type-option ${memberType === 'candidate' ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="memberType"
                      value="candidate"
                      checked={memberType === 'candidate'}
                      onChange={() => setMemberType('candidate')}
                      disabled={loading}
                    />
                    <div className="option-content">
                      <span className="option-title">Assessment Candidate</span>
                      <span className="option-description">
                        They will complete the E.Q.U.I.P. 360 assessment
                      </span>
                    </div>
                  </label>

                  <label
                    className={`member-type-option ${memberType === 'team' ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="memberType"
                      value="team"
                      checked={memberType === 'team'}
                      onChange={() => setMemberType('team')}
                      disabled={loading}
                    />
                    <div className="option-content">
                      <span className="option-title">Team Member</span>
                      <span className="option-description">
                        They can view team results and manage assessments
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {error && <p className="form-error">{error}</p>}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
