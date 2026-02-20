import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiUserPlus, FiSearch, FiFilter, FiMoreVertical, FiEdit2, FiTrash2, FiEye, FiPhone, FiMail, FiCalendar, FiX, FiAlertTriangle } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/cards/StatCard';
import { SkeletonCard, SkeletonTableRow, useToast } from '../../components/common';
import './PatientsPage.css';

// Insurance / Mutuelle types for dropdown
const INSURANCE_OPTIONS = [
  { value: '', label: 'Sélectionner une assurance' },
  { value: 'CNSS', label: 'CNSS' },
  { value: 'CNOPS', label: 'CNOPS' },
  { value: 'RAMED', label: 'RAMED' },
  { value: 'FAR', label: 'FAR' },
  { value: 'Assurance privée', label: 'Assurance privée' },
  { value: 'Sans assurance', label: 'Sans assurance' },
  { value: 'Autre', label: 'Autre' },
];

// Sample patients data
const initialPatientsData = [
  { id: 1, ipp: 'PAT-001', name: 'Mohamed Alami', age: 45, gender: 'Homme', phone: '+212 6 12 34 56 78', email: 'mohamed.alami@email.com', city: 'Casablanca', insurance: 'CNSS', diagnosis: 'Polyarthrite rhumatoïde', lastVisit: '2026-02-03', nextAppointment: '2026-02-15', status: 'Actif', avatar: '👨' },
  { id: 2, ipp: 'PAT-002', name: 'Fatima Benali', age: 38, gender: 'Femme', phone: '+212 6 23 45 67 89', email: 'fatima.benali@email.com', city: 'Rabat', insurance: 'CNOPS', diagnosis: 'Lupus érythémateux', lastVisit: '2026-02-01', nextAppointment: '2026-02-12', status: 'Actif', avatar: '👩' },
  { id: 3, ipp: 'PAT-003', name: 'Ahmed Tazi', age: 62, gender: 'Homme', phone: '+212 6 34 56 78 90', email: 'ahmed.tazi@email.com', city: 'Marrakech', insurance: 'RAMED', diagnosis: 'Arthrose', lastVisit: '2026-01-28', nextAppointment: '2026-02-20', status: 'Actif', avatar: '👨' },
  { id: 4, ipp: 'PAT-004', name: 'Khadija Mansouri', age: 55, gender: 'Femme', phone: '+212 6 45 67 89 01', email: 'khadija.mansouri@email.com', city: 'Fès', insurance: 'Assurance privée', diagnosis: 'Fibromyalgie', lastVisit: '2026-01-25', nextAppointment: null, status: 'En attente', avatar: '👩' },
  { id: 5, ipp: 'PAT-005', name: 'Youssef El Idrissi', age: 41, gender: 'Homme', phone: '+212 6 56 78 90 12', email: 'youssef.idrissi@email.com', city: 'Tanger', insurance: 'CNSS', diagnosis: 'Spondylarthrite', lastVisit: '2026-02-04', nextAppointment: '2026-02-18', status: 'Actif', avatar: '👨' },
  { id: 6, ipp: 'PAT-006', name: 'Salma Berrada', age: 29, gender: 'Femme', phone: '+212 6 67 89 01 23', email: 'salma.berrada@email.com', city: 'Casablanca', insurance: 'CNOPS', diagnosis: 'Arthrite juvénile', lastVisit: '2026-01-30', nextAppointment: '2026-02-10', status: 'Actif', avatar: '👩' },
];

function PatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState(initialPatientsData);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Tous');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Add patient form state
  const [addFormData, setAddFormData] = useState({
    ipp: '',
    name: '',
    birthDate: '',
    phone: '',
    email: '',
    city: '',
    gender: '',
    insurance: '',
    insuranceNumber: '',
    diagnosis: '',
    notes: '',
    notesAdmin: '',
    appointmentDate: '',
    appointmentTime: '',
    consultationType: '',
    duration: '60',
    appointmentReason: ''
  });

  const resetAddForm = () => {
    setAddFormData({
      ipp: '',
      name: '',
      birthDate: '',
      phone: '',
      email: '',
      city: '',
      gender: '',
      insurance: '',
      insuranceNumber: '',
      diagnosis: '',
      notes: '',
      notesAdmin: '',
      appointmentDate: '',
      appointmentTime: '',
      consultationType: '',
      duration: '60',
      appointmentReason: ''
    });
  };

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const filteredPatients = patients.filter(patient => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term ||
      (patient.ipp && patient.ipp.toLowerCase().includes(term)) ||
      (patient.name && patient.name.toLowerCase().includes(term)) ||
      (patient.phone && patient.phone.replace(/\s/g, '').includes(term.replace(/\s/g, ''))) ||
      (patient.diagnosis && patient.diagnosis.toLowerCase().includes(term)) ||
      (patient.city && patient.city.toLowerCase().includes(term));
    const matchesFilter = selectedFilter === 'Tous' || patient.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Handle Edit
  const handleEditClick = (patient) => {
    setSelectedPatient(patient);
    setEditFormData({
      ipp: patient.ipp || '',
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone || '',
      email: patient.email || '',
      city: patient.city || '',
      insurance: patient.insurance || '',
      insuranceNumber: patient.insuranceNumber || '',
      diagnosis: patient.diagnosis,
      status: patient.status,
      notes: patient.notes || '',
      notesAdmin: patient.notesAdmin || '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    setPatients(patients.map(p => 
      p.id === selectedPatient.id 
        ? { ...p, ...editFormData }
        : p
    ));
    setShowEditModal(false);
    setSelectedPatient(null);
    toast.success(`Patient ${editFormData.name} modifié avec succès`);
  };

  // Handle Delete
  const handleDeleteClick = (patient) => {
    setSelectedPatient(patient);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    const patientName = selectedPatient.name;
    setPatients(patients.filter(p => p.id !== selectedPatient.id));
    setShowDeleteModal(false);
    setSelectedPatient(null);
    toast.success(`Patient ${patientName} supprimé avec succès`);
  };

  // Handle Add Patient
  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!addFormData.name || !addFormData.birthDate || !addFormData.gender || !addFormData.diagnosis) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const newPatient = {
      id: Date.now(),
      ipp: addFormData.ipp || `PAT-${String(Date.now()).slice(-6)}`,
      name: addFormData.name,
      age: calculateAge(addFormData.birthDate),
      gender: addFormData.gender === 'homme' ? 'Homme' : 'Femme',
      phone: addFormData.phone || '-',
      email: addFormData.email || '-',
      city: addFormData.city || '',
      insurance: addFormData.insurance || '',
      insuranceNumber: addFormData.insuranceNumber || '',
      diagnosis: addFormData.diagnosis,
      notes: addFormData.notes || '',
      notesAdmin: addFormData.notesAdmin || '',
      lastVisit: null,
      nextAppointment: addFormData.appointmentDate || null,
      status: 'Actif',
      avatar: addFormData.gender === 'homme' ? '👨' : '👩'
    };

    setPatients([newPatient, ...patients]);
    setShowAddModal(false);
    resetAddForm();
    toast.success(`Patient ${addFormData.name} ajouté avec succès`);
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
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Search and Filter Bar */}
        <div className="search-filter-bar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Rechercher par IPP, nom, téléphone, diagnostic, ville..."
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
                  <th>IPP</th>
                  <th>Patient</th>
                  <th>Contact</th>
                  <th>Ville</th>
                  <th>Diagnostic</th>
                  <th>Dernière visite</th>
                  <th>Prochain RDV</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <>
                    <SkeletonTableRow columns={9} />
                    <SkeletonTableRow columns={9} />
                    <SkeletonTableRow columns={9} />
                    <SkeletonTableRow columns={9} />
                    <SkeletonTableRow columns={9} />
                  </>
                ) : (
                  filteredPatients.map(patient => (
                    <tr key={patient.id} className="patient-row" onClick={() => navigate(`/patients/${patient.id}`)}>
                      <td><span className="ipp-badge">{patient.ipp || '-'}</span></td>
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
                      <td>{patient.city || '-'}</td>
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
                        <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                          <button className="action-btn view" title="Voir le dossier" onClick={() => navigate(`/patients/${patient.id}`)}>
                            <FiEye />
                          </button>
                          <button className="action-btn edit" title="Modifier" onClick={() => handleEditClick(patient)}>
                            <FiEdit2 />
                          </button>
                          <button className="action-btn delete" title="Supprimer" onClick={() => handleDeleteClick(patient)}>
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="table-pagination">
            <span className="pagination-info">Affichage 1-{filteredPatients.length} sur {patients.length}</span>
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
          <div className="modal-overlay" onClick={() => { setShowAddModal(false); resetAddForm(); }}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nouveau Patient</h2>
                <button className="modal-close" onClick={() => { setShowAddModal(false); resetAddForm(); }}>×</button>
              </div>
              <form className="patient-form" onSubmit={handleAddSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>IPP</label>
                    <input 
                      type="text" 
                      name="ipp"
                      value={addFormData.ipp}
                      onChange={handleAddFormChange}
                      placeholder="Ex: PAT-001 (optionnel)" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Nom complet <span className="required">*</span></label>
                    <input 
                      type="text" 
                      name="name"
                      value={addFormData.name}
                      onChange={handleAddFormChange}
                      placeholder="Entrez le nom complet" 
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Date de naissance <span className="required">*</span></label>
                    <input 
                      type="date" 
                      name="birthDate"
                      value={addFormData.birthDate}
                      onChange={handleAddFormChange}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={addFormData.phone}
                      onChange={handleAddFormChange}
                      placeholder="+212 6 XX XX XX XX" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      name="email"
                      value={addFormData.email}
                      onChange={handleAddFormChange}
                      placeholder="email@example.com" 
                    />
                  </div>
                  <div className="form-group">
                    <label>Ville</label>
                    <input 
                      type="text" 
                      name="city"
                      value={addFormData.city}
                      onChange={handleAddFormChange}
                      placeholder="Ville" 
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Genre <span className="required">*</span></label>
                    <select 
                      name="gender"
                      value={addFormData.gender}
                      onChange={handleAddFormChange}
                      required
                    >
                      <option value="">Sélectionner</option>
                      <option value="homme">Homme</option>
                      <option value="femme">Femme</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Assurance / Mutuelle</label>
                    <select 
                      name="insurance"
                      value={addFormData.insurance}
                      onChange={handleAddFormChange}
                    >
                      {INSURANCE_OPTIONS.map(opt => (
                        <option key={opt.value || 'empty'} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>N° carte assurance</label>
                    <input 
                      type="text" 
                      name="insuranceNumber"
                      value={addFormData.insuranceNumber}
                      onChange={handleAddFormChange}
                      placeholder="N° carte" 
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Diagnostic initial <span className="required">*</span></label>
                    <select 
                      name="diagnosis"
                      value={addFormData.diagnosis}
                      onChange={handleAddFormChange}
                      required
                    >
                      <option value="">Sélectionner un diagnostic</option>
                      <option value="Polyarthrite rhumatoïde">Polyarthrite rhumatoïde</option>
                      <option value="Lupus érythémateux">Lupus érythémateux</option>
                      <option value="Arthrose">Arthrose</option>
                      <option value="Fibromyalgie">Fibromyalgie</option>
                      <option value="Spondylarthrite">Spondylarthrite</option>
                      <option value="Sclérodermie">Sclérodermie</option>
                      <option value="Goutte">Goutte</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Notes médicales</label>
                  <textarea 
                    name="notes"
                    value={addFormData.notes}
                    onChange={handleAddFormChange}
                    placeholder="Antécédents, allergies, observations..."
                  ></textarea>
                </div>
                <div className="form-group full-width">
                  <label>Notes administratives</label>
                  <textarea 
                    name="notesAdmin"
                    value={addFormData.notesAdmin}
                    onChange={handleAddFormChange}
                    placeholder="Notes internes, rappels admin..."
                  ></textarea>
                </div>

                {/* Appointment Section */}
                <div className="form-section-divider">
                  <span>Rendez-vous (optionnel)</span>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date du rendez-vous</label>
                    <input 
                      type="date" 
                      name="appointmentDate"
                      value={addFormData.appointmentDate}
                      onChange={handleAddFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Heure</label>
                    <select 
                      name="appointmentTime"
                      value={addFormData.appointmentTime}
                      onChange={handleAddFormChange}
                    >
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
                    <select 
                      name="consultationType"
                      value={addFormData.consultationType}
                      onChange={handleAddFormChange}
                    >
                      <option value="">Sélectionner le type</option>
                      <option value="premiere">Première consultation</option>
                      <option value="suivi">Consultation de suivi</option>
                      <option value="urgence">Consultation urgente</option>
                      <option value="controle">Contrôle</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Durée estimée</label>
                    <select 
                      name="duration"
                      value={addFormData.duration}
                      onChange={handleAddFormChange}
                    >
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">1 heure</option>
                      <option value="90">1h30</option>
                    </select>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Motif du rendez-vous</label>
                  <textarea 
                    name="appointmentReason"
                    value={addFormData.appointmentReason}
                    onChange={handleAddFormChange}
                    placeholder="Décrivez le motif de la consultation..."
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => { setShowAddModal(false); resetAddForm(); }}>
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

        {/* Edit Patient Modal */}
        {showEditModal && selectedPatient && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Modifier le patient</h2>
                <button className="modal-close" onClick={() => setShowEditModal(false)}>
                  <FiX />
                </button>
              </div>
              <form className="patient-form" onSubmit={handleEditSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>IPP</label>
                    <input type="text" value={editFormData.ipp} onChange={(e) => setEditFormData({...editFormData, ipp: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Nom complet</label>
                    <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Âge</label>
                    <input type="number" value={editFormData.age} onChange={(e) => setEditFormData({...editFormData, age: parseInt(e.target.value) || 0})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input type="tel" value={editFormData.phone} onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={editFormData.email} onChange={(e) => setEditFormData({...editFormData, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Ville</label>
                    <input type="text" value={editFormData.city} onChange={(e) => setEditFormData({...editFormData, city: e.target.value})} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Genre</label>
                    <select value={editFormData.gender} onChange={(e) => setEditFormData({...editFormData, gender: e.target.value})}>
                      <option value="Homme">Homme</option>
                      <option value="Femme">Femme</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Assurance / Mutuelle</label>
                    <select value={editFormData.insurance} onChange={(e) => setEditFormData({...editFormData, insurance: e.target.value})}>
                      {INSURANCE_OPTIONS.map(opt => (
                        <option key={opt.value || 'empty'} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Statut</label>
                    <select value={editFormData.status} onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}>
                      <option value="Actif">Actif</option>
                      <option value="En attente">En attente</option>
                      <option value="Inactif">Inactif</option>
                    </select>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Diagnostic</label>
                  <select value={editFormData.diagnosis} onChange={(e) => setEditFormData({...editFormData, diagnosis: e.target.value})}>
                    <option value="Polyarthrite rhumatoïde">Polyarthrite rhumatoïde</option>
                    <option value="Lupus érythémateux">Lupus érythémateux</option>
                    <option value="Arthrose">Arthrose</option>
                    <option value="Fibromyalgie">Fibromyalgie</option>
                    <option value="Spondylarthrite">Spondylarthrite</option>
                    <option value="Arthrite juvénile">Arthrite juvénile</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label>Notes médicales</label>
                  <textarea value={editFormData.notes} onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})} placeholder="Notes médicales" />
                </div>
                <div className="form-group full-width">
                  <label>Notes administratives</label>
                  <textarea value={editFormData.notesAdmin} onChange={(e) => setEditFormData({...editFormData, notesAdmin: e.target.value})} placeholder="Notes administratives" />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowEditModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-submit">
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedPatient && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
              <div className="delete-icon">
                <FiAlertTriangle />
              </div>
              <h2>Supprimer le patient</h2>
              <p>Êtes-vous sûr de vouloir supprimer <strong>{selectedPatient.name}</strong> ?</p>
              <p className="delete-warning">Cette action est irréversible. Toutes les données du patient seront définitivement supprimées.</p>
              <div className="delete-actions">
                <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
                  Annuler
                </button>
                <button className="btn-delete" onClick={handleDeleteConfirm}>
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default PatientsPage;
