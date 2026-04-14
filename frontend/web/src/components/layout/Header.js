import React, { useState, useRef, useEffect } from 'react';
import { FiSearch, FiMenu, FiFileText, FiShield, FiX, FiMessageSquare, FiUser, FiCalendar, FiActivity } from 'react-icons/fi';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { getPatients, getAppointments, getMedicalActs } from '../../api/api';
import './Header.css';

const navTabs = [
  { path: '/dashboard', label: 'Tableau de Bord' },
  { path: '/patients', label: 'Patients' },
  { path: '/appointments', label: 'Rendez-vous' },
  { path: '/medical-acts', label: 'Actes Médicaux' },
];

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isDashboard = location.pathname === '/dashboard';
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ patients: [], appointments: [], acts: [] });
  const [showResults, setShowResults] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const [allData, setAllData] = useState({ patients: [], appointments: [], acts: [] });

  // Load data on component mount
  useEffect(() => {
    const loadSearchData = async () => {
      try {
        const [patientsRes, appointmentsRes, actsRes] = await Promise.all([
          getPatients().catch(() => ({ data: [] })),
          getAppointments().catch(() => ({ data: [] })),
          getMedicalActs().catch(() => ({ data: [] }))
        ]);
        
        setAllData({ 
          patients: Array.isArray(patientsRes?.data) ? patientsRes.data : [],
          appointments: Array.isArray(appointmentsRes?.data) ? appointmentsRes.data : [],
          acts: Array.isArray(actsRes?.data) ? actsRes.data : []
        });
      } catch (error) {
        console.error('Error loading search data:', error);
        setAllData({ patients: [], appointments: [], acts: [] });
      }
    };
    loadSearchData();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search handler
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setSearchResults({ patients: [], appointments: [], acts: [] });
      setShowResults(false);
      return;
    }

    const lowerQuery = query.toLowerCase();
    
    const calculateAge = (dateOfBirth) => {
      if (!dateOfBirth) return null;
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    };
    
    const patients = (Array.isArray(allData.patients) ? allData.patients : [])
      .filter(p => 
        (p.first_name?.toLowerCase().includes(lowerQuery) || 
         p.last_name?.toLowerCase().includes(lowerQuery) ||
         p.primary_diagnosis?.toLowerCase().includes(lowerQuery))
      ).slice(0, 3).map(p => {
        const age = calculateAge(p.date_of_birth);
        return {
          id: p.id,
          name: `${p.first_name} ${p.last_name}`,
          detail: `${age ? age + ' ans' : ''} • ${p.primary_diagnosis || 'N/A'}`,
          avatar: (p.gender?.toLowerCase() === 'femme') ? '👩' : '👨'
        };
      });

    const appointments = (Array.isArray(allData.appointments) ? allData.appointments : [])
      .filter(a => 
        (a.patient?.first_name?.toLowerCase().includes(lowerQuery) || 
         a.patient?.last_name?.toLowerCase().includes(lowerQuery) ||
         a.type?.toLowerCase().includes(lowerQuery))
      ).slice(0, 3).map(a => ({
        id: a.id,
        patient: `${a.patient?.first_name} ${a.patient?.last_name}`,
        time: a.datetime_scheduled ? new Date(a.datetime_scheduled).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '-',
        type: a.type || '-'
      }));

    const acts = (Array.isArray(allData.acts) ? allData.acts : [])
      .filter(a => 
        (a.name?.toLowerCase().includes(lowerQuery) || 
         a.patient?.first_name?.toLowerCase().includes(lowerQuery) ||
         a.patient?.last_name?.toLowerCase().includes(lowerQuery))
      ).slice(0, 2).map(a => ({
        id: a.id,
        name: a.name,
        patient: `${a.patient?.first_name} ${a.patient?.last_name}`
      }));

    setSearchResults({ patients, appointments, acts });
    setShowResults(true);
  };

  const handleResultClick = (type, id) => {
    setShowResults(false);
    setSearchQuery('');
    if (type === 'patient') {
      navigate(`/patients/${id}`);
    } else if (type === 'appointment') {
      navigate('/appointments');
    } else if (type === 'act') {
      navigate('/medical-acts');
    }
  };

  const hasResults = searchResults.patients.length > 0 || 
                     searchResults.appointments.length > 0 || 
                     searchResults.acts.length > 0;

  return (
    <header className={`header ${isDashboard ? 'header-centered' : ''}`}>
      {!isDashboard && (
        <div className="header-left" ref={searchRef}>
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Rechercher patients, rendez-vous..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => { setSearchQuery(''); setShowResults(false); }}>
                <FiX />
              </button>
            )}
            
            {/* Search Results Dropdown */}
            {showResults && (
              <div className="search-results">
                {!hasResults ? (
                  <div className="search-no-results">
                    <FiSearch />
                    <span>Aucun résultat pour "{searchQuery}"</span>
                  </div>
                ) : (
                  <>
                    {searchResults.patients.length > 0 && (
                      <div className="search-category">
                        <div className="search-category-header">
                          <FiUser />
                          <span>Patients</span>
                        </div>
                        {searchResults.patients.map(patient => (
                          <div 
                            key={patient.id} 
                            className="search-result-item"
                            onClick={() => handleResultClick('patient', patient.id)}
                          >
                            <span className="result-avatar">{patient.avatar}</span>
                            <div className="result-info">
                              <span className="result-name">{patient.name}</span>
                              <span className="result-detail">{patient.detail}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {searchResults.appointments.length > 0 && (
                      <div className="search-category">
                        <div className="search-category-header">
                          <FiCalendar />
                          <span>Rendez-vous</span>
                        </div>
                        {searchResults.appointments.map(apt => (
                          <div 
                            key={apt.id} 
                            className="search-result-item"
                            onClick={() => handleResultClick('appointment', apt.id)}
                          >
                            <span className="result-icon"><FiCalendar /></span>
                            <div className="result-info">
                              <span className="result-name">{apt.patient}</span>
                              <span className="result-detail">{apt.type} • {apt.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {searchResults.acts.length > 0 && (
                      <div className="search-category">
                        <div className="search-category-header">
                          <FiActivity />
                          <span>Actes Médicaux</span>
                        </div>
                        {searchResults.acts.map(act => (
                          <div 
                            key={act.id} 
                            className="search-result-item"
                            onClick={() => handleResultClick('act', act.id)}
                          >
                            <span className="result-icon"><FiActivity /></span>
                            <div className="result-info">
                              <span className="result-name">{act.name}</span>
                              <span className="result-detail">{act.patient}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <nav className="header-nav">
        {navTabs.slice(0, 2).map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={`header-tab ${location.pathname === tab.path ? 'active' : ''}`}
          >
            {tab.label}
          </NavLink>
        ))}
        
        {isDashboard && (
          <button 
            className="ai-assistant-btn"
            onClick={() => navigate('/assistant')}
          >
            <FiMessageSquare />
            <span>Assistant IA</span>
          </button>
        )}
        
        {navTabs.slice(2).map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={`header-tab ${location.pathname === tab.path ? 'active' : ''}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <div className="header-right">
        <div className="menu-container" ref={menuRef}>
          <button 
            className={`header-icon-btn ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          
          {menuOpen && (
            <div className="dropdown-menu">
              <a href="/terms" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                <FiFileText />
                <span>Conditions d'utilisation</span>
              </a>
              <a href="/privacy" className="dropdown-item" onClick={() => setMenuOpen(false)}>
                <FiShield />
                <span>Politique de confidentialité</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
