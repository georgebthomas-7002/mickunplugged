// Login Page - Magic Link Authentication
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithMagicLink, user, isConfigured } = useAuth();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in
  if (user) {
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const { error: signInError } = await signInWithMagicLink(email);

    if (signInError) {
      setError(signInError.message);
      setIsSubmitting(false);
      return;
    }

    setEmailSent(true);
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

  if (emailSent) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <div className="email-sent-icon">✉️</div>
            <h1>Check Your Email</h1>
            <p className="login-subtitle">
              We sent a magic link to <strong>{email}</strong>. Click the link in the email to sign in.
            </p>
            <p className="login-note">
              Didn't receive it? Check your spam folder or{' '}
              <button
                type="button"
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="link-button"
              >
                try again
              </button>
              .
            </p>
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

          <form onSubmit={handleSubmit} className="login-form">
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
              {isSubmitting ? 'Sending...' : 'Send Magic Link'}
            </button>

            <p className="login-note">
              We'll send you a secure link to sign in—no password needed.
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
