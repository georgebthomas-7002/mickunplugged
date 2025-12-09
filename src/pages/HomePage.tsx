import { Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
  // Sample assessments - replace with actual data fetching
  const sampleAssessments = [
    {
      id: 'sample-1',
      title: 'Sample Assessment',
      description: 'A sample assessment to test the application.',
      questionCount: 10,
      timeLimit: 30,
    },
  ];

  return (
    <div className="home-page">
      <section className="hero">
        <h1>Welcome to the Assessment Tool</h1>
        <p>
          Take assessments, track your progress, and improve your knowledge.
        </p>
      </section>

      <section className="assessments-section">
        <h2>Available Assessments</h2>
        <div className="assessments-grid">
          {sampleAssessments.map((assessment) => (
            <div key={assessment.id} className="assessment-card">
              <h3>{assessment.title}</h3>
              <p>{assessment.description}</p>
              <div className="assessment-meta">
                <span>{assessment.questionCount} questions</span>
                {assessment.timeLimit && (
                  <span>{assessment.timeLimit} min</span>
                )}
              </div>
              <Link
                to={`/assessment/${assessment.id}`}
                className="btn btn-primary"
              >
                Start Assessment
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
