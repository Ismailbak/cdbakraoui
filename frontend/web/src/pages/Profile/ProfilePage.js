import React, { useState, useEffect } from 'react';
import { 
  FiUser, FiMail, FiPhone, FiLock, FiCamera, FiSave, 
  FiEdit2, FiShield, FiClock, FiActivity 
} from 'react-icons/fi';
import Layout from '../../components/layout/Layout';
import { SkeletonCard, useToast } from '../../components/common';
import './ProfilePage.css';

function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      try {
        const res = await import('../../api/api').then(mod => mod.getCurrentUser());
        const user = res.data.user || res.data;
        setProfile({
          firstName: user.first_name || user.username || '',
          lastName: user.last_name || '',
          email: user.email || '',
          phone: user.phone || '',
          specialty: user.specialty || '',
          department: user.department || '',
          hospital: user.hospital || '',
        });
      } catch (err) {
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const toast = useToast();

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setIsEditing(false);
    toast.success('Profil mis à jour avec succès');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    setPasswords({ current: '', new: '', confirm: '' });
    toast.success('Mot de passe modifié avec succès');
  };

  return (
    <Layout>
      <div className="profile-page">
        <div className="profile-header">
          <h1>Mon Profil</h1>
          <p>Gérez vos informations personnelles et paramètres de sécurité</p>
        </div>

        {isLoading ? (
          <div className="profile-content">
            <SkeletonCard height="400px" />
            <div className="profile-sidebar-skeleton">
              <SkeletonCard height="250px" />
              <SkeletonCard height="200px" />
            </div>
          </div>
        ) : !profile ? (
          <div className="profile-content">
            <div style={{ color: 'red' }}>Impossible de charger le profil utilisateur.</div>
          </div>
        ) : (
        <div className="profile-content">
          {/* Profile Card */}
          <div className="profile-card main-profile">
            <div className="profile-avatar-section">
              <div className="profile-avatar">
                <FiUser />
                <button className="avatar-edit-btn" title="Changer la photo">
                  <FiCamera />
                </button>
              </div>
              <div className="profile-info">
                    <h2>
                      <span>
                        {profile.specialty
                          ? `Dr. ${profile.lastName || profile.firstName || profile.email}`
                          : profile.firstName || profile.email}
                      </span>
                    </h2>
                {profile.phone && (
                  <div className="profile-phone" style={{ marginTop: 4, color: '#6B7280', fontSize: 15 }}>
                    <FiPhone style={{ marginRight: 4 }} /> {profile.phone}
                  </div>
                )}
                {profile.specialty && (
                  <div className="profile-specialty" style={{ marginTop: 4, color: '#6B7280', fontSize: 15 }}>
                    <strong>Spécialité:</strong> {profile.specialty}
                  </div>
                )}
                {profile.department && (
                  <div className="profile-department" style={{ marginTop: 4, color: '#6B7280', fontSize: 15 }}>
                    <strong>Département:</strong> {profile.department}
                  </div>
                )}
                <span className="profile-hospital">{profile.hospital}</span>
              </div>
            </div>

            <div className="profile-actions">
              {isEditing ? (
                <button className="btn-save" onClick={handleSaveProfile}>
                  <FiSave /> Enregistrer
                </button>
              ) : (
                <button className="btn-edit" onClick={() => setIsEditing(true)}>
                  <FiEdit2 /> Modifier
                </button>
              )}
            </div>

            <div className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom</label>
                  <input
                    type="text"
                    name="firstName"
                    value={profile.firstName}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label>Nom</label>
                  <input
                    type="text"
                    name="lastName"
                    value={profile.lastName}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="form-group">
                <label><FiMail /> Adresse email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-group">
                <label><FiPhone /> Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  disabled={!isEditing}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Spécialité</label>
                  <input
                    type="text"
                    name="specialty"
                    value={profile.specialty}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="form-group">
                  <label>Département</label>
                  <input
                    type="text"
                    name="department"
                    value={profile.department}
                    onChange={handleProfileChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="profile-card security-card">
            <div className="card-header">
              <FiShield />
              <h3>Sécurité</h3>
            </div>

            <form onSubmit={handleChangePassword} className="password-form">
              <div className="form-group">
                <label><FiLock /> Mot de passe actuel</label>
                <input
                  type="password"
                  name="current"
                  value={passwords.current}
                  onChange={handlePasswordChange}
                  placeholder="••••••••"
                />
              </div>

              <div className="form-group">
                <label><FiLock /> Nouveau mot de passe</label>
                <input
                  type="password"
                  name="new"
                  value={passwords.new}
                  onChange={handlePasswordChange}
                  placeholder="Minimum 8 caractères"
                />
              </div>

              <div className="form-group">
                <label><FiLock /> Confirmer le mot de passe</label>
                <input
                  type="password"
                  name="confirm"
                  value={passwords.confirm}
                  onChange={handlePasswordChange}
                  placeholder="Répétez le mot de passe"
                />
              </div>

              <button type="submit" className="btn-change-password">
                Changer le mot de passe
              </button>
            </form>
          </div>

          {/* Activity Card */}
          <div className="profile-card activity-card">
            <div className="card-header">
              <FiActivity />
              <h3>Activité Récente</h3>
            </div>

            <div className="activity-list">
              <div className="activity-item">
                <FiClock />
                <div>
                  <span className="activity-text">Dernière connexion</span>
                  <span className="activity-time">Aujourd'hui à 09:15</span>
                </div>
              </div>
              <div className="activity-item">
                <FiUser />
                <div>
                  <span className="activity-text">Patients consultés ce mois</span>
                  <span className="activity-count">47</span>
                </div>
              </div>
              <div className="activity-item">
                <FiEdit2 />
                <div>
                  <span className="activity-text">Actes médicaux réalisés</span>
                  <span className="activity-count">23</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </Layout>
  );
}

export default ProfilePage;
