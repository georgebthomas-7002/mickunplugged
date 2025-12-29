// Login Page - OTP Code Authentication
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithOtp, verifyOtp, user, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  if (user) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
    return null;
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const { error: signInError } = await signInWithOtp(email);

    if (signInError) {
      setError(signInError.message);
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

    const { error: verifyError } = await verifyOtp(email, otpCode);

    if (verifyError) {
      setError(verifyError.message);
      setIsSubmitting(false);
      return;
    }

    // Success - auth state change will trigger redirect
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  };

  const handleResendCode = async () => {
    setIsSubmitting(true);
    setError(null);
    setOtpCode('');

    const { error: signInError } = await signInWithOtp(email);

    if (signInError) {
      setError(signInError.message);
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
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  required
                  autoFocus
                  maxLength={6}
                  pattern="\d{6}"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  className="otp-input"
                />
              </div>

              {error && (
                <p className="form-error">{error}</p>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-large submit-btn"
                disabled={isSubmitting || otpCode.length !== 6}
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

            {error && (
              <p className="form-error">{error}</p>
            )}

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
