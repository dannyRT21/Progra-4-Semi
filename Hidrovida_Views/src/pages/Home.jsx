import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Mock data
const mockSensor = { ph: 7.2, nivelTanque: 78, ultimaActualizacion: 'Hace 5 minutos' };
const mockAlertaPrioritaria = {
  tipo: 'yellow',
  titulo: 'Mantenimiento programado en Sector A',
  zona: 'Sector A - Colonia El Roble',
  fecha: 'Lunes 2 de Junio, 08:00 AM',
  motivo: 'Revisión preventiva de tuberías principales'
};
const mockAlertas = [
  { id: 1, tipo: 'yellow', titulo: 'Mantenimiento programado', zona: 'Sector A', tiempo: 'Hace 2 horas' },
  { id: 2, tipo: 'blue', titulo: 'Nueva medición registrada', zona: 'Sistema Central', tiempo: 'Hace 5 min' },
  { id: 3, tipo: 'blue', titulo: 'Sistema actualizado correctamente', zona: 'Red General', tiempo: 'Hace 1 hora' },
];

function getPhStatus(ph) {
  if (ph >= 6.5 && ph <= 8.5) return { color: '#2cc0b3', text: 'SEGURO', icon: '🛡️', optimo: 'Óptimo', sub: 'Tu agua es apta para el consumo' };
  if ((ph >= 6.0 && ph < 6.5) || (ph > 8.5 && ph <= 9.0)) return { color: '#f1c40f', text: 'PRECAUCIÓN', icon: '⚠️', optimo: 'Revisar', sub: 'pH ligeramente fuera de rango' };
  return { color: '#e74c3c', text: 'RIESGO', icon: '❌', optimo: 'Peligro', sub: 'No apta para el consumo humano' };
}

export default function Home({ isLoggedIn }) {
  const status = getPhStatus(mockSensor.ph);
  const [alertaDismissed, setAlertaDismissed] = useState(false);

  return (
    <div className="home-page">
      {/* ─── LOGGED-IN VIEW ─── */}
      {isLoggedIn ? (
        <div className="container-user">
          {/* Alert Banner */}
          {!alertaDismissed && (
            <div className={`alert-banner-card alert-${mockAlertaPrioritaria.tipo}`}>
              <div className="alert-banner-left">
                <div className={`alert-banner-icon-circle icon-${mockAlertaPrioritaria.tipo}`}>
                  {mockAlertaPrioritaria.tipo === 'yellow' ? '⚠️' : '🔵'}
                </div>
                <div>
                  <h5 className="alert-banner-title">{mockAlertaPrioritaria.titulo}</h5>
                  <p className="alert-banner-meta">📍 {mockAlertaPrioritaria.zona} &nbsp;·&nbsp; 🕐 {mockAlertaPrioritaria.fecha}</p>
                  <p className="alert-banner-motivo"><strong>Motivo:</strong> {mockAlertaPrioritaria.motivo}</p>
                </div>
              </div>
              <div className="alert-banner-actions">
                <Link to="/alertas" className={`btn btn-alert-${mockAlertaPrioritaria.tipo}`}>Ver detalles</Link>
                <button className="alert-dismiss-btn" onClick={() => setAlertaDismissed(true)}>✕</button>
              </div>
            </div>
          )}

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

          {/* Cards de sensores */}
          <div className="sensor-cards-grid">
            {/* pH */}
            <div className="sensor-card">
              <div className="sensor-icon-wrap" style={{ background: '#eef7fc', color: '#299bc4' }}>💧</div>
              <div>
                <div className="sensor-label">pH del agua</div>
                <div className="sensor-value">{mockSensor.ph}</div>
                <span className="sensor-badge" style={{ background: status.color + '20', color: status.color, border: `1px solid ${status.color}50` }}>{status.optimo}</span>
                <div className="sensor-sub">Rango ideal: 6.5 – 8.5</div>
              </div>
            </div>
            {/* Nivel tanque */}
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
            {/* Última medición */}
            <div className="sensor-card">
              <div className="sensor-icon-wrap" style={{ background: '#fffbeb', color: '#d97706' }}>🕐</div>
              <div>
                <div className="sensor-label">Última medición</div>
                <div className="sensor-value" style={{ fontSize: '1.2rem' }}>{mockSensor.ultimaActualizacion}</div>
                <span className="badge-live">🟢 En tiempo real</span>
              </div>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="card-panel mb-4">
            <h5 className="panel-card-title">Acciones rápidas</h5>
            <div className="quick-actions-grid">
              <Link to="/calidad" className="quick-action-btn quick-action-blue">
                <span>Consultar calidad completa</span>
                <span>›</span>
              </Link>
              <Link to="/reportar" className="quick-action-btn quick-action-green">
                <span>Reportar problema / falla</span>
                <span>›</span>
              </Link>
              <Link to="/alertas" className="quick-action-btn quick-action-amber">
                <span>Ver todas las alertas</span>
                <span>›</span>
              </Link>
            </div>
          </div>

          {/* Banner cumplimiento */}
          <div className="compliance-banner-card">
            <span className="compliance-icon">✅</span>
            <span className="compliance-text">Tu agua cumple con los estándares de calidad del MINSAL y la OMS. Seguimos monitoreando para garantizar tu bienestar.</span>
          </div>

          {/* Notificaciones recientes */}
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
              <div className="notif-item">
                <div className="notif-dot notif-blue">💧</div>
                <div className="notif-content">
                  <div className="notif-title">Nueva medición registrada</div>
                  <div className="notif-meta">pH: {mockSensor.ph} – Estado: {status.optimo}</div>
                </div>
                <span className="notif-time">{mockSensor.ultimaActualizacion}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ─── GUEST LANDING VIEW ─── */
        <div className="landing-page">
          {/* Hero */}
          <section className="hero-section">
            <div className="hero-text">
              <h1 className="hero-title">Tu tranquilidad,<br />nuestra prioridad</h1>
              <p className="hero-subtitle">
                Hidrovida te permite monitorear la calidad del agua en tiempo real.
                Recibe alertas instantáneas de cortes y reporta incidencias
                fácilmente para asegurar el bienestar de tu familia.
              </p>
              <Link to="/calidad" className="hero-cta-btn">
                Consultar calidad del agua →
              </Link>
            </div>
            <div className="hero-image">
              <div className="hero-water-icon">
                <div className="hero-water-tower">
                  <div className="wt-tank"></div>
                  <div className="wt-legs">
                    <div className="wt-leg"></div>
                    <div className="wt-leg"></div>
                    <div className="wt-leg"></div>
                  </div>
                  <div className="wt-drops">
                    <div className="wt-drop wt-drop-1">💧</div>
                    <div className="wt-drop wt-drop-2">💧</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Panel de Resumen */}
          <div className="panel-container-guest">
            <h2 className="panel-title-guest">Panel de resumen de estado</h2>
            <div className="gauge-section-guest">
              <div className="gauge-container-ui">
                <div className="gauge-box-ui" style={{ borderColor: status.color + '40' }}>
                  <div className="gauge-inner-ui">
                    <span className="gauge-icon" style={{ color: status.color }}>{status.icon}</span>
                    <div className="gauge-label">ESTADO GENERAL:</div>
                    <div className="gauge-value" style={{ color: status.color }}>{status.text}</div>
                  </div>
                </div>
              </div>
              <div className="status-items-guest">
                <div className="status-item-guest">
                  <span className="status-item-icon">👤</span>
                  <div>
                    <h4 className="status-item-title">Tu agua hoy:</h4>
                    <div className="status-item-value">pH {mockSensor.ph} | <span style={{ color: status.color }}>{status.optimo}</span></div>
                    <p className="status-item-sub">{status.sub}</p>
                  </div>
                </div>
                <div className="status-item-guest">
                  <span className="status-item-icon">🕐</span>
                  <div>
                    <h4 className="status-item-title">Última medición</h4>
                    <div className="status-item-value">{mockSensor.ultimaActualizacion}</div>
                    <p className="status-item-sub">Actualización en tiempo real</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Banner */}
          <div className="action-banner-guest">
            <div className="action-banner-left">
              <span className="action-banner-icon">📣</span>
              <div>
                <h3>¿Ves algún problema?</h3>
                <p>Reporta incidencias y ayuda a tu comunidad</p>
              </div>
            </div>
            <Link to="/reportar" className="btn-teal-custom">Reportar incidencia →</Link>
          </div>

          {/* Tips de agua */}
          <div className="tips-section-guest">
            <h3 className="tips-title">Consejos para el cuidado del agua</h3>
            <div className="tips-grid">
              <div className="tip-card-guest tip-pink">
                <div className="tip-emoji">🚿</div>
                <div>
                  <h5>Duchas cortas</h5>
                  <p>Reduce el tiempo en la ducha para ahorrar agua y energía en tu hogar.</p>
                </div>
              </div>
              <div className="tip-card-guest tip-blue">
                <div className="tip-emoji">🔧</div>
                <div>
                  <h5>Repara fugas</h5>
                  <p>Una fuga pequeña puede desperdiciar cientos de litros al mes. Repárala pronto.</p>
                </div>
              </div>
              <div className="tip-card-guest tip-green">
                <div className="tip-emoji">🫧</div>
                <div>
                  <h5>Usa la lavadora llena</h5>
                  <p>Espera a tener carga completa antes de usar la lavadora para optimizar el consumo.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Banner */}
          <div className="compliance-banner-guest">
            <div className="compliance-left">
              <span>🛡️</span>
              <span>Cumplimos con las normativas de calidad establecidas por las Autoridades</span>
            </div>
            <Link to="/estandares" className="compliance-link-btn">Ver normativas de OMS y MINSAL →</Link>
          </div>
        </div>
      )}
    </div>
  );
}
