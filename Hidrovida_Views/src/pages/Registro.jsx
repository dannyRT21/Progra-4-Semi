import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Registro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre_completo: '',
    correo_usuario: '',
    sector_zona: '',
    contrasena: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre_completo || !form.correo_usuario || !form.sector_zona || !form.contrasena) {
      setError('Por favor, completa todos los campos.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2200);
    }, 1100);
  };

  return (
    <div className="login-screen">
      <div className="login-topbar">
        <button className="login-back-btn" onClick={() => navigate('/login')}>
          <span style={{ fontSize: '1.8rem' }}>🏠</span>
          <span>Inicio</span>
        </button>
        <div className="login-topbar-title">Crear cuenta</div>
      </div>

      <div className="login-body" style={{ paddingTop: '1rem', paddingBottom: '2rem' }}>
        <div className="login-box" style={{ maxWidth: '500px', padding: '2.5rem 3.5rem' }}>
          <div className="login-logo-area">
            <div className="login-logo-icon" style={{ background: 'rgba(255,255,255,0.15)' }}>💧</div>
          </div>

          <div className="login-subtitle">
            Únete a HidroVida y mantente informado sobre la calidad del agua en tu comunidad.
          </div>

          {error && <div className="login-alert login-alert-error">⚠️ {error}</div>}
          {success && (
            <div className="login-alert login-alert-success">
              ✅ ¡Cuenta creada! Espera a que el administrador te active.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="login-label">Nombre completo</label>
              <input
                type="text"
                name="nombre_completo"
                className="login-input"
                placeholder="Ej. Juan Pérez"
                value={form.nombre_completo}
                onChange={handleChange}
                id="reg-nombre"
              />
            </div>

            <div className="form-group">
              <label className="login-label">Número de cuenta</label>
              <input
                type="text"
                name="correo_usuario"
                className="login-input"
                placeholder="0000-000-0000"
                value={form.correo_usuario}
                onChange={handleChange}
                id="reg-cuenta"
              />
            </div>

            <div className="form-group">
              <label className="login-label">Sector / Zona</label>
              <input
                type="text"
                name="sector_zona"
                className="login-input"
                placeholder="Caserío / calle / número de casa"
                value={form.sector_zona}
                onChange={handleChange}
                id="reg-sector"
              />
            </div>

            <div className="form-group">
              <label className="login-label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  name="contrasena"
                  className="login-input"
                  placeholder="**********"
                  value={form.contrasena}
                  onChange={handleChange}
                  id="reg-contrasena"
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  className="toggle-pass-btn"
                  onClick={() => setShowPass(v => !v)}
                  tabIndex={-1}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-login"
              disabled={loading || success}
              id="reg-submit-btn"
              style={{ width: '60%' }}
            >
              {loading ? 'Procesando...' : 'Crear cuenta'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.85)' }}>
              ¿Ya tienes cuenta? <Link to="/login" style={{ color: '#1a5c8b', fontWeight: 800 }}>Iniciar sesión</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
