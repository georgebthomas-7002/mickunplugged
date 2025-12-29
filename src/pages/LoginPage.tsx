// Login Page - OTP Code Authentication
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sendOtpCode, verifyOtpCode, user, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location.state]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    const { error: sendError } = await sendOtpCode(email);

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

    const { error: verifyError, session } = await verifyOtpCode(email, otpCode);

    if (verifyError || !session) {
      setError(verifyError?.message || 'Verification failed. Please try again.');
      setIsSubmitting(false);
      return;
    }

    // Successfully verified - handle any pending profile data
    const pendingProfileData = localStorage.getItem('pending_profile_data');
    if (pendingProfileData && session.user) {
      try {
        const profileData = JSON.parse(pendingProfileData);
        await supabase
          .from('profiles')
          .update({
            first_name: profileData.firstName,
            last_name: profileData.lastName,
            company: profileData.company || null,
            role: profileData.role || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', session.user.id);

        localStorage.removeItem('pending_profile_data');
      } catch (e) {
        console.error('Error updating profile:', e);
        localStorage.removeItem('pending_profile_data');
      }
    }

    // Check for pending invite token
    const inviteToken = localStorage.getItem('pending_invite_token');
    if (inviteToken) {
      localStorage.removeItem('pending_invite_token');
      navigate(`/invite/${inviteToken}`, { replace: true });
      return;
    }

    // Navigate to dashboard
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  };

  const handleResendCode = async () => {
    setIsSubmitting(true);
    setError(null);
    setOtpCode('');

    const { error: sendError } = await sendOtpCode(email);

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
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <h1>Configuration Required</h1>
            <p className="login-subtitle">
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
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="email-sent-icon">🔐</div>
            <h1>Enter Your Code</h1>
            <p className="login-subtitle">
              We sent a 6-digit code to <strong>{email}</strong>
            </p>

            <form onSubmit={handleVerifyCode} className="login-form">
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
                />
              </div>

              {error && <p className="form-error">{error}</p>}
              {successMessage && <p className="form-success">{successMessage}</p>}

              <button
                type="submit"
                className="btn btn-primary btn-large submit-btn"
                disabled={isSubmitting || otpCode.length < 6}
              >
                {isSubmitting ? 'Verifying...' : 'Sign In'}
              </button>
            </form>

            <p className="login-note">
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
              className="link-button back-link"
            >
              ← Use a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <h1>Welcome Back</h1>
          <p className="login-subtitle">
            Sign in to access your dashboard and team insights.
          </p>

          <form onSubmit={handleSendCode} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            {error && <p className="form-error">{error}</p>}

            <button
              type="submit"
              className="btn btn-primary btn-large submit-btn"
              disabled={isSubmitting || !email}
            >
              {isSubmitting ? 'Sending...' : 'Send Verification Code'}
            </button>

            <p className="login-note">
              We'll send you a 6-digit code to sign in—no password needed.
            </p>
          </form>

          <div className="login-divider">
            <span>New to EQUIP 360?</span>
          </div>

          <Link to="/signup" className="btn btn-outline signup-link">
            Create an Account
          </Link>

          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
