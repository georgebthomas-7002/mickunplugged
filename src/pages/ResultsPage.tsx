import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAssessment } from '@/context';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  LEADERSHIP_FAMILIES,
  LEADERSHIP_TYPES,
  EQ_PILLARS,
  CULTURE_DIMENSIONS,
} from '@/types';
import {
  getMetricPercentage,
  getScoreLevel,
  getCultureRippleInsight,
  getBEDProfileInsight,
  getPressurePatternInsight,
  getGrowthRecommendations,
  getMoveTheStoolInsight,
  getBecauseStatementInsight,
  getEQPillarInsight,
  getCultureDimensionInsight,
  generateResultsPDF,
  uploadPDFToHubSpot,
} from '@/utils';
import {
  saveAssessment,
  getOrganizationContext,
} from '@/services/assessments';
import './ResultsPage.css';
import './ResultsPagePDF.css';

function ResultsPage() {
  const navigate = useNavigate();
  const { state } = useAssessment();
  const { result, user } = state;
  const { user: authUser } = useAuth();

  // Track if we've already uploaded the PDF to prevent duplicates
  const hasUploadedPDF = useRef(false);
  // Track if we've already saved to Supabase
  const hasSavedToSupabase = useRef(false);

  // Redirect if no result
  useEffect(() => {
    if (!result) {
      navigate('/');
    }
  }, [result, navigate]);

  // Auto-upload PDF to HubSpot when page loads
  useEffect(() => {
    if (!result || !user?.email || hasUploadedPDF.current) {
      return;
    }

    const uploadPDF = async () => {
      // Wait for page to fully render
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const pdfFileName = `EQUIP360-${user.firstName}-${user.lastName}-${new Date().toISOString().split('T')[0]}`;

      try {
        const pdfResult = await generateResultsPDF('results-pdf-content', pdfFileName);

        if (!pdfResult.success || !pdfResult.base64) {
          return;
        }

        // Check if PDF is too large for Vercel
        const MAX_BASE64_SIZE = 3500000;
        if (pdfResult.base64.length > MAX_BASE64_SIZE) {
          return;
        }

        const uploadResult = await uploadPDFToHubSpot(pdfResult.base64, pdfFileName, user.email);

        if (uploadResult.success) {
          hasUploadedPDF.current = true;
        }
      } catch {
        // Silent fail - PDF upload is a background operation
      }
    };

    uploadPDF();
  }, [result, user]);

  // Save assessment to Supabase if user is authenticated
  useEffect(() => {
    if (!result || !authUser || hasSavedToSupabase.current) {
      return;
    }

    const saveToSupabase = async () => {
      // First try to get org context from localStorage (set during invite flow)
      let organizationId = getOrganizationContext()?.organizationId;

      console.log('Saving assessment - org context from localStorage:', organizationId);

      // If no localStorage context, check if user is a member of an organization
      if (!organizationId) {
        console.log('No localStorage org context, checking organization_members...');
        const { data: membership } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', authUser.id)
          .limit(1)
          .single();

        if (membership) {
          organizationId = membership.organization_id;
          console.log('Found org from membership:', organizationId);
        }
      }

      const saveResult = await saveAssessment({
        userId: authUser.id,
        result,
        organizationId,
        responses: state.session?.responses,
      });

      if (saveResult.success) {
        hasSavedToSupabase.current = true;
        console.log('Assessment saved to Supabase:', saveResult.assessmentId, 'with org:', organizationId);
      } else {
        console.warn('Failed to save assessment:', saveResult.error);
      }
    };

    saveToSupabase();
  }, [result, authUser, state.session?.responses]);

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
  const moveTheStoolInsight = getMoveTheStoolInsight(scores, result.leadershipType);
  const becauseStatement = getBecauseStatementInsight(scores, result.leadershipType, result.leadershipFamily);

  return (
    <div className="results-page" id="results-pdf-content">
      {/* Section 1: Welcome Header */}
      <header className="results-header">
        <div className="container">
          <span className="results-badge">Assessment Complete</span>
          <h1>
            <span className="title-line-1">Your E.Q.U.I.P. 360</span>
            <span className="title-line-2">Leadership Intelligence Report</span>
          </h1>
          {user && <p className="results-for">Results for {user.firstName} {user.lastName}</p>}
        </div>
      </header>

      {/* Welcome Introduction */}
      <section className="welcome-section">
        <div className="container-narrow">
          <div className="welcome-card">
            <p className="welcome-lead">Leadership is emotional, because people are emotional.</p>
            <p className="welcome-text">
              Every conversation, decision, and moment of pressure reveals something about how you lead.
              The E.Q.U.I.P. 360 Assessment measures how you:
            </p>
            <ul className="welcome-list">
              <li><strong>Lead yourself:</strong> Emotional Readiness</li>
              <li><strong>Behave under pressure:</strong> Behavioral Reality</li>
              <li><strong>Impact others:</strong> Cultural Influence</li>
            </ul>
            <p className="welcome-note">
              This is not a personality test. This is your leadership behavior in motion.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2: Leadership Family */}
      <section className="family-section">
        <div className="container-narrow">
          <div className="section-context">
            <h2 className="section-heading">Your Leadership Family</h2>
            <p className="context-text">
              Your Leadership Family reflects the emotional foundation of how you naturally lead.
              Each family represents a dominant style of emotional performance when you face decisions,
              pressure, and relationships.
            </p>
            <div className="families-overview">
              <span className="family-tag">Regulators</span>
              <span className="family-tag">Connectors</span>
              <span className="family-tag">Drivers</span>
              <span className="family-tag">Strategists</span>
            </div>
          </div>

          <div className="family-result-card" style={{ borderColor: leadershipFamily.color }}>
            <span className="result-label">Your Family</span>
            <h3 className="family-name" style={{ color: leadershipFamily.color }}>{leadershipFamily.name}</h3>
            <p className="family-tagline">{leadershipFamily.tagline}</p>
            <p className="family-description">{leadershipFamily.description}</p>
          </div>
        </div>
      </section>

      {/* Section 3: Leadership Identity */}
      <section className="identity-section">
        <div className="container-narrow">
          <div className="section-context">
            <h2 className="section-heading">Your Leadership Identity</h2>
            <p className="context-text">
              Your Leadership Identity is the most accurate snapshot of how you show up under emotional pressure.
              It reflects the combination of your EQ patterns, B.E.D. tendencies, and cultural impact,
              forming a leadership type people experience every day.
            </p>
          </div>

          <div className="identity-card" style={{ borderColor: leadershipFamily.color }}>
            <div className="identity-type">
              <span className="type-label">Your Identity Type</span>
              <h3>{leadershipType.name}</h3>
              <p className="type-tagline">{leadershipType.tagline}</p>
              <p className="type-description">{leadershipType.description}</p>
            </div>

            <div className="identity-divider" />

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

      {/* Section 4: Score Breakdown */}
      <section className="scores-section">
        <div className="container">
          <div className="section-context centered">
            <h2 className="section-heading">Your Score Breakdown</h2>
            <p className="context-text">
              <span className="context-line">These three scores summarize how you perform across the</span>
              <span className="context-line">emotional demands of leadership.</span>
            </p>
          </div>

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
                <p className="category-context">How well you prepare and regulate yourself</p>
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
                <p className="category-context">How your beliefs, excuses, and decisions show up in action</p>
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
                <p className="category-context">How your emotional presence affects others</p>
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

      {/* Section 5: EQ Pillars */}
      <section className="pillars-section">
        <div className="container-narrow">
          <div className="section-context">
            <h2 className="section-heading">EQ Pillars</h2>
            <p className="context-text">
              The EQ Pillars represent the core emotional skills that shape your leadership.
              These scores reveal where your emotional strengths help you, and where pressure may challenge you.
            </p>
          </div>

          <div className="pillars-grid">
            {Object.entries(EQ_PILLARS).map(([code, pillar]) => {
              const score = scores.eq[code as keyof typeof scores.eq];
              if (typeof score !== 'number') return null;
              const percent = getMetricPercentage(score);
              const insight = getEQPillarInsight(code, percent, result.leadershipType);
              return (
                <div key={code} className="pillar-card">
                  <div className="pillar-header">
                    <h4>{pillar.name}</h4>
                    <span className="pillar-percent">{percent}%</span>
                  </div>
                  <div className="pillar-bar">
                    <div className="pillar-fill" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="pillar-description">{pillar.description}</p>
                  <p className="pillar-insight">{insight}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 6: B.E.D. Profile */}
      <section className="insight-section bed-section">
        <div className="container-narrow">
          <div className="section-context">
            <h2 className="section-heading">Your B.E.D. Profile</h2>
            <p className="context-text">
              Your B.E.D. Profile reveals the internal patterns that drive your leadership.
              Understanding these three factors gives you clarity on why you behave the way you do under pressure.
            </p>
          </div>

          <div className="bed-cards">
            <div className="bed-card">
              <div className="bed-header">
                <h4>Beliefs</h4>
                <span className="bed-percent">{getMetricPercentage(scores.bed.B)}%</span>
              </div>
              <p className="bed-context">The stories you tell yourself about your capability and role</p>
              <div className="bed-bar">
                <div className="bed-fill" style={{ width: `${getMetricPercentage(scores.bed.B)}%` }} />
              </div>
              <p className="bed-insight">{bedProfileInsight.beliefs}</p>
            </div>

            <div className="bed-card">
              <div className="bed-header">
                <h4>Excuses</h4>
                <span className="bed-percent">{getMetricPercentage(scores.bed.EX)}%</span>
              </div>
              <p className="bed-context">Where you hesitate, rationalize, or protect yourself</p>
              <div className="bed-bar">
                <div className="bed-fill" style={{ width: `${getMetricPercentage(scores.bed.EX)}%` }} />
              </div>
              <p className="bed-insight">{bedProfileInsight.excuses}</p>
            </div>

            <div className="bed-card">
              <div className="bed-header">
                <h4>Decisions</h4>
                <span className="bed-percent">{getMetricPercentage(scores.bed.D)}%</span>
              </div>
              <p className="bed-context">How you act when clarity and courage matter most</p>
              <div className="bed-bar">
                <div className="bed-fill" style={{ width: `${getMetricPercentage(scores.bed.D)}%` }} />
              </div>
              <p className="bed-insight">{bedProfileInsight.decisions}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Culture Impact Index */}
      <section className="culture-section">
        <div className="container-narrow">
          <div className="section-context">
            <h2 className="section-heading">Culture Impact Index</h2>
            <p className="context-text">
              Your culture impact reflects the emotional footprint you leave behind:
              the way people feel after interacting with you.
            </p>
          </div>

          <div className="culture-grid">
            {Object.entries(CULTURE_DIMENSIONS).map(([code, dim]) => {
              const score = scores.culture[code as keyof typeof scores.culture];
              if (typeof score !== 'number') return null;
              const percent = getMetricPercentage(score);
              const insight = getCultureDimensionInsight(code, percent, result.leadershipFamily);
              return (
                <div key={code} className="culture-card">
                  <div className="culture-header">
                    <h4>{dim.name}</h4>
                    <span className="culture-percent">{percent}%</span>
                  </div>
                  <div className="culture-bar">
                    <div className="culture-fill" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="culture-insight">{insight}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Section 8: Culture Ripple */}
      <section className="insight-section">
        <div className="container-narrow">
          <div className="section-context">
            <h2 className="section-heading">Your Culture Ripple</h2>
            <p className="context-text">
              Your Culture Ripple is the effect your emotional presence has on the environment around you,
              positively or negatively. This explains how your leadership style shapes morale, clarity, trust,
              and emotional tone.
            </p>
          </div>
          <div className="insight-card">
            <div className="insight-header">
              <span className="insight-icon">🌊</span>
              <h3>Your Emotional Footprint</h3>
            </div>
            <p className="insight-text">{cultureRippleInsight}</p>
          </div>
        </div>
      </section>

      {/* Section 9: Pressure Pattern */}
      <section className="insight-section">
        <div className="container-narrow">
          <div className="section-context">
            <h2 className="section-heading">Your Pressure Pattern</h2>
            <p className="context-text">
              When pressure rises, every leader develops a predictable pattern.
              Understanding this pattern helps you anticipate your reactions and choose better responses.
            </p>
          </div>
          <div className="insight-card">
            <div className="insight-header">
              <span className="insight-icon">⚡</span>
              <h3>Under Pressure</h3>
            </div>
            <p className="insight-text">{pressurePatternInsight}</p>
          </div>
        </div>
      </section>

      {/* Section 10: Move the Stool */}
      <section className="insight-section move-section">
        <div className="container-narrow">
          <div className="section-context">
            <h2 className="section-heading">Move the Stool</h2>
            <p className="context-text">
              "Move the Stool" represents the one shift that unlocks your next level of leadership.
              It is based on the highest-impact area revealed by your assessment.
            </p>
          </div>
          <div className="insight-card gold-border">
            <div className="insight-header">
              <span className="insight-icon">🪑</span>
              <h3>Your One Move</h3>
            </div>
            <p className="insight-text move-the-stool">{moveTheStoolInsight}</p>
          </div>
        </div>
      </section>

      {/* Section 11: Your Because Statement */}
      <section className="insight-section because-section">
        <div className="container-narrow">
          <div className="section-context">
            <h2 className="section-heading">Your Because Statement</h2>
            <p className="context-text">
              Your "Because" is the emotional engine behind your leadership.
              It explains why you show up the way you do, and why you refuse to quit.
            </p>
          </div>
          <div className="because-card">
            <blockquote className="because-quote">
              "{becauseStatement}"
            </blockquote>
          </div>
        </div>
      </section>

      {/* Section 12: 30-Day Leadership Action Plan */}
      <section className="action-plan-section">
        <div className="container-narrow">
          <div className="section-context">
            <h2 className="section-heading">30-Day Leadership Action Plan</h2>
            <p className="context-text">
              This action plan gives you simple, high-impact steps based on your unique profile.
            </p>
          </div>
          <div className="action-plan-card">
            <div className="action-plan-list">
              {growthRecommendations.map((rec, i) => (
                <div key={i} className="action-item">
                  <span className="action-number">{i + 1}</span>
                  <p className="action-text">{rec}</p>
                </div>
              ))}
            </div>
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
              {authUser && (
                <Link to="/dashboard" className="btn btn-primary">
                  Return to Dashboard
                </Link>
              )}
              <Link to="/" className={authUser ? "btn btn-secondary" : "btn btn-primary"}>
                Return Home
              </Link>
              <button className="btn btn-outline" onClick={() => window.print()}>
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
