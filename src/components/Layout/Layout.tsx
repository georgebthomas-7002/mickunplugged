import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const location = useLocation();

  // Hide header on assessment page for focused experience
  const hideHeader = location.pathname.startsWith('/assessment/');

  // Full width pages (no container padding)
  const fullWidthPages = ['/', '/start'];
  const isFullWidth = fullWidthPages.includes(location.pathname);

  return (
    <div className="layout">
      {!hideHeader && <Header />}
      <main className={`main-content ${isFullWidth ? 'full-width' : ''}`}>
        {children}
      </main>
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-brand">
            <span className="footer-logo">E.Q.U.I.P. <span className="text-blue">360</span></span>
            <span className="footer-tagline">Emotional Quotient Under Intelligent Pressure</span>
          </p>
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} Mick Hunt Official. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
