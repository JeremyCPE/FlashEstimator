import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>Flash Estimator</h1>
        </Link>
        <nav className="nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Accueil
          </Link>
          <Link 
            to="/games" 
            className={`nav-link ${location.pathname === '/games' ? 'active' : ''}`}
          >
            Parties
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;