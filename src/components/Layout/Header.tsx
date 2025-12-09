import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-text">E.Q.U.I.P.</span>
          <span className="logo-360">360</span>
        </Link>
        <nav className="nav">
          <Link to="/start" className="nav-link nav-cta">
            Take Assessment
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
