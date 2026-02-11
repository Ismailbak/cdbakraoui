import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { FiSave } from 'react-icons/fi';
import './AdminDashboard.css';

const initialSettings = {
  platformName: 'RhumatoAI',
  notifications: true,
  maintenanceMode: false,
  emailAlerts: true,
  sessionTimeout: 30,
  backupFrequency: 'quotidien',
};

function AdminSettings() {
  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);

  const toggle = (key) => {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Layout>
      <div className="admin-section-page">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Paramètres de la plateforme</h1>
          <p className="admin-page-subtitle">Configuration globale et notifications</p>
        </div>

        <div className="admin-card-wrap">
          <div className="admin-settings-section">
            <h3>Général</h3>
            <div className="admin-settings-row">
              <span className="admin-settings-label">Nom de la plateforme</span>
              <span className="admin-settings-value">{settings.platformName}</span>
            </div>
            <div className="admin-settings-row">
              <span className="admin-settings-label">Délai de session (minutes)</span>
              <span className="admin-settings-value">{settings.sessionTimeout} min</span>
            </div>
            <div className="admin-settings-row">
              <span className="admin-settings-label">Fréquence des sauvegardes</span>
              <span className="admin-settings-value">{settings.backupFrequency}</span>
            </div>
          </div>

          <div className="admin-settings-section">
            <h3>Notifications</h3>
            <div className="admin-settings-row">
              <span className="admin-settings-label">Notifications système</span>
              <button
                type="button"
                className={`admin-toggle ${settings.notifications ? 'active' : ''}`}
                onClick={() => toggle('notifications')}
                aria-label={settings.notifications ? 'Désactiver' : 'Activer'}
              />
            </div>
            <div className="admin-settings-row">
              <span className="admin-settings-label">Alertes par email</span>
              <button
                type="button"
                className={`admin-toggle ${settings.emailAlerts ? 'active' : ''}`}
                onClick={() => toggle('emailAlerts')}
                aria-label={settings.emailAlerts ? 'Désactiver' : 'Activer'}
              />
            </div>
          </div>

          <div className="admin-settings-section">
            <h3>Maintenance & Sécurité</h3>
            <div className="admin-settings-row">
              <span className="admin-settings-label">Mode maintenance</span>
              <button
                type="button"
                className={`admin-toggle ${settings.maintenanceMode ? 'active' : ''}`}
                onClick={() => toggle('maintenanceMode')}
                aria-label={settings.maintenanceMode ? 'Désactiver' : 'Activer'}
              />
            </div>
            <div className="admin-settings-row">
              <span className="admin-settings-label">État</span>
              <span className="admin-settings-value">
                {settings.maintenanceMode ? (
                  <span className="admin-badge admin-badge--error">Maintenance</span>
                ) : (
                  <span className="admin-badge admin-badge--actif">Opérationnel</span>
                )}
              </span>
            </div>
          </div>

          <div className="admin-settings-actions">
            <button type="button" className="admin-btn-primary" onClick={handleSave}>
              <FiSave /> {saved ? 'Enregistré !' : 'Enregistrer les modifications'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default AdminSettings;
