// Signup Page - Create Account with HubSpot Lead Capture + Magic Link Auth
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { submitToHubSpot } from '@/services';
import './SignupPage.css';

function SignupPage() {
  const navigate = useNavigate();
  const { signInWithMagicLink, user, isConfigured } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    role: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

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

    // Send magic link via Supabase
    const { error: signInError } = await signInWithMagicLink(formData.email);

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

  if (emailSent) {
    return (
      <div className="signup-page">
        <div className="signup-container">
          <div className="signup-card">
            <div className="email-sent-icon">✉️</div>
            <h1>Check Your Email</h1>
            <p className="signup-subtitle">
              We sent a magic link to <strong>{formData.email}</strong>. Click the link to complete your account setup.
            </p>
            <p className="signup-note">
              Didn't receive it? Check your spam folder or{' '}
              <button
                type="button"
                onClick={() => {
                  setEmailSent(false);
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
    <div className="signup-page">
      <div className="signup-container">
        {/* Left Side - Benefits */}
        <div className="signup-info">
          <h1>Create Your Account</h1>
          <p className="signup-intro">
            {pendingInviteToken
              ? 'Create an account to join your team and take the assessment.'
              : 'Unlock the full EQUIP 360 experience with a free account.'}
          </p>

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

            <form onSubmit={handleSubmit} className="signup-form">
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
                {isSubmitting ? 'Creating Account...' : 'Create Account'}
              </button>

              <p className="form-note">
                We'll send you a magic link to verify your email—no password needed.
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
