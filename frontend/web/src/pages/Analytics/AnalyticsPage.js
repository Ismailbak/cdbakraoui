import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  FiTrendingUp, FiDownload, FiCalendar, FiUsers, FiDollarSign, 
  FiActivity, FiPieChart, FiBarChart2, FiFileText, FiFilter 
} from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import { SkeletonCard, SkeletonChart } from '../../components/common';
import { getAnalyticsSummary } from '../../api/api';
import './AnalyticsPage.css';

const diagnosisColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('6months');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [medicalActs, setMedicalActs] = useState([]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([
      getAnalyticsSummary(),
      import('../../api/api').then(mod => Promise.all([mod.getAppointments(), mod.getPatients(), mod.getMedicalActs()]))
    ])
      .then(([analyticsRes, [appointmentsRes, patientsRes, actsRes]]) => {
        if (!cancelled) {
          setSummary(analyticsRes.data);
          setAppointments(appointmentsRes.data || []);
          setPatients(patientsRes.data || []);
          setMedicalActs(actsRes.data || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError('Erreur lors du chargement des statistiques.');
          setIsLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, []);

  const totalPatients = summary?.total_patients ?? 0;
  const avgAge = summary?.avg_age ?? 0;
  const commonDiagnoses = summary?.common_diagnoses ?? [];

  // Compute weekly appointments data for the current week
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Monday as first day
  const weeklyAppointmentsData = weekDays.map((day, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayAppointments = appointments.filter(a => a.date === dateStr);
    return {
      day,
      consultations: dayAppointments.filter(a => a.type === 'Consultation').length,
      suivis: dayAppointments.filter(a => a.type === 'Suivi').length,
      urgences: dayAppointments.filter(a => a.type === 'Urgence').length,
    };
  });

  // Compute age distribution data from patients
  const ageGroups = [
    { label: '18-30', min: 18, max: 30 },
    { label: '31-45', min: 31, max: 45 },
    { label: '46-60', min: 46, max: 60 },
    { label: '61-75', min: 61, max: 75 },
    { label: '75+', min: 76, max: 200 },
  ];
  const ageDistributionData = ageGroups.map(group => {
    const males = patients.filter(p => p.age >= group.min && p.age <= group.max && (p.gender === 'Homme' || p.gender === 'homme')).length;
    const females = patients.filter(p => p.age >= group.min && p.age <= group.max && (p.gender === 'Femme' || p.gender === 'femme')).length;
    return { age: group.label, male: males, female: females };
  });

  // Compute activity trend data (per month)
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const currentYear = new Date().getFullYear();
  const activityTrendData = months.map((month, i) => {
    const monthStr = String(i + 1).padStart(2, '0');
    const acts = medicalActs.filter(a => {
      const d = new Date(a.date);
      return d.getFullYear() === currentYear && d.getMonth() === i;
    }).length;
    const rdv = appointments.filter(a => {
      const d = new Date(a.date);
      return d.getFullYear() === currentYear && d.getMonth() === i;
    }).length;
    return { month, actes: acts, rdv };
  });


  // Compute monthly revenue and patient count data from medical acts
  // For each month, sum up revenue (amount) and count unique patients
  const monthlyRevenueData = months.map((month, i) => {
    const monthActs = medicalActs.filter(a => {
      const d = new Date(a.date);
      return d.getFullYear() === currentYear && d.getMonth() === i;
    });
    // Use amount field from medical acts (may be string, parse to float)
    const revenue = monthActs.reduce((sum, a) => {
      const amt = parseFloat(a.amount) || 0;
      return sum + amt;
    }, 0);
    // Count unique patients for the month
    const patientIds = new Set(monthActs.map(a => a.patient_id));
    return {
      month,
      revenue,
      patients: patientIds.size
    };
  });


  // Compute top treatments data from medicalActs
  // Group by treatment field, count occurrences, sort, and calculate percentage
  const treatmentCounts = {};
  medicalActs.forEach(act => {
    if (act.treatment && act.treatment.trim()) {
      treatmentCounts[act.treatment] = (treatmentCounts[act.treatment] || 0) + 1;
    }
  });
  const totalTreatments = Object.values(treatmentCounts).reduce((sum, count) => sum + count, 0);
  const topTreatmentsData = Object.entries(treatmentCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalTreatments > 0 ? Math.round((count / totalTreatments) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 treatments

  return (
    <Layout>
      <div className="analytics-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Rapports & Analytiques</h1>
            <p className="page-subtitle">Analyses détaillées de votre activité médicale</p>
          </div>
          <div className="header-actions">
            <div className="date-filter">
              <FiCalendar />
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                <option value="7days">7 derniers jours</option>
                <option value="30days">30 derniers jours</option>
                <option value="3months">3 derniers mois</option>
                <option value="6months">6 derniers mois</option>
                <option value="1year">Cette année</option>
              </select>
            </div>
            <button className="export-btn">
              <FiDownload />
              <span>Exporter PDF</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="analytics-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FiPieChart /> Vue d'ensemble
          </button>
          <button 
            className={`tab-btn ${activeTab === 'revenue' ? 'active' : ''}`}
            onClick={() => setActiveTab('revenue')}
          >
            <FiDollarSign /> Revenus
          </button>
          <button 
            className={`tab-btn ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            <FiUsers /> Patients
          </button>
          <button 
            className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            <FiActivity /> Activité
          </button>
        </div>

        {/* Summary Stats */}
        <div className="stats-summary">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : error ? (
            <div style={{ color: 'red', gridColumn: 'span 4' }}>{error}</div>
          ) : (
            <>
              <div className="summary-card">
                <div className="summary-icon green">
                  <FiUsers />
                </div>
                <div className="summary-info">
                  <span className="summary-value">{totalPatients}</span>
                  <span className="summary-label">Patients traités</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon purple">
                  <FiFileText />
                </div>
                <div className="summary-info">
                  <span className="summary-value">{avgAge}</span>
                  <span className="summary-label">Âge moyen</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon blue">
                  <FiPieChart />
                </div>
                <div className="summary-info">
                  <span className="summary-value">{commonDiagnoses.length}</span>
                  <span className="summary-label">Diagnostics courants</span>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon orange">
                  <FiTrendingUp />
                </div>
                <div className="summary-info">
                  <span className="summary-value">-</span>
                  <span className="summary-label">À compléter</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Charts Grid - Conditional rendering based on activeTab */}
        <div className="charts-grid">
          {isLoading ? (
            <>
              <SkeletonChart height="350px" />
              <SkeletonChart height="220px" />
            </>
          ) : (
            <>
              {/* Overview Tab: Show activity trend + diagnosis distribution + top treatments */}
              {activeTab === 'overview' && (
                <>
                  {/* Activity Trend */}
                  <div className="chart-card large">
                    <div className="chart-header">
                      <h3>Tendance d'Activité</h3>
                      <p className="chart-subtitle">Actes médicaux vs Rendez-vous</p>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={activityTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            background: '#fff', 
                            border: 'none', 
                            borderRadius: '10px', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                          }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="actes" 
                          stroke="#8B5CF6" 
                          strokeWidth={2}
                          dot={{ fill: '#8B5CF6', r: 4 }}
                          name="Actes"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="rdv" 
                          stroke="#F59E0B" 
                          strokeWidth={2}
                          dot={{ fill: '#F59E0B', r: 4 }}
                          name="RDV"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Diagnosis Distribution */}
                  <div className="chart-card">
                    <div className="chart-header">
                      <h3>Répartition des Diagnostics</h3>
                    </div>
                    <div className="pie-chart-container">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={commonDiagnoses.map((name, i) => ({ name, value: 1, color: diagnosisColors[i % diagnosisColors.length] }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {commonDiagnoses.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={diagnosisColors[index % diagnosisColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pie-legend">
                        {commonDiagnoses.map((name, index) => (
                          <div key={index} className="pie-legend-item">
                            <span className="pie-dot" style={{ background: diagnosisColors[index % diagnosisColors.length] }}></span>
                            <span className="pie-name">{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Top Treatments */}
                  <div className="chart-card">
                    <div className="chart-header">
                      <h3>Traitements les Plus Prescrits</h3>
                    </div>
                    <div className="treatments-list">
                      {topTreatmentsData.map((treatment, index) => (
                        <div key={index} className="treatment-item">
                          <div className="treatment-rank">{index + 1}</div>
                          <div className="treatment-info">
                            <span className="treatment-name">{treatment.name}</span>
                            <div className="treatment-bar">
                              <div 
                                className="treatment-progress" 
                                style={{ width: `${treatment.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="treatment-stats">
                            <span className="treatment-count">{treatment.count}</span>
                            <span className="treatment-percentage">{treatment.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Revenue Tab: Show revenue evolution chart */}
              {activeTab === 'revenue' && (
                <>
                  <div className="chart-card large">
                    <div className="chart-header">
                      <div>
                        <h3>Évolution des Revenus</h3>
                        <p className="chart-subtitle">Revenus et nombre de patients par mois</p>
                      </div>
                      <div className="chart-legend">
                        <span className="legend-item"><span className="dot blue"></span> Revenus (DH)</span>
                        <span className="legend-item"><span className="dot green"></span> Patients</span>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={monthlyRevenueData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                        <YAxis yAxisId="left" stroke="#9CA3AF" fontSize={12} />
                        <YAxis yAxisId="right" orientation="right" stroke="#9CA3AF" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            background: '#fff', 
                            border: 'none', 
                            borderRadius: '10px', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                          }} 
                        />
                        <Area 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#3B82F6" 
                          strokeWidth={2}
                          fill="url(#colorRevenue)"
                          name="Revenus"
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="patients" 
                          stroke="#10B981" 
                          strokeWidth={2}
                          dot={{ fill: '#10B981', r: 4 }}
                          name="Patients"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Top Treatments (also useful in revenue context) */}
                  <div className="chart-card">
                    <div className="chart-header">
                      <h3>Traitements les Plus Prescrits</h3>
                    </div>
                    <div className="treatments-list">
                      {topTreatmentsData.map((treatment, index) => (
                        <div key={index} className="treatment-item">
                          <div className="treatment-rank">{index + 1}</div>
                          <div className="treatment-info">
                            <span className="treatment-name">{treatment.name}</span>
                            <div className="treatment-bar">
                              <div 
                                className="treatment-progress" 
                                style={{ width: `${treatment.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="treatment-stats">
                            <span className="treatment-count">{treatment.count}</span>
                            <span className="treatment-percentage">{treatment.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Patients Tab: Show diagnosis distribution + demographics */}
              {activeTab === 'patients' && (
                <>
                  {/* Diagnosis Distribution */}
                  <div className="chart-card">
                    <div className="chart-header">
                      <h3>Répartition des Diagnostics</h3>
                    </div>
                    <div className="pie-chart-container">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={commonDiagnoses.map((name, i) => ({ name, value: 1, color: diagnosisColors[i % diagnosisColors.length] }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={80}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {commonDiagnoses.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={diagnosisColors[index % diagnosisColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pie-legend">
                        {commonDiagnoses.map((name, index) => (
                          <div key={index} className="pie-legend-item">
                            <span className="pie-dot" style={{ background: diagnosisColors[index % diagnosisColors.length] }}></span>
                            <span className="pie-name">{name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Age Distribution */}
                  <div className="chart-card">
                    <div className="chart-header">
                      <h3>Démographie des Patients</h3>
                      <p className="chart-subtitle">Distribution par âge et genre</p>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={ageDistributionData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                        <YAxis dataKey="age" type="category" stroke="#9CA3AF" fontSize={12} width={50} />
                        <Tooltip 
                          contentStyle={{ 
                            background: '#fff', 
                            border: 'none', 
                            borderRadius: '10px', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                          }} 
                        />
                        <Bar dataKey="male" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Hommes" />
                        <Bar dataKey="female" fill="#EC4899" radius={[0, 4, 4, 0]} name="Femmes" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}

              {/* Activity Tab: Show activity trend + weekly appointments */}
              {activeTab === 'activity' && (
                <>
                  {/* Activity Trend */}
                  <div className="chart-card large">
                    <div className="chart-header">
                      <h3>Tendance d'Activité</h3>
                      <p className="chart-subtitle">Actes médicaux vs Rendez-vous</p>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={activityTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            background: '#fff', 
                            border: 'none', 
                            borderRadius: '10px', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                          }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="actes" 
                          stroke="#8B5CF6" 
                          strokeWidth={2}
                          dot={{ fill: '#8B5CF6', r: 4 }}
                          name="Actes"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="rdv" 
                          stroke="#F59E0B" 
                          strokeWidth={2}
                          dot={{ fill: '#F59E0B', r: 4 }}
                          name="RDV"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Weekly Appointments */}
                  <div className="chart-card">
                    <div className="chart-header">
                      <h3>Rendez-vous par Jour</h3>
                      <p className="chart-subtitle">Cette semaine</p>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={weeklyAppointmentsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis dataKey="day" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            background: '#fff', 
                            border: 'none', 
                            borderRadius: '10px', 
                            boxShadow: '0 4px 20px rgba(0,0,0,0.1)' 
                          }} 
                        />
                        <Bar dataKey="consultations" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Consultations" />
                        <Bar dataKey="suivis" fill="#10B981" radius={[4, 4, 0, 0]} name="Suivis" />
                        <Bar dataKey="urgences" fill="#EF4444" radius={[4, 4, 0, 0]} name="Urgences" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Export Section */}
        <div className="export-section">
          <h3>Exporter les Rapports</h3>
          <div className="export-options">
            <button className="export-option">
              <FiFileText />
              <span>Rapport Mensuel</span>
              <small>PDF</small>
            </button>
            <button className="export-option">
              <FiBarChart2 />
              <span>Statistiques Patients</span>
              <small>Excel</small>
            </button>
            <button className="export-option">
              <FiDollarSign />
              <span>Rapport Financier</span>
              <small>PDF</small>
            </button>
            <button className="export-option">
              <FiActivity />
              <span>Activité Détaillée</span>
              <small>Excel</small>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AnalyticsPage;
