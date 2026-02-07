import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiUsers, FiCalendar, FiFileText, FiActivity, FiHeart } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/cards/StatCard';
import { SkeletonCard, SkeletonChart, SkeletonListItem } from '../../components/common';
import './DashboardPage.css';

// Sample data for charts
const appointmentData = [
  { name: '12/20', value: 45 },
  { name: '2/4', value: 78 },
  { name: '14/8', value: 65 },
  { name: '6/3', value: 90 },
  { name: '16/8', value: 120 },
  { name: '12/4', value: 145 },
];

const diagnosisData = [
  { name: 'Arthrite', value: 35, color: '#6B7280' },
  { name: 'Lupus', value: 25, color: '#F97316' },
  { name: 'Polyarthrite', value: 20, color: '#3B82F6' },
  { name: 'Fibromyalgie', value: 20, color: '#06B6D4' },
];

function DashboardPage() {
  const userName = "Dr. Martin";
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
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
                <LineChart data={appointmentData}>
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
                value="245 patients"
                color="pink"
              />
              <StatCard 
                icon={<FiCalendar />}
                label="Rendez-vous Aujourd'hui"
                percentage="Planifiés"
                value="12 rdv"
                color="blue"
              />
              <StatCard 
                icon={<FiFileText />}
                label="Actes Médicaux"
                percentage="Ce mois"
                value="89 actes"
                color="green"
              />
              <StatCard 
                icon={<FiActivity />}
                label="Consultations"
                percentage="Cette semaine"
                value="34 consultations"
                color="yellow"
              />
              <StatCard 
                icon={<FiHeart />}
                label="Nouveaux Patients"
                percentage="Ce mois"
                value="18 nouveaux"
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
              <button className="promo-btn">Essayer maintenant →</button>
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
                    data={diagnosisData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {diagnosisData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="diagnosis-center">
                <span className="diagnosis-total">245</span>
                <span className="diagnosis-label">Patients</span>
              </div>
            </div>
            <div className="diagnosis-legend">
              {diagnosisData.map((item, index) => (
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
