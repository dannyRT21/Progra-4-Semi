import React from 'react';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/dashboard':    'Dashboard',
  '/pagos':        'Gestión de Pagos',
  '/reportes':     'Reportes de Falla',
  '/calidad':      'Calidad del Agua',
  '/actividades':  'Actividades del Sistema',
  '/login':        'Iniciar Sesión',
  '/login-admin':  'Administración',
};

export default function Navbar({ onToggleSidebar, notifications = 3 }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'HidroVida';
  const now = new Date();
  const dateStr = now.toLocaleDateString('es-SV', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="navbar">
      <button className="navbar-toggle" onClick={onToggleSidebar} title="Toggle sidebar">
        ☰
      </button>

      <div className="navbar-title">{title}</div>

      {/* Date chip */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: '#f0f4f8', padding: '0.3rem 0.75rem',
        borderRadius: '20px', fontSize: '0.78rem', color: '#4a657c', fontWeight: 600
      }}>
        📅 {dateStr}
      </div>

      <div className="navbar-actions">
        {/* Notifications */}
        <button className="navbar-icon-btn" title="Notificaciones">
          🔔
          {notifications > 0 && <span className="navbar-badge" />}
        </button>

        {/* Settings */}
        <button className="navbar-icon-btn" title="Configuración">⚙️</button>

        {/* Avatar */}
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'linear-gradient(135deg, #299bc4, #2cc0b3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 800, fontSize: '0.82rem',
          cursor: 'pointer', flexShrink: 0
        }}>
          AD
        </div>
      </div>
    </header>
  );
}
