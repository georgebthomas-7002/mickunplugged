import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '@/context';
import './StartPage.css';

function StartPage() {
  const navigate = useNavigate();
  const { registerUser, startAssessment } = useAssessment();

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: '',
    role: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Register the user
    registerUser({
      email: formData.email,
      name: formData.name,
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
          <h1>Begin Your E.Q.U.I.P. 360 Assessment</h1>
          <div className="start-quote">
            <p className="text-accent">
              "Let's discover the leader you already are — and the one you're
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
                />
              </div>

              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
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
                <label htmlFor="role">Role (Optional)</label>
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

              <p className="form-privacy">
                By starting, you agree to our privacy policy and terms of
                service.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartPage;
