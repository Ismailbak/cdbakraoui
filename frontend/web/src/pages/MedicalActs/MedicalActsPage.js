import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFileText, FiPlus, FiSearch, FiFilter, FiEye, FiEdit2, FiTrash2, FiDownload, FiPrinter, FiClipboard, FiActivity, FiUser, FiPaperclip } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/cards/StatCard';
import { SkeletonCard, SkeletonTableRow } from '../../components/common';
import './MedicalActsPage.css';

const STAFF_OPTIONS = [
  { id: 1, name: 'Dr. Martin' },
  { id: 2, name: 'Dr. Bennani' },
  { id: 3, name: 'Dr. El Amrani' },
  { id: 4, name: 'Dr. Alaoui' },
];
const PATIENTS_OPTIONS = [
  { id: 1, name: 'Mohamed Alami', ipp: 'PAT-001' },
  { id: 2, name: 'Fatima Benali', ipp: 'PAT-002' },
  { id: 3, name: 'Ahmed Tazi', ipp: 'PAT-003' },
  { id: 4, name: 'Khadija Mansouri', ipp: 'PAT-004' },
  { id: 5, name: 'Youssef El Idrissi', ipp: 'PAT-005' },
  { id: 6, name: 'Salma Berrada', ipp: 'PAT-006' },
];

// Sample medical acts data
const medicalActsData = [
  {
    id: 1,
    patientName: 'Mohamed Alami',
    patientId: 1,
    patientIdDisplay: 'PAT-001',
    type: 'Consultation',
    category: 'Rhumatologie',
    date: '2026-02-05',
    doctor: 'Dr. Martin',
    assignedStaff: [1],
    report: 'Suivi PR - DAS28: 3.2. Traitement maintenu. Bonne tolérance.',
    diagnosis: 'Polyarthrite rhumatoïde',
    treatment: 'Méthotrexate 15mg/semaine',
    status: 'completed',
    amount: 500,
    documents: [{ id: 1, filename: 'ordonnance-2026-02-05.pdf', date: '2026-02-05' }],
  },
  {
    id: 2,
    patientName: 'Fatima Benali',
    patientId: 2,
    patientIdDisplay: 'PAT-002',
    type: 'Examen',
    category: 'Imagerie',
    date: '2026-02-05',
    doctor: 'Dr. Martin',
    documents: [],
    diagnosis: 'Lupus érythémateux',
    treatment: 'Radiographie des mains',
    status: 'completed',
    amount: 350
  },
  {
    id: 3,
    patientName: 'Ahmed Tazi',
    patientId: 3,
    patientIdDisplay: 'PAT-003',
    type: 'Infiltration',
    category: 'Intervention',
    date: '2026-02-04',
    doctor: 'Dr. Martin',
    diagnosis: 'Arthrose du genou',
    treatment: 'Infiltration acide hyaluronique',
    status: 'completed',
    amount: 800
  },
  {
    id: 4,
    patientName: 'Khadija Mansouri',
    patientId: 4,
    patientIdDisplay: 'PAT-004',
    type: 'Consultation',
    category: 'Rhumatologie',
    date: '2026-02-04',
    doctor: 'Dr. Martin',
    diagnosis: 'Fibromyalgie',
    treatment: 'Duloxétine 60mg/jour',
    status: 'pending',
    amount: 500
  },
  {
    id: 5,
    patientName: 'Youssef El Idrissi',
    patientId: 5,
    patientIdDisplay: 'PAT-005',
    type: 'Bilan',
    category: 'Laboratoire',
    date: '2026-02-03',
    doctor: 'Dr. Martin',
    diagnosis: 'Spondylarthrite',
    treatment: 'Bilan inflammatoire complet',
    status: 'completed',
    amount: 450
  },
  {
    id: 6,
    patientName: 'Salma Berrada',
    patientId: 6,
    patientIdDisplay: 'PAT-006',
    type: 'Suivi',
    category: 'Rhumatologie',
    date: '2026-02-03',
    doctor: 'Dr. Martin',
    diagnosis: 'Arthrite juvénile',
    treatment: 'Ajustement traitement biologique',
    status: 'completed',
    amount: 500
  },
];

const actTypes = ['Tous', 'Consultation', 'Examen', 'Infiltration', 'Bilan', 'Suivi'];

function MedicalActsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAct, setSelectedAct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addFormData, setAddFormData] = useState({
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
    assignedStaff: [],
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const patientId = searchParams.get('patientId');
    const isNew = searchParams.get('new') === '1';
    if (patientId && isNew) {
      setShowAddModal(true);
      setAddFormData(prev => ({ ...prev, patientId }));
      setSearchParams({}); // clear after opening to avoid re-open on refresh
    }
  }, [searchParams, setSearchParams]);

  const filteredActs = medicalActsData.filter(act => {
    const pid = act.patientIdDisplay || String(act.patientId || '');
    const matchesSearch = act.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         act.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'Tous' || act.type === selectedType;
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Rhumatologie': return 'rheumatology';
      case 'Imagerie': return 'imaging';
      case 'Intervention': return 'intervention';
      case 'Laboratoire': return 'laboratory';
      default: return 'default';
    }
  };

  const openDetail = (act) => {
    setSelectedAct(act);
    setShowDetailModal(true);
  };

  return (
    <Layout>
      <div className="medical-acts-page">
        {/* Header Section */}
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

        {/* Stats Cards */}
        <div className="medical-acts-stats">
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
                icon={<FiFileText />}
                label="Total Actes"
                percentage="Ce mois"
                value="89"
                color="blue"
              />
              <StatCard 
                icon={<FiClipboard />}
                label="Consultations"
                percentage="Ce mois"
                value="45"
                color="green"
              />
              <StatCard 
                icon={<FiActivity />}
                label="Interventions"
                percentage="Ce mois"
                value="12"
                color="pink"
              />
              <StatCard 
                icon={<FiUser />}
                label="Patients traités"
                percentage="Ce mois"
                value="67"
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
              placeholder="Rechercher par patient, ID ou diagnostic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            {actTypes.map(type => (
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

        {/* Medical Acts Grid */}
        <div className="medical-acts-grid">
          {isLoading ? (
            <>
              <div className="act-card skeleton-act-card">
                <SkeletonCard />
              </div>
              <div className="act-card skeleton-act-card">
                <SkeletonCard />
              </div>
              <div className="act-card skeleton-act-card">
                <SkeletonCard />
              </div>
              <div className="act-card skeleton-act-card">
                <SkeletonCard />
              </div>
            </>
          ) : (
            filteredActs.map(act => (
              <div key={act.id} className="act-card">
                <div className="act-card-header">
                  <span className={`act-category ${getCategoryColor(act.category)}`}>
                  {act.category}
                </span>
                <span className={`act-status ${act.status}`}>
                  {act.status === 'completed' ? 'Terminé' : 'En cours'}
                </span>
              </div>
              
              <div className="act-card-body">
                <h3 className="act-type">{act.type}</h3>
                <div className="act-patient">
                  <FiUser />
                  <span>{act.patientName}</span>
                  <span className="patient-id">{act.patientIdDisplay || act.patientId}</span>
                </div>
                <p className="act-diagnosis">{act.diagnosis}</p>
                <p className="act-treatment">{act.treatment}</p>
              </div>

              <div className="act-card-footer">
                <div className="act-info">
                  <span className="act-date">{formatDate(act.date)}</span>
                  <span className="act-amount">{act.amount} DH</span>
                </div>
                <div className="act-actions">
                  <button className="action-btn view" title="Voir détails" onClick={() => openDetail(act)}>
                    <FiEye />
                  </button>
                  <button className="action-btn edit" title="Modifier">
                    <FiEdit2 />
                  </button>
                  <button className="action-btn print" title="Imprimer">
                    <FiPrinter />
                  </button>
                </div>
              </div>
            </div>
            ))
          )}
        </div>

        {/* Add Act Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content large" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nouvel Acte Médical</h2>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <form className="act-form" onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); }}>
                <div className="form-section">
                  <h3 className="section-title">Informations Patient</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Patient</label>
                      <select name="patientId" value={addFormData.patientId} onChange={(e) => setAddFormData({ ...addFormData, patientId: e.target.value })}>
                        <option value="">Sélectionner un patient</option>
                        {PATIENTS_OPTIONS.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.ipp})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Date de l'acte</label>
                      <input type="date" value={addFormData.date} onChange={(e) => setAddFormData({ ...addFormData, date: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">Détails de l'Acte</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Type d'acte</label>
                      <select name="type" value={addFormData.type} onChange={(e) => setAddFormData({ ...addFormData, type: e.target.value })}>
                        <option value="Consultation">Consultation</option>
                        <option value="Examen">Examen</option>
                        <option value="Infiltration">Infiltration</option>
                        <option value="Bilan">Bilan</option>
                        <option value="Suivi">Suivi</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Catégorie</label>
                      <select name="category" value={addFormData.category} onChange={(e) => setAddFormData({ ...addFormData, category: e.target.value })}>
                        <option value="Rhumatologie">Rhumatologie</option>
                        <option value="Imagerie">Imagerie</option>
                        <option value="Intervention">Intervention</option>
                        <option value="Laboratoire">Laboratoire</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Rapport de consultation</label>
                    <textarea name="report" value={addFormData.report} onChange={(e) => setAddFormData({ ...addFormData, report: e.target.value })} placeholder="Rapport structuré de la consultation..." rows={3} />
                  </div>
                  <div className="form-group">
                    <label>Diagnostic</label>
                    <input type="text" name="diagnosis" value={addFormData.diagnosis} onChange={(e) => setAddFormData({ ...addFormData, diagnosis: e.target.value })} placeholder="Entrez le diagnostic..." />
                  </div>
                  <div className="form-group">
                    <label>Traitement / Prescription</label>
                    <textarea name="treatment" value={addFormData.treatment} onChange={(e) => setAddFormData({ ...addFormData, treatment: e.target.value })} placeholder="Décrivez le traitement ou la prescription..."></textarea>
                  </div>
                  <div className="form-group">
                    <label>Médecin(s) / Équipe assignée</label>
                    <div className="staff-multi-select">
                      {STAFF_OPTIONS.map(s => (
                        <label key={s.id} className="staff-checkbox">
                          <input type="checkbox" checked={addFormData.assignedStaff.includes(s.id)} onChange={(e) => setAddFormData({ ...addFormData, assignedStaff: e.target.checked ? [...addFormData.assignedStaff, s.id] : addFormData.assignedStaff.filter(id => id !== s.id) })} />
                          <span>{s.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">Facturation</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Montant (DH)</label>
                      <input type="number" name="amount" value={addFormData.amount} onChange={(e) => setAddFormData({ ...addFormData, amount: e.target.value })} placeholder="0.00" />
                    </div>
                    <div className="form-group">
                      <label>Statut</label>
                      <select name="status" value={addFormData.status} onChange={(e) => setAddFormData({ ...addFormData, status: e.target.value })}>
                        <option value="completed">Terminé</option>
                        <option value="pending">En cours</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes additionnelles</label>
                  <textarea name="notes" value={addFormData.notes} onChange={(e) => setAddFormData({ ...addFormData, notes: e.target.value })} placeholder="Notes ou observations supplémentaires..."></textarea>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-submit">
                    Créer l'acte médical
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedAct && (
          <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Détails de l'Acte</h2>
                <button className="modal-close" onClick={() => setShowDetailModal(false)}>×</button>
              </div>
              <div className="act-detail">
                <div className="detail-header">
                  <span className={`act-category ${getCategoryColor(selectedAct.category)}`}>
                    {selectedAct.category}
                  </span>
                  <span className={`act-status ${selectedAct.status}`}>
                    {selectedAct.status === 'completed' ? 'Terminé' : 'En cours'}
                  </span>
                </div>

                <div className="detail-section">
                  <h4>Patient</h4>
                  <p className="detail-value">{selectedAct.patientName} <span className="patient-id">{selectedAct.patientIdDisplay || selectedAct.patientId}</span></p>
                </div>

                <div className="detail-row">
                  <div className="detail-section">
                    <h4>Type d'acte</h4>
                    <p className="detail-value">{selectedAct.type}</p>
                  </div>
                  <div className="detail-section">
                    <h4>Date</h4>
                    <p className="detail-value">{formatDate(selectedAct.date)}</p>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Diagnostic</h4>
                  <p className="detail-value">{selectedAct.diagnosis}</p>
                </div>

                {selectedAct.report && (
                  <div className="detail-section">
                    <h4>Rapport de consultation</h4>
                    <p className="detail-value report">{selectedAct.report}</p>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Traitement / Prescription</h4>
                  <p className="detail-value">{selectedAct.treatment}</p>
                </div>

                <div className="detail-row">
                  <div className="detail-section">
                    <h4>Médecin(s) / Équipe</h4>
                    <p className="detail-value">{selectedAct.doctor}{selectedAct.assignedStaff && selectedAct.assignedStaff.length > 1 ? ` + ${selectedAct.assignedStaff.length - 1} autre(s)` : ''}</p>
                  </div>
                  <div className="detail-section">
                    <h4>Montant</h4>
                    <p className="detail-value amount">{selectedAct.amount} DH</p>
                  </div>
                </div>

                <div className="detail-section documents-section">
                  <h4><FiPaperclip /> Documents attachés</h4>
                  <ul className="documents-list">
                    {(selectedAct.documents || []).length > 0 ? (selectedAct.documents || []).map(doc => (
                      <li key={doc.id}><a href="#view" className="doc-link">{doc.filename}</a> <span className="doc-date">{doc.date}</span></li>
                    )) : <li className="no-docs">Aucun document. <button type="button" className="link-btn">Attacher un document</button></li>}
                  </ul>
                </div>

                <div className="detail-actions">
                  <button className="btn-secondary">
                    <FiPrinter /> Imprimer
                  </button>
                  <button className="btn-secondary">
                    <FiDownload /> Télécharger PDF
                  </button>
                  <button className="btn-primary">
                    <FiEdit2 /> Modifier
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default MedicalActsPage;
