import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getInvitationByToken, acceptInvitation } from '@/services/invitations';
import type { InvitationWithOrganization } from '@/types/database';
import './InviteAccept.css';

export default function InviteAccept() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [invitation, setInvitation] = useState<InvitationWithOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch invitation details
  useEffect(() => {
    async function fetchInvitation() {
      if (!token) {
        setError('Invalid invitation link');
        setLoading(false);
        return;
      }

      try {
        const inv = await getInvitationByToken(token);
        if (!inv) {
          setError('Invitation not found or has expired');
        } else if (inv.status === 'accepted') {
          setError('This invitation has already been accepted');
        } else if (inv.status === 'expired') {
          setError('This invitation has expired');
        } else if (!inv.organization) {
          setError('Organization not found');
        } else {
          setInvitation(inv);
        }
      } catch (err) {
        console.error('Failed to fetch invitation:', err);
        setError('Failed to load invitation');
      } finally {
        setLoading(false);
      }
    }

    fetchInvitation();
  }, [token]);

  // Handle accepting the invitation
  const handleAccept = async () => {
    if (!user || !token) return;

    setAccepting(true);
    setError(null);

    try {
      const result = await acceptInvitation(token, user.id);

      if (result.success) {
        // If candidate, redirect to start assessment
        // If team member, redirect to dashboard
        if (invitation?.member_type === 'candidate') {
          // Store org context for assessment
          localStorage.setItem(
            'pending_assessment_org',
            JSON.stringify({
              organizationId: result.organizationId,
              organizationName: invitation.organization.name,
            })
          );
          navigate('/start');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Failed to accept invitation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  // Redirect to login with return URL if not authenticated
  const handleLoginRedirect = () => {
    // Store the invite token for after login
    localStorage.setItem('pending_invite_token', token || '');
    navigate('/login');
  };

  const handleSignupRedirect = () => {
    // Store the invite token for after signup
    localStorage.setItem('pending_invite_token', token || '');
    navigate('/signup');
  };

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="invite-page">
        <div className="invite-container">
          <div className="loading-spinner" />
          <p>Loading invitation...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="invite-page">
        <div className="invite-container">
          <div className="invite-card error">
            <div className="error-icon">!</div>
            <h1>Invitation Error</h1>
            <p>{error}</p>
            <Link to="/" className="btn btn-primary">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // No invitation found
  if (!invitation) {
    return (
      <div className="invite-page">
        <div className="invite-container">
          <div className="invite-card error">
            <div className="error-icon">?</div>
            <h1>Invitation Not Found</h1>
            <p>This invitation link is invalid or has expired.</p>
            <Link to="/" className="btn btn-primary">
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCandidate = invitation.member_type === 'candidate';

  return (
    <div className="invite-page">
      <div className="invite-container">
        <div className="invite-card">
          <div className="invite-badge">{isCandidate ? 'Assessment Invite' : 'Team Invite'}</div>

          <h1>You're Invited!</h1>

          <p className="invite-org">
            <strong>{invitation.organization.name}</strong> has invited you to
            {isCandidate
              ? ' complete the E.Q.U.I.P. 360 Leadership Assessment.'
              : ' join their team on E.Q.U.I.P. 360.'}
          </p>

          {isCandidate && (
            <div className="invite-details">
              <h3>About the Assessment</h3>
              <ul>
                <li>20 scenario-based questions</li>
                <li>Measures emotional intelligence &amp; leadership potential</li>
                <li>Takes approximately 15-20 minutes</li>
                <li>Receive your Leadership Identity and personalized insights</li>
              </ul>
            </div>
          )}

          {user ? (
            // User is logged in - show accept button
            <div className="invite-actions">
              <button
                className="btn btn-primary btn-lg"
                onClick={handleAccept}
                disabled={accepting}
              >
                {accepting
                  ? 'Accepting...'
                  : isCandidate
                    ? 'Accept & Start Assessment'
                    : 'Accept Invitation'}
              </button>
              <p className="logged-in-as">
                Logged in as <strong>{user.email}</strong>
              </p>
            </div>
          ) : (
            // User not logged in - show login/signup options
            <div className="invite-actions">
              <p className="auth-prompt">Sign in or create an account to accept this invitation:</p>

              <div className="auth-buttons">
                <button className="btn btn-primary btn-lg" onClick={handleSignupRedirect}>
                  Create Account
                </button>
                <button className="btn btn-secondary btn-lg" onClick={handleLoginRedirect}>
                  Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
