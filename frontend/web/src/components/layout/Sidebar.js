import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiUsers, FiCalendar, FiFileText, FiMessageSquare, FiBarChart2, FiBell, FiLogOut, FiUser, FiShield } from 'react-icons/fi';
import { useToast } from '../common';
import ConfirmDialog from '../common/ConfirmDialog';
import logo from '../../assets/images/logo.png';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { path: '/patients', icon: FiUsers, label: 'Patients' },
  { path: '/appointments', icon: FiCalendar, label: 'Rendez-vous' },
  { path: '/medical-acts', icon: FiFileText, label: 'Actes Médicaux' },
  { path: '/assistant', icon: FiMessageSquare, label: 'Assistant IA' },
  { path: '/analytics', icon: FiBarChart2, label: 'Analytics', roles: ['admin', 'doctor', 'department_head'] },
  { path: '/notifications', icon: FiBell, label: 'Notifications' },
];

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { warning } = useToast();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [showConfirm, setShowConfirm] = useState(false);

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true;
    if (user.is_admin) return true;
    return item.roles.includes(user.role);
  });

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    localStorage.removeItem('user');
    warning('Vous avez été déconnecté.', 3500);
    navigate('/');
  };

  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <div className="sidebar">
        <div className="sidebar-gradient"></div>
        <div className="sidebar-content">
          {/* Logo */}
          <div className="sidebar-logo">
            <img src={logo} alt="RhumatoAI Logo" className="logo-img" />
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            {filteredNavItems.map((item) => {
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
            {/* Admin Dashboard link for admin users */}
            {user.is_admin && (
              <NavLink
                to="/admin"
                className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}
                title="Admin Dashboard"
              >
                <FiShield size={22} />
              </NavLink>
            )}
          </nav>

          {/* Profile & Logout */}
          <div className="sidebar-footer">
            <NavLink to="/profile" className="nav-item profile" title="Mon Profil">
              <FiUser size={22} />
            </NavLink>
            <a href="/" className="nav-item logout" title="Déconnexion" onClick={handleLogoutClick}>
              <FiLogOut size={22} />
            </a>
          </div>
        </div>
      </div>
      <ConfirmDialog
        open={showConfirm}
        title="Déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}

export default Sidebar;
