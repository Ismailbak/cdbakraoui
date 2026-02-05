import React, { useState } from 'react';
import { FiFileText, FiPlus, FiSearch, FiFilter, FiEye, FiEdit2, FiTrash2, FiDownload, FiPrinter, FiClipboard, FiActivity, FiUser } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/cards/StatCard';
import './MedicalActsPage.css';

// Sample medical acts data
const medicalActsData = [
  {
    id: 1,
    patientName: 'Mohamed Alami',
    patientId: 'PAT-001',
    type: 'Consultation',
    category: 'Rhumatologie',
    date: '2026-02-05',
    doctor: 'Dr. Martin',
    diagnosis: 'Polyarthrite rhumatoïde',
    treatment: 'Méthotrexate 15mg/semaine',
    status: 'completed',
    amount: 500
  },
  {
    id: 2,
    patientName: 'Fatima Benali',
    patientId: 'PAT-002',
    type: 'Examen',
    category: 'Imagerie',
    date: '2026-02-05',
    doctor: 'Dr. Martin',
    diagnosis: 'Lupus érythémateux',
    treatment: 'Radiographie des mains',
    status: 'completed',
    amount: 350
  },
  {
    id: 3,
    patientName: 'Ahmed Tazi',
    patientId: 'PAT-003',
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
    patientId: 'PAT-004',
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
    patientId: 'PAT-005',
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
    patientId: 'PAT-006',
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('Tous');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAct, setSelectedAct] = useState(null);

  const filteredActs = medicalActsData.filter(act => {
    const matchesSearch = act.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         act.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         act.patientId.toLowerCase().includes(searchTerm.toLowerCase());
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
          {filteredActs.map(act => (
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
                  <span className="patient-id">{act.patientId}</span>
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
          ))}
        </div>

        {/* Add Act Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content large" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nouvel Acte Médical</h2>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <form className="act-form">
                <div className="form-section">
                  <h3 className="section-title">Informations Patient</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Patient</label>
                      <select>
                        <option value="">Sélectionner un patient</option>
                        <option value="1">Mohamed Alami (PAT-001)</option>
                        <option value="2">Fatima Benali (PAT-002)</option>
                        <option value="3">Ahmed Tazi (PAT-003)</option>
                        <option value="4">Khadija Mansouri (PAT-004)</option>
                        <option value="5">Youssef El Idrissi (PAT-005)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Date de l'acte</label>
                      <input type="date" defaultValue="2026-02-05" />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">Détails de l'Acte</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Type d'acte</label>
                      <select>
                        <option value="">Sélectionner</option>
                        <option value="consultation">Consultation</option>
                        <option value="examen">Examen</option>
                        <option value="infiltration">Infiltration</option>
                        <option value="bilan">Bilan</option>
                        <option value="suivi">Suivi</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Catégorie</label>
                      <select>
                        <option value="">Sélectionner</option>
                        <option value="rhumatologie">Rhumatologie</option>
                        <option value="imagerie">Imagerie</option>
                        <option value="intervention">Intervention</option>
                        <option value="laboratoire">Laboratoire</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Diagnostic</label>
                    <input type="text" placeholder="Entrez le diagnostic..." />
                  </div>
                  <div className="form-group">
                    <label>Traitement / Prescription</label>
                    <textarea placeholder="Décrivez le traitement ou la prescription..."></textarea>
                  </div>
                </div>

                <div className="form-section">
                  <h3 className="section-title">Facturation</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Montant (DH)</label>
                      <input type="number" placeholder="0.00" />
                    </div>
                    <div className="form-group">
                      <label>Statut</label>
                      <select>
                        <option value="completed">Terminé</option>
                        <option value="pending">En cours</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes additionnelles</label>
                  <textarea placeholder="Notes ou observations supplémentaires..."></textarea>
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
                  <p className="detail-value">{selectedAct.patientName} <span className="patient-id">{selectedAct.patientId}</span></p>
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

                <div className="detail-section">
                  <h4>Traitement / Prescription</h4>
                  <p className="detail-value">{selectedAct.treatment}</p>
                </div>

                <div className="detail-row">
                  <div className="detail-section">
                    <h4>Médecin</h4>
                    <p className="detail-value">{selectedAct.doctor}</p>
                  </div>
                  <div className="detail-section">
                    <h4>Montant</h4>
                    <p className="detail-value amount">{selectedAct.amount} DH</p>
                  </div>
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
