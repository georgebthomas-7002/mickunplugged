import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          Assessment Tool
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">
            Home
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Header;
