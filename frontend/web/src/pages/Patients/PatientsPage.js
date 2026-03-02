import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiUserPlus, FiSearch, FiFilter, FiMoreVertical, FiEdit2, FiTrash2, FiEye, FiPhone, FiMail, FiCalendar, FiX, FiAlertTriangle } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/cards/StatCard';
import { SkeletonCard, SkeletonTableRow, useToast } from '../../components/common';
import { getPatients, updatePatient, deletePatient } from '../../api/api';
import PatientForm from '../../components/PatientForm';
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

function mapApiPatientToUi(p) {
  return {
    ...p,
    insuranceNumber: p.insurance_number,
    notesAdmin: p.notes_admin,
    lastVisit: null,
    nextAppointment: null,
    avatar: (p.gender && p.gender.toLowerCase() === 'femme') ? '👩' : '👨',
  };
}

function PatientsPage() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Tous');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const totalPatients = Array.isArray(patients) ? patients.length : 0;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = Array.isArray(patients) ? patients.filter(p => {
    if (!p.createdAt && !p.date_of_birth) return false;
    const created = p.createdAt ? new Date(p.createdAt) : new Date(p.date_of_birth);
    return created >= startOfMonth && created <= now;
  }).length : 0;
  const todayStr = now.toISOString().slice(0, 10);
  const rdvToday = Array.isArray(patients) ? patients.filter(p => {
    if (!p.nextAppointment) return false;
    const appt = new Date(p.nextAppointment);
    return appt.toISOString().slice(0, 10) === todayStr;
  }).length : 0;
  const enAttente = Array.isArray(patients) ? patients.filter(p => p.status === 'En attente').length : 0;
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

  const loadPatients = async () => {
    try {
      const res = await getPatients();
      setPatients((res.data || []).map(mapApiPatientToUi));
    } catch {
      toast.error('Impossible de charger les patients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePatient(selectedPatient.id, {
        name: editFormData.name,
        age: editFormData.age,
        gender: editFormData.gender,
        phone: editFormData.phone || null,
        email: editFormData.email || null,
        city: editFormData.city || null,
        insurance: editFormData.insurance || null,
        insurance_number: editFormData.insuranceNumber || null,
        diagnosis: editFormData.diagnosis || null,
        status: editFormData.status || 'Actif',
        notes: editFormData.notes || null,
        notes_admin: editFormData.notesAdmin || null,
      });
      setPatients(patients.map(p => p.id === selectedPatient.id ? { ...p, ...editFormData } : p));
      setShowEditModal(false);
      setSelectedPatient(null);
      toast.success(`Patient ${editFormData.name} modifié avec succès`);
    } catch {
      toast.error('Erreur lors de la modification');
    }
  };

  // Handle Delete
  const handleDeleteClick = (patient) => {
    setSelectedPatient(patient);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    const patientName = selectedPatient.name;
    try {
      await deletePatient(selectedPatient.id);
      setPatients(patients.filter(p => p.id !== selectedPatient.id));
      setShowDeleteModal(false);
      setSelectedPatient(null);
      toast.success(`Patient ${patientName} supprimé avec succès`);
    } catch {
      toast.error('Erreur lors de la suppression');
    }
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

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    if (!addFormData.name || !addFormData.birthDate || !addFormData.gender || !addFormData.diagnosis) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const age = calculateAge(addFormData.birthDate);
    const genderLabel = addFormData.gender === 'homme' ? 'Homme' : 'Femme';
    try {
      const res = await createPatient({
        ipp: addFormData.ipp || null,
        name: addFormData.name,
        age,
        gender: genderLabel,
        date_of_birth: addFormData.birthDate || null,
        phone: addFormData.phone || null,
        email: addFormData.email || null,
        city: addFormData.city || null,
        insurance: addFormData.insurance || null,
        insurance_number: addFormData.insuranceNumber || null,
        diagnosis: addFormData.diagnosis,
        notes: addFormData.notes || null,
        notes_admin: addFormData.notesAdmin || null,
        status: 'Actif',
      });
      const created = mapApiPatientToUi(res.data);
      setPatients([created, ...patients]);
      setShowAddModal(false);
      resetAddForm();
      toast.success(`Patient ${addFormData.name} ajouté avec succès`);
    } catch {
      toast.error('Erreur lors de l\'ajout du patient');
    }
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
                percentage=""
                value={totalPatients}
                color="blue"
              />
              <StatCard
                icon={<FiUserPlus />}
                label="Nouveaux ce mois"
                percentage=""
                value={newThisMonth}
                color="green"
              />
              <StatCard
                icon={<FiCalendar />}
                label="RDV Aujourd'hui"
                percentage=""
                value={rdvToday}
                color="pink"
              />
              <StatCard
                icon={<FiUsers />}
                label="En attente"
                percentage=""
                value={enAttente}
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
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <PatientForm
                onSuccess={() => { loadPatients(); toast.success('Patient ajouté avec succès'); }}
                onClose={() => setShowAddModal(false)}
              />
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
                    <input type="text" value={editFormData.ipp} onChange={(e) => setEditFormData({ ...editFormData, ipp: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Nom complet</label>
                    <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Âge</label>
                    <input type="number" value={editFormData.age} onChange={(e) => setEditFormData({ ...editFormData, age: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Téléphone</label>
                    <input type="tel" value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Ville</label>
                    <input type="text" value={editFormData.city} onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Genre</label>
                    <select value={editFormData.gender} onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}>
                      <option value="Homme">Homme</option>
                      <option value="Femme">Femme</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Assurance / Mutuelle</label>
                    <select value={editFormData.insurance} onChange={(e) => setEditFormData({ ...editFormData, insurance: e.target.value })}>
                      {INSURANCE_OPTIONS.map(opt => (
                        <option key={opt.value || 'empty'} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Statut</label>
                    <select value={editFormData.status} onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}>
                      <option value="Actif">Actif</option>
                      <option value="En attente">En attente</option>
                      <option value="Inactif">Inactif</option>
                    </select>
                  </div>
                </div>
                <div className="form-group full-width">
                  <label>Diagnostic</label>
                  <select value={editFormData.diagnosis} onChange={(e) => setEditFormData({ ...editFormData, diagnosis: e.target.value })}>
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
                  <textarea value={editFormData.notes} onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })} placeholder="Notes médicales" />
                </div>
                <div className="form-group full-width">
                  <label>Notes administratives</label>
                  <textarea value={editFormData.notesAdmin} onChange={(e) => setEditFormData({ ...editFormData, notesAdmin: e.target.value })} placeholder="Notes administratives" />
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
