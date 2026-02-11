import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiActivity, FiAlertCircle } from 'react-icons/fi';
import { login } from '../../api/api';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const performDemoLogin = (role, rememberEmail, emailToRemember) => {
    setIsLoading(true);
    setError('');
    if (role === 'medecin') {
      setTimeout(() => {
        localStorage.setItem('token', 'demo-token-rhumatoai-2026');
        localStorage.setItem('user', JSON.stringify({
          id: 1,
          name: 'Dr. Demo',
          email: 'demo@churochd.ma',
          role: 'medecin',
          specialty: 'Rhumatologie'
        }));
        if (rememberEmail) localStorage.setItem('rememberEmail', emailToRemember);
        setIsLoading(false);
        navigate('/dashboard');
      }, 600);
    } else {
      setTimeout(() => {
        localStorage.setItem('token', 'demo-token-admin-2026');
        localStorage.setItem('user', JSON.stringify({
          id: 0,
          name: 'Admin Demo',
          email: 'admin@churochd.ma',
          role: 'admin',
          is_admin: true
        }));
        if (rememberEmail) localStorage.setItem('rememberEmail', emailToRemember);
        setIsLoading(false);
        navigate('/admin');
      }, 600);
    }
  };

  const handleDemoUser = () => {
    setEmail('demo@churochd.ma');
    setPassword('demo123');
    setError('');
    performDemoLogin('medecin', rememberMe, 'demo@churochd.ma');
  };

  const handleDemoAdmin = () => {
    setEmail('admin@churochd.ma');
    setPassword('adminpass2026');
    setError('');
    performDemoLogin('admin', rememberMe, 'admin@churochd.ma');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);


    // Mode démo - connexion sans backend (médecin)
    if (email === 'demo@churochd.ma' && password === 'demo123') {
      performDemoLogin('medecin', rememberMe, email);
      return;
    }

    // Mode démo - connexion sans backend (admin)
    if (email === 'admin@churochd.ma' && password === 'adminpass2026') {
      performDemoLogin('admin', rememberMe, email);
      return;
    }

    // Connexion normale via API
    try {
      const res = await login(email, password);
      localStorage.setItem('token', res.data.access_token);
      // Fetch user info after login
      const userRes = await fetch('http://localhost:8000/api/auth/me', {
        headers: { Authorization: `Bearer ${res.data.access_token}` }
      });
      const userData = await userRes.json();
      localStorage.setItem('user', JSON.stringify(userData.user || userData));
      if (rememberMe) {
        localStorage.setItem('rememberEmail', email);
      }
      // Redirect based on admin status
      if ((userData.user && userData.user.is_admin) || userData.is_admin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError('Email ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Side - Branding */}
      <div className="auth-branding">
        <div className="branding-content">
          <div className="brand-logo">
            <FiActivity />
            <span>RhumatoAI</span>
          </div>
          <h1>Assistant IA pour la Rhumatologie</h1>
          <p>
            Optimisez votre pratique médicale avec notre assistant intelligent. 
            Gestion des patients, aide au diagnostic et suivi personnalisé.
          </p>
          <div className="brand-features">
            <div className="feature-item">
              <div className="feature-icon">🏥</div>
              <div>
                <h4>CHU Ibn Rochd</h4>
                <p>Service de Rhumatologie</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🤖</div>
              <div>
                <h4>IA Médicale</h4>
                <p>Assistance intelligente</p>
              </div>
            </div>
            <div className="feature-item">
              <div className="feature-icon">🔒</div>
              <div>
                <h4>Sécurisé</h4>
                <p>Données protégées</p>
              </div>
            </div>
          </div>
        </div>
        <div className="branding-footer">
          <p>© 2026 RhumatoAI - Tous droits réservés</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="auth-form-container">
        <div className="auth-form-wrapper">
          <div className="auth-header">
            <h2>Connexion</h2>
            <p>Bienvenue ! Connectez-vous pour accéder à votre espace.</p>
          </div>

          {error && (
            <div className="auth-error">
              <FiAlertCircle />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <div className="input-with-icon">
                <div className="input-icon-slot" aria-hidden="true">
                  <FiMail className="input-icon" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="docteur@churochd.ma"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <div className="input-with-icon">
                <div className="input-icon-slot" aria-hidden="true">
                  <FiLock className="input-icon" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                Se souvenir de moi
              </label>
              <Link to="/forgot-password" className="forgot-password">
                Mot de passe oublié ?
              </Link>
            </div>

            <button 
              type="submit" 
              className={`submit-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="spinner"></span>
              ) : (
                'Se connecter'
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>ou</span>
          </div>


          <div className="demo-login">
            <p>Compte de démonstration :</p>
            <div className="demo-login-buttons">
              <button type="button" className="demo-btn" onClick={handleDemoUser}>
                Utiliser le compte démo
              </button>
              <button type="button" className="demo-btn" onClick={handleDemoAdmin}>
                Utiliser le compte admin
              </button>
            </div>
          </div>

          <div className="auth-footer">
            <p>
              Pas encore de compte ?{' '}
              <Link to="/signup">Créer un compte</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
