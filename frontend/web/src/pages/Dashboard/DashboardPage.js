import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiUsers, FiCalendar, FiFileText, FiActivity, FiHeart } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/cards/StatCard';
import { SkeletonCard, SkeletonChart, SkeletonListItem } from '../../components/common';
import { getPatients, getTodayAppointments, getMedicalActs, getAnalyticsSummary } from '../../api/api';
import './DashboardPage.css';

const diagnosisColors = ['#6B7280', '#F97316', '#3B82F6', '#06B6D4', '#10B981'];

function DashboardPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = user.username || user.name || user.email || 'Docteur';
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ totalPatients: 0, todayAppointments: 0, medicalActs: 0, commonDiagnoses: [] });

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [patientsRes, todayRes, actsRes, analyticsRes] = await Promise.all([
          getPatients(),
          getTodayAppointments(),
          getMedicalActs(),
          getAnalyticsSummary(),
        ]);
        if (cancelled) return;
        const patients = patientsRes.data || [];
        const today = todayRes.data || [];
        const acts = actsRes.data || [];
        const analytics = analyticsRes.data || {};
        setStats({
          totalPatients: patients.length,
          todayAppointments: today.length,
          medicalActs: acts.length,
          commonDiagnoses: (analytics.common_diagnoses || []).slice(0, 5).map((name, i) => ({ name, value: 20 - i * 3, color: diagnosisColors[i] })),
        });
      } catch {
        if (!cancelled) setStats({ totalPatients: 0, todayAppointments: 0, medicalActs: 0, commonDiagnoses: [] });
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <Layout>
      <div className="dashboard">
        {/* Welcome Section */}
        <div className="dashboard-grid">
          <div className="welcome-section">
            <p className="welcome-subtitle">Bonjour, <strong>{userName}</strong> - Bienvenue</p>
            <h1 className="welcome-title">Tableau de Bord</h1>
            <p className="welcome-text">
              <span className="status-icon"> </span> Vue d'ensemble de votre activité
            </p>
          </div>

          {/* Line Chart */}
          {isLoading ? (
            <SkeletonChart height="220px" />
          ) : (
            <div className="chart-card">
              <div className="chart-header">
                <h3>Rendez-vous</h3>
                <span className="chart-date">Janvier 2026 ▼</span>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={[{ name: 'Rendez-vous', value: stats.todayAppointments }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Stat Cards */}
        <div className="stats-grid">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <StatCard 
                icon={<FiUsers />}
                label="Patients"
                percentage="Total"
                value={`${stats.totalPatients} patients`}
                color="pink"
              />
              <StatCard 
                icon={<FiCalendar />}
                label="Rendez-vous Aujourd'hui"
                percentage="Planifiés"
                value={`${stats.todayAppointments} rdv`}
                color="blue"
              />
              <StatCard 
                icon={<FiFileText />}
                label="Actes Médicaux"
                percentage="Total"
                value={`${stats.medicalActs} actes`}
                color="green"
              />
              <StatCard 
                icon={<FiActivity />}
                label="Consultations"
                percentage="Total"
                value={`${stats.medicalActs} actes`}
                color="yellow"
              />
              <StatCard 
                icon={<FiHeart />}
                label="Diagnostics"
                percentage="Fréquents"
                value={stats.commonDiagnoses.length ? `${stats.commonDiagnoses.length} types` : '-'}
                color="purple"
              />
            </>
          )}
        </div>

        {/* Bottom Section */}
        <div className="bottom-grid">
          {/* Recent Activity */}
          {isLoading ? (
            <div className="activity-card">
              <h3>Activité Récente</h3>
              <div className="activity-list">
                <SkeletonListItem />
                <SkeletonListItem />
                <SkeletonListItem />
              </div>
            </div>
          ) : (
            <div className="activity-card">
              <h3>Activité Récente</h3>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon patient">👤</div>
                  <div className="activity-info">
                    <p className="activity-title">Nouveau patient ajouté</p>
                    <p className="activity-subtitle">Mohamed Alami</p>
                  </div>
                  <span className="activity-time">Il y a 2h</span>
                </div>
                <div className="activity-item">
                  <div className="activity-icon appointment">📅</div>
                  <div className="activity-info">
                    <p className="activity-title">Rendez-vous confirmé</p>
                    <p className="activity-subtitle">Fatima Benali - 14:30</p>
                  </div>
                  <span className="activity-time">Il y a 3h</span>
                </div>
                <div className="activity-item">
                  <div className="activity-icon medical">📋</div>
                  <div className="activity-info">
                    <p className="activity-title">Acte médical créé</p>
                    <p className="activity-subtitle">Consultation rhumatologie</p>
                  </div>
                  <span className="activity-time">Hier</span>
                </div>
              </div>
            </div>
          )}

          {/* Assistant AI Promo */}
          <div className="assistant-promo-card">
            <div className="promo-content">
              <h3>Assistant IA</h3>
              <p>Obtenez des résumés de dossiers patients et des suggestions médicales en temps réel.</p>
              <button className="promo-btn" onClick={() => window.location.href = '/assistant'}>Essayer maintenant →</button>
            </div>
            <div className="promo-illustration">🤖</div>
          </div>

          {/* Diagnosis Chart */}
          <div className="diagnosis-card">
            <h3>Diagnostics</h3>
            <div className="diagnosis-chart">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={stats.commonDiagnoses.length ? stats.commonDiagnoses : [{ name: '-', value: 1, color: '#E5E7EB' }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {(stats.commonDiagnoses.length ? stats.commonDiagnoses : [{ color: '#E5E7EB' }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="diagnosis-center">
                <span className="diagnosis-total">{stats.totalPatients}</span>
                <span className="diagnosis-label">Patients</span>
              </div>
            </div>
            <div className="diagnosis-legend">
              {(stats.commonDiagnoses.length ? stats.commonDiagnoses : []).map((item, index) => (
                <div key={index} className="legend-item">
                  <span className="legend-dot" style={{ background: item.color }}></span>
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default DashboardPage;
