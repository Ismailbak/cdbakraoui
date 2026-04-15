// ─── MedicalActsPage.jsx ──────────────────────────────────────────────────────
// Main page for managing medical acts (consultations, examinations, etc.)
// Provides: listing, filtering, creation, viewing details, and deletion.

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiFileText, FiPlus, FiSearch, FiEye, FiEdit2, FiDownload, FiPrinter,
  FiClipboard, FiActivity, FiUser, FiPaperclip, FiTrash2, FiChevronRight,
  FiChevronLeft, FiCheck, FiX, FiAlertCircle, FiDollarSign, FiClock, FiTarget
} from 'react-icons/fi';

import { getMedicalActs, deleteMedicalAct, getPatients, createMedicalAct, getDoctors, getPatientResults } from '../../api/api';
import Layout from '../../components/layout/Layout';
import { Breadcrumb, LoadingSpinner } from '../../components/common';
import { SkeletonCard } from '../../components/common/Skeleton';
import StatCard from '../../components/cards/StatCard';
import MedicalActForm from './MedicalActForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import './MedicalActsPage.css';

// ─── Constants ────────────────────────────────────────────────────────────────

// Available act type filters shown in the filter bar
const ACT_TYPES = ['Tous', 'Consultation', 'Examen', 'Infiltration', 'Bilan', 'Suivi'];

// Maps category names to CSS class suffixes for color-coding
const CATEGORY_COLOR_MAP = {
  Rhumatologie: 'rheumatology',
  Imagerie: 'imaging',
  Intervention: 'intervention',
  Laboratoire: 'laboratory',
};

// Default/empty state for the "add act" form
const EMPTY_FORM = {
  patientId: '',
  date: new Date().toISOString().split('T')[0],
  type: 'Consultation',
  category: 'Rhumatologie',
  report: '',
  notes: '',
  status: 'completed',
  amount: '',
  assignedStaffIds: [],
};

// ─── Service Layer ────────────────────────────────────────────────────────────
// Abstracts all API calls so the component stays clean.

const medicalActsService = {
  /** Updates a medical act, mapping camelCase form fields to backend snake_case. */
  async updateAct(data) {
    const mapped = {
      patient_id: data.patientId,
      act_type: data.type,
      description: data.notes || '',
      report: data.report || '',
      act_date: data.date,
      notes: data.notes || '',
      status: data.status,
      doctor_id: data.doctorId || null,
      amount: data.amount || '',
      category: data.category || '',
    };
    await import('../../api/api').then(api => api.updateMedicalAct(data.id, mapped));
  },
  /** Returns summary stats from the backend. */
  async getStats() {
    const { getMedicalActsStats } = await import('../../api/api');
    const response = await getMedicalActsStats();
    return response.data;
  },

  /** Fetches all medical acts and maps backend snake_case fields to camelCase. */
  async getActs() {
    const response = await getMedicalActs();
    return response.data.map(act => ({
      id: act.id,
      patientName: act.patient_name || '',
      patientId: act.patient_id,
      type: act.act_type,
      category: act.category || '',
      date: act.act_date,
      description: act.description || '',
      status: act.status,
      amount: act.amount || '',
      doctor: act.doctor_id || '',
      // assigned_staff_ids is stored as a JSON string in the backend
      assignedStaff: act.assigned_staff_ids ? JSON.parse(act.assigned_staff_ids) : [],
      notes: act.notes || '',
      report: act.report || '',
      documents: act.documents || [],
      diagnoses: act.diagnoses || [],
      treatments: act.treatments || [],
    }));
  },

  /** Fetches the patient list for the dropdown in the form. */
  async getPatients() {
    const response = await getPatients();
    return response.data;
  },

  /** Returns available staff for assignment. Extend when endpoint is ready. */
  async getStaff() {
    return [];
  },

  /** Creates a new medical act, mapping camelCase form fields to backend snake_case. */
  async createAct(data) {
    const mapped = {
      patient_id: data.patientId,
      act_type: data.type,
      description: data.notes || '',
      report: data.report || '',
      date: data.date,
      notes: data.notes || '',
      status: data.status,
      doctor_id: data.doctorId || null,
      assigned_staff_ids: JSON.stringify(data.assignedStaffIds || []),
      amount: data.amount || '',
      category: data.category || '',
      diagnosis: data.diagnosis || '',
      treatment: data.treatment || '',
    };
    const response = await createMedicalAct(mapped);
    return response.data;
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Formats an ISO date string into a readable French locale date. */
const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

/** Returns the CSS class suffix for a given category name. */
const getCategoryColor = (category) => CATEGORY_COLOR_MAP[category] ?? 'default';

/** Returns a human-readable label for act status. */
const statusLabel = (status) => (status === 'completed' ? 'Terminé' : 'En cours');

// ─── ActCard ──────────────────────────────────────────────────────────────────
// Displays a summary card for a single medical act.
// Props:
//   act      – the medical act object
//   onView   – callback to open the detail modal
//   onDelete – callback to delete the act

function ActCard({ act, onView, onDelete, onEdit }) {
  return (
    <div className="act-card">
      <div className="act-card-header">
        <span className={`act-category ${getCategoryColor(act.category)}`}>{act.category}</span>
        <span className={`act-status ${act.status}`}>
          {act.status === 'completed' ? <FiCheck /> : <FiClock />}
          {statusLabel(act.status)}
        </span>
      </div>

      <div className="act-card-body">
        <h3 className="act-type">{act.type}</h3>
        <div className="act-patient">
          <FiUser />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span>{act.patientName}</span>
            <span className="patient-id">{act.patientIdDisplay ?? act.patientId}</span>
          </div>
        </div>
        {act.description && (
          <p className="act-diagnosis">
            <FiActivity size={14} /> {act.description}
          </p>
        )}
        {(act.diagnoses?.length > 0 || act.treatments?.length > 0) && (
          <p className="act-treatment">
            {act.diagnoses?.length > 0 && <span>{act.diagnoses.length} diagnostic(s)</span>}
            {act.treatments?.length > 0 && <span>{act.treatments.length} traitement(s)</span>}
          </p>
        )}
      </div>

      <div className="act-card-footer">
        <div className="act-info">
          <span className="act-date">{formatDate(act.date)}</span>
          {act.amount && <span className="act-amount">{act.amount}</span>}
        </div>
        <div className="act-actions">
          <button className="action-btn view" title="Voir détails" onClick={() => onView(act)}>
            <FiEye />
          </button>
          <button className="action-btn edit" title="Modifier" onClick={() => onEdit(act)}>
            <FiEdit2 />
          </button>
          <button
            className="action-btn delete"
            title="Supprimer"
            onClick={() => onDelete(act.id)}
            style={{ color: '#ef4444' }}
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DetailModal ──────────────────────────────────────────────────────────────
// Read-only detail view for a selected medical act.

function DetailModal({ act, doctors = [], onClose, onSuccess }) {
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [labResults, setLabResults] = useState([]);
  const [labResultsLoading, setLabResultsLoading] = useState(false);

  // Fetch lab results when modal opens or act changes
  useEffect(() => {
    if (!act?.patientId) return;
    const fetchLabResults = async () => {
      try {
        setLabResultsLoading(true);
        const response = await getPatientResults(act.patientId);
        setLabResults(response.data || []);
      } catch (err) {
        console.error('Erreur lors du chargement des résultats de labo:', err);
        setLabResults([]);
      } finally {
        setLabResultsLoading(false);
      }
    };
    fetchLabResults();
  }, [act?.patientId]);

  // Helper function to get doctor name from ID
  const getDoctorName = (doctorId) => {
    if (!doctorId) return 'Non assigné';
    const doctor = doctors.find(d => d.id === doctorId);
    return doctor ? `${doctor.first_name} ${doctor.last_name}` : `Médecin #${doctorId}`;
  };

  // Print handler - fetches professional PDF from backend and opens print dialog
  const handlePrint = async () => {
    try {
      const { getMedicalActPdf } = await import('../../api/api');
      const response = await getMedicalActPdf(act.id);
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
          window.URL.revokeObjectURL(url);
        };
      }
    } catch (err) {
      console.error('Print error:', err);
      alert('Erreur lors de la génération de l\'impression.');
    }
  };

  // PDF download handler
  const handleDownloadPDF = async () => {
    try {
      const { getMedicalActPdf } = await import('../../api/api');
      const response = await getMedicalActPdf(act.id);
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `acte_medical_${act.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      alert('Erreur lors du téléchargement du PDF.');
    }
  };

  // Attach document handler
  const handleAttachDocument = async (file) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { uploadMedicalActDocument } = await import('../../api/api');
      await uploadMedicalActDocument(act.id, formData);
      setShowAttachModal(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l’attachement du document.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Détails de l'Acte</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="act-detail">
          <div className="detail-header">
            <span className={`act-category ${getCategoryColor(act.category)}`}>{act.category}</span>
            <span className={`act-status ${act.status}`}>{statusLabel(act.status)}</span>
          </div>

          <div className="detail-section">
            <h4>Patient</h4>
            <p className="detail-value">
              {act.patientName}{' '}
              <span className="patient-id">{act.patientIdDisplay ?? act.patientId}</span>
            </p>
          </div>

          <div className="detail-row">
            <div className="detail-section">
              <h4>Type d'acte</h4>
              <p className="detail-value">{act.type}</p>
            </div>
            <div className="detail-section">
              <h4>Date</h4>
              <p className="detail-value">{formatDate(act.date)}</p>
            </div>
          </div>

          <div className="detail-section">
            <h4>Diagnostic</h4>
            <p className="detail-value">
              {act.diagnoses && act.diagnoses.length > 0
                ? act.diagnoses.map((d) => d.diagnosis_label).join(', ')
                : 'Aucun diagnostic'}
            </p>
          </div>

          {act.report && (
            <div className="detail-section">
              <h4>Rapport de consultation</h4>
              <p className="detail-value report">{act.report}</p>
            </div>
          )}

          <div className="detail-section">
            <h4>Traitement / Prescription</h4>
            <p className="detail-value">
              {act.treatments && act.treatments.length > 0
                ? act.treatments.map((t) => `${t.drug_name}${t.dosage ? ` (${t.dosage})` : ''}`).join(', ')
                : 'Aucun traitement'}
            </p>
          </div>

          <div className="detail-row">
            <div className="detail-section">
              <h4>Médecin(s) / Équipe</h4>
              <p className="detail-value">
                {getDoctorName(act.doctor)}
                {act.assignedStaff?.length > 1 && ` + ${act.assignedStaff.length - 1} autre(s)`}
              </p>
            </div>
            <div className="detail-section">
              <h4>Montant</h4>
              <p className="detail-value amount">{act.amount} DH</p>
            </div>
          </div>

          {labResults && labResults.length > 0 && (
            <div className="detail-section lab-results-section">
              <h4><FiTarget /> Résultats de laboratoire</h4>
              <div className="lab-results-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Analyse</th>
                      <th>Résultat</th>
                      <th>Unité</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labResults.map((result) => (
                      <tr key={result.id} className={result.is_abnormal ? 'abnormal' : ''}>
                        <td>{formatDate(result.result_date)}</td>
                        <td>{result.result_name}</td>
                        <td className="result-value">{result.result_value}</td>
                        <td>{result.result_unit || '-'}</td>
                        <td className="status-cell">
                          <span className={`status-badge ${result.is_abnormal ? 'abnormal' : 'normal'}`}>
                            {result.is_abnormal ? 'Anormal' : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="detail-section documents-section">
            <h4><FiPaperclip /> Documents attachés</h4>
            <ul className="documents-list">
              {(act.documents ?? []).length > 0
                ? act.documents.map((doc) => (
                  <li key={doc.id}>
                    <button type="button" className="link-btn doc-link" style={{ textAlign: 'left' }} onClick={async () => {
                      try {
                        const { downloadMedicalActDocument } = await import('../../api/api');
                        const response = await downloadMedicalActDocument(act.id, doc.id);
                        const url = window.URL.createObjectURL(new Blob([response.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', doc.filename);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      } catch (err) {
                        alert('Erreur lors du téléchargement');
                      }
                    }}>{doc.filename}</button>
                    <span className="doc-date">{doc.date}</span>
                  </li>
                ))
                : (
                  <li className="no-docs">
                    Aucun document.{' '}
                    <button type="button" className="link-btn" onClick={() => setShowAttachModal(true)}>Attacher un document</button>
                  </li>
                )}
            </ul>
          </div>

          <div className="detail-actions">
            <button className="btn-secondary" onClick={handlePrint}><FiPrinter /> Imprimer</button>
            <button className="btn-secondary" onClick={handleDownloadPDF}><FiDownload /> Télécharger PDF</button>
          </div>
        </div>

        {showAttachModal && (
          <div className="modal-overlay" onClick={() => setShowAttachModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Attacher un document</h2>
                <button className="modal-close" onClick={() => setShowAttachModal(false)}>×</button>
              </div>
              <form onSubmit={e => { e.preventDefault(); handleAttachDocument(e.target.file.files[0]); }}>
                <input type="file" name="file" required />
                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowAttachModal(false)}>Annuler</button>
                  <button type="submit" className="btn-submit">Attacher</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MedicalActsPage ──────────────────────────────────────────────────────────

function MedicalActsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);
  const [acts, setActs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAct, setSelectedAct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAct, setEditAct] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  const loadActs = useCallback(async () => {
    try {
      const data = await medicalActsService.getActs();
      setActs(data);
    } catch (err) {
      setError(err.message ?? 'Erreur inconnue');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [statsData, patientsData, staffData, doctorsData] = await Promise.all([
          medicalActsService.getStats(),
          medicalActsService.getPatients(),
          medicalActsService.getStaff(),
          getDoctors(),
        ]);
        setStats(statsData);
        setPatients(patientsData);
        setStaffOptions(staffData);
        setDoctors(doctorsData.data || []);
        await loadActs();
      } catch (err) {
        setError(err.message ?? 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [loadActs]);

  const filteredActs = acts.filter((act) => {
    const matchesType = selectedType === 'Tous' || act.type === selectedType;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      (act.patientName && act.patientName.toLowerCase().includes(term)) ||
      (act.description && act.description.toLowerCase().includes(term)) ||
      String(act.patientId).toLowerCase().includes(term);
    return matchesType && matchesSearch;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredActs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedActs = filteredActs.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedType, searchTerm]);

  const [deleteDialog, setDeleteDialog] = useState({ open: false, actId: null });

  const openDeleteDialog = (id) => {
    setDeleteDialog({ open: true, actId: id });
  };

  const confirmDeleteAct = async () => {
    const id = deleteDialog.actId;
    setDeleteDialog({ open: false, actId: null });
    try {
      await deleteMedicalAct(id);
      await loadActs();
    } catch (err) {
      setError(err.message ?? 'Erreur lors de la suppression');
    }
  };

  const cancelDeleteAct = () => {
    setDeleteDialog({ open: false, actId: null });
  };

  const handleEditAct = (act) => {
    // Ensure proper data structure for the form
    const formData = {
      ...act,
      // Ensure diagnosis field exists as a string
      diagnosis: act.diagnosis 
        ? String(act.diagnosis).trim()
        : (act.diagnoses && Array.isArray(act.diagnoses) && act.diagnoses.length > 0
          ? act.diagnoses.map(d => d.diagnosis_label || d.label || '').filter(d => d).join(', ')
          : ''),
      // Ensure treatment field exists as a string
      treatment: act.treatment
        ? String(act.treatment).trim()
        : (act.treatments && Array.isArray(act.treatments) && act.treatments.length > 0
          ? act.treatments.map(t => t.drug_name || t.name || '').filter(t => t).join(', ')
          : ''),
      // Ensure amount is set correctly
      amount: act.amount || '',
      // Map backend fields to form fields
      patientId: act.patientId,
      patientName: act.patientName,
      doctorId: act.doctor || '',
      date: act.date,
      actType: act.type || 'Consultation',
      category: act.category || 'rheumatology',
      report: act.report || '',
      status: act.status || 'pending',
      notes: act.notes || '',
    };
    
    setEditAct(formData);
    setShowEditModal(true);
  };

  return (
    <Layout>
      <div className="medical-acts-page">
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Actes Médicaux</h1>
            <p className="page-subtitle">Gérez les actes et prescriptions médicales</p>
          </div>
          <button className="add-act-btn" onClick={() => setShowAddModal(true)}>
            <FiPlus />
            <span>Nouvel Acte</span>
          </button>
        </div>

        <div className="medical-acts-stats">
          {isLoading || !stats ? (
            <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
          ) : (
            <>
              <StatCard icon={<FiFileText />} label="Total Actes" percentage="Ce mois" value={stats.total} color="blue" />
              <StatCard icon={<FiClipboard />} label="Consultations" percentage="Ce mois" value={stats.consultations} color="green" />
              <StatCard icon={<FiActivity />} label="Interventions" percentage="Ce mois" value={stats.interventions} color="pink" />
              <StatCard icon={<FiUser />} label="Patients traités" percentage="Ce mois" value={stats.treatedPatients} color="yellow" />
            </>
          )}
        </div>

        <div className="search-filter-bar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher par patient, ID ou diagnostic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            {ACT_TYPES.map((type) => (
              <button
                key={type}
                className={`filter-btn ${selectedType === type ? 'active' : ''}`}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="error-banner">
            Erreur lors du chargement des données : {error}
          </div>
        )}

        <div className="medical-acts-grid">
          {isLoading ? (
            [1, 2, 3, 4].map((n) => (
              <div key={n} className="act-card skeleton-act-card"><SkeletonCard /></div>
            ))
          ) : filteredActs.length === 0 ? (
            <p className="empty-state">Aucun acte médical trouvé.</p>
          ) : (
            paginatedActs.map((act) => (
              <ActCard
                key={act.id}
                act={act}
                onView={setSelectedAct}
                onDelete={openDeleteDialog}
                onEdit={handleEditAct}
              />
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {filteredActs.length > ITEMS_PER_PAGE && (
          <div className="pagination-container">
            <button
              className="pagination-btn prev-btn"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              ←
            </button>
            <div className="pagination-pages">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`pagination-page ${currentPage === i + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              className="pagination-btn next-btn"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              →
            </button>
          </div>
        )}

        <ConfirmDialog
          open={deleteDialog.open}
          title="Supprimer l'acte médical ?"
          description="Cette action est irréversible. Toutes les données liées à cet acte seront supprimées."
          onConfirm={confirmDeleteAct}
          onCancel={cancelDeleteAct}
        />

        {selectedAct && (
          <DetailModal
            act={selectedAct}
            doctors={doctors}
            onClose={() => setSelectedAct(null)}
            onSuccess={async () => {
              await loadActs();
              setSelectedAct(null);
            }}
          />
        )}

        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <MedicalActForm
                onSuccess={() => {
                  setShowAddModal(false);
                  loadActs();
                }}
                onClose={() => setShowAddModal(false)}
              />
            </div>
          </div>
        )}

        {showEditModal && editAct && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <MedicalActForm
                initialData={editAct}
                isEdit={true}
                onSuccess={() => {
                  setShowEditModal(false);
                  setEditAct(null);
                  loadActs();
                }}
                onClose={() => {
                  setShowEditModal(false);
                  setEditAct(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default MedicalActsPage;