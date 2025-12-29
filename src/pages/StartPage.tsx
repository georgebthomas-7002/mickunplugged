import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAssessment } from '@/context';
import { useAuth } from '@/context/AuthContext';
import { submitToHubSpot } from '@/services';
import {
  getOrganizationContext,
  type OrganizationContext,
} from '@/services/assessments';
import './StartPage.css';

function StartPage() {
  const navigate = useNavigate();
  const { registerUser, startAssessment } = useAssessment();
  const { user, profile } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    role: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hubspotError, setHubspotError] = useState<string | null>(null);
  const [orgContext, setOrgContext] = useState<OrganizationContext | null>(null);

  // Pre-fill form with logged-in user's data
  useEffect(() => {
    if (user && profile) {
      setFormData({
        email: user.email || '',
        firstName: profile.first_name || '',
        lastName: profile.last_name || '',
        company: profile.company || '',
        role: profile.role || '',
      });
    }
  }, [user, profile]);

  // Check for organization context on mount
  useEffect(() => {
    const context = getOrganizationContext();
    if (context) {
      setOrgContext(context);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setHubspotError(null);

    // Submit to HubSpot in the background (don't block the user)
    submitToHubSpot({
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      company: formData.company || undefined,
      jobTitle: formData.role || undefined,
    }).then((result) => {
      console.log('🔵 HubSpot final result:', result);
      if (!result.success) {
        // Log error but don't block the user
        console.warn('HubSpot submission failed:', result.message, result.debugInfo);
        setHubspotError(result.message);
      } else {
        console.log('✅ HubSpot submission successful:', result.debugInfo);
      }
    });

    // Register the user locally
    registerUser({
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      company: formData.company || undefined,
      role: formData.role || undefined,
    });

    // Start the assessment
    startAssessment();

    // Navigate to the assessment
    navigate('/assessment/equip360');
  };

  return (
    <div className="start-page">
      <div className="start-container">
        {/* Left Side - Info */}
        <div className="start-info">
          {orgContext && (
            <div className="org-context-banner">
              <span className="org-context-label">Taking assessment for</span>
              <span className="org-context-name">{orgContext.organizationName}</span>
            </div>
          )}
          <h1>Begin Your E.Q.U.I.P. 360 Assessment</h1>
          <div className="start-quote">
            <p className="text-accent">
              "Let's discover the leader you already are, and the one you're
              becoming."
            </p>
          </div>

          <div className="start-details">
            <div className="detail-item">
              <span className="detail-icon">⏱</span>
              <div>
                <strong>15-20 minutes</strong>
                <span>Complete at your own pace</span>
              </div>
            </div>
            <div className="detail-item">
              <span className="detail-icon">📝</span>
              <div>
                <strong>20 scenarios</strong>
                <span>Real leadership situations</span>
              </div>
            </div>
            <div className="detail-item">
              <span className="detail-icon">💾</span>
              <div>
                <strong>Save progress</strong>
                <span>Resume anytime</span>
              </div>
            </div>
            <div className="detail-item">
              <span className="detail-icon">📊</span>
              <div>
                <strong>Instant results</strong>
                <span>Personalized insights</span>
              </div>
            </div>
          </div>

          <div className="start-note">
            <p>
              <strong>Note:</strong> There are no right or wrong answers. Choose
              the response that most closely reflects how you would actually
              behave, not how you think you should behave.
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="start-form-container">
          <div className="form-card">
            <h2>Enter Your Details</h2>
            <p className="form-subtitle">
              Your information is kept confidential and used only for your
              assessment report.
            </p>

            <form onSubmit={handleSubmit} className="start-form">
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
                  readOnly={!!user}
                  className={user ? 'input-readonly' : ''}
                />
                {user && (
                  <span className="field-note">Logged in as this email</span>
                )}
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

              <button
                type="submit"
                className="btn btn-primary btn-large submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Starting...' : 'Start Assessment'}
              </button>

              {hubspotError && (
                <p className="form-error" style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  Note: There was an issue saving your information. Your assessment will continue normally.
                </p>
              )}

              <p className="form-privacy">
                By starting, you agree to our privacy policy and terms of
                service.
              </p>

              {user && (
                <Link to="/dashboard" className="back-to-dashboard">
                  ← Back to Dashboard
                </Link>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartPage;
