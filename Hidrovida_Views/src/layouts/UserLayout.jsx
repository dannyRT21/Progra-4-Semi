import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

// Mock usuario logueado
const mockUser = { nombre: 'Carlos Martínez', cuenta: '0023-001-0089' };

export default function UserLayout({ children, isLoggedIn = false, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="ul-shell">
      {/* ── HEADER ── */}
      <header className="ul-header">
        <Link to="/" className="ul-logo">
          <span className="ul-logo-icon">💧</span>
          <span className="ul-logo-text">HidroVida</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="ul-nav">
          <Link to="/" className={`ul-nav-item${isActive('/') ? ' active' : ''}`}>
            <span className="ul-nav-icon">🏠</span>
            <span>Inicio</span>
          </Link>
          <Link to="/calidad" className={`ul-nav-item${isActive('/calidad') ? ' active' : ''}`}>
            <span className="ul-nav-icon">💧</span>
            <span>Calidad</span>
          </Link>
          <Link to="/reportar" className={`ul-nav-item${isActive('/reportar') ? ' active' : ''}`}>
            <span className="ul-nav-icon">📋</span>
            <span>Reportar</span>
          </Link>
          <Link to="/alertas" className={`ul-nav-item${isActive('/alertas') ? ' active' : ''}`}>
            <span className="ul-nav-icon">🔔</span>
            <span>Alertas</span>
          </Link>
          <Link to="/estandares" className={`ul-nav-item${isActive('/estandares') ? ' active' : ''}`}>
            <span className="ul-nav-icon">📑</span>
            <span>Información</span>
          </Link>
        </nav>

        {/* Session */}
        <div className="ul-session">
          {isLoggedIn ? (
            <>
              <span className="ul-user-chip">
                <span>👤</span>
                <span>{mockUser.nombre.split(' ')[0]}</span>
              </span>
              <Link to="/inicio" className="ul-nav-item">Panel</Link>
              <button className="ul-logout-btn" onClick={onLogout}>
                Salir
              </button>
            </>
          ) : (
            <Link to="/login" className="ul-btn-login">Iniciar sesión</Link>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button className="ul-hamburger" onClick={() => setMenuOpen(v => !v)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="ul-mobile-menu">
          <Link to="/" className="ul-mobile-item" onClick={() => setMenuOpen(false)}>🏠 Inicio</Link>
          <Link to="/calidad" className="ul-mobile-item" onClick={() => setMenuOpen(false)}>💧 Calidad del Agua</Link>
          <Link to="/reportar" className="ul-mobile-item" onClick={() => setMenuOpen(false)}>📋 Reportar Problema</Link>
          <Link to="/alertas" className="ul-mobile-item" onClick={() => setMenuOpen(false)}>🔔 Alertas</Link>
          <Link to="/estandares" className="ul-mobile-item" onClick={() => setMenuOpen(false)}>📑 Información</Link>
          {isLoggedIn ? (
            <>
              <Link to="/inicio" className="ul-mobile-item" onClick={() => setMenuOpen(false)}>📊 Mi Panel</Link>
              <Link to="/perfil" className="ul-mobile-item" onClick={() => setMenuOpen(false)}>👤 Mi Perfil</Link>
              <button className="ul-mobile-item ul-mobile-logout" onClick={() => { onLogout(); setMenuOpen(false); }}>↩ Cerrar sesión</button>
            </>
          ) : (
            <Link to="/login" className="ul-mobile-item ul-mobile-login" onClick={() => setMenuOpen(false)}>Iniciar sesión</Link>
          )}
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="ul-main">
        {children}
      </main>

      {/* ── FOOTER ── */}
      <footer className="ul-footer">
        <div className="ul-footer-inner">
          <div className="ul-footer-brand">
            <Link to="/" className="ul-footer-logo">
              <span>💧</span>
              <span>HidroVida</span>
            </Link>
            <p className="ul-footer-desc">Comprometidos con la calidad del agua y bienestar de nuestra comunidad</p>
          </div>

          <div className="ul-footer-col">
            <h5>Enlaces rápidos</h5>
            <ul>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/calidad">Calidad de agua</Link></li>
              <li><Link to="/reportar">Reportes</Link></li>
              <li><Link to="/alertas">Alertas</Link></li>
              <li><Link to="/estandares">Información</Link></li>
            </ul>
          </div>

          <div className="ul-footer-col">
            <h5>Soporte</h5>
            <ul>
              <li><a href="#">Centro de ayuda</a></li>
              <li><a href="#">Preguntas frecuentes</a></li>
              <li><a href="#">Contacto</a></li>
              <li><a href="#">Términos de uso</a></li>
              <li><a href="#">Políticas de privacidad</a></li>
            </ul>
          </div>

          <div className="ul-footer-col">
            <h5>Síguenos</h5>
            <div className="ul-social-links">
              <a href="#" className="ul-social-link">📘 HidroVida.sv</a>
              <a href="#" className="ul-social-link">📸 @hidrovida.sv</a>
            </div>
          </div>
        </div>
        <div className="ul-copyright">© 2026 HidroVida. Todos los derechos reservados.</div>
      </footer>
    </div>
  );
}
