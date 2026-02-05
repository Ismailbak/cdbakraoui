import React, { useState } from 'react';
import { FiUsers, FiUserPlus, FiSearch, FiFilter, FiMoreVertical, FiEdit2, FiTrash2, FiEye, FiPhone, FiMail, FiCalendar } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/cards/StatCard';
import './PatientsPage.css';

// Sample patients data
const patientsData = [
  {
    id: 1,
    name: 'Mohamed Alami',
    age: 45,
    gender: 'Homme',
    phone: '+212 6 12 34 56 78',
    email: 'mohamed.alami@email.com',
    diagnosis: 'Polyarthrite rhumatoïde',
    lastVisit: '2026-02-03',
    nextAppointment: '2026-02-15',
    status: 'Actif',
    avatar: '👨'
  },
  {
    id: 2,
    name: 'Fatima Benali',
    age: 38,
    gender: 'Femme',
    phone: '+212 6 23 45 67 89',
    email: 'fatima.benali@email.com',
    diagnosis: 'Lupus érythémateux',
    lastVisit: '2026-02-01',
    nextAppointment: '2026-02-12',
    status: 'Actif',
    avatar: '👩'
  },
  {
    id: 3,
    name: 'Ahmed Tazi',
    age: 62,
    gender: 'Homme',
    phone: '+212 6 34 56 78 90',
    email: 'ahmed.tazi@email.com',
    diagnosis: 'Arthrose',
    lastVisit: '2026-01-28',
    nextAppointment: '2026-02-20',
    status: 'Actif',
    avatar: '👨'
  },
  {
    id: 4,
    name: 'Khadija Mansouri',
    age: 55,
    gender: 'Femme',
    phone: '+212 6 45 67 89 01',
    email: 'khadija.mansouri@email.com',
    diagnosis: 'Fibromyalgie',
    lastVisit: '2026-01-25',
    nextAppointment: null,
    status: 'En attente',
    avatar: '👩'
  },
  {
    id: 5,
    name: 'Youssef El Idrissi',
    age: 41,
    gender: 'Homme',
    phone: '+212 6 56 78 90 12',
    email: 'youssef.idrissi@email.com',
    diagnosis: 'Spondylarthrite',
    lastVisit: '2026-02-04',
    nextAppointment: '2026-02-18',
    status: 'Actif',
    avatar: '👨'
  },
  {
    id: 6,
    name: 'Salma Berrada',
    age: 29,
    gender: 'Femme',
    phone: '+212 6 67 89 01 23',
    email: 'salma.berrada@email.com',
    diagnosis: 'Arthrite juvénile',
    lastVisit: '2026-01-30',
    nextAppointment: '2026-02-10',
    status: 'Actif',
    avatar: '👩'
  },
];

function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Tous');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredPatients = patientsData.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'Tous' || patient.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <Layout>
      <div className="patients-page">
        {/* Header Section */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Patients</h1>
            <p className="page-subtitle">Gérez vos patients et leurs dossiers médicaux</p>
          </div>
          <button className="add-patient-btn" onClick={() => setShowAddModal(true)}>
            <FiUserPlus />
            <span>Nouveau Patient</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="patients-stats">
          <StatCard 
            icon={<FiUsers />}
            label="Total Patients"
            percentage="Tous"
            value="245"
            color="blue"
          />
          <StatCard 
            icon={<FiUserPlus />}
            label="Nouveaux ce mois"
            percentage="+12%"
            value="18"
            color="green"
          />
          <StatCard 
            icon={<FiCalendar />}
            label="RDV Aujourd'hui"
            percentage="Planifiés"
            value="8"
            color="pink"
          />
          <StatCard 
            icon={<FiUsers />}
            label="En attente"
            percentage="À revoir"
            value="5"
            color="yellow"
          />
        </div>

        {/* Search and Filter Bar */}
        <div className="search-filter-bar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Rechercher un patient par nom ou diagnostic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            {['Tous', 'Actif', 'En attente'].map(filter => (
              <button 
                key={filter}
                className={`filter-btn ${selectedFilter === filter ? 'active' : ''}`}
                onClick={() => setSelectedFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Patients Table */}
        <div className="patients-table-card">
          <div className="table-header">
            <h3>Liste des Patients</h3>
            <span className="patient-count">{filteredPatients.length} patients</span>
          </div>
          
          <div className="table-wrapper">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Contact</th>
                  <th>Diagnostic</th>
                  <th>Dernière visite</th>
                  <th>Prochain RDV</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(patient => (
                  <tr key={patient.id}>
                    <td>
                      <div className="patient-info">
                        <div className="patient-avatar">{patient.avatar}</div>
                        <div className="patient-details">
                          <span className="patient-name">{patient.name}</span>
                          <span className="patient-meta">{patient.age} ans • {patient.gender}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <span className="contact-item"><FiPhone /> {patient.phone}</span>
                        <span className="contact-item"><FiMail /> {patient.email}</span>
                      </div>
                    </td>
                    <td>
                      <span className="diagnosis-badge">{patient.diagnosis}</span>
                    </td>
                    <td>{formatDate(patient.lastVisit)}</td>
                    <td>
                      {patient.nextAppointment ? (
                        <span className="next-appointment">{formatDate(patient.nextAppointment)}</span>
                      ) : (
                        <span className="no-appointment">Non planifié</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge ${patient.status === 'Actif' ? 'active' : 'pending'}`}>
                        {patient.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn view" title="Voir le dossier">
                          <FiEye />
                        </button>
                        <button className="action-btn edit" title="Modifier">
                          <FiEdit2 />
                        </button>
                        <button className="action-btn delete" title="Supprimer">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="table-pagination">
            <span className="pagination-info">Affichage 1-{filteredPatients.length} sur {patientsData.length}</span>
            <div className="pagination-buttons">
              <button className="pagination-btn" disabled>← Précédent</button>
              <button className="pagination-btn active">1</button>
              <button className="pagination-btn">2</button>
              <button className="pagination-btn">3</button>
              <button className="pagination-btn">Suivant →</button>
            </div>
          </div>
        </div>

        {/* Add Patient Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nouveau Patient</h2>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <form className="patient-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Nom complet</label>
                    <input type="text" placeholder="Entrez le nom complet" />
                  </div>
                  <div className="form-group">
                    <label>Date de naissance</label>
                    <input type="date" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input type="tel" placeholder="+212 6 XX XX XX XX" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" placeholder="email@example.com" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Genre</label>
                    <select>
                      <option value="">Sélectionner</option>
                      <option value="homme">Homme</option>
                      <option value="femme">Femme</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Diagnostic initial</label>
                    <select>
                      <option value="">Sélectionner un diagnostic</option>
                      <option value="polyarthrite">Polyarthrite rhumatoïde</option>
                      <option value="lupus">Lupus érythémateux</option>
                      <option value="arthrose">Arthrose</option>
                      <option value="fibromyalgie">Fibromyalgie</option>
                      <option value="spondylarthrite">Spondylarthrite</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Notes médicales</label>
                  <textarea placeholder="Antécédents, allergies, observations..."></textarea>
                </div>

                {/* Appointment Section */}
                <div className="form-section-divider">
                  <span>Rendez-vous</span>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date du rendez-vous</label>
                    <input type="date" />
                  </div>
                  <div className="form-group">
                    <label>Heure</label>
                    <select>
                      <option value="">Sélectionner l'heure</option>
                      <option value="08:00">08:00</option>
                      <option value="08:30">08:30</option>
                      <option value="09:00">09:00</option>
                      <option value="09:30">09:30</option>
                      <option value="10:00">10:00</option>
                      <option value="10:30">10:30</option>
                      <option value="11:00">11:00</option>
                      <option value="11:30">11:30</option>
                      <option value="14:00">14:00</option>
                      <option value="14:30">14:30</option>
                      <option value="15:00">15:00</option>
                      <option value="15:30">15:30</option>
                      <option value="16:00">16:00</option>
                      <option value="16:30">16:30</option>
                      <option value="17:00">17:00</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Type de consultation</label>
                    <select>
                      <option value="">Sélectionner le type</option>
                      <option value="premiere">Première consultation</option>
                      <option value="suivi">Consultation de suivi</option>
                      <option value="urgence">Consultation urgente</option>
                      <option value="controle">Contrôle</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Durée estimée</label>
                    <select>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60" selected>1 heure</option>
                      <option value="90">1h30</option>
                    </select>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Motif du rendez-vous</label>
                  <textarea placeholder="Décrivez le motif de la consultation..."></textarea>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-submit">
                    Ajouter le patient
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default PatientsPage;
