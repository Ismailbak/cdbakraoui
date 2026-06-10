import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import './Breadcrumb.css';

// Route name mappings
const routeNames = {
  'dashboard': 'Tableau de Bord',
  'patients': 'Patients',
  'appointments': 'Rendez-vous',
  'medical-acts': 'Actes Médicaux',
  'assistant': 'Assistant IA',
  'analytics': 'Analytics',
  'notifications': 'Notifications',
  'profile': 'Mon Profil',
};

function Breadcrumb({ items }) {
  const location = useLocation();
  
  // If custom items are provided, use them
  if (items && items.length > 0) {
    return (
      <nav className="breadcrumb">
        <Link to="/dashboard" className="breadcrumb-item home">
          <FiHome />
        </Link>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <FiChevronRight className="breadcrumb-separator" />
            {item.path ? (
              <Link to={item.path} className="breadcrumb-item">
                {item.label}
              </Link>
            ) : (
              <span className="breadcrumb-item current">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
    );
  }

  // Auto-generate from current path
  const pathParts = location.pathname.split('/').filter(part => part);
  
  if (pathParts.length === 0 || (pathParts.length === 1 && pathParts[0] === 'dashboard')) {
    return null; // Don't show on dashboard
  }

  return (
    <nav className="breadcrumb">
      <Link to="/dashboard" className="breadcrumb-item home">
        <FiHome />
      </Link>
      {pathParts.map((part, index) => {
        const path = '/' + pathParts.slice(0, index + 1).join('/');
        const isLast = index === pathParts.length - 1;
        const name = routeNames[part] || part;

        return (
          <React.Fragment key={part}>
            <FiChevronRight className="breadcrumb-separator" />
            {isLast ? (
              <span className="breadcrumb-item current">{name}</span>
            ) : (
              <Link to={path} className="breadcrumb-item">{name}</Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
