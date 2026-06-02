import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: '📊', path: '/dashboard', section: 'Principal' },
  { label: 'Pagos',     icon: '💳', path: '/pagos',     section: 'Gestión' },
  { label: 'Reportes',  icon: '📋', path: '/reportes',  section: 'Gestión' },
  { label: 'Calidad',   icon: '💧', path: '/calidad',   section: 'Monitoreo' },
  { label: 'Actividades', icon: '🔔', path: '/actividades', section: 'Monitoreo' },
];

export default function Sidebar({ isOpen, onToggle }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [hovered, setHovered] = useState(null);

  const goTo = (path) => {
    navigate(path);
    // Close on mobile
    if (window.innerWidth < 768) onToggle();
  };

  const sections = [...new Set(navItems.map(i => i.section))];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            zIndex: 299, display: window.innerWidth < 768 ? 'block' : 'none'
          }}
          onClick={onToggle}
        />
      )}

      <aside className={`sidebar${!isOpen ? ' hidden' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">💧</div>
          <div>
            <div className="sidebar-logo-text">HidroVida</div>
            <div className="sidebar-logo-sub">Panel Admin</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {sections.map(section => (
            <React.Fragment key={section}>
              <div className="sidebar-section-label">{section}</div>
              {navItems
                .filter(item => item.section === section)
                .map(item => {
                  const active = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      className={`sidebar-link${active ? ' active' : ''}`}
                      onClick={() => goTo(item.path)}
                      onMouseEnter={() => setHovered(item.path)}
                      onMouseLeave={() => setHovered(null)}
                      title={item.label}
                    >
                      <span className="link-icon">{item.icon}</span>
                      <span>{item.label}</span>
                      {active && (
                        <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.8 }}>●</span>
                      )}
                    </button>
                  );
                })}
            </React.Fragment>
          ))}
        </nav>

        {/* Separator */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 0.8rem' }} />

        {/* Quick links */}
        <nav style={{ padding: '0.6rem 0.8rem' }}>
          <div className="sidebar-section-label">Acceso rápido</div>
          <button className="sidebar-link" onClick={() => navigate('/login')}>
            <span className="link-icon">👤</span>
            <span>Login Usuario</span>
          </button>
          <button className="sidebar-link" onClick={() => navigate('/login-admin')}>
            <span className="link-icon">🛡️</span>
            <span>Login Admin</span>
          </button>
        </nav>

        {/* User Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">AD</div>
            <div>
              <div className="sidebar-user-name">Admin HidroVida</div>
              <div className="sidebar-user-role">Administrador</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
