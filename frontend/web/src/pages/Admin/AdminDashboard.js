import React from 'react';
import { useNavigate } from 'react-router-dom';

import Layout from '../../components/layout/Layout';
import StatCard from '../../components/cards/StatCard';
import { FiUsers, FiBarChart2, FiShield, FiSettings, FiLogIn, FiUserPlus } from 'react-icons/fi';
import './AdminDashboard.css';

const recentActivity = [
  { id: 1, user: 'Admin Demo', action: 'Connexion', time: 'Il y a 2 min', status: 'Succès' },
  { id: 2, user: 'Dr. Demo', action: 'Consultation dossier', time: 'Il y a 15 min', status: 'Succès' },
  { id: 3, user: 'Dr. Fatima', action: 'Tentative connexion', time: 'Il y a 1 h', status: 'Échec' },
];

function AdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const adminName = user.name || 'Admin';

  return (
    <Layout>
      <div className="dashboard admin-dashboard">
        {/* Welcome Section */}
        <div className="dashboard-grid">
          <div className="welcome-section">
            <p className="welcome-subtitle">Bonjour, <strong>{adminName}</strong> - Bienvenue</p>
            <h1 className="welcome-title">Tableau de Bord Admin</h1>
            <p className="welcome-text">
              <span className="status-icon"> </span> Gestion de la plateforme et des utilisateurs
            </p>
          </div>
          <div className="admin-overview-card">
            <h3>Vue d'ensemble</h3>
            <div className="admin-overview-stats">
              <div className="admin-overview-item">
                <span className="admin-overview-value">12</span>
                <span className="admin-overview-label">Utilisateurs</span>
              </div>
              <div className="admin-overview-item">
                <span className="admin-overview-value">34</span>
                <span className="admin-overview-label">Connexions aujourd'hui</span>
              </div>
              <div className="admin-overview-item">
                <span className="admin-overview-value">210</span>
                <span className="admin-overview-label">Actions ce mois</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick navigation cards */}
        <div className="stats-grid admin-stats-grid">
          <div className="admin-stat-wrapper" onClick={() => navigate('/admin/users')} role="button" tabIndex={0}>
            <StatCard
              icon={<FiUsers />}
              label="Gestion des utilisateurs"
              percentage="Voir, ajouter, modifier"
              value="Utilisateurs"
              color="blue"
            />
          </div>
          <div className="admin-stat-wrapper" onClick={() => navigate('/admin/analytics')} role="button" tabIndex={0}>
            <StatCard
              icon={<FiBarChart2 />}
              label="Analytique système"
              percentage="Statistiques d'utilisation"
              value="Plateforme"
              color="yellow"
            />
          </div>
          <div className="admin-stat-wrapper" onClick={() => navigate('/admin/security')} role="button" tabIndex={0}>
            <StatCard
              icon={<FiShield />}
              label="Logs & Sécurité"
              percentage="Logs et permissions"
              value="Sécurité"
              color="green"
            />
          </div>
          <div className="admin-stat-wrapper" onClick={() => navigate('/admin/settings')} role="button" tabIndex={0}>
            <StatCard
              icon={<FiSettings />}
              label="Paramètres"
              percentage="Configuration globale"
              value="Plateforme"
              color="pink"
            />
          </div>
        </div>

        {/* Recent activity */}
        <div className="admin-bottom-grid">
          <div className="admin-activity-card">
            <div className="admin-activity-header">
              <h3>Activité récente</h3>
              <button type="button" className="admin-link-btn" onClick={() => navigate('/admin/security')}>
                Voir tout
              </button>
            </div>
            <ul className="admin-activity-list">
              {recentActivity.map((item) => (
                <li key={item.id} className="admin-activity-item">
                  <div className="admin-activity-icon">
                    {item.action.includes('Connexion') ? <FiLogIn /> : <FiUserPlus />}
                  </div>
                  <div className="admin-activity-info">
                    <span className="admin-activity-user">{item.user}</span>
                    <span className="admin-activity-action">{item.action}</span>
                  </div>
                  <span className={`admin-activity-badge admin-activity-badge--${item.status === 'Succès' ? 'success' : 'error'}`}>
                    {item.status}
                  </span>
                  <span className="admin-activity-time">{item.time}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="admin-quick-actions-card">
            <h3>Actions rapides</h3>
            <div className="admin-quick-actions">
              <button type="button" className="admin-action-btn" onClick={() => navigate('/admin/users')}>
                <FiUsers /> Ajouter un utilisateur
              </button>
              <button type="button" className="admin-action-btn" onClick={() => navigate('/admin/security')}>
                <FiShield /> Voir les logs
              </button>
              <button type="button" className="admin-action-btn" onClick={() => navigate('/admin/settings')}>
                <FiSettings /> Paramètres
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AdminDashboard;
