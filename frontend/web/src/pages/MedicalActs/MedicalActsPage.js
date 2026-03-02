// ─── MedicalActsPage.jsx ──────────────────────────────────────────────────────
// Main page for managing medical acts (consultations, examinations, etc.)
// Provides: listing, filtering, creation, viewing details, and deletion.

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiFileText, FiPlus, FiSearch, FiEye, FiEdit2, FiDownload, FiPrinter,
  FiClipboard, FiActivity, FiUser, FiPaperclip, FiTrash2, FiChevronRight,
  FiChevronLeft, FiCheck, FiX, FiAlertCircle, FiDollarSign
} from 'react-icons/fi';

import { getMedicalActs, deleteMedicalAct, getPatients, createMedicalAct } from '../../api/api';
import Layout from '../../components/layout/Layout';
import { Breadcrumb, LoadingSpinner } from '../../components/common';
import { SkeletonCard } from '../../components/common/Skeleton';
import StatCard from '../../components/cards/StatCard';
import MedicalActForm from '../../components/MedicalActForm';
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
  diagnosis: '',
  treatment: '',
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
      date: act.date,
      diagnosis: act.diagnosis || '',
      treatment: act.treatment || '',
      status: act.status,
      amount: act.amount || '',
      doctor: act.doctor_id || '',
      // assigned_staff_ids is stored as a JSON string in the backend
      assignedStaff: act.assigned_staff_ids ? JSON.parse(act.assigned_staff_ids) : [],
      notes: act.notes || '',
      report: act.report || '',
      documents: act.documents || [],
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
      {/* Header: category badge + status badge */}
      <div className="act-card-header">
        <span className={`act-category ${getCategoryColor(act.category)}`}>{act.category}</span>
        <span className={`act-status ${act.status}`}>{statusLabel(act.status)}</span>
      </div>

      {/* Body: act type, patient info, diagnosis, treatment */}
      <div className="act-card-body">
        <h3 className="act-type">{act.type}</h3>
        <div className="act-patient">
          <FiUser />
          <span>{act.patientName}</span>
          <span className="patient-id">{act.patientIdDisplay ?? act.patientId}</span>
        </div>
        {act.diagnosis && <p className="act-diagnosis"><b>Diagnostic:</b> {act.diagnosis}</p>}
        {act.treatment && <p className="act-treatment"><b>Traitement:</b> {act.treatment}</p>}
      </div>

      {/* Footer: date, amount, and action buttons */}
      <div className="act-card-footer">
        <div className="act-info">
          <span className="act-date">{formatDate(act.date)}</span>
          {act.amount && <span className="act-amount">{act.amount} DH</span>}
        </div>
        <div className="act-actions">
          <button className="action-btn view" title="Voir détails" onClick={() => onView(act)}>
            <FiEye />
          </button>
          <button className="action-btn edit" title="Modifier" onClick={() => onEdit(act)}>
            <FiEdit2 />
          </button>
          {/* Delete button: triggers confirmation in parent via onDelete prop */}
          <button
            className="action-btn delete"
            title="Supprimer"
            onClick={() => onDelete(act.id)}
            style={{ color: 'red' }}
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
}

// AddActModal was replaced by MedicalActForm component

// ─── DetailModal ──────────────────────────────────────────────────────────────
// Read-only detail view for a selected medical act.
// Props:
//   act     – the selected medical act object
//   onClose – callback to close the modal

function DetailModal({ act, onClose }) {
  // State for attach document modal
  const [showAttachModal, setShowAttachModal] = useState(false);
  // State for edit modal
  const [showEditModal, setShowEditModal] = useState(false);

  // Paste your clinic logo base64 string below:
  // Use the full data URI for PNG images:
  const logoBase64 = "data:image/png;base64,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"; // <-- Paste your base64 string here
  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // PDF download handler (custom layout)
  const handleDownloadPDF = () => {
    import('jspdf').then(jsPDF => {
      const doc = new jsPDF.jsPDF();
      let y = 15;
      // Header
      // Add logo image if base64 string is provided
      if (logoBase64 && logoBase64 !== "data:image/png;base64,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") {
        doc.addImage(logoBase64, 'PNG', 150, 10, 40, 20); // Adjust position/size as needed
      }
      doc.setFontSize(16);
      doc.text('Centre Hospitalo-Universitaire Ibn Rochd', 10, y);
      y += 8;
      doc.setFontSize(12);
      doc.text('8, Rue Lahcen El Arjoun Casablanca 20100', 10, y);
      y += 6;
      doc.text('+212 (5) 22 48 01 10', 10, y);
      y += 6;
      doc.text('direction@chucasa.ma', 10, y);
      y += 10;
      doc.setFontSize(18);
      doc.text('Acte Médical', 10, y);
      doc.setFontSize(10);
      doc.text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')} `, 150, y);
      y += 10;

      // Patient Information
      doc.setFontSize(12);
      doc.text('Informations Patient', 10, y);
      y += 7;
      doc.setFontSize(10);
      doc.text(`Nom: ${act.patientName || '-'} `, 10, y);
      doc.text(`ID / IPP: ${act.patientIdDisplay ?? act.patientId ?? '-'} `, 80, y);
      y += 6;
      doc.text(`Date de naissance: ${act.patientDob || '-'} `, 10, y);
      doc.text(`Contact: ${act.patientContact || '-'} `, 80, y);
      y += 10;

      // Medical Act Details
      doc.setFontSize(12);
      doc.text('Détails de l’acte médical', 10, y);
      y += 7;
      doc.setFontSize(10);
      doc.text(`Type: ${act.type || '-'} `, 10, y);
      doc.text(`Catégorie: ${act.category || '-'} `, 80, y);
      y += 6;
      doc.text(`Date de l’acte: ${formatDate(act.date)} `, 10, y);
      doc.text(`Médecin(s) / Équipe: ${act.doctor || '-'}${act.assignedStaff?.length > 1 ? ` + ${act.assignedStaff.length - 1} autre(s)` : ''} `, 80, y);
      y += 6;
      doc.text(`Statut: ${statusLabel(act.status)} `, 10, y);
      doc.text(`Montant: ${act.amount || '-'} DH`, 80, y);
      y += 10;

      // Clinical Information
      doc.setFontSize(12);
      doc.text('Informations Cliniques', 10, y);
      y += 7;
      doc.setFontSize(10);
      doc.text(`Diagnostic: ${act.diagnosis || '-'} `, 10, y);
      y += 6;
      doc.text(`Traitement / Prescription: ${act.treatment || '-'} `, 10, y);
      y += 6;
      if (act.report) {
        doc.text('Rapport de consultation:', 10, y);
        y += 6;
        doc.text(`${act.report} `, 10, y, { maxWidth: 180 });
        y += 10;
      }
      doc.text(`Notes: ${act.notes || '-'} `, 10, y);
      y += 10;

      // Attached Documents
      doc.setFontSize(12);
      doc.text('Documents attachés', 10, y);
      y += 7;
      doc.setFontSize(10);
      if ((act.documents ?? []).length > 0) {
        act.documents.forEach((docItem) => {
          doc.text(`- ${docItem.filename} (${docItem.date})`, 10, y);
          y += 6;
        });
      } else {
        doc.text('Aucun document attaché.', 10, y);
        y += 6;
      }
      y += 10;

      // Footer
      doc.setFontSize(12);
      doc.text('Signature du médecin / équipe:', 10, y);
      y += 12;
      doc.setFontSize(10);
      doc.text('Centre Hospitalo-Universitaire Ibn Rochd', 10, y);
      y += 6;
      doc.text('8, Rue Lahcen El Arjoun Casablanca 20100', 10, y);
      y += 6;
      doc.text('+212 (5) 22 48 01 10', 10, y);
      y += 6;
      doc.text('direction@chucasa.ma', 10, y);
      y += 8;
      doc.setFontSize(8);
      doc.text('Confidentiel - Ce document est destiné à un usage médical uniquement. Toute diffusion non autorisée est interdite.', 10, y, { maxWidth: 180 });

      doc.save(`acte_${act.id}.pdf`);
    });
  };

  // Attach document handler
  const handleAttachDocument = (file) => {
    // TODO: Implement backend upload logic
    alert('Fonctionnalité d’attachement de document à implémenter.');
    setShowAttachModal(false);
  };

  // Edit handler
  const handleEdit = () => {
    setShowEditModal(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Détails de l'Acte</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="act-detail">
          {/* Category + status badges */}
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
            <p className="detail-value">{act.diagnosis}</p>
          </div>

          {/* Only show report section if a report exists */}
          {act.report && (
            <div className="detail-section">
              <h4>Rapport de consultation</h4>
              <p className="detail-value report">{act.report}</p>
            </div>
          )}

          <div className="detail-section">
            <h4>Traitement / Prescription</h4>
            <p className="detail-value">{act.treatment}</p>
          </div>

          <div className="detail-row">
            <div className="detail-section">
              <h4>Médecin(s) / Équipe</h4>
              <p className="detail-value">
                {act.doctor}
                {/* Show "+N other(s)" if multiple staff assigned */}
                {act.assignedStaff?.length > 1 && ` + ${act.assignedStaff.length - 1} autre(s)`}
              </p>
            </div>
            <div className="detail-section">
              <h4>Montant</h4>
              <p className="detail-value amount">{act.amount} DH</p>
            </div>
          </div>

          {/* Attached documents list */}
          <div className="detail-section documents-section">
            <h4><FiPaperclip /> Documents attachés</h4>
            <ul className="documents-list">
              {(act.documents ?? []).length > 0
                ? act.documents.map((doc) => (
                  <li key={doc.id}>
                    <a href="#view" className="doc-link">{doc.filename}</a>
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

          {/* Action buttons at the bottom of the detail view */}
          <div className="detail-actions">
            <button className="btn-secondary" onClick={handlePrint}><FiPrinter /> Imprimer</button>
            <button className="btn-secondary" onClick={handleDownloadPDF}><FiDownload /> Télécharger PDF</button>
            <button className="btn-primary" onClick={handleEdit}><FiEdit2 /> Modifier</button>
          </div>
        </div>

        {/* Attach Document Modal */}
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

        {/* Edit Modal (placeholder) */}
        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <MedicalActForm
                initialData={{
                  id: act.id,
                  patientId: act.patientId,
                  patientName: act.patientName,
                  date: act.date,
                  type: act.type,
                  category: act.category,
                  diagnosis: act.diagnosis,
                  report: act.report,
                  amount: act.amount,
                  status: act.status,
                  treatment: act.treatment,
                  notes: act.notes,
                }}
                isEdit={true}
                onSuccess={loadActs}
                onClose={() => setShowEditModal(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MedicalActsPage ──────────────────────────────────────────────────────────
// Root page component. Manages data loading, filtering, and modal state.

function MedicalActsPage() {
  // Allows reading/writing URL search params (e.g. ?type=Consultation)
  const [searchParams, setSearchParams] = useSearchParams();

  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);
  const [acts, setActs] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Controls visibility of the "add act" modal
  const [showAddModal, setShowAddModal] = useState(false);
  // Holds the act selected for the detail modal (null = closed)
  const [selectedAct, setSelectedAct] = useState(null);
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAct, setEditAct] = useState(null);

  // ── Data Loaders ────────────────────────────────────────────────────────────

  /** Loads (or reloads) the acts list from the API. */
  const loadActs = useCallback(async () => {
    try {
      const data = await medicalActsService.getActs();
      setActs(data);
    } catch (err) {
      setError(err.message ?? 'Erreur inconnue');
    }
  }, []);

  /** Runs once on mount: loads stats, patients, staff, and acts in parallel. */
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [statsData, patientsData, staffData] = await Promise.all([
          medicalActsService.getStats(),
          medicalActsService.getPatients(),
          medicalActsService.getStaff(),
        ]);
        setStats(statsData);
        setPatients(patientsData);
        setStaffOptions(staffData);
        await loadActs();
      } catch (err) {
        setError(err.message ?? 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [loadActs]);

  // ── Filtered Acts ────────────────────────────────────────────────────────────

  /**
   * Client-side filtering of acts by search term and selected type.
   * If a backend search endpoint becomes available, move this logic to loadActs.
   */
  const filteredActs = acts.filter((act) => {
    const matchesType = selectedType === 'Tous' || act.type === selectedType;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      act.patientName.toLowerCase().includes(term) ||
      act.diagnosis.toLowerCase().includes(term) ||
      String(act.patientId).toLowerCase().includes(term);
    return matchesType && matchesSearch;
  });

  // ── Handlers ─────────────────────────────────────────────────────────────────

  // State for delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState({ open: false, actId: null });

  /** Opens the delete confirmation dialog */
  const openDeleteDialog = (id) => {
    setDeleteDialog({ open: true, actId: id });
  };

  /** Handles confirmed delete */
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

  /** Cancels delete dialog */
  const cancelDeleteAct = () => {
    setDeleteDialog({ open: false, actId: null });
  };

  /** Creates a new act via the service layer, then refreshes the list. */
  const handleCreateAct = async (formData) => {
    await medicalActsService.createAct(formData);
    await loadActs();
  };

  /** Opens the edit modal with the selected act */
  const handleEditAct = (act) => {
    setEditAct(act);
    setShowEditModal(true);
  };

  /** Updates an act via the service layer, then refreshes the list. */
  const handleUpdateAct = async (formData) => {
    await medicalActsService.updateAct(formData);
    setShowEditModal(false);
    setEditAct(null);
    await loadActs();
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <Layout>
      <div className="medical-acts-page">

        {/* ── Page Header ── */}
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

        {/* ── Stats Row ── */}
        <div className="medical-acts-stats">
          {isLoading || !stats ? (
            // Show skeleton placeholders while data is loading
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

        {/* ── Search & Filter Bar ── */}
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

        {/* ── Error Banner ── */}
        {error && (
          <div className="error-banner">
            Erreur lors du chargement des données : {error}
          </div>
        )}

        {/* ── Acts Grid ── */}
        <div className="medical-acts-grid">
          {isLoading ? (
            // Skeleton cards while the acts are being fetched
            [1, 2, 3, 4].map((n) => (
              <div key={n} className="act-card skeleton-act-card"><SkeletonCard /></div>
            ))
          ) : filteredActs.length === 0 ? (
            <p className="empty-state">Aucun acte médical trouvé.</p>
          ) : (
            // Render one ActCard per act; pass delete handler via prop (no global hacks)
            filteredActs.map((act) => (
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

        {/* ── Delete Confirm Dialog ── */}
        <ConfirmDialog
          open={deleteDialog.open}
          title="Supprimer l'acte médical ?"
          description="Cette action est irréversible. Toutes les données liées à cet acte seront supprimées."
          onConfirm={confirmDeleteAct}
          onCancel={cancelDeleteAct}
        />

        {/* ── Detail Modal ── */}
        {selectedAct && (
          <DetailModal
            act={selectedAct}
            onClose={() => setSelectedAct(null)}
          />
        )}

        {/* ── Add Act Modal ── */}
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

        {/* ── Edit Act Modal ── */}
        {showEditModal && editAct && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <MedicalActForm
                initialData={{
                  id: editAct.id,
                  patientId: editAct.patientId,
                  patientName: editAct.patientName,
                  date: editAct.date,
                  type: editAct.type,
                  category: editAct.category,
                  diagnosis: editAct.diagnosis,
                  report: editAct.report,
                  amount: editAct.amount,
                  status: editAct.status,
                  treatment: editAct.treatment,
                  notes: editAct.notes,
                }}
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