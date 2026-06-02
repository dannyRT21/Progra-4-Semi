import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Mock user data
const mockUser = {
  nombre: 'Carlos Martínez',
  cuenta: '0023-001-0089',
  sector: 'Colonia El Roble, Calle Principal #45',
  correo: 'carlos.m@ejemplo.com',
};
const mockSensor = { ph: 7.2, nivelTanque: 78, ultimaActualizacion: 'Hace 5 minutos' };
const mockAlertas = [
  { id: 1, tipo: 'yellow', titulo: 'Mantenimiento programado en Sector A', zona: 'Sector A', tiempo: 'Hace 2 horas' },
  { id: 2, tipo: 'blue', titulo: 'Nueva medición registrada', zona: 'Sistema Central', tiempo: 'Hace 5 min' },
  { id: 3, tipo: 'blue', titulo: 'Sistema actualizado correctamente', zona: 'Red General', tiempo: 'Hace 1 hora' },
];

function getPhStatus(ph) {
  if (ph >= 6.5 && ph <= 8.5) return { color: '#2cc0b3', text: 'SEGURO', icon: '🛡️', optimo: 'Óptimo', sub: 'Tu agua es apta para el consumo' };
  if ((ph >= 6.0 && ph < 6.5) || (ph > 8.5 && ph <= 9.0)) return { color: '#f1c40f', text: 'PRECAUCIÓN', icon: '⚠️', optimo: 'Revisar', sub: 'pH ligeramente fuera de rango' };
  return { color: '#e74c3c', text: 'RIESGO', icon: '❌', optimo: 'Peligro', sub: 'No apta para el consumo humano' };
}

export default function InicioUsuario() {
  const status = getPhStatus(mockSensor.ph);
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <div className="container-user">
      {/* Welcome banner */}
      <div className="welcome-banner">
        <div>
          <h2 className="welcome-title">¡Bienvenido, {mockUser.nombre.split(' ')[0]}! 👋</h2>
          <p className="welcome-sub">Cuenta: #{mockUser.cuenta} · {mockUser.sector}</p>
        </div>
        <button className="btn btn-outline-white" id="btn-ver-perfil" onClick={() => setShowProfileModal(true)}>
          👤 Mi Perfil
        </button>
      </div>

      {/* Estado General */}
      <div className="card-panel text-center mb-4">
        <h5 className="panel-card-title">📊 Estado general del agua</h5>
        <div className="gauge-container-ui">
          <div className="gauge-box-ui" style={{ borderColor: status.color + '40' }}>
            <div className="gauge-inner-ui">
              <span className="gauge-icon" style={{ color: status.color }}>{status.icon}</span>
              <div className="gauge-label">ESTADO GENERAL:</div>
              <div className="gauge-value" style={{ color: status.color }}>{status.text}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor cards */}
      <div className="sensor-cards-grid">
        <div className="sensor-card">
          <div className="sensor-icon-wrap" style={{ background: '#eef7fc', color: '#299bc4' }}>💧</div>
          <div>
            <div className="sensor-label">pH del agua</div>
            <div className="sensor-value">{mockSensor.ph}</div>
            <span className="sensor-badge" style={{ background: status.color + '20', color: status.color, border: `1px solid ${status.color}50` }}>{status.optimo}</span>
            <div className="sensor-sub">Rango ideal: 6.5 – 8.5</div>
          </div>
        </div>
        <div className="sensor-card">
          <div className="sensor-icon-wrap" style={{ background: '#f0fdf4', color: '#198754' }}>🗄️</div>
          <div style={{ flex: 1 }}>
            <div className="sensor-label">Nivel del tanque</div>
            <div className="sensor-value">{mockSensor.nivelTanque}%</div>
            <div className="sensor-progress-bg">
              <div className="sensor-progress-fill" style={{ width: `${mockSensor.nivelTanque}%` }} />
            </div>
            <div className="sensor-sub">Capacidad del tanque</div>
          </div>
        </div>
        <div className="sensor-card">
          <div className="sensor-icon-wrap" style={{ background: '#fffbeb', color: '#d97706' }}>🕐</div>
          <div>
            <div className="sensor-label">Última medición</div>
            <div className="sensor-value" style={{ fontSize: '1.2rem' }}>{mockSensor.ultimaActualizacion}</div>
            <span className="badge-live">🟢 En tiempo real</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-panel mb-4">
        <h5 className="panel-card-title">Acciones rápidas</h5>
        <div className="quick-actions-grid">
          <Link to="/calidad" className="quick-action-btn quick-action-blue">
            <span>Consultar calidad completa</span><span>›</span>
          </Link>
          <Link to="/reportar" className="quick-action-btn quick-action-green">
            <span>Reportar problema / falla</span><span>›</span>
          </Link>
          <Link to="/alertas" className="quick-action-btn quick-action-amber">
            <span>Ver todas las alertas</span><span>›</span>
          </Link>
        </div>
      </div>

      {/* Compliance Banner */}
      <div className="compliance-banner-card">
        <span className="compliance-icon">✅</span>
        <span className="compliance-text">Tu agua cumple con los estándares de calidad del MINSAL y la OMS. Seguimos monitoreando para garantizar tu bienestar.</span>
      </div>

      {/* Notificaciones */}
      <div className="card-panel">
        <div className="card-panel-header">
          <h5 className="panel-card-title mb-0">Notificaciones recientes</h5>
          <Link to="/alertas" className="link-see-all">Ver todas</Link>
        </div>
        <div className="notif-list">
          {mockAlertas.map(al => (
            <Link to="/alertas" key={al.id} className="notif-item">
              <div className={`notif-dot notif-${al.tipo}`}>
                {al.tipo === 'yellow' ? '⚠️' : al.tipo === 'red' ? '🔴' : 'ℹ️'}
              </div>
              <div className="notif-content">
                <div className="notif-title">{al.titulo}</div>
                <div className="notif-meta">{al.zona} · {al.tiempo}</div>
              </div>
              <span className="notif-time">{al.tiempo}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">👤 Mi Perfil</h3>
              <button className="modal-close" id="btn-cerrar-perfil" onClick={() => setShowProfileModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="profile-info-grid">
                <div className="profile-field">
                  <div className="profile-field-label">Nombre completo</div>
                  <div className="profile-field-value">{mockUser.nombre}</div>
                </div>
                <div className="profile-field">
                  <div className="profile-field-label">Número de cuenta</div>
                  <div className="profile-field-value">{mockUser.cuenta}</div>
                </div>
                <div className="profile-field">
                  <div className="profile-field-label">Sector / Zona</div>
                  <div className="profile-field-value">{mockUser.sector}</div>
                </div>
                <div className="profile-field">
                  <div className="profile-field-label">Correo</div>
                  <div className="profile-field-value">{mockUser.correo}</div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" id="btn-editar-perfil" onClick={() => setShowProfileModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
