import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAssessment } from '@/context';
import {
  LEADERSHIP_FAMILIES,
  LEADERSHIP_TYPES,
  EQ_PILLARS,
  BED_FACTORS,
  CULTURE_DIMENSIONS,
} from '@/types';
import {
  getMetricPercentage,
  getScoreLevel,
  getCultureRippleInsight,
  getBEDProfileInsight,
  getPressurePatternInsight,
  getGrowthRecommendations,
} from '@/utils';
import './ResultsPage.css';

function ResultsPage() {
  const navigate = useNavigate();
  const { state } = useAssessment();
  const { result, user } = state;

  // Redirect if no result
  useEffect(() => {
    if (!result) {
      navigate('/');
    }
  }, [result, navigate]);

  if (!result) {
    return (
      <div className="results-loading">
        <div className="loading-spinner" />
        <p>Loading results...</p>
      </div>
    );
  }

  const leadershipFamily = LEADERSHIP_FAMILIES[result.leadershipFamily];
  const leadershipType = LEADERSHIP_TYPES[result.leadershipType];
  const { scores } = result;

  // Generate insights
  const cultureRippleInsight = getCultureRippleInsight(scores, result.leadershipFamily);
  const bedProfileInsight = getBEDProfileInsight(scores, result.leadershipType);
  const pressurePatternInsight = getPressurePatternInsight(scores, result.leadershipType);
  const growthRecommendations = getGrowthRecommendations(scores, result.leadershipType, result.leadershipFamily);

  return (
    <div className="results-page">
      {/* Header */}
      <header className="results-header">
        <div className="container">
          <span className="results-badge">Assessment Complete</span>
          <h1>Your E.Q.U.I.P. 360 Results</h1>
          {user && <p className="results-for">Results for {user.name}</p>}
        </div>
      </header>

      {/* Leadership Identity */}
      <section className="identity-section">
        <div className="container-narrow">
          <div className="identity-card" style={{ borderColor: leadershipFamily.color }}>
            <div className="identity-family">
              <span className="family-label">Your Leadership Family</span>
              <h2 style={{ color: leadershipFamily.color }}>{leadershipFamily.name}</h2>
              <p className="family-tagline">{leadershipFamily.tagline}</p>
            </div>

            <div className="identity-divider" />

            <div className="identity-type">
              <span className="type-label">Your Leadership Identity</span>
              <h3>{leadershipType.name}</h3>
              <p className="type-tagline">{leadershipType.tagline}</p>
              <p className="type-description">{leadershipType.description}</p>
            </div>

            <div className="identity-traits">
              <div className="trait-group">
                <h4>Strengths</h4>
                <ul>
                  {leadershipType.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="trait-group">
                <h4>Blind Spots</h4>
                <ul>
                  {leadershipType.blindSpots.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
              <div className="trait-group">
                <h4>Under Stress</h4>
                <ul>
                  {leadershipType.stressBehaviors.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="best-utilization">
              <strong>Best Utilized:</strong> {leadershipType.bestUtilization}
            </div>
          </div>
        </div>
      </section>

      {/* Score Breakdown */}
      <section className="scores-section">
        <div className="container">
          <h2 className="section-title">Your Score Breakdown</h2>

          <div className="scores-overview">
            <div className="score-ring-container">
              <div className="score-ring">
                <svg viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" className="ring-bg" />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="ring-fill"
                    style={{
                      strokeDasharray: `${scores.overall.percentage * 2.83} 283`,
                    }}
                  />
                </svg>
                <div className="ring-content">
                  <span className="ring-value">{scores.overall.percentage}%</span>
                  <span className="ring-label">Overall</span>
                </div>
              </div>
            </div>

            <div className="category-scores">
              <div className="category-score">
                <div className="category-header">
                  <h4>Emotional Readiness</h4>
                  <span className="category-percent">{scores.eq.percentage}%</span>
                </div>
                <div className="category-bar">
                  <div
                    className="category-fill eq"
                    style={{ width: `${scores.eq.percentage}%` }}
                  />
                </div>
                <span className="category-level">{getScoreLevel(scores.eq.percentage)}</span>
              </div>

              <div className="category-score">
                <div className="category-header">
                  <h4>Behavioral Reality</h4>
                  <span className="category-percent">{scores.bed.percentage}%</span>
                </div>
                <div className="category-bar">
                  <div
                    className="category-fill bed"
                    style={{ width: `${scores.bed.percentage}%` }}
                  />
                </div>
                <span className="category-level">{getScoreLevel(scores.bed.percentage)}</span>
              </div>

              <div className="category-score">
                <div className="category-header">
                  <h4>Cultural Influence</h4>
                  <span className="category-percent">{scores.culture.percentage}%</span>
                </div>
                <div className="category-bar">
                  <div
                    className="category-fill culture"
                    style={{ width: `${scores.culture.percentage}%` }}
                  />
                </div>
                <span className="category-level">{getScoreLevel(scores.culture.percentage)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Metrics */}
      <section className="metrics-section">
        <div className="container">
          <div className="metrics-grid">
            {/* EQ Pillars */}
            <div className="metrics-card">
              <h3>EQ Pillars</h3>
              <div className="metrics-list">
                {Object.entries(EQ_PILLARS).map(([code, pillar]) => {
                  const score = scores.eq[code as keyof typeof scores.eq];
                  if (typeof score !== 'number') return null;
                  const percent = getMetricPercentage(score);
                  return (
                    <div key={code} className="metric-item">
                      <div className="metric-info">
                        <span className="metric-name">{pillar.name}</span>
                        <span className="metric-percent">{percent}%</span>
                      </div>
                      <div className="metric-bar">
                        <div className="metric-fill" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* B.E.D. Factors */}
            <div className="metrics-card">
              <h3>B.E.D. Factors</h3>
              <div className="metrics-list">
                {Object.entries(BED_FACTORS).map(([code, factor]) => {
                  const score = scores.bed[code as keyof typeof scores.bed];
                  if (typeof score !== 'number') return null;
                  const percent = getMetricPercentage(score);
                  return (
                    <div key={code} className="metric-item">
                      <div className="metric-info">
                        <span className="metric-name">{factor.name}</span>
                        <span className="metric-percent">{percent}%</span>
                      </div>
                      <div className="metric-bar">
                        <div className="metric-fill" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Culture Dimensions */}
            <div className="metrics-card">
              <h3>Culture Impact</h3>
              <div className="metrics-list">
                {Object.entries(CULTURE_DIMENSIONS).map(([code, dim]) => {
                  const score = scores.culture[code as keyof typeof scores.culture];
                  if (typeof score !== 'number') return null;
                  const percent = getMetricPercentage(score);
                  return (
                    <div key={code} className="metric-item">
                      <div className="metric-info">
                        <span className="metric-name">{dim.name}</span>
                        <span className="metric-percent">{percent}%</span>
                      </div>
                      <div className="metric-bar">
                        <div className="metric-fill" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Culture Ripple */}
      <section className="insight-section">
        <div className="container-narrow">
          <div className="insight-card">
            <div className="insight-header">
              <span className="insight-icon">🌊</span>
              <h3>Your Culture Ripple</h3>
            </div>
            <p className="insight-text">{cultureRippleInsight}</p>
          </div>
        </div>
      </section>

      {/* B.E.D. Profile */}
      <section className="insight-section bed-section">
        <div className="container-narrow">
          <div className="insight-card">
            <div className="insight-header">
              <span className="insight-icon">🛏️</span>
              <h3>Your B.E.D. Profile</h3>
            </div>
            <div className="bed-insights">
              <div className="bed-item">
                <h4>Beliefs</h4>
                <p>{bedProfileInsight.beliefs}</p>
              </div>
              <div className="bed-item">
                <h4>Excuses</h4>
                <p>{bedProfileInsight.excuses}</p>
              </div>
              <div className="bed-item">
                <h4>Decisions</h4>
                <p>{bedProfileInsight.decisions}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pressure Pattern */}
      <section className="insight-section">
        <div className="container-narrow">
          <div className="insight-card">
            <div className="insight-header">
              <span className="insight-icon">⚡</span>
              <h3>Your Pressure Pattern</h3>
            </div>
            <p className="insight-text">{pressurePatternInsight}</p>
          </div>
        </div>
      </section>

      {/* Your Move */}
      <section className="insight-section move-section">
        <div className="container-narrow">
          <div className="insight-card gold-border">
            <div className="insight-header">
              <span className="insight-icon">🎯</span>
              <h3>Your Move</h3>
            </div>
            <p className="move-intro">
              Based on your assessment results, here are your personalized growth recommendations:
            </p>
            <ul className="move-list">
              {growthRecommendations.map((rec, i) => (
                <li key={i}>{rec}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="quote-section">
        <div className="container-narrow">
          <blockquote className="results-quote">
            "Lead from emotional truth, not emotional convenience."
            <span className="quote-author">The E.Q.U.I.P. 360 Leadership Mandate</span>
          </blockquote>
        </div>
      </section>

      {/* Actions */}
      <section className="actions-section">
        <div className="container-narrow">
          <div className="actions-card">
            <h3>Continue Your Leadership Journey</h3>
            <p>
              Your E.Q.U.I.P. 360 results reveal your leadership patterns under
              pressure. Use these insights to lead with greater emotional
              intelligence and make your next move.
            </p>
            <div className="actions-buttons">
              <Link to="/" className="btn btn-primary">
                Return Home
              </Link>
              <button className="btn btn-secondary" onClick={() => window.print()}>
                Print Results
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ResultsPage;
