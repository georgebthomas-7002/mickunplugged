import { Link } from 'react-router-dom';
import './NotFoundPage.css';

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <span className="not-found-badge">Navigation Error</span>
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Path Not Found</h2>
        <p className="not-found-message">
          The leadership journey you're seeking doesn't exist at this location.
          Let's redirect your course.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            Return to Home
          </Link>
          <Link to="/start" className="btn btn-secondary">
            Begin Assessment
          </Link>
        </div>
      </div>
      <div className="not-found-decoration">
        <div className="decoration-ring" />
        <div className="decoration-ring" />
        <div className="decoration-ring" />
      </div>
    </div>
  );
}

export default NotFoundPage;
