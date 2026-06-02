import React, { useState, useEffect } from 'react';
import AdminLayout from '../layouts/AdminLayout.jsx';
import Card from '../components/Card.jsx';

const MOCK_ALERTS = [
  { id: 1, tipo: 'yellow', titulo: 'Mantenimiento programado', zona: 'Zona Norte', fecha_texto: '2 Jun 2026, 08:00', motivo: 'Reparación de tubería principal' },
  { id: 2, tipo: 'blue',   titulo: 'Nueva medición registrada', zona: 'Zona Centro', fecha_texto: '1 Jun 2026, 14:30', motivo: 'pH: 7.2 – Estado: Normal' },
  { id: 3, tipo: 'red',    titulo: 'Nivel bajo en tanque', zona: 'Zona Sur', fecha_texto: '1 Jun 2026, 09:00', motivo: 'Nivel crítico al 12%' },
];

const MOCK_ACTIVITY = [
  { icon: '✅', color: '#16a34a', titulo: 'Recibo generado', descripcion: 'Recibo HVR-1024 emitido para cuenta #7', tiempo: 'Hace 12 min', bg: '#f0fdf4' },
  { icon: '⚠️', color: '#d97706', titulo: 'Alerta publicada', descripcion: 'Corte de agua en Zona Norte programado', tiempo: 'Hace 45 min', bg: '#fffbeb' },
  { icon: '👤', color: '#2563eb', titulo: 'Nuevo usuario registrado', descripcion: 'María López – Sector B2', tiempo: 'Hace 1 h', bg: '#eff6ff' },
  { icon: '💧', color: '#299bc4', titulo: 'Sensor actualizado', descripcion: 'pH ajustado a 7.4 – Nivel tanque: 82%', tiempo: 'Hace 2 h', bg: '#f0f9ff' },
  { icon: '🖨️', color: '#7c3aed', titulo: 'Reporte impreso', descripcion: 'Falla tubería – Sector C3 resuelta', tiempo: 'Hace 3 h', bg: '#f5f3ff' },
];

function AlertBadge({ tipo }) {
  const map = { red: 'badge-red', yellow: 'badge-yellow', blue: 'badge-blue' };
  const labels = { red: 'Alta', yellow: 'Media', blue: 'Info' };
  return <span className={`badge ${map[tipo] || 'badge-gray'}`}>{labels[tipo] || tipo}</span>;
}

export default function Dashboard() {
  const [ph, setPh]         = useState(7.2);
  const [nivel, setNivel]   = useState(75);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab]       = useState('sensores');
  const [sensorPh, setSensorPh]     = useState(7.2);
  const [sensorNivel, setSensorNivel] = useState(75);
  const [saved, setSaved]   = useState(false);

  const phStatus = () => {
    if (ph >= 6.5 && ph <= 8.5) return { label: 'Normal', color: '#16a34a', bg: '#d1fae5', text: 'badge-green' };
    if ((ph >= 6.0 && ph < 6.5) || (ph > 8.5 && ph <= 9.0)) return { label: 'Revisar', color: '#d97706', bg: '#fef3c7', text: 'badge-yellow' };
    return { label: 'Peligro', color: '#e53e3e', bg: '#fee2e2', text: 'badge-red' };
  };

  const status = phStatus();

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSaveSensor = (e) => {
    e.preventDefault();
    setPh(parseFloat(sensorPh));
    setNivel(parseInt(sensorNivel));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">¡Bienvenido, Administrador! 👋</h1>
          <p className="page-subtitle">Resumen general del sistema de monitoreo de agua</p>
        </div>
        <button className="btn btn-outline-primary btn-sm" onClick={handleRefresh}>
          {refreshing ? '⏳' : '🔄'} Actualizar
        </button>
      </div>

      {/* Stats Row */}
      <div className="stat-grid">
        <div className="stat-card">
          <div className={`stat-icon-wrap stat-icon-blue`}>💧</div>
          <div>
            <div className="stat-label">pH del Agua</div>
            <div className="stat-value" style={{ color: status.color }}>{ph.toFixed(1)}</div>
            <div className="stat-sub">
              <span className={`badge ${status.text}`}>{status.label}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap stat-icon-green">📡</div>
          <div>
            <div className="stat-label">Estaciones activas</div>
            <div className="stat-value">24</div>
            <div className="stat-sub">de 28 estaciones</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap stat-icon-amber">⚠️</div>
          <div>
            <div className="stat-label">Alertas activas</div>
            <div className="stat-value">{MOCK_ALERTS.length}</div>
            <div className="stat-sub">Requieren atención</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap stat-icon-purple">👥</div>
          <div>
            <div className="stat-label">Usuarios registrados</div>
            <div className="stat-value">312</div>
            <div className="stat-sub" style={{ color: '#16a34a' }}>↑ +12% vs mes ant.</div>
          </div>
        </div>
      </div>

      {/* Main Content Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Water Quality Chart (simulated) */}
        <Card
          title="Calidad del agua – Resumen"
          subtitle="Lecturas de pH en el tiempo"
          actions={
            <select className="form-control" style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.82rem' }}>
              <option>Últimas 15 lecturas</option>
              <option>Últimas 7 lecturas</option>
            </select>
          }
        >
          {/* Tank Level Visual */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', marginBottom: '0.4rem' }}>
              <span>Nivel del Tanque</span>
              <span style={{ fontWeight: 700 }}>{nivel}%</span>
            </div>
            <div className="progress">
              <div className="progress-bar progress-bar-green" style={{ width: `${nivel}%` }} />
            </div>
          </div>

          {/* Simulated sparkline-like bar chart */}
          <div className="chart-placeholder" style={{ height: 250, padding: '1.5rem' }}>
            <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', gap: '6px', height: 180, paddingBottom: '0.5rem' }}>
              {[7.1, 7.3, 7.0, 7.4, 7.2, 6.9, 7.6, 7.3, 7.5, 7.2, 7.4, 7.1, 7.3, 7.2, ph].map((v, i) => {
                const pct = Math.max(0, Math.min(1, (v - 5.5) / 4));
                const barColor = v >= 6.5 && v <= 8.5 ? '#2cc0b3' : v >= 6.0 ? '#d97706' : '#e53e3e';
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    <div style={{
                      width: '100%', background: barColor + '22',
                      borderRadius: '4px 4px 0 0', position: 'relative',
                      height: `${pct * 140 + 20}px`, minHeight: 20,
                      transition: 'height 0.4s ease',
                      border: `1.5px solid ${barColor}`,
                    }}>
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        background: barColor, opacity: 0.7,
                        height: `${pct * 60 + 8}px`, borderRadius: '4px 4px 0 0'
                      }} />
                    </div>
                    <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 600 }}>{v.toFixed(1)}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.7rem', color: '#94a3b8' }}>
              <span>Hace 15 lecturas</span>
              <span>Ahora</span>
            </div>
          </div>
        </Card>

        {/* Recent Alerts */}
        <Card title="Alertas recientes" actions={<span style={{ fontSize: '0.78rem', color: '#299bc4', cursor: 'pointer', fontWeight: 600 }}>Ver todas</span>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {MOCK_ALERTS.map(a => {
              const borderMap = { red: '#e53e3e', yellow: '#d97706', blue: '#2563eb' };
              const bgMap = { red: '#fff5f5', yellow: '#fffbeb', blue: '#eff6ff' };
              return (
                <div key={a.id} style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 10,
                  borderLeft: `4px solid ${borderMap[a.tipo]}`,
                  background: bgMap[a.tipo],
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#1b3650' }}>{a.titulo}</span>
                    <AlertBadge tipo={a.tipo} />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#4a657c' }}>{a.motivo}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.3rem' }}>
                    📍 {a.zona} · 🕐 {a.fecha_texto}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card
        title="Actividad del sistema"
        subtitle="Eventos recientes y acciones administrativas"
        actions={
          <button className="btn btn-sm btn-outline-primary" onClick={handleRefresh}>
            🔄 Actualizar
          </button>
        }
        style={{ marginBottom: '1.25rem' }}
      >
        <div className="activity-feed">
          {MOCK_ACTIVITY.map((act, i) => (
            <div key={i} className="activity-item">
              <div
                className="activity-dot"
                style={{ background: act.bg, color: act.color, fontSize: '1rem' }}
              >
                {act.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.87rem', color: '#1b3650' }}>{act.titulo}</span>
                  <span style={{ fontSize: '0.73rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{act.tiempo}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.15rem' }}>{act.descripcion}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Admin Console */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {/* Console Header */}
        <div style={{
          background: '#1e293b', color: 'white',
          padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          <span style={{ fontSize: '1.2rem', color: '#f59e0b' }}>🛡️</span>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>Consola de Control de Administración</span>
        </div>

        {/* Tabs */}
        <div className="tabs-bar" style={{ padding: '0 1.5rem', marginBottom: 0, borderBottom: '2px solid #e8ecf0' }}>
          {[
            { key: 'sensores', label: '📡 Simulador de Sensores' },
            { key: 'alertas',  label: '🔔 Gestión de Alertas' },
            { key: 'usuarios', label: '👥 Usuarios' },
          ].map(t => (
            <button
              key={t.key}
              className={`tab-btn${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '1.5rem' }}>
          {/* Tab: Sensores */}
          {tab === 'sensores' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1b3650', marginBottom: '1rem' }}>
                  📊 Simular Lectura de Sensores
                </h3>
                <form onSubmit={handleSaveSensor}>
                  <div className="form-group">
                    <label className="form-label">Nivel de pH (Rango seguro: 6.5 – 8.5)</label>
                    <div className="input-group">
                      <div className="input-group-text">💧</div>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="14"
                        className="form-control"
                        value={sensorPh}
                        onChange={e => setSensorPh(e.target.value)}
                        placeholder="Ej. 7.2"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nivel del tanque (%)</label>
                    <div className="input-group">
                      <div className="input-group-text">%</div>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="form-control"
                        value={sensorNivel}
                        onChange={e => setSensorNivel(e.target.value)}
                        placeholder="Ej. 75"
                      />
                    </div>
                    {/* Live progress preview */}
                    <div style={{ marginTop: '0.5rem' }}>
                      <div className="progress">
                        <div className="progress-bar progress-bar-blue" style={{ width: `${Math.min(100, Math.max(0, sensorNivel))}%` }} />
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary">
                    🔄 Actualizar Simulador
                  </button>
                  {saved && (
                    <span style={{ marginLeft: '0.75rem', color: '#16a34a', fontWeight: 600, fontSize: '0.85rem' }}>
                      ✅ Guardado
                    </span>
                  )}
                </form>
              </div>

              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1b3650', marginBottom: '1rem' }}>
                  ℹ️ Guía de Indicadores Rápidos
                </h3>
                <div style={{ background: '#f7fafc', borderRadius: 12, padding: '1.25rem', border: '1px solid #e8ecf0' }}>
                  {[
                    { badge: 'badge-green', label: 'Normal', desc: 'pH entre 6.5 y 8.5. (Agua completamente potable)' },
                    { badge: 'badge-yellow', label: 'Revisar', desc: 'pH 6.0–6.4 ó 8.6–9.0. (Precaución)' },
                    { badge: 'badge-red', label: 'Peligro', desc: 'pH menor a 6.0 ó mayor a 9.0. (No apta)' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <span className={`badge ${item.badge}`} style={{ minWidth: 70, justifyContent: 'center' }}>{item.label}</span>
                      <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{item.desc}</span>
                    </div>
                  ))}
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem', marginBottom: 0 }}>
                    * Los valores alterados aquí impactan todas las vistas en tiempo real.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Alertas */}
          {tab === 'alertas' && (
            <AlertasTab />
          )}

          {/* Tab: Usuarios */}
          {tab === 'usuarios' && (
            <UsuariosTab />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

/* ── Sub-tabs ── */

function AlertasTab() {
  const [alerts, setAlerts] = useState([
    { id: 1, tipo: 'yellow', titulo: 'Mantenimiento programado', zona: 'Zona Norte', fecha: '2026-06-05', hora: '08:00', motivo: 'Reparación de tubería principal' },
    { id: 2, tipo: 'blue', titulo: 'Alerta informativa', zona: 'Zona Centro', fecha: '2026-06-03', hora: '10:00', motivo: 'Limpieza de tanque programada' },
  ]);
  const [form, setForm] = useState({ tipo: 'yellow', titulo: '', zona: '', fecha: '', hora: '', motivo: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setAlerts(prev => [...prev, { ...form, id: Date.now() }]);
      setForm({ tipo: 'yellow', titulo: '', zona: '', fecha: '', hora: '', motivo: '' });
      setSaving(false);
    }, 800);
  };

  const handleDelete = (id) => setAlerts(prev => prev.filter(a => a.id !== id));

  const borderMap = { red: '#e53e3e', yellow: '#d97706', blue: '#2563eb' };
  const badgeMap  = { red: 'badge-red', yellow: 'badge-yellow', blue: 'badge-blue' };
  const labelMap  = { red: 'Alta', yellow: 'Media', blue: 'Info' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      {/* Form */}
      <div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1b3650', marginBottom: '1rem' }}>
          📢 Publicar Nueva Alerta
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tipo de Alerta</label>
              <select className="form-control" value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}>
                <option value="red">Alta (Rojo)</option>
                <option value="yellow">Media (Amarillo)</option>
                <option value="blue">Informativa (Azul)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Zona Afectada</label>
              <input type="text" className="form-control" placeholder="Ej. Zona Norte" value={form.zona} onChange={e => setForm(p => ({ ...p, zona: e.target.value }))} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Título de Alerta</label>
            <input type="text" className="form-control" placeholder="Corte de agua por mantenimiento" value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input type="date" className="form-control" value={form.fecha} onChange={e => setForm(p => ({ ...p, fecha: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Hora</label>
              <input type="time" className="form-control" value={form.hora} onChange={e => setForm(p => ({ ...p, hora: e.target.value }))} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Motivo</label>
            <input type="text" className="form-control" placeholder="Reparación de tubería" value={form.motivo} onChange={e => setForm(p => ({ ...p, motivo: e.target.value }))} required />
          </div>
          <button type="submit" className="btn btn-warning" disabled={saving}>
            {saving ? '⏳ Publicando...' : '📢 Publicar Alerta'}
          </button>
        </form>
      </div>

      {/* Active Alerts */}
      <div>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1b3650', marginBottom: '1rem' }}>
          🗑️ Alertas Activas
        </h3>
        {alerts.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>Sin alertas activas</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {alerts.map(a => (
              <div key={a.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: '#f7fafc', borderRadius: 10, padding: '0.8rem 1rem',
                borderLeft: `4px solid ${borderMap[a.tipo] || '#94a3b8'}`
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className={`badge ${badgeMap[a.tipo] || 'badge-gray'}`}>{labelMap[a.tipo] || a.tipo}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{a.titulo}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>📍 {a.zona} · {a.motivo}</div>
                </div>
                <button
                  className="btn btn-sm btn-outline-danger btn-icon"
                  onClick={() => handleDelete(a.id)}
                  title="Eliminar"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const MOCK_USERS = [
  { id: 1, nombre: 'Juan Carlos Mejía',    correo: '0021-450-0012', zona: 'Sector A', rol: 'usuario',  activo: true },
  { id: 2, nombre: 'María López Hernández', correo: '0021-450-0013', zona: 'Sector B', rol: 'usuario',  activo: true },
  { id: 3, nombre: 'Pedro Martínez',        correo: '0021-450-0014', zona: 'Sector C', rol: 'admin',    activo: true },
  { id: 4, nombre: 'Ana Torres',            correo: '0021-450-0015', zona: 'Sector A', rol: 'usuario',  activo: false },
  { id: 5, nombre: 'Luis Ramos',            correo: '0021-450-0016', zona: 'Sector D', rol: 'usuario',  activo: true },
];

function UsuariosTab() {
  const [users, setUsers] = useState(MOCK_USERS);
  const [search, setSearch] = useState('');

  const filtered = users.filter(u =>
    u.nombre.toLowerCase().includes(search.toLowerCase()) ||
    u.correo.includes(search) ||
    u.zona.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActivo = (id) => setUsers(prev => prev.map(u => u.id === id ? { ...u, activo: !u.activo } : u));
  const changeRol = (id, rol) => setUsers(prev => prev.map(u => u.id === id ? { ...u, rol } : u));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1b3650', margin: 0 }}>
          👥 Control de Roles y Cuentas
        </h3>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Filtrar usuarios..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>N° Cuenta</th>
              <th>Sector / Zona</th>
              <th>Rol</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600 }}>{u.nombre}</td>
                <td><code style={{ background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: 4, fontSize: '0.8rem' }}>{u.correo}</code></td>
                <td>{u.zona}</td>
                <td>
                  <select
                    className="form-control"
                    style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem', width: 'auto' }}
                    value={u.rol}
                    onChange={e => changeRol(u.id, e.target.value)}
                  >
                    <option value="usuario">Usuario</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      onClick={() => toggleActivo(u.id)}
                      style={{
                        width: 36, height: 20, borderRadius: 10,
                        background: u.activo ? '#16a34a' : '#cbd5e1',
                        border: 'none', cursor: 'pointer',
                        position: 'relative', transition: 'background 0.2s'
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: 3, width: 14, height: 14,
                        background: 'white', borderRadius: '50%',
                        left: u.activo ? 18 : 3, transition: 'left 0.2s'
                      }} />
                    </button>
                    <span className={`badge ${u.activo ? 'badge-green' : 'badge-gray'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
