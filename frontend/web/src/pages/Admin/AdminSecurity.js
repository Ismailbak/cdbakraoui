import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { FiDownload, FiShield, FiAlertCircle, FiFileText } from 'react-icons/fi';
import { SkeletonTableRow } from '../../components/common';
import EmptyState from '../../components/common/EmptyState';
import './AdminDashboard.css';

const demoLogs = [
  { id: 1, date: '11/02/2026', time: '10:01', user: 'Dr. Demo', action: 'Connexion', status: 'Succès', ip: '192.168.1.10' },
  { id: 2, date: '11/02/2026', time: '10:05', user: 'Admin Demo', action: 'Ajout utilisateur', status: 'Succès', ip: '192.168.1.5' },
  { id: 3, date: '11/02/2026', time: '10:10', user: 'Dr. Fatima', action: 'Connexion', status: 'Échec', ip: '192.168.1.22' },
  { id: 4, date: '11/02/2026', time: '09:45', user: 'Dr. Karim Alami', action: 'Consultation dossier', status: 'Succès', ip: '192.168.1.12' },
  { id: 5, date: '11/02/2026', time: '09:30', user: 'Inconnu', action: 'Tentative connexion', status: 'Échec', ip: '10.0.0.99' },
  { id: 6, date: '10/02/2026', time: '16:20', user: 'Dr. Samira Idrissi', action: 'Déconnexion', status: 'Succès', ip: '192.168.1.8' },
];

function AdminSecurity() {
  const [filter, setFilter] = useState('all'); // all | success | error
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const filteredLogs = filter === 'all'
    ? demoLogs
    : demoLogs.filter((log) =>
        filter === 'success' ? log.status === 'Succès' : log.status === 'Échec'
      );

  return (
    <Layout>
      <div className="admin-section-page">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Logs & Sécurité</h1>
          <p className="admin-page-subtitle">Activité récente et tentatives de connexion</p>
        </div>

        <div className="admin-card-wrap">
          <div className="admin-toolbar">
            <div className="admin-security-filters">
              <button
                type="button"
                className={`admin-filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                Tous
              </button>
              <button
                type="button"
                className={`admin-filter-btn ${filter === 'success' ? 'active' : ''}`}
                onClick={() => setFilter('success')}
              >
                <FiShield /> Succès
              </button>
              <button
                type="button"
                className={`admin-filter-btn ${filter === 'error' ? 'active' : ''}`}
                onClick={() => setFilter('error')}
              >
                <FiAlertCircle /> Échecs
              </button>
            </div>
            <button type="button" className="admin-btn-secondary" disabled={isLoading}>
              <FiDownload /> Exporter les logs
            </button>
          </div>

          {isLoading ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Utilisateur</th>
                    <th>Action</th>
                    <th>Statut</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <SkeletonTableRow key={i} columns={6} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : filteredLogs.length === 0 ? (
            <EmptyState
              icon={FiFileText}
              title="Aucun log"
              description="Aucune activité ne correspond aux filtres sélectionnés. Essayez « Tous » pour afficher l'historique."
              actionLabel="Voir tous les logs"
              onAction={() => setFilter('all')}
            />
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Utilisateur</th>
                    <th>Action</th>
                    <th>Statut</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{log.date}</td>
                      <td>{log.time}</td>
                      <td>{log.user}</td>
                      <td>{log.action}</td>
                      <td>
                        <span className={`admin-badge ${log.status === 'Succès' ? 'admin-badge--success' : 'admin-badge--error'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td><code className="admin-ip">{log.ip}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default AdminSecurity;
