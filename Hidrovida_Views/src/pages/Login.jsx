import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ cuenta: '', contrasena: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.cuenta || !form.contrasena) {
      setError('Por favor, complete sus credenciales.');
      return;
    }
    setLoading(true);
    setError('');

    // Simulate login - mock credentials: any non-empty input works
    setTimeout(() => {
      setLoading(false);
      setSuccess('¡Bienvenido a HidroVida!');
      setTimeout(() => {
        onLogin();
        navigate('/inicio');
      }, 900);
    }, 1000);
  };

  return (
    <div className="login-screen">
      <div className="login-topbar">
        <button className="login-back-btn" onClick={() => navigate('/')}>
          <span style={{ fontSize: '1.8rem' }}>🏠</span>
          <span>Inicio</span>
        </button>
        <div className="login-topbar-title">Iniciar sesión</div>
      </div>

      <div className="login-body">
        <div className="login-box">
          {/* Logo */}
          <div className="login-logo-area">
            <div className="login-logo-icon" style={{ background: 'rgba(255,255,255,0.15)' }}>💧</div>
            <div className="login-site-title">HidroVida</div>
          </div>

          <div className="login-subtitle">
            Inicia sesión con tu cuenta de<br />HidroVida
          </div>

          {/* Error / Success messages */}
          {error && (
            <div className="login-alert login-alert-error">⚠️ {error}</div>
          )}
          {success && (
            <div className="login-alert login-alert-success">✅ {success}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="login-label">Número de cuenta</label>
              <input
                type="text"
                name="cuenta"
                className="login-input"
                placeholder="0000-000-0000"
                value={form.cuenta}
                onChange={handleChange}
                autoComplete="username"
                id="login-cuenta"
              />
              <span className="login-hint">Puedes encontrar tu número de cuenta en tu recibo</span>
            </div>

            <div className="form-group">
              <label className="login-label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="contrasena"
                  className="login-input"
                  placeholder="Ingrese su contraseña"
                  value={form.contrasena}
                  onChange={handleChange}
                  autoComplete="current-password"
                  id="login-contrasena"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  className="toggle-pass-btn"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                  aria-label="Mostrar/ocultar contraseña"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              <span className="login-forgot">¿Olvidaste tu contraseña?</span>
            </div>

            <button
              type="submit"
              className="btn-login"
              disabled={loading}
              id="login-submit-btn"
            >
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="login-footer">
            <p style={{ marginBottom: '0.4rem', fontWeight: 600, fontSize: '1rem' }}>
              ¿No tienes cuenta? <Link to="/registro" style={{ color: '#1a5c8b', fontWeight: 800 }}>Registrate</Link>
            </p>
            <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <a href="#" style={{ color: 'rgba(255,255,255,0.7)' }}>Términos de uso</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.7)' }}>Políticas de privacidad</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
