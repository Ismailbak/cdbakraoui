import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FiUsers, FiCalendar, FiFileText, FiActivity, FiHeart } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/cards/StatCard';
import { SkeletonCard, SkeletonChart, SkeletonListItem } from '../../components/common';
import { getPatients, getAppointments, getTodayAppointments, getMedicalActs, getAnalyticsSummary, getRecentActivity } from '../../api/api';
import './DashboardPage.css';

const diagnosisColors = ['#6B7280', '#F97316', '#3B82F6', '#06B6D4', '#10B981'];

function timeAgo(isoString) {
  if (!isoString) return 'Date inconnue';
  const now = new Date();
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return 'Date inconnue';
  let diff = Math.floor((now - date) / 1000);
  // If activity is in the future or negative diff, show date
  if (diff < 0) return date.toLocaleDateString();
  if (diff < 60) return 'À l’instant';
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 172800) return 'Hier';
  return date.toLocaleDateString();
}

function DashboardPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userName =
    user.specialty === 'medecine-interne' && (user.last_name || user.lastName)
      ? `Dr. ${user.last_name || user.lastName}`
      : user.username || user.name || user.email || 'Docteur';
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ totalPatients: 0, todayAppointments: 0, medicalActs: 0, commonDiagnoses: [] });
  const [activity, setActivity] = useState([]);

  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        // Individual fetchers with catches to prevent total failure
        const fetchPatients = getPatients().then(r => r.data).catch(e => { console.error("Patients Load Error:", e); return []; });
        const fetchAppointments = getAppointments().then(r => r.data).catch(e => { console.error("Apps Load Error:", e); return []; });
        const fetchActs = getMedicalActs().then(r => r.data).catch(e => { console.error("Acts Load Error:", e); return []; });
        const fetchAnalytics = getAnalyticsSummary().then(r => r.data).catch(e => { console.error("Analytics Load Error:", e); return {}; });
        const fetchRecentActivity = getRecentActivity().then(r => r.data?.activities).catch(e => { console.error("Activity Load Error:", e); return []; });

        const [patients, appointmentsData, acts, analytics, remoteActivity] = await Promise.all([
          fetchPatients, fetchAppointments, fetchActs, fetchAnalytics, fetchRecentActivity
        ]);

        if (cancelled) return;

        // Ensure we are working with arrays
        const patientsSafe = Array.isArray(patients) ? patients : [];
        const appointments = Array.isArray(appointmentsData) ? appointmentsData : [];
        const actsSafe = Array.isArray(acts) ? acts : [];

        // 1. Calculate Stats
        const todayStr = new Date().toISOString().split('T')[0];
        const todayApps = appointments.filter(a => a.date === todayStr);

        setStats({
          totalPatients: patientsSafe.length,
          todayAppointments: todayApps.length,
          medicalActs: actsSafe.length,
          commonDiagnoses: (analytics?.common_diagnoses || []).slice(0, 5).map((name, i) => ({
            name,
            value: 20 - i * 3,
            color: diagnosisColors[i]
          })),
        });

        // 2. Generate 7-Day Trend
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().split('T')[0];
        });

        const newTrend = last7Days.map(date => {
          const dayDate = new Date(date);
          const dayName = dayDate.toLocaleDateString('fr-FR', { weekday: 'short' });
          return {
            name: dayName.charAt(0).toUpperCase() + dayName.slice(1),
            rdv: appointments.filter(a => a.date === date).length,
            actes: actsSafe.filter(a => a.date === date).length
          };
        });
        setTrendData(newTrend);

        // 3. Robust Recent Activity: Merge, format and sort
        // API returns data in descending order (newest first), so slice(0, 5) gets the 5 most recent
        const recentPatients = patientsSafe.slice(0, 5).map(p => ({
          type: 'patient',
          title: `Nouveau Patient: ${p.name}`,
          subtitle: `IPP: ${p.ipp || 'N/A'}`,
          time: p.created_at || null,
          icon: '👤'
        }));

        const recentActsData = actsSafe.slice(0, 5).map(a => ({
          type: 'medical',
          title: `${a.act_type}: ${a.patient_name || a.patientName || 'Patient'}`,
          subtitle: a.diagnosis || 'Détails non spécifiés',
          time: a.created_at || (a.date ? `${a.date}T12:00:00` : null),
          icon: '📋'
        }));

        const recentAppsData = appointments.slice(0, 5).map(app => ({
          type: 'appointment',
          title: `RDV: ${app.patient_name || app.patientName || 'Patient'}`,
          subtitle: `${app.time || ''} - ${app.type || 'Cons'}`,
          time: app.created_at || (app.date && app.time ? `${app.date}T${app.time}` : app.date ? `${app.date}T12:00:00` : null),
          icon: '📅'
        }));

        const mergedActivity = [...recentPatients, ...recentActsData, ...recentAppsData]
          .filter(item => item.time && !isNaN(new Date(item.time).getTime()))
          .sort((a, b) => new Date(b.time) - new Date(a.time))
          .slice(0, 4);

        // Fallback to merged if remote is empty
        setActivity(mergedActivity.length > 0 ? mergedActivity : (remoteActivity || []));

      } catch (err) {
        if (!cancelled) {
          console.error("Dashboard Global Load Error:", err);
        }
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
                <h3>Activité Hebdomadaire</h3>
                <div className="chart-legend-top">
                  <span className="legend-item"><i className="dot rdv"></i> RDV</span>
                  <span className="legend-item"><i className="dot actes"></i> Actes</span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rdv"
                    name="Rendez-vous"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actes"
                    name="Actes"
                    stroke="#8B5CF6"
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
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
                {activity.length === 0 && <div className="activity-empty-state">Aucune activité récente à afficher</div>}
                {activity.map((item, idx) => (
                  <div className={`activity-item ${item.type}`} key={idx}>
                    <div className={`activity-icon ${item.type}`}>{item.icon}</div>
                    <div className="activity-info">
                      <p className="activity-title">{item.title}</p>
                      <p className="activity-subtitle">{item.subtitle}</p>
                    </div>
                    <span className="activity-time">{timeAgo(item.time)}</span>
                  </div>
                ))}
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
