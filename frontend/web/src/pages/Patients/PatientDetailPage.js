import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FiArrowLeft, FiEdit2, FiPhone, FiMail, FiMapPin, FiCalendar, 
  FiFileText, FiActivity, FiHeart, FiAlertCircle, FiClock,
  FiUser, FiClipboard, FiPlusCircle
} from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import { LoadingSpinner, Breadcrumb } from '../../components/common';
import './PatientDetailPage.css';

// Sample patient data (in real app, fetch from API)
const patientsDatabase = {
  1: {
    id: 1,
    name: 'Mohamed Alami',
    age: 45,
    gender: 'Homme',
    dateOfBirth: '1981-03-15',
    phone: '+212 6 12 34 56 78',
    email: 'mohamed.alami@email.com',
    address: '123 Rue Mohammed V, Casablanca',
    bloodType: 'A+',
    allergies: ['Pénicilline', 'Aspirine'],
    diagnosis: 'Polyarthrite rhumatoïde',
    status: 'Actif',
    avatar: '👨',
    insurance: 'CNSS - Carte N° 12345678',
    emergencyContact: {
      name: 'Fatima Alami',
      relation: 'Épouse',
      phone: '+212 6 98 76 54 32'
    },
    medicalHistory: [
      { date: '2024-03-10', event: 'Diagnostic initial - PR séropositive', doctor: 'Dr. Martin' },
      { date: '2024-06-15', event: 'Début traitement Méthotrexate 15mg', doctor: 'Dr. Martin' },
      { date: '2024-09-20', event: 'Ajustement posologie - 20mg', doctor: 'Dr. Martin' },
      { date: '2025-01-10', event: 'Ajout Prednisone 5mg', doctor: 'Dr. Martin' },
      { date: '2026-02-03', event: 'Consultation de suivi - DAS28: 3.2', doctor: 'Dr. Martin' },
    ],
    currentTreatments: [
      { name: 'Méthotrexate', dosage: '20mg/semaine', startDate: '2024-06-15' },
      { name: 'Acide folique', dosage: '5mg/semaine', startDate: '2024-06-15' },
      { name: 'Prednisone', dosage: '5mg/jour', startDate: '2025-01-10' },
    ],
    appointments: [
      { date: '2026-02-15', time: '10:30', type: 'Consultation de suivi', status: 'Confirmé' },
      { date: '2026-03-15', time: '09:00', type: 'Bilan sanguin', status: 'Planifié' },
    ],
    labResults: [
      { date: '2026-02-03', test: 'VS', value: '28 mm/h', status: 'Élevé' },
      { date: '2026-02-03', test: 'CRP', value: '12 mg/L', status: 'Élevé' },
      { date: '2026-02-03', test: 'NFS', value: 'Normal', status: 'Normal' },
      { date: '2026-02-03', test: 'Créatinine', value: '0.9 mg/dL', status: 'Normal' },
    ],
    notes: 'Patient coopératif, bonne observance du traitement. Surveiller fonction hépatique.',
  },
  2: {
    id: 2,
    name: 'Fatima Benali',
    age: 38,
    gender: 'Femme',
    dateOfBirth: '1988-07-22',
    phone: '+212 6 23 45 67 89',
    email: 'fatima.benali@email.com',
    address: '45 Avenue Hassan II, Rabat',
    bloodType: 'O+',
    allergies: ['Sulfamides'],
    diagnosis: 'Lupus érythémateux',
    status: 'Actif',
    avatar: '👩',
    insurance: 'CNOPS - Carte N° 87654321',
    emergencyContact: {
      name: 'Ahmed Benali',
      relation: 'Frère',
      phone: '+212 6 11 22 33 44'
    },
    medicalHistory: [
      { date: '2023-05-20', event: 'Diagnostic Lupus', doctor: 'Dr. Martin' },
      { date: '2023-06-01', event: 'Début Hydroxychloroquine', doctor: 'Dr. Martin' },
      { date: '2026-02-01', event: 'Consultation de suivi', doctor: 'Dr. Martin' },
    ],
    currentTreatments: [
      { name: 'Hydroxychloroquine', dosage: '400mg/jour', startDate: '2023-06-01' },
      { name: 'Prednisone', dosage: '10mg/jour', startDate: '2023-06-01' },
    ],
    appointments: [
      { date: '2026-02-12', time: '14:00', type: 'Consultation de suivi', status: 'Confirmé' },
    ],
    labResults: [
      { date: '2026-02-01', test: 'Anti-DNA', value: 'Positif', status: 'Anormal' },
      { date: '2026-02-01', test: 'C3/C4', value: 'Bas', status: 'Anormal' },
    ],
    notes: 'Patiente stable, éviter exposition solaire.',
  },
};

// Default patient template for IDs not in database
const defaultPatient = (id) => ({
  id,
  name: `Patient ${id}`,
  age: 40,
  gender: 'Non spécifié',
  dateOfBirth: '1986-01-01',
  phone: '+212 6 00 00 00 00',
  email: 'patient@email.com',
  address: 'Adresse non renseignée',
  bloodType: 'Non renseigné',
  allergies: [],
  diagnosis: 'En cours de diagnostic',
  status: 'Actif',
  avatar: '👤',
  insurance: 'Non renseigné',
  emergencyContact: { name: '-', relation: '-', phone: '-' },
  medicalHistory: [],
  currentTreatments: [],
  appointments: [],
  labResults: [],
  notes: 'Aucune note',
});

function PatientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      const patientData = patientsDatabase[id] || defaultPatient(id);
      setPatient(patientData);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [id]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="patient-detail-loading">
          <LoadingSpinner size="large" text="Chargement du dossier patient..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="patient-detail-page">
        {/* Breadcrumb Navigation */}
        <Breadcrumb 
          items={[
            { label: 'Patients', path: '/patients' },
            { label: patient.name }
          ]} 
        />

        {/* Header */}
        <div className="detail-header">
          <button className="back-btn" onClick={() => navigate('/patients')}>
            <FiArrowLeft /> Retour aux patients
          </button>
          <div className="header-actions">
            <button className="edit-btn">
              <FiEdit2 /> Modifier
            </button>
          </div>
        </div>

        {/* Patient Info Card */}
        <div className="patient-info-card">
          <div className="patient-main-info">
            <div className="patient-avatar-large">{patient.avatar}</div>
            <div className="patient-identity">
              <h1>{patient.name}</h1>
              <p className="patient-meta-info">
                {patient.age} ans • {patient.gender} • Né(e) le {formatDate(patient.dateOfBirth)}
              </p>
              <span className={`status-badge ${patient.status === 'Actif' ? 'active' : 'pending'}`}>
                {patient.status}
              </span>
            </div>
          </div>
          
          <div className="patient-quick-info">
            <div className="quick-info-item">
              <FiPhone />
              <span>{patient.phone}</span>
            </div>
            <div className="quick-info-item">
              <FiMail />
              <span>{patient.email}</span>
            </div>
            <div className="quick-info-item">
              <FiMapPin />
              <span>{patient.address}</span>
            </div>
          </div>

          <div className="patient-diagnosis-banner">
            <FiActivity />
            <span><strong>Diagnostic:</strong> {patient.diagnosis}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="detail-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FiUser /> Vue d'ensemble
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <FiClock /> Historique
          </button>
          <button 
            className={`tab-btn ${activeTab === 'treatments' ? 'active' : ''}`}
            onClick={() => setActiveTab('treatments')}
          >
            <FiHeart /> Traitements
          </button>
          <button 
            className={`tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
            onClick={() => setActiveTab('appointments')}
          >
            <FiCalendar /> Rendez-vous
          </button>
          <button 
            className={`tab-btn ${activeTab === 'labs' ? 'active' : ''}`}
            onClick={() => setActiveTab('labs')}
          >
            <FiClipboard /> Résultats
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-grid">
              {/* Personal Info */}
              <div className="info-card">
                <h3><FiUser /> Informations personnelles</h3>
                <div className="info-grid">
                  <div className="info-row">
                    <span className="info-label">Groupe sanguin</span>
                    <span className="info-value">{patient.bloodType}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Assurance</span>
                    <span className="info-value">{patient.insurance}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Allergies</span>
                    <span className="info-value allergies">
                      {patient.allergies.length > 0 
                        ? patient.allergies.map((a, i) => (
                            <span key={i} className="allergy-tag">{a}</span>
                          ))
                        : 'Aucune allergie connue'
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="info-card">
                <h3><FiAlertCircle /> Contact d'urgence</h3>
                <div className="info-grid">
                  <div className="info-row">
                    <span className="info-label">Nom</span>
                    <span className="info-value">{patient.emergencyContact.name}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Relation</span>
                    <span className="info-value">{patient.emergencyContact.relation}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Téléphone</span>
                    <span className="info-value">{patient.emergencyContact.phone}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="info-card full-width">
                <h3><FiFileText /> Notes médicales</h3>
                <p className="notes-content">{patient.notes}</p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-section">
              <div className="section-header">
                <h3>Historique médical</h3>
              </div>
              <div className="timeline">
                {patient.medicalHistory.map((event, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <span className="timeline-date">{formatDate(event.date)}</span>
                      <p className="timeline-event">{event.event}</p>
                      <span className="timeline-doctor">{event.doctor}</span>
                    </div>
                  </div>
                ))}
                {patient.medicalHistory.length === 0 && (
                  <p className="empty-state">Aucun historique enregistré</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'treatments' && (
            <div className="treatments-section">
              <div className="section-header">
                <h3>Traitements en cours</h3>
                <button className="add-btn"><FiPlusCircle /> Ajouter</button>
              </div>
              <div className="treatments-list">
                {patient.currentTreatments.map((treatment, index) => (
                  <div key={index} className="treatment-card">
                    <div className="treatment-icon">💊</div>
                    <div className="treatment-info">
                      <h4>{treatment.name}</h4>
                      <p className="treatment-dosage">{treatment.dosage}</p>
                      <span className="treatment-date">Depuis {formatDate(treatment.startDate)}</span>
                    </div>
                  </div>
                ))}
                {patient.currentTreatments.length === 0 && (
                  <p className="empty-state">Aucun traitement en cours</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'appointments' && (
            <div className="appointments-section">
              <div className="section-header">
                <h3>Rendez-vous</h3>
                <button className="add-btn"><FiPlusCircle /> Nouveau RDV</button>
              </div>
              <div className="appointments-list">
                {patient.appointments.map((apt, index) => (
                  <div key={index} className="appointment-card">
                    <div className="appointment-date">
                      <span className="day">{new Date(apt.date).getDate()}</span>
                      <span className="month">{new Date(apt.date).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                    </div>
                    <div className="appointment-info">
                      <h4>{apt.type}</h4>
                      <p>{apt.time}</p>
                    </div>
                    <span className={`appointment-status ${apt.status === 'Confirmé' ? 'confirmed' : 'planned'}`}>
                      {apt.status}
                    </span>
                  </div>
                ))}
                {patient.appointments.length === 0 && (
                  <p className="empty-state">Aucun rendez-vous planifié</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'labs' && (
            <div className="labs-section">
              <div className="section-header">
                <h3>Résultats de laboratoire</h3>
              </div>
              <table className="labs-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Analyse</th>
                    <th>Résultat</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {patient.labResults.map((result, index) => (
                    <tr key={index}>
                      <td>{formatDate(result.date)}</td>
                      <td>{result.test}</td>
                      <td>{result.value}</td>
                      <td>
                        <span className={`lab-status ${result.status === 'Normal' ? 'normal' : 'abnormal'}`}>
                          {result.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {patient.labResults.length === 0 && (
                <p className="empty-state">Aucun résultat disponible</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default PatientDetailPage;
