import React, { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiUser, FiPlus, FiChevronLeft, FiChevronRight, FiCheck, FiX, FiEdit2, FiPhone } from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import StatCard from '../../components/cards/StatCard';
import { SkeletonCard, SkeletonListItem, useToast } from '../../components/common';
import { getAppointments, getPatients, updateAppointment, deleteAppointment } from '../../api/api';
import AppointmentForm from './AppointmentForm';
import './AppointmentsPage.css';

function mapApiAppointmentToUi(apt) {
  return {
    id: apt.id,
    patient_id: apt.patient_id,
    patientName: apt.patient_name || '-',
    patientPhone: '',
    type: 'Consultation',
    date: apt.date,
    time: apt.time,
    duration: 30,
    status: apt.status === 'scheduled' ? 'pending' : apt.status === 'cancelled' ? 'cancelled' : 'confirmed',
    notes: apt.reason || '',
  };
}

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
  // State for selected day insights modal
  const [insightsModal, setInsightsModal] = useState({ open: false, date: null, appointments: [] });

  // Helper to open insights modal for a day
  const openDayInsights = (dayObj) => {
    if (!dayObj.currentMonth) return;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;
    const dayAppointments = appointments.filter(apt => apt.date === dateStr);
    setInsightsModal({ open: true, date: dateStr, appointments: dayAppointments });
  };

  // Helper to format date for modal
  const formatDateForModal = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };
  const [appointments, setAppointments] = useState([]);
  const [patientsData, setPatientsData] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Stats calculations
  const todayStr = new Date().toISOString().slice(0, 10);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekStartStr = weekStart.toISOString().slice(0, 10);
  const weekEndStr = weekEnd.toISOString().slice(0, 10);
  const month = new Date().getMonth();
  const year = new Date().getFullYear();
  const isSameMonth = (dateStr) => {
    const d = new Date(dateStr);
    return d.getMonth() === month && d.getFullYear() === year;
  };
  const rdvToday = appointments.filter(a => a.date === todayStr).length;
  const rdvWeek = appointments.filter(a => a.date >= weekStartStr && a.date <= weekEndStr).length;
  const confirmedThisMonth = appointments.filter(a => a.status === 'confirmed' && isSameMonth(a.date)).length;
  const pending = appointments.filter(a => a.status === 'pending').length;
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  const [addFormData, setAddFormData] = useState({
    patientId: '',
    date: '',
    time: '',
    type: '',
    duration: '60',
    notes: ''
  });

  const resetAddForm = () => {
    setAddFormData({
      patientId: '',
      date: selectedDate.toISOString().split('T')[0],
      time: '',
      type: '',
      duration: '60',
      notes: ''
    });
  };

  const loadAppointments = async () => {
    try {
      const res = await getAppointments();
      setAppointments((res.data || []).map(mapApiAppointmentToUi));
    } catch {
      toast.error('Impossible de charger les rendez-vous');
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [aptRes, patRes] = await Promise.all([getAppointments(), getPatients()]);
        if (cancelled) return;
        setAppointments((aptRes.data || []).map(mapApiAppointmentToUi));
        setPatientsData(patRes.data || []);
      } catch {
        if (!cancelled) toast.error('Impossible de charger les données');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const calendarDays = generateCalendarDays(currentDate.getFullYear(), currentDate.getMonth());

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const formatSelectedDate = (date) => {
    return date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return appointments.filter(apt => apt.date === dateStr);
  };

  const selectedDateAppointments = getAppointmentsForDate(selectedDate);

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'confirmed';
      case 'pending': return 'pending';
      case 'cancelled': return 'cancelled';
      default: return 'pending';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const hasAppointments = (day, currentMonth) => {
    if (!currentMonth) return false;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return appointments.some(apt => apt.date === dateStr);
  };

  // Handle form change
  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmAppointment = async (id) => {
    const apt = appointments.find(a => a.id === id);
    if (!apt) return;
    try {
      await updateAppointment(id, {
        patient_id: apt.patient_id,
        date: apt.date,
        time: apt.time,
        reason: apt.notes,
        status: 'scheduled',
      });
      setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'confirmed' } : a));
      toast.success('Rendez-vous confirmé');
    } catch {
      toast.error('Erreur lors de la confirmation');
    }
  };

  const handleCancelAppointment = async (id) => {
    const apt = appointments.find(a => a.id === id);
    if (!apt) return;
    try {
      await updateAppointment(id, {
        patient_id: apt.patient_id,
        date: apt.date,
        time: apt.time,
        reason: apt.notes,
        status: 'cancelled',
      });
      setAppointments(appointments.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
      toast.info('Rendez-vous annulé');
    } catch {
      toast.error('Erreur lors de l\'annulation');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addFormData.patientId || !addFormData.date || !addFormData.time) {
      toast.error('Veuillez remplir patient, date et heure');
      return;
    }
    const patient = patientsData.find(p => p.id === parseInt(addFormData.patientId, 10));
    try {
      const res = await createAppointment({
        patient_id: parseInt(addFormData.patientId, 10),
        date: addFormData.date,
        time: addFormData.time,
        reason: [addFormData.type, addFormData.notes].filter(Boolean).join(' – ') || null,
        status: 'scheduled',
      });
      const created = mapApiAppointmentToUi(res.data);
      created.patientName = patient ? patient.name : '-';
      created.patientPhone = patient ? (patient.phone || '') : '';
      setAppointments([...appointments, created]);
      setShowAddModal(false);
      resetAddForm();
      toast.success(patient ? `Rendez-vous créé pour ${patient.name}` : 'Rendez-vous créé');
    } catch {
      toast.error('Erreur lors de la création du rendez-vous');
    }
  };

  const isToday = (day, currentMonth) => {
    if (!currentMonth) return false;
    const today = new Date();
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
            <button className="add-appointment-btn" onClick={() => { setShowAddModal(true); setAddFormData(prev => ({ ...prev, date: selectedDate.toISOString().split('T')[0] })); }}>
              <FiPlus />
              <span>Nouveau RDV</span>
            </button>
          </div>
        </div>

        {viewMode === 'list' ? (
          <>
            {/* Stats Cards */}
            <div className="appointments-stats">
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
                    icon={<FiCalendar />}
                    label="RDV Aujourd'hui"
                    percentage="Planifiés"
                    value={rdvToday}
                    color="blue"
                  />
                  <StatCard
                    icon={<FiClock />}
                    label="Cette semaine"
                    percentage="Total"
                    value={rdvWeek}
                    color="green"
                  />
                  <StatCard
                    icon={<FiCheck />}
                    label="Confirmés"
                    percentage="Ce mois"
                    value={confirmedThisMonth}
                    color="pink"
                  />
                  <StatCard
                    icon={<FiUser />}
                    label="En attente"
                    percentage="À confirmer"
                    value={pending}
                    color="yellow"
                  />
                </>
              )}
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
                              <button className="action-btn confirm" title="Confirmer" onClick={() => handleConfirmAppointment(appointment.id)}>
                                <FiCheck />
                              </button>
                              <button className="action-btn cancel" title="Annuler" onClick={() => handleCancelAppointment(appointment.id)}>
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
          </>
        ) : (
          // Full-page calendar mode
          <div className="full-calendar-view">
            <div className="calendar-header">
              <h2>{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
              <div className="calendar-nav">
                <button onClick={() => navigateMonth(-1)}><FiChevronLeft /></button>
                <button onClick={() => navigateMonth(1)}><FiChevronRight /></button>
              </div>
            </div>
            <div className="calendar-weekdays full">
              {weekDays.map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>
            <div className="calendar-days full">
              {calendarDays.map((dayObj, index) => {
                // Get appointments for this day
                const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(dayObj.day).padStart(2, '0')}`;
                const dayAppointments = dayObj.currentMonth ? appointments.filter(apt => apt.date === dateStr) : [];
                return (
                  <div
                    key={index}
                    className={`calendar-day full clickable ${!dayObj.currentMonth ? 'other-month' : ''} ${isToday(dayObj.day, dayObj.currentMonth) ? 'today' : ''}`}
                    onClick={() => openDayInsights(dayObj)}
                    tabIndex={dayObj.currentMonth ? 0 : -1}
                    style={{ cursor: dayObj.currentMonth ? 'pointer' : 'default', outline: 'none' }}
                  >
                    <span className="day-number">{dayObj.day}</span>
                    <div className="day-appointments">
                      {dayAppointments.map(apt => (
                        <div
                          key={apt.id}
                          className={`apt-chip ${getStatusColor(apt.status)}`}
                          title={`${apt.patientName} (${getStatusLabel(apt.status)})`}
                        >
                          <span className="apt-time">{apt.time}</span>
                          <span className="apt-patient">{apt.patientName}</span>
                        </div>
                      ))}
                    </div>
                    {dayObj.currentMonth && dayAppointments.length > 0 && (
                      <span className="day-insights-icon" title="Voir les rendez-vous">🔍</span>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Insights Modal */}
            {insightsModal.open && (
              <div className="modal-overlay" onClick={() => setInsightsModal({ open: false, date: null, appointments: [] })}>
                <div className="modal-content" onClick={e => e.stopPropagation()}>
                  <div className="modal-header">
                    <h2>Rendez-vous du {formatDateForModal(insightsModal.date)}</h2>
                    <button className="modal-close" onClick={() => setInsightsModal({ open: false, date: null, appointments: [] })}>×</button>
                  </div>
                  <div className="insights-list">
                    {insightsModal.appointments.length === 0 ? (
                      <div className="no-appointments">
                        <FiCalendar className="no-apt-icon" />
                        <p>Aucun rendez-vous pour cette date</p>
                      </div>
                    ) : (
                      insightsModal.appointments.map(apt => (
                        <div key={apt.id} className="insight-apt-item">
                          <div className={`apt-chip ${getStatusColor(apt.status)}`}
                            style={{ marginBottom: 6 }}>
                            <span className="apt-time">{apt.time}</span>
                            <span className="apt-patient">{apt.patientName}</span>
                          </div>
                          <div className="apt-details">
                            <span className="apt-type">{apt.type}</span>
                            <span className={`apt-status ${getStatusColor(apt.status)}`}>{getStatusLabel(apt.status)}</span>
                            {apt.notes && <p className="apt-notes">{apt.notes}</p>}
                            {apt.patientPhone && <span className="apt-phone"><FiPhone /> {apt.patientPhone}</span>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add Appointment Modal */}
        {showAddModal && (
          <div className="modal-overlay" onClick={() => { setShowAddModal(false); resetAddForm(); }}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <AppointmentForm
                defaultDate={selectedDate.toISOString().split('T')[0]}
                onSuccess={() => { loadAppointments(); toast.success('Rendez-vous créé avec succès'); }}
                onClose={() => { setShowAddModal(false); resetAddForm(); }}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AppointmentsPage;
