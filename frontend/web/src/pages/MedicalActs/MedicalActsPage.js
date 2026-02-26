// ─── MedicalActsPage.jsx ──────────────────────────────────────────────────────
// Main page for managing medical acts (consultations, examinations, etc.)
// Provides: listing, filtering, creation, viewing details, and deletion.

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiFileText, FiPlus, FiSearch, FiEye, FiEdit2,
  FiDownload, FiPrinter, FiClipboard, FiActivity,
  FiUser, FiPaperclip, FiTrash2,
} from 'react-icons/fi';

import {
  getMedicalActs,
  createMedicalAct,
  getPatients,
  deleteMedicalAct,
} from '../../api/api';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/cards/StatCard';
import { SkeletonCard } from '../../components/common';
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

function ActCard({ act, onView, onDelete }) {
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
          <button className="action-btn edit" title="Modifier">
            <FiEdit2 />
          </button>
          <button className="action-btn print" title="Imprimer">
            <FiPrinter />
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

// ─── AddActModal ──────────────────────────────────────────────────────────────
// Modal form for creating a new medical act.
// Props:
//   onClose      – closes the modal without saving
//   onSubmit     – async callback that receives the form data
//   patients     – list of patient objects { id, name, ipp }
//   staffOptions – list of staff objects { id, name }

function AddActModal({ onClose, onSubmit, patients, staffOptions }) {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  /** Generic handler: returns an onChange function that updates a specific field. */
  const set = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  /** Toggles a staff member's ID in the assignedStaffIds array. */
  const toggleStaff = (id) =>
    setFormData((prev) => ({
      ...prev,
      assignedStaffIds: prev.assignedStaffIds.includes(id)
        ? prev.assignedStaffIds.filter((s) => s !== id)
        : [...prev.assignedStaffIds, id],
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* Stop propagation so clicking inside the modal doesn't close it */}
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Nouvel Acte Médical</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form className="act-form" onSubmit={handleSubmit}>
          {/* ── Section 1: Patient Info ── */}
          <div className="form-section">
            <h3 className="section-title">Informations Patient</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Patient</label>
                <select value={formData.patientId} onChange={set('patientId')} required>
                  <option value="">Sélectionner un patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.ipp})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Date de l'acte</label>
                <input type="date" value={formData.date} onChange={set('date')} required />
              </div>
            </div>
          </div>

          {/* ── Section 2: Act Details ── */}
          <div className="form-section">
            <h3 className="section-title">Détails de l'Acte</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Type d'acte</label>
                <select value={formData.type} onChange={set('type')}>
                  {ACT_TYPES.filter((t) => t !== 'Tous').map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Catégorie</label>
                <select value={formData.category} onChange={set('category')}>
                  {Object.keys(CATEGORY_COLOR_MAP).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Rapport de consultation</label>
              <textarea
                value={formData.report}
                onChange={set('report')}
                placeholder="Rapport structuré de la consultation..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Diagnostic</label>
              <input
                type="text"
                value={formData.diagnosis}
                onChange={set('diagnosis')}
                placeholder="Entrez le diagnostic..."
                required
              />
            </div>

            <div className="form-group">
              <label>Traitement / Prescription</label>
              <textarea
                value={formData.treatment}
                onChange={set('treatment')}
                placeholder="Décrivez le traitement ou la prescription..."
              />
            </div>

            {/* Staff multi-select: renders a checkbox per staff member */}
            <div className="form-group">
              <label>Médecin(s) / Équipe assignée</label>
              <div className="staff-multi-select">
                {staffOptions.map((s) => (
                  <label key={s.id} className="staff-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.assignedStaffIds.includes(s.id)}
                      onChange={() => toggleStaff(s.id)}
                    />
                    <span>{s.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* ── Section 3: Billing ── */}
          <div className="form-section">
            <h3 className="section-title">Facturation</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Montant (DH)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={set('amount')}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Statut</label>
                <select value={formData.status} onChange={set('status')}>
                  <option value="completed">Terminé</option>
                  <option value="pending">En cours</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Notes additionnelles</label>
            <textarea
              value={formData.notes}
              onChange={set('notes')}
              placeholder="Notes ou observations supplémentaires..."
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Enregistrement...' : "Créer l'acte médical"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── DetailModal ──────────────────────────────────────────────────────────────
// Read-only detail view for a selected medical act.
// Props:
//   act     – the selected medical act object
//   onClose – callback to close the modal

function DetailModal({ act, onClose }) {
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
                    <button type="button" className="link-btn">Attacher un document</button>
                  </li>
                )}
            </ul>
          </div>

          {/* Action buttons at the bottom of the detail view */}
          <div className="detail-actions">
            <button className="btn-secondary"><FiPrinter /> Imprimer</button>
            <button className="btn-secondary"><FiDownload /> Télécharger PDF</button>
            <button className="btn-primary"><FiEdit2 /> Modifier</button>
          </div>
        </div>
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

  /** Confirms and deletes a medical act, then refreshes the list. */
  const handleDeleteAct = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet acte médical ?')) {
      try {
        await deleteMedicalAct(id);
        await loadActs();
      } catch (err) {
        setError(err.message ?? 'Erreur lors de la suppression');
      }
    }
  };

  /** Creates a new act via the service layer, then refreshes the list. */
  const handleCreateAct = async (formData) => {
    await medicalActsService.createAct(formData);
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
              <StatCard icon={<FiFileText />}  label="Total Actes"      percentage="Ce mois" value={stats.total}           color="blue"   />
              <StatCard icon={<FiClipboard />} label="Consultations"    percentage="Ce mois" value={stats.consultations}   color="green"  />
              <StatCard icon={<FiActivity />}  label="Interventions"    percentage="Ce mois" value={stats.interventions}   color="pink"   />
              <StatCard icon={<FiUser />}      label="Patients traités" percentage="Ce mois" value={stats.treatedPatients} color="yellow" />
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
                onDelete={handleDeleteAct}
              />
            ))
          )}
        </div>

        {/* ── Add Act Modal ── */}
        {showAddModal && (
          <AddActModal
            onClose={() => setShowAddModal(false)}
            onSubmit={handleCreateAct}
            patients={patients}
            staffOptions={staffOptions}
          />
        )}

        {/* ── Detail Modal ── */}
        {selectedAct && (
          <DetailModal act={selectedAct} onClose={() => setSelectedAct(null)} />
        )}
      </div>
    </Layout>
  );
}

export default MedicalActsPage;