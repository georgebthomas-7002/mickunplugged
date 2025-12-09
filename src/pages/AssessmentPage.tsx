import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '@/context';
import { getCoachMessage } from '@/types';
import './AssessmentPage.css';

function AssessmentPage() {
  const navigate = useNavigate();
  const {
    state,
    getCurrentScenario,
    getProgress,
    getResponseForScenario,
    answerScenario,
    nextScenario,
    previousScenario,
    canProceed,
    completeAssessment,
    calculateResults,
    resetAssessment,
  } = useAssessment();

  const [selectedChoice, setSelectedChoice] = useState<'A' | 'B' | 'C' | 'D' | null>(null);

  const currentScenario = getCurrentScenario();
  const progress = getProgress();
  const totalScenarios = state.scenarios.length;
  const currentIndex = state.currentScenarioIndex;
  const isLastScenario = currentIndex === totalScenarios - 1;

  // Check for existing response when scenario changes
  useEffect(() => {
    if (currentScenario) {
      const existingResponse = getResponseForScenario(currentScenario.id);
      if (existingResponse) {
        setSelectedChoice(existingResponse.selectedChoice);
      } else {
        setSelectedChoice(null);
      }
    }
  }, [currentScenario, getResponseForScenario]);

  // Redirect if no session
  useEffect(() => {
    if (!state.session) {
      navigate('/start');
    }
  }, [state.session, navigate]);

  if (!currentScenario || !state.session) {
    return (
      <div className="assessment-loading">
        <div className="loading-spinner" />
        <p>Loading assessment...</p>
      </div>
    );
  }

  const handleChoiceSelect = (choiceId: 'A' | 'B' | 'C' | 'D') => {
    setSelectedChoice(choiceId);
    const choice = currentScenario.choices.find((c) => c.id === choiceId);
    if (choice) {
      answerScenario(currentScenario.id, choiceId, choice.scores);
      // Auto-advance after a brief delay to show selection
      setTimeout(() => {
        if (isLastScenario) {
          handleComplete();
        } else {
          nextScenario();
        }
      }, 400);
    }
  };

  const handleNext = () => {
    if (isLastScenario) {
      handleComplete();
    } else {
      nextScenario();
    }
  };

  const handleComplete = () => {
    completeAssessment();
    const result = calculateResults();
    if (result) {
      navigate(`/results/${result.id}`);
    }
  };

  const handleStartOver = () => {
    if (window.confirm('Are you sure you want to start over? All progress will be lost.')) {
      resetAssessment();
      navigate('/start');
    }
  };

  const coachMessage = getCoachMessage(progress);

  return (
    <div className="assessment-page">
      {/* Header */}
      <header className="assessment-header">
        <div className="header-top">
          <span className="scenario-badge">Scenario {currentScenario.number} of {totalScenarios}</span>
          <div className="header-actions">
            <button
              className="save-exit-btn"
              onClick={handleStartOver}
            >
              Start Over
            </button>
            <button
              className="save-exit-btn"
              onClick={() => navigate('/')}
            >
              Save & Exit
            </button>
          </div>
        </div>
        <div className="progress-section">
          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="progress-text">{progress}% Complete</span>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="assessment-layout">
        {/* Scenario Content */}
        <main className="scenario-container">
          <div className="scenario-card">
            <h2 className="scenario-title">{currentScenario.title}</h2>

            <div className="scenario-context">
              <p>{currentScenario.context}</p>
            </div>

            <div className="scenario-question">
              <h3>{currentScenario.question}</h3>
            </div>

            <div className="choices-container">
              {currentScenario.choices.map((choice) => (
                <button
                  key={choice.id}
                  className={`choice-btn ${selectedChoice === choice.id ? 'selected' : ''}`}
                  onClick={() => handleChoiceSelect(choice.id)}
                >
                  <span className="choice-letter">{choice.id}</span>
                  <span className="choice-text">{choice.text}</span>
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* Coach Sidebar */}
        <aside className="coach-sidebar">
          <div className="coach-card">
            <div className="coach-header">
              <span className="coach-icon">🎯</span>
              <span className="coach-label">Coach</span>
            </div>
            <p className="coach-text">{coachMessage?.message || "Trust your instincts."}</p>
          </div>
        </aside>
      </div>

      {/* Navigation */}
      <footer className="assessment-navigation">
        <button
          className="btn btn-secondary"
          onClick={previousScenario}
          disabled={currentIndex === 0}
        >
          ← Previous
        </button>

        <div className="nav-indicators">
          {state.scenarios.map((_, index) => (
            <span
              key={index}
              className={`nav-dot ${
                index === currentIndex
                  ? 'current'
                  : state.session?.responses.some(
                      (r) => r.scenarioId === state.scenarios[index].id
                    )
                  ? 'answered'
                  : ''
              }`}
            />
          ))}
        </div>

        <button
          className="btn btn-primary"
          onClick={handleNext}
          disabled={!canProceed()}
        >
          {isLastScenario ? 'Complete Assessment' : 'Next →'}
        </button>
      </footer>
    </div>
  );
}

export default AssessmentPage;
