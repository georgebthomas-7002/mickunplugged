import { Link } from 'react-router-dom';
import { useAssessment } from '@/context';
import './HomePage.css';

function HomePage() {
  const { hasSavedProgress, getProgress } = useAssessment();
  const hasProgress = hasSavedProgress();
  const progress = getProgress();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-badge">Leadership Assessment</span>
          <h1 className="hero-title">
            <span className="shimmer">E.Q.U.I.P.</span> <span className="text-blue">360</span>
          </h1>
          <p className="hero-subtitle">
            Emotional Quotient Under Intelligent Pressure
          </p>
          <div className="hero-divider" />
          <p className="hero-description">
            Discover how you think, decide, and influence when emotional
            intelligence meets intelligent pressure. Unlike traditional
            assessments, E.Q.U.I.P. 360 measures{' '}
            <span className="text-gold">emotional performance</span>: the
            behaviors that define leadership when pressure, emotion, and
            expectation collide.
          </p>
          {hasProgress ? (
            <div className="hero-buttons">
              <Link to="/assessment" className="btn btn-primary btn-large">
                Continue Assessment ({progress}% Complete)
              </Link>
              <Link to="/start" className="btn btn-secondary">
                Start New Assessment
              </Link>
            </div>
          ) : (
            <Link to="/start" className="btn btn-primary btn-large">
              Begin Your Assessment
            </Link>
          )}
          <p className="hero-time">Takes approximately 15-20 minutes</p>
        </div>
      </section>

      {/* Quote Section */}
      <section className="quote-section">
        <div className="container-narrow">
          <blockquote className="quote">
            "No leader rises to the moment. You rise to your level of emotional preparation."
            <span className="quote-author">The E.Q.U.I.P. 360 Leadership Mandate</span>
          </blockquote>
        </div>
      </section>

      {/* Three Layers Section */}
      <section className="layers-section">
        <div className="container">
          <h2 className="section-title">Three Layers of Leadership Intelligence</h2>
          <p className="section-subtitle">
            E.Q.U.I.P. 360 reveals three interconnected layers that shape how
            you lead
          </p>

          <div className="layers-grid">
            <div className="layer-card">
              <div className="layer-number">01</div>
              <h3>Emotional Readiness</h3>
              <p className="layer-subtitle">The 5 EQ Pillars</p>
              <p>
                How prepared you are to handle emotion-driven moments that test
                composure, judgment, and empathy.
              </p>
              <ul className="layer-list">
                <li>Self-Awareness</li>
                <li>Self-Regulation</li>
                <li>Motivation</li>
                <li>Empathy</li>
                <li>Social Skill</li>
              </ul>
            </div>

            <div className="layer-card">
              <div className="layer-number">02</div>
              <h3>Behavioral Reality</h3>
              <p className="layer-subtitle">The B.E.D. Factors</p>
              <p>
                Your decision patterns, whether driven by fear, control,
                connection, or confidence.
              </p>
              <ul className="layer-list">
                <li>Beliefs: Stories that shape your lens</li>
                <li>Excuses: Protection patterns under tension</li>
                <li>Decisions: How boldly you choose direction</li>
              </ul>
            </div>

            <div className="layer-card">
              <div className="layer-number">03</div>
              <h3>Cultural Influence</h3>
              <p className="layer-subtitle">Culture Impact Index</p>
              <p>
                How your emotions affect others and your overall culture
                footprint.
              </p>
              <ul className="layer-list">
                <li>Trust-Building</li>
                <li>Psychological Safety</li>
                <li>Communication Quality</li>
                <li>Team Stability</li>
                <li>Emotional Ripple</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Families Section */}
      <section className="families-section">
        <div className="container">
          <h2 className="section-title">Discover Your Leadership Identity</h2>
          <p className="section-subtitle">
            20 Leadership Types across 4 Leadership Families
          </p>

          <div className="families-grid">
            <div className="family-card">
              <h3>Regulators</h3>
              <p className="family-tagline">Composure, Steadiness, Emotional Grounding</p>
              <p>They stabilize teams.</p>
            </div>

            <div className="family-card">
              <h3>Connectors</h3>
              <p className="family-tagline">Empathy, Trust, Human Intelligence</p>
              <p>They humanize leadership.</p>
            </div>

            <div className="family-card">
              <h3>Drivers</h3>
              <p className="family-tagline">Action, Standards, Momentum</p>
              <p>They create results and standards.</p>
            </div>

            <div className="family-card">
              <h3>Strategists</h3>
              <p className="family-tagline">Awareness, Vision, Intentionality</p>
              <p>They shape direction and intelligence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Receive Section */}
      <section className="results-preview-section">
        <div className="container-narrow">
          <h2 className="section-title">What You'll Receive</h2>

          <div className="results-list">
            <div className="result-item">
              <div className="result-icon">📊</div>
              <div className="result-content">
                <h4>Your Leadership Identity</h4>
                <p>
                  Discover your Leadership Family and specific Identity Type
                  with personalized insights.
                </p>
              </div>
            </div>

            <div className="result-item">
              <div className="result-icon">🌊</div>
              <div className="result-content">
                <h4>Your Culture Ripple</h4>
                <p>
                  Understand how your emotional state impacts your team and
                  organizational culture.
                </p>
              </div>
            </div>

            <div className="result-item">
              <div className="result-icon">🛏️</div>
              <div className="result-content">
                <h4>Your B.E.D. Profile</h4>
                <p>
                  Deep analysis of your Beliefs, Excuses, and Decision patterns
                  under pressure.
                </p>
              </div>
            </div>

            <div className="result-item">
              <div className="result-icon">⚡</div>
              <div className="result-content">
                <h4>Your Pressure Pattern</h4>
                <p>
                  AI-generated insights into how you behave when stress,
                  conflict, and uncertainty rise.
                </p>
              </div>
            </div>

            <div className="result-item">
              <div className="result-icon">🎯</div>
              <div className="result-content">
                <h4>Your Move</h4>
                <p>
                  Actionable next steps and growth recommendations tailored to
                  your profile.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container-narrow">
          <div className="cta-card">
            <h2>Ready to Discover Your Leadership Identity?</h2>
            <p className="text-accent">
              "Lead from emotional truth, not emotional convenience."
            </p>
            {hasProgress ? (
              <div className="cta-buttons">
                <Link to="/assessment" className="btn btn-primary btn-large">
                  Continue Assessment ({progress}% Complete)
                </Link>
                <Link to="/start" className="btn btn-secondary">
                  Start New Assessment
                </Link>
              </div>
            ) : (
              <Link to="/start" className="btn btn-primary btn-large">
                Start the Assessment
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container-narrow">
          <div className="team-card">
            <div className="team-icon">👥</div>
            <h3>Assessing Your Whole Team?</h3>
            <p>
              Create a free team account to invite your team, track completions,
              and view aggregated leadership insights across your organization.
            </p>
            <Link to="/signup" className="btn btn-outline">
              Create Team Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
