import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiBriefcase, FiShield, FiClock } from 'react-icons/fi';
import { SkeletonTableRow } from '../../components/common';
import { getUserDetail } from '../../api/api';
import './AdminDashboard.css';

function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError('');
      try {
        const res = await getUserDetail(id);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Utilisateur introuvable.');
      } finally { setIsLoading(false); }
    }
    load();
  }, [id]);

  const formatDate = (isoStr) => {
    if (!isoStr) return '-';
    return new Date(isoStr).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });
  };

  const displayName = (u) => {
    if (u.first_name || u.last_name) return `${u.first_name || ''} ${u.last_name || ''}`.trim();
    return u.username;
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="admin-section-page">
          <div className="admin-card-wrap" style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Chargement...</div>
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <div className="admin-section-page">
          <div className="admin-card-wrap" style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: '#EF4444', marginBottom: 16 }}>{error || 'Erreur'}</p>
            <button type="button" className="admin-btn-secondary" onClick={() => navigate('/admin/users')}><FiArrowLeft /> Retour</button>
          </div>
        </div>
      </Layout>
    );
  }

  const user = data.user;
  const activity = data.activity || [];

  return (
    <Layout>
      <div className="admin-section-page">
        <div className="admin-page-header">
          <button type="button" className="admin-btn-secondary" onClick={() => navigate('/admin/users')} style={{ marginBottom: 12 }}><FiArrowLeft /> Retour aux utilisateurs</button>
          <h1 className="admin-page-title">{displayName(user)}</h1>
          <p className="admin-page-subtitle">Détail et historique d'activité</p>
        </div>

        {/* User info card */}
        <div className="admin-card-wrap">
          <div className="admin-user-detail-grid">
            <div className="admin-user-detail-item"><FiUser /><div><div className="admin-health-label">Nom</div><div className="admin-health-value">{displayName(user)}</div></div></div>
            <div className="admin-user-detail-item"><FiMail /><div><div className="admin-health-label">Email</div><div className="admin-health-value">{user.email}</div></div></div>
            <div className="admin-user-detail-item"><FiShield /><div><div className="admin-health-label">Rôle</div><div className="admin-health-value"><span className={`admin-badge ${user.role === 'admin' ? 'admin-badge--admin' : 'admin-badge--medecin'}`}>{user.role}</span></div></div></div>
            <div className="admin-user-detail-item"><FiBriefcase /><div><div className="admin-health-label">Département</div><div className="admin-health-value">{user.department || '-'}</div></div></div>
            <div className="admin-user-detail-item"><FiPhone /><div><div className="admin-health-label">Téléphone</div><div className="admin-health-value">{user.phone || '-'}</div></div></div>
            <div className="admin-user-detail-item"><FiClock /><div><div className="admin-health-label">Statut</div><div className="admin-health-value"><span className={`admin-badge ${user.is_active ? 'admin-badge--actif' : 'admin-badge--inactif'}`}>{user.is_active ? 'Actif' : 'Inactif'}</span></div></div></div>
          </div>
        </div>

        {/* Activity history */}
        <div className="admin-card-wrap" style={{ marginTop: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 700 }}>Historique d'activité</h3>
          {activity.length === 0 ? (
            <p style={{ color: '#9CA3AF', padding: '20px 0', textAlign: 'center' }}>Aucune activité enregistrée.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Date</th><th>Action</th><th>Ressource</th><th>Statut</th><th>IP</th></tr></thead>
                <tbody>
                  {activity.map((a, i) => (
                    <tr key={i}>
                      <td>{formatDate(a.timestamp)}</td>
                      <td>{a.action}</td>
                      <td>{a.resource_type || '-'}{a.resource_id ? ` #${a.resource_id}` : ''}</td>
                      <td><span className={`admin-badge ${a.status === 'success' ? 'admin-badge--success' : 'admin-badge--error'}`}>{a.status === 'success' ? 'Succès' : 'Échec'}</span></td>
                      <td><code className="admin-ip">{a.ip_address || '-'}</code></td>
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

export default AdminUserDetail;
