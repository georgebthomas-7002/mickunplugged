import { useParams, Link } from 'react-router-dom';
import './ResultsPage.css';

function ResultsPage() {
  const { id } = useParams<{ id: string }>();

  // Placeholder - replace with actual results data
  const results = {
    assessmentId: id,
    title: 'Sample Assessment',
    totalQuestions: 10,
    correctAnswers: 8,
    score: 80,
    passed: true,
    completedAt: new Date(),
  };

  return (
    <div className="results-page">
      <div className="results-card">
        <h1>Assessment Complete!</h1>
        <h2>{results.title}</h2>

        <div className="score-display">
          <div className={`score-circle ${results.passed ? 'passed' : 'failed'}`}>
            <span className="score-value">{results.score}%</span>
          </div>
          <p className={`score-status ${results.passed ? 'passed' : 'failed'}`}>
            {results.passed ? 'Passed' : 'Failed'}
          </p>
        </div>

        <div className="results-details">
          <div className="result-item">
            <span className="label">Total Questions</span>
            <span className="value">{results.totalQuestions}</span>
          </div>
          <div className="result-item">
            <span className="label">Correct Answers</span>
            <span className="value">{results.correctAnswers}</span>
          </div>
          <div className="result-item">
            <span className="label">Completed At</span>
            <span className="value">
              {results.completedAt.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="results-actions">
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ResultsPage;
