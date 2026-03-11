import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/cards/StatCard';
import { FiUsers, FiLogIn, FiActivity, FiTrendingUp } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SkeletonCard, SkeletonChart, Skeleton } from '../../components/common';
import { getAdminStats } from '../../api/api';
import './AdminDashboard.css';

function AdminAnalytics() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAdminStats();
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="admin-section-page">
          <div className="admin-page-header">
            <h1 className="admin-page-title">Analytique système</h1>
            <p className="admin-page-subtitle">Statistiques d'utilisation de la plateforme</p>
          </div>
          <div className="admin-stats-grid admin-analytics-stats">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <div className="admin-chart-card">
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600, color: '#374151' }}>Activité par jour</h3>
            <SkeletonChart height="260px" />
          </div>
          <div className="admin-card-wrap">
            <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 600, color: '#374151' }}>Résumé</h3>
            <Skeleton height="80px" className="skeleton-mt" />
          </div>
        </div>
      </Layout>
    );
  }

  const statCards = stats ? [
    { label: 'Utilisateurs actifs', value: String(stats.active_users), sub: `sur ${stats.total_users} total`, color: 'blue' },
    { label: 'Connexions aujourd\'hui', value: String(stats.today_logins), sub: 'aujourd\'hui', color: 'green' },
    { label: 'Actions totales', value: String(stats.monthly_actions), sub: 'ce mois', color: 'yellow' },
    { label: 'Taux d\'activité', value: `${stats.activity_rate}%`, sub: 'moyenne 7 jours', color: 'purple' },
  ] : [];

  const activityByDay = stats?.activity_by_day || [];

  return (
    <Layout>
      <div className="admin-section-page">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Analytique système</h1>
          <p className="admin-page-subtitle">Statistiques d'utilisation de la plateforme</p>
        </div>

        <div className="admin-stats-grid admin-analytics-stats">
          {statCards.map((stat, idx) => (
            <StatCard
              key={idx}
              icon={
                stat.color === 'blue' ? <FiUsers /> :
                stat.color === 'green' ? <FiLogIn /> :
                stat.color === 'yellow' ? <FiActivity /> :
                <FiTrendingUp />
              }
              label={stat.label}
              percentage={stat.sub}
              value={stat.value}
              color={stat.color}
            />
          ))}
        </div>

        <div className="admin-chart-card">
          <h3>Activité par jour (7 derniers jours)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={activityByDay} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip
                contentStyle={{ borderRadius: '10px', border: '1px solid #E5E7EB' }}
                labelStyle={{ color: '#374151' }}
              />
              <Bar dataKey="connexions" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Connexions" />
              <Bar dataKey="actions" fill="#10B981" radius={[4, 4, 0, 0]} name="Actions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="admin-card-wrap">
          <h3>Résumé</h3>
          <ul className="admin-stats-list">
            <li><strong>{stats?.active_users || 0}</strong> Utilisateurs actifs</li>
            <li><strong>{stats?.today_logins || 0}</strong> Connexions aujourd'hui</li>
            <li><strong>{stats?.monthly_actions || 0}</strong> Actions totales ce mois</li>
            <li><strong>{stats?.activity_rate || 0}%</strong> Taux d'activité moyen (7 jours)</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}

export default AdminAnalytics;
