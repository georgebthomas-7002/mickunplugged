// Signup Page - Create Account with HubSpot Lead Capture + OTP Auth
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { submitToHubSpot } from '@/services';
import './SignupPage.css';

function SignupPage() {
  const navigate = useNavigate();
  const { sendOtpCode, verifyOtpCode, user, isConfigured } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    role: '',
  });

  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check for pending invite token
  const [pendingInviteToken] = useState(() =>
    localStorage.getItem('pending_invite_token')
  );

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (pendingInviteToken) {
        navigate(`/invite/${pendingInviteToken}`, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate, pendingInviteToken]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    // Store profile data for after email verification
    localStorage.setItem(
      'pending_profile_data',
      JSON.stringify({
        firstName: formData.firstName,
        lastName: formData.lastName,
        company: formData.company,
        role: formData.role,
      })
    );

    // Submit to HubSpot for lead capture (non-blocking)
    submitToHubSpot({
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      company: formData.company || undefined,
      jobTitle: formData.role || undefined,
    }).then((result) => {
      if (!result.success) {
        console.warn('HubSpot submission failed:', result.message);
      }
    });

    // Send OTP code via Supabase
    const { error: sendError } = await sendOtpCode(formData.email);

    if (sendError) {
      setError(sendError.message);
      setIsSubmitting(false);
      return;
    }

    setCodeSent(true);
    setIsSubmitting(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const { error: verifyError, session } = await verifyOtpCode(formData.email, otpCode);

    if (verifyError || !session) {
      setError(verifyError?.message || 'Verification failed. Please try again.');
      setIsSubmitting(false);
      return;
    }

    // Successfully verified - update profile with form data
    // Set account_type: 'admin' if signing up directly, 'member' if via invite
    if (session.user) {
      try {
        await supabase
          .from('profiles')
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            company: formData.company || null,
            role: formData.role || null,
            account_type: pendingInviteToken ? 'member' : 'admin',
            updated_at: new Date().toISOString(),
          })
          .eq('id', session.user.id);

        localStorage.removeItem('pending_profile_data');
      } catch (e) {
        console.error('Error updating profile:', e);
      }
    }

    // Check for pending invite token
    if (pendingInviteToken) {
      navigate(`/invite/${pendingInviteToken}`, { replace: true });
      return;
    }

    // Navigate to dashboard
    navigate('/dashboard', { replace: true });
  };

  const handleResendCode = async () => {
    setIsSubmitting(true);
    setError(null);
    setOtpCode('');

    const { error: sendError } = await sendOtpCode(formData.email);

    if (sendError) {
      setError(sendError.message);
    } else {
      setSuccessMessage('New code sent! Check your email.');
      setTimeout(() => setSuccessMessage(null), 5000);
    }

    setIsSubmitting(false);
  };

  if (!isConfigured) {
    return (
      <div className="signup-page">
        <div className="signup-container">
          <div className="signup-card">
            <h1>Configuration Required</h1>
            <p className="signup-subtitle">
              Supabase environment variables are not configured. Please add
              VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable authentication.
            </p>
            <Link to="/" className="btn btn-outline">
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (codeSent) {
    return (
      <div className="signup-page">
        <div className="signup-container">
          <div className="signup-card" style={{ maxWidth: '480px', margin: '0 auto' }}>
            <div className="email-sent-icon">🔐</div>
            <h1>Enter Your Code</h1>
            <p className="signup-subtitle">
              We sent a 6-digit code to <strong>{formData.email}</strong>
            </p>

            <form onSubmit={handleVerifyCode} className="signup-form">
              <div className="form-group">
                <label htmlFor="otp-code">Verification Code</label>
                <input
                  type="text"
                  id="otp-code"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter code"
                  required
                  autoFocus
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="otp-input"
                  style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.3rem' }}
                />
              </div>

              {error && <p className="form-error">{error}</p>}
              {successMessage && <p className="form-success">{successMessage}</p>}

              <button
                type="submit"
                className="btn btn-primary btn-large submit-btn"
                disabled={isSubmitting || otpCode.length < 6}
              >
                {isSubmitting ? 'Creating Account...' : 'Complete Sign Up'}
              </button>
            </form>

            <p className="signup-note">
              Didn't receive the code? Check your spam folder or{' '}
              <button
                type="button"
                onClick={handleResendCode}
                className="link-button"
                disabled={isSubmitting}
              >
                resend code
              </button>
              .
            </p>

            <button
              type="button"
              onClick={() => {
                setCodeSent(false);
                setOtpCode('');
                setError(null);
              }}
              className="link-button"
              style={{ marginTop: '1rem' }}
            >
              ← Back to form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        {/* Left Side - Benefits */}
        <div className="signup-info">
          <h1>Create a Team Account</h1>
          <p className="signup-intro">
            {pendingInviteToken
              ? 'Create an account to join your team and take the assessment.'
              : 'Accounts are for team leaders who want to invite others and view aggregated insights.'}
          </p>

          {!pendingInviteToken && (
            <div className="signup-note-box">
              <span className="note-icon">💡</span>
              <div>
                <strong>Just want to take the assessment?</strong>
                <p>
                  No account needed! <Link to="/start">Start your assessment</Link> right away—it's completely free.
                </p>
              </div>
            </div>
          )}

          <div className="signup-benefits">
            <div className="benefit-item">
              <span className="benefit-icon">👥</span>
              <div>
                <strong>Team Management</strong>
                <span>Create teams and invite members</span>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">📊</span>
              <div>
                <strong>Team Insights</strong>
                <span>View aggregated team analytics</span>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">📈</span>
              <div>
                <strong>Track Progress</strong>
                <span>Monitor leadership development</span>
              </div>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">💾</span>
              <div>
                <strong>Save Results</strong>
                <span>Access your assessments anytime</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="signup-form-container">
          <div className="signup-card">
            <h2>Enter Your Details</h2>
            <p className="form-subtitle">
              Your information is kept confidential and used only for your account.
            </p>

            <form onSubmit={handleSendCode} className="signup-form">
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="company">Company (Optional)</label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Your organization"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">Job Title (Optional)</label>
                <input
                  type="text"
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="Your job title"
                />
              </div>

              {error && <p className="form-error">{error}</p>}

              <button
                type="submit"
                className="btn btn-primary btn-large submit-btn"
                disabled={isSubmitting || !formData.email || !formData.firstName || !formData.lastName}
              >
                {isSubmitting ? 'Sending Code...' : 'Send Verification Code'}
              </button>

              <p className="form-note">
                We'll send you a 6-digit code to verify your email—no password needed.
              </p>

              <p className="form-privacy">
                By creating an account, you agree to our privacy policy and terms of
                service.
              </p>
            </form>

            <div className="signup-divider">
              <span>Already have an account?</span>
            </div>

            <Link to="/login" className="btn btn-outline login-link">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
