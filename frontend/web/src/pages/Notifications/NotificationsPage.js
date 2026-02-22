import React, { useState, useEffect } from 'react';
import { 
  FiBell, FiCalendar, FiUser, FiFileText, FiAlertCircle, FiCheckCircle, 
  FiClock, FiTrash2, FiCheck, FiFilter, FiSettings, FiMail, FiPhone,
  FiActivity, FiHeart, FiMessageSquare
} from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import { SkeletonListItem, useToast } from '../../components/common';
import { getNotifications, markNotificationRead as apiMarkRead } from '../../api/api';
import './NotificationsPage.css';

function mapApiNotification(n) {
  return {
    id: n.id,
    type: 'generic',
    title: n.title,
    message: n.message,
    isRead: n.read,
    icon: 'bell',
    date: new Date().toISOString().split('T')[0],
    priority: 'normal',
  };
}

const notificationFilters = ['Toutes', 'Non lues', 'RDV', 'Patients', 'Résultats', 'Messages'];

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('Toutes');
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    getNotifications()
      .then(res => {
        if (!cancelled) setNotifications((res.data || []).map(mapApiNotification));
      })
      .catch(() => { if (!cancelled) setNotifications([]); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);


  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(notif => {
    switch(selectedFilter) {
      case 'Non lues': return !notif.isRead;
      case 'RDV': return notif.type.includes('appointment');
      case 'Patients': return notif.type === 'new_patient' || notif.type === 'follow_up';
      case 'Résultats': return notif.type === 'lab_results';
      case 'Messages': return notif.type === 'message';
      default: return true;
    }
  });

  const markAsRead = async (id) => {
    try {
      await apiMarkRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      toast.error('Erreur');
    }
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    toast.success('Toutes les notifications marquées comme lues');
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast.info('Notification supprimée');
  };

  const getIcon = (iconType) => {
    switch(iconType) {
      case 'calendar': return <FiCalendar />;
      case 'user': return <FiUser />;
      case 'file': return <FiFileText />;
      case 'alert': return <FiAlertCircle />;
      case 'check': return <FiCheckCircle />;
      case 'activity': return <FiActivity />;
      case 'heart': return <FiHeart />;
      case 'message': return <FiMessageSquare />;
      case 'settings': return <FiSettings />;
      default: return <FiBell />;
    }
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'high': return 'priority-high';
      case 'low': return 'priority-low';
      default: return 'priority-normal';
    }
  };

  const getTypeClass = (type) => {
    if (type.includes('appointment')) return 'type-appointment';
    if (type === 'new_patient' || type === 'follow_up') return 'type-patient';
    if (type === 'lab_results') return 'type-results';
    if (type === 'message') return 'type-message';
    if (type === 'system') return 'type-system';
    return 'type-default';
  };

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notif) => {
    const date = notif.date === '2026-02-05' ? 'Aujourd\'hui' : 
                 notif.date === '2026-02-04' ? 'Hier' : notif.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(notif);
    return groups;
  }, {});

  return (
    <Layout>
      <div className="notifications-page">
        {/* Header */}
        <div className="page-header">
          <div className="header-content">
            <h1 className="page-title">
              Notifications
              {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
            </h1>
            <p className="page-subtitle">Restez informé de l'activité de vos patients</p>
          </div>
          <div className="header-actions">
            <button className="mark-all-btn" onClick={markAllAsRead} disabled={unreadCount === 0}>
              <FiCheck />
              <span>Tout marquer comme lu</span>
            </button>
            <button className="settings-btn" onClick={() => setShowSettings(!showSettings)}>
              <FiSettings />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          {notificationFilters.map(filter => (
            <button 
              key={filter}
              className={`filter-btn ${selectedFilter === filter ? 'active' : ''}`}
              onClick={() => setSelectedFilter(filter)}
            >
              {filter}
              {filter === 'Non lues' && unreadCount > 0 && (
                <span className="filter-count">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="notifications-container">
          {isLoading ? (
            <div className="notification-group">
              <div className="skeleton-date" style={{ width: '100px', height: '20px', background: '#e9ecef', borderRadius: '4px', marginBottom: '16px' }}></div>
              <div className="notification-list">
                {[1, 2, 3, 4, 5].map(i => (
                  <SkeletonListItem key={i} />
                ))}
              </div>
            </div>
          ) : Object.keys(groupedNotifications).length === 0 ? (
            <div className="no-notifications">
              <FiBell className="no-notif-icon" />
              <h3>Aucune notification</h3>
              <p>Vous n'avez aucune notification dans cette catégorie</p>
            </div>
          ) : (
            Object.entries(groupedNotifications).map(([date, notifs]) => (
              <div key={date} className="notification-group">
                <h3 className="group-date">{date}</h3>
                <div className="notification-list">
                  {notifs.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${!notification.isRead ? 'unread' : ''} ${getPriorityClass(notification.priority)}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className={`notification-icon ${getTypeClass(notification.type)}`}>
                        {getIcon(notification.icon)}
                      </div>
                      
                      <div className="notification-content">
                        <div className="notification-header">
                          <h4 className="notification-title">{notification.title}</h4>
                          <span className="notification-time">{notification.time}</span>
                        </div>
                        <p className="notification-message">{notification.message}</p>
                        {notification.patient && (
                          <span className="notification-patient">
                            <FiUser /> {notification.patient}
                          </span>
                        )}
                        {notification.action && (
                          <button className="notification-action">
                            {notification.action} →
                          </button>
                        )}
                      </div>

                      <div className="notification-actions">
                        {!notification.isRead && (
                          <div className="unread-dot" title="Non lu"></div>
                        )}
                        <button 
                          className="delete-btn" 
                          onClick={(e) => { e.stopPropagation(); deleteNotification(notification.id); }}
                          title="Supprimer"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Notification Settings Modal */}
        {showSettings && (
          <div className="modal-overlay" onClick={() => setShowSettings(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Préférences de notifications</h2>
                <button className="modal-close" onClick={() => setShowSettings(false)}>×</button>
              </div>
              <div className="settings-content">
                <div className="settings-section">
                  <h3>Notifications par email</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <FiMail />
                      <div>
                        <span className="setting-title">Rappels de rendez-vous</span>
                        <span className="setting-desc">Recevoir un email 24h avant chaque RDV</span>
                      </div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <FiFileText />
                      <div>
                        <span className="setting-title">Résultats d'analyses</span>
                        <span className="setting-desc">Notification immédiate des nouveaux résultats</span>
                      </div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <FiMessageSquare />
                      <div>
                        <span className="setting-title">Messages patients</span>
                        <span className="setting-desc">Recevoir les messages des patients par email</span>
                      </div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-section">
                  <h3>Notifications push</h3>
                  <div className="setting-item">
                    <div className="setting-info">
                      <FiCalendar />
                      <div>
                        <span className="setting-title">Rappels RDV</span>
                        <span className="setting-desc">30 min avant chaque consultation</span>
                      </div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <FiUser />
                      <div>
                        <span className="setting-title">Nouveaux patients</span>
                        <span className="setting-desc">Alertes d'inscription de nouveaux patients</span>
                      </div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" />
                      <span className="slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <FiHeart />
                      <div>
                        <span className="setting-title">Suivis recommandés</span>
                        <span className="setting-desc">Patients sans consultation récente</span>
                      </div>
                    </div>
                    <label className="toggle">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-actions">
                  <button className="btn-cancel" onClick={() => setShowSettings(false)}>Annuler</button>
                  <button className="btn-save">Enregistrer</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default NotificationsPage;
