import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiMenu, FiFileText, FiShield, FiX, FiMessageSquare } from 'react-icons/fi';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const navTabs = [
  { path: '/dashboard', label: 'Tableau de Bord' },
  { path: '/patients', label: 'Patients' },
  { path: '/appointments', label: 'Rendez-vous' },
  { path: '/medical-acts', label: 'Actes Médicaux' },
];

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/dashboard';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`header ${isDashboard ? 'header-centered' : ''}`}>
      {!isDashboard && (
        <div className="header-left">
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Rechercher patients, rendez-vous..." 
              className="search-input"
            />
          </div>
        </div>
      )}

      <nav className="header-nav">
        {navTabs.slice(0, 2).map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={`header-tab ${location.pathname === tab.path ? 'active' : ''}`}
          >
            {tab.label}
          </NavLink>
        ))}
        
        {isDashboard && (
          <button 
            className="ai-assistant-btn"
            onClick={() => navigate('/assistant')}
          >
            <FiMessageSquare />
            <span>Assistant IA</span>
          </button>
        )}
        
        {navTabs.slice(2).map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={`header-tab ${location.pathname === tab.path ? 'active' : ''}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className="header-right">
        <div className="menu-container" ref={menuRef}>
          <button 
            className={`header-icon-btn ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          
          {menuOpen && (
            <div className="dropdown-menu">
              <a href="/terms" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                <FiFileText />
                <span>Conditions d'utilisation</span>
              </a>
              <a href="/privacy" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                <FiShield />
                <span>Politique de confidentialité</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
