import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Footer.css';

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const player = useSelector(state => state.player.data);

  if (!player) {
    return null;
  }

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <footer className="footer">
      <nav className="footer-nav">
        <button 
          className={`nav-button ${isActive('/') ? 'active' : ''}`}
          onClick={() => navigate('/')}
        >
          <span className="nav-icon">🌲</span>
          <span className="nav-label">Локация</span>
        </button>
        
        <button 
          className={`nav-button ${isActive('/chat') ? 'active' : ''}`}
          onClick={() => navigate('/chat')}
        >
          <span className="nav-icon">💬</span>
          <span className="nav-label">Чат</span>
        </button>
        
        <button 
          className={`nav-button ${isActive('/map') ? 'active' : ''}`}
          onClick={() => navigate('/map')}
        >
          <span className="nav-icon">🗺️</span>
          <span className="nav-label">Карта</span>
        </button>
        
        <button 
          className={`nav-button ${isActive('/profile') ? 'active' : ''}`}
          onClick={() => navigate('/profile')}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">Профиль</span>
        </button>
      </nav>
    </footer>
  );
};

export default Footer;


