import React, { useState } from 'react';
import { FiCalendar, FiClock, FiUser, FiPlus, FiChevronLeft, FiChevronRight, FiCheck, FiX, FiEdit2, FiPhone } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/cards/StatCard';
import './AppointmentsPage.css';

// Sample appointments data
const appointmentsData = [
  {
    id: 1,
    patientName: 'Mohamed Alami',
    patientPhone: '+212 6 12 34 56 78',
    type: 'Consultation de suivi',
    date: '2026-02-05',
    time: '09:00',
    duration: 60,
    status: 'confirmed',
    notes: 'Contrôle polyarthrite rhumatoïde'
  },
  {
    id: 2,
    patientName: 'Fatima Benali',
    patientPhone: '+212 6 23 45 67 89',
    type: 'Première consultation',
    date: '2026-02-05',
    time: '10:30',
    duration: 45,
    status: 'confirmed',
    notes: 'Douleurs articulaires chroniques'
  },
  {
    id: 3,
    patientName: 'Ahmed Tazi',
    patientPhone: '+212 6 34 56 78 90',
    type: 'Contrôle',
    date: '2026-02-05',
    time: '14:00',
    duration: 30,
    status: 'pending',
    notes: 'Suivi traitement arthrose'
  },
  {
    id: 4,
    patientName: 'Khadija Mansouri',
    patientPhone: '+212 6 45 67 89 01',
    type: 'Consultation urgente',
    date: '2026-02-05',
    time: '15:30',
    duration: 45,
    status: 'confirmed',
    notes: 'Crise fibromyalgie'
  },
  {
    id: 5,
    patientName: 'Youssef El Idrissi',
    patientPhone: '+212 6 56 78 90 12',
    type: 'Consultation de suivi',
    date: '2026-02-06',
    time: '09:30',
    duration: 60,
    status: 'pending',
    notes: 'Bilan spondylarthrite'
  },
  {
    id: 6,
    patientName: 'Salma Berrada',
    patientPhone: '+212 6 67 89 01 23',
    type: 'Contrôle',
    date: '2026-02-06',
    time: '11:00',
    duration: 30,
    status: 'confirmed',
    notes: 'Résultats analyses'
  },
];

// Generate calendar days
const generateCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();
  
  const days = [];
  
  // Previous month days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthLastDay - i, currentMonth: false });
  }
  
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, currentMonth: true });
  }
  
  // Next month days
  const remainingDays = 42 - days.length;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({ day: i, currentMonth: false });
  }
  
  return days;
};

const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const weekDays = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

function AppointmentsPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 5)); // February 5, 2026
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 1, 5));
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  const calendarDays = generateCalendarDays(currentDate.getFullYear(), currentDate.getMonth());
  
  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const formatSelectedDate = (date) => {
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return appointmentsData.filter(apt => apt.date === dateStr);
  };

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'confirmed';
      case 'pending': return 'pending';
      case 'cancelled': return 'cancelled';
      default: return 'pending';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const hasAppointments = (day, currentMonth) => {
    if (!currentMonth) return false;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointmentsData.some(apt => apt.date === dateStr);
  };

  const isToday = (day, currentMonth) => {
    if (!currentMonth) return false;
    const today = new Date(2026, 1, 5); // February 5, 2026
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const isSelected = (day, currentMonth) => {
    if (!currentMonth) return false;
    return day === selectedDate.getDate() && 
           currentDate.getMonth() === selectedDate.getMonth() && 
           currentDate.getFullYear() === selectedDate.getFullYear();
  };

  return (
    <Layout>
      <div className="appointments-page">
        {/* Header Section */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">Rendez-vous</h1>
            <p className="page-subtitle">Gérez votre agenda et vos consultations</p>
          </div>
          <div className="header-actions">
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                Liste
              </button>
              <button 
                className={`view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                onClick={() => setViewMode('calendar')}
              >
                Calendrier
              </button>
            </div>
            <button className="add-appointment-btn" onClick={() => setShowAddModal(true)}>
              <FiPlus />
              <span>Nouveau RDV</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="appointments-stats">
          <StatCard 
            icon={<FiCalendar />}
            label="RDV Aujourd'hui"
            percentage="Planifiés"
            value="8"
            color="blue"
          />
          <StatCard 
            icon={<FiClock />}
            label="Cette semaine"
            percentage="Total"
            value="32"
            color="green"
          />
          <StatCard 
            icon={<FiCheck />}
            label="Confirmés"
            percentage="Ce mois"
            value="45"
            color="pink"
          />
          <StatCard 
            icon={<FiUser />}
            label="En attente"
            percentage="À confirmer"
            value="12"
            color="yellow"
          />
        </div>

        {/* Main Content Grid */}
        <div className="appointments-content">
          {/* Calendar Section */}
          <div className="calendar-card">
            <div className="calendar-header">
              <h3>{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
              <div className="calendar-nav">
                <button onClick={() => navigateMonth(-1)}><FiChevronLeft /></button>
                <button onClick={() => navigateMonth(1)}><FiChevronRight /></button>
              </div>
            </div>
            
            <div className="calendar-weekdays">
              {weekDays.map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>
            
            <div className="calendar-days">
              {calendarDays.map((dayObj, index) => (
                <div 
                  key={index}
                  className={`calendar-day ${!dayObj.currentMonth ? 'other-month' : ''} ${isToday(dayObj.day, dayObj.currentMonth) ? 'today' : ''} ${isSelected(dayObj.day, dayObj.currentMonth) ? 'selected' : ''} ${hasAppointments(dayObj.day, dayObj.currentMonth) ? 'has-appointments' : ''}`}
                  onClick={() => {
                    if (dayObj.currentMonth) {
                      setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), dayObj.day));
                    }
                  }}
                >
                  <span>{dayObj.day}</span>
                  {hasAppointments(dayObj.day, dayObj.currentMonth) && <div className="appointment-dot"></div>}
                </div>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="calendar-quick-stats">
              <div className="quick-stat">
                <span className="stat-dot confirmed"></span>
                <span>4 Confirmés</span>
              </div>
              <div className="quick-stat">
                <span className="stat-dot pending"></span>
                <span>2 En attente</span>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="appointments-list-card">
            <div className="list-header">
              <div className="list-title">
                <h3>Rendez-vous du jour</h3>
                <span className="selected-date">{formatSelectedDate(selectedDate)}</span>
              </div>
              <span className="appointment-count">{selectedDateAppointments.length} rendez-vous</span>
            </div>

            <div className="appointments-list">
              {selectedDateAppointments.length === 0 ? (
                <div className="no-appointments">
                  <FiCalendar className="no-apt-icon" />
                  <p>Aucun rendez-vous pour cette date</p>
                  <button className="add-apt-btn" onClick={() => setShowAddModal(true)}>
                    Ajouter un rendez-vous
                  </button>
                </div>
              ) : (
                selectedDateAppointments.map(appointment => (
                  <div key={appointment.id} className="appointment-item">
                    <div className="appointment-time">
                      <span className="time">{appointment.time}</span>
                      <span className="duration">{appointment.duration} min</span>
                    </div>
                    <div className="appointment-details">
                      <div className="appointment-main">
                        <h4 className="patient-name">{appointment.patientName}</h4>
                        <span className={`appointment-status ${getStatusColor(appointment.status)}`}>
                          {getStatusLabel(appointment.status)}
                        </span>
                      </div>
                      <p className="appointment-type">{appointment.type}</p>
                      <p className="appointment-notes">{appointment.notes}</p>
                      <div className="appointment-contact">
                        <FiPhone /> {appointment.patientPhone}
                      </div>
                    </div>
                    <div className="appointment-actions">
                      {appointment.status === 'pending' && (
                        <>
                          <button className="action-btn confirm" title="Confirmer">
                            <FiCheck />
                          </button>
                          <button className="action-btn cancel" title="Annuler">
                            <FiX />
                          </button>
                        </>
                      )}
                      <button className="action-btn edit" title="Modifier">
                        <FiEdit2 />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Add Appointment Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Nouveau Rendez-vous</h2>
                <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
              </div>
              <form className="appointment-form">
                <div className="form-group">
                  <label>Patient</label>
                  <select>
                    <option value="">Sélectionner un patient</option>
                    <option value="1">Mohamed Alami</option>
                    <option value="2">Fatima Benali</option>
                    <option value="3">Ahmed Tazi</option>
                    <option value="4">Khadija Mansouri</option>
                    <option value="5">Youssef El Idrissi</option>
                    <option value="6">Salma Berrada</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input type="date" defaultValue="2026-02-05" />
                  </div>
                  <div className="form-group">
                    <label>Heure</label>
                    <select>
                      <option value="">Sélectionner</option>
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
                      <option value="">Sélectionner</option>
                      <option value="premiere">Première consultation</option>
                      <option value="suivi">Consultation de suivi</option>
                      <option value="urgence">Consultation urgente</option>
                      <option value="controle">Contrôle</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Durée</label>
                    <select>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">1 heure</option>
                      <option value="90">1h30</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Motif / Notes</label>
                  <textarea placeholder="Décrivez le motif de la consultation..."></textarea>
                </div>
                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-submit">
                    Créer le rendez-vous
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

export default AppointmentsPage;
