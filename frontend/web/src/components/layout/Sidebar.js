import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiCalendar, 
  FiFileText, 
  FiMessageSquare,
  FiBarChart2,
  FiBell,
  FiLogOut,
  FiUser 
} from 'react-icons/fi';
import logo from '../../assets/images/logo.png';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { path: '/patients', icon: FiUsers, label: 'Patients' },
  { path: '/appointments', icon: FiCalendar, label: 'Rendez-vous' },
  { path: '/medical-acts', icon: FiFileText, label: 'Actes Médicaux' },
  { path: '/assistant', icon: FiMessageSquare, label: 'Assistant IA' },
  { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
  { path: '/notifications', icon: FiBell, label: 'Notifications' },
];

function Sidebar() {
  const location = useLocation();

  return (
    <div className="sidebar">
      <div className="sidebar-gradient"></div>
      <div className="sidebar-content">
        {/* Logo */}
        <div className="sidebar-logo">
          <img src={logo} alt="RhumatoAI Logo" className="logo-img" />
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                title={item.label}
              >
                <Icon size={22} />
              </NavLink>
            );
          })}
        </nav>

        {/* Profile & Logout */}
        <div className="sidebar-footer">
          <NavLink to="/profile" className="nav-item profile" title="Mon Profil">
            <FiUser size={22} />
          </NavLink>
          <NavLink to="/" className="nav-item logout" title="Déconnexion">
            <FiLogOut size={22} />
          </NavLink>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
