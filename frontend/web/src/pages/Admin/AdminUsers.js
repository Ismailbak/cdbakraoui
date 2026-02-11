import React, { useState, useMemo, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { FiSearch, FiUserPlus, FiEdit2, FiToggleLeft, FiToggleRight, FiUsers } from 'react-icons/fi';
import { SkeletonTableRow } from '../../components/common';
import EmptyState from '../../components/common/EmptyState';
import './AdminDashboard.css';

const demoUsers = [
  { id: 1, name: 'Dr. Demo', email: 'demo@churochd.ma', role: 'medecin', status: 'Actif' },
  { id: 2, name: 'Admin Demo', email: 'admin@churochd.ma', role: 'admin', status: 'Actif' },
  { id: 3, name: 'Dr. Fatima Benali', email: 'fatima@churochd.ma', role: 'medecin', status: 'Inactif' },
  { id: 4, name: 'Dr. Karim Alami', email: 'karim@churochd.ma', role: 'medecin', status: 'Actif' },
  { id: 5, name: 'Dr. Samira Idrissi', email: 'samira@churochd.ma', role: 'medecin', status: 'Actif' },
  { id: 6, name: 'Inf. Mohamed Tazi', email: 'mohamed.t@churochd.ma', role: 'infirmier', status: 'Actif' },
];

function AdminUsers() {
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(t);
  }, []);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return demoUsers;
    const q = search.toLowerCase();
    return demoUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [search]);

  const getRoleBadgeClass = (role) => {
    if (role === 'admin') return 'admin-badge admin-badge--admin';
    if (role === 'medecin') return 'admin-badge admin-badge--medecin';
    if (role === 'infirmier') return 'admin-badge admin-badge--infirmier';
    return 'admin-badge';
  };

  const getStatusBadgeClass = (status) =>
    status === 'Actif' ? 'admin-badge admin-badge--actif' : 'admin-badge admin-badge--inactif';

  return (
    <Layout>
      <div className="admin-section-page">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Gestion des utilisateurs</h1>
          <p className="admin-page-subtitle">Voir et gérer tous les utilisateurs de la plateforme</p>
        </div>

        <div className="admin-card-wrap">
          <div className="admin-toolbar">
            <div className="admin-search-wrap">
              <FiSearch className="admin-search-icon" />
              <input
                type="search"
                placeholder="Rechercher par nom, email ou rôle..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Rechercher utilisateurs"
                disabled={isLoading}
              />
            </div>
            <button type="button" className="admin-btn-primary" disabled={isLoading}>
              <FiUserPlus /> Ajouter un utilisateur
            </button>
          </div>

          {isLoading ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <SkeletonTableRow key={i} columns={6} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              icon={FiUsers}
              title="Aucun utilisateur trouvé"
              description="Modifiez votre recherche ou ajoutez un nouvel utilisateur à la plateforme."
              actionLabel="Ajouter un utilisateur"
              onAction={() => {}}
            />
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={getRoleBadgeClass(user.role)}>{user.role}</span>
                      </td>
                      <td>
                        <span className={getStatusBadgeClass(user.status)}>{user.status}</span>
                      </td>
                      <td>
                        <div className="admin-table-actions">
                          <button type="button" className="admin-btn-secondary" title="Modifier">
                            <FiEdit2 />
                          </button>
                          <button type="button" className="admin-btn-secondary" title={user.status === 'Actif' ? 'Désactiver' : 'Activer'}>
                            {user.status === 'Actif' ? <FiToggleRight /> : <FiToggleLeft />}
                          </button>
                        </div>
                      </td>
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

export default AdminUsers;
