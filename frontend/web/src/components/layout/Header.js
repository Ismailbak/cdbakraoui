import React from 'react';
import { FiSearch, FiBell, FiMenu } from 'react-icons/fi';
import { NavLink, useLocation } from 'react-router-dom';
import './Header.css';

const navTabs = [
  { path: '/dashboard', label: 'Tableau de Bord' },
  { path: '/patients', label: 'Patients' },
  { path: '/appointments', label: 'Rendez-vous' },
  { path: '/medical-acts', label: 'Actes Médicaux' },
];

function Header() {
  const location = useLocation();

  return (
    <header className="header">
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

      <nav className="header-nav">
        {navTabs.map((tab) => (
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
        <button className="header-icon-btn">
          <FiBell size={20} />
          <span className="notification-badge">3</span>
        </button>
        <button className="header-icon-btn">
          <FiMenu size={20} />
        </button>
      </div>
    </header>
  );
}

export default Header;
