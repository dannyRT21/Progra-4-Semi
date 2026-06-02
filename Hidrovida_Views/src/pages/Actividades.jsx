import React, { useState } from 'react';
import AdminLayout from '../layouts/AdminLayout.jsx';
import Card from '../components/Card.jsx';
import Modal from '../components/Modal.jsx';
import DataTable from '../components/DataTable.jsx';

const TIPO_CONFIG = {
  sensor:    { icon: '💧', label: 'Sensor',     color: '#299bc4', bg: '#f0f9ff', badge: 'badge-blue'   },
  alerta:    { icon: '⚠️', label: 'Alerta',     color: '#d97706', bg: '#fffbeb', badge: 'badge-yellow' },
  usuario:   { icon: '👤', label: 'Usuario',    color: '#2563eb', bg: '#eff6ff', badge: 'badge-blue'   },
  pago:      { icon: '💳', label: 'Pago',       color: '#16a34a', bg: '#f0fdf4', badge: 'badge-green'  },
  sistema:   { icon: '⚙️', label: 'Sistema',   color: '#7c3aed', bg: '#f5f3ff', badge: 'badge-purple' },
  reporte:   { icon: '📋', label: 'Reporte',    color: '#0f766e', bg: '#f0fdfa', badge: 'badge-green'  },
};

const MOCK_ACTIVITIES = [
  { id: 1, tipo: 'pago',    titulo: 'Recibo generado', descripcion: 'Recibo HVR-1024 emitido para cuenta #7 – Período: Mayo 2026', tiempo: 'Hace 12 min', fecha: '2026-06-02 14:30' },
  { id: 2, tipo: 'alerta',  titulo: 'Alerta publicada', descripcion: 'Corte de agua en Zona Norte programado para el 5 Jun', tiempo: 'Hace 45 min', fecha: '2026-06-02 13:57' },
  { id: 3, tipo: 'usuario', titulo: 'Nuevo usuario registrado', descripcion: 'María López – Sector B2, cuenta 0021-450-0019 creada', tiempo: 'Hace 1 h', fecha: '2026-06-02 13:10' },
  { id: 4, tipo: 'sensor',  titulo: 'Lectura de sensor actualizada', descripcion: 'pH ajustado a 7.4 – Nivel tanque: 82% – Estado: Normal', tiempo: 'Hace 2 h', fecha: '2026-06-02 12:00' },
  { id: 5, tipo: 'reporte', titulo: 'Reporte de falla resuelto', descripcion: 'Tubería rota en Sector C3 – Marcado como resuelto', tiempo: 'Hace 3 h', fecha: '2026-06-02 11:00' },
  { id: 6, tipo: 'sistema', titulo: 'Backup del sistema', descripcion: 'Respaldo automático de base de datos completado exitosamente', tiempo: 'Hace 5 h', fecha: '2026-06-02 09:00' },
  { id: 7, tipo: 'pago',    titulo: 'Recibo marcado como pagado', descripcion: 'Recibo HVR-1020 – Cuenta #3 – $43.50 confirmado', tiempo: 'Hace 6 h', fecha: '2026-06-02 08:30' },
  { id: 8, tipo: 'alerta',  titulo: 'Alerta eliminada', descripcion: 'Alerta de corte de agua en Zona Sur removida por expiración', tiempo: 'Ayer', fecha: '2026-06-01 20:00' },
  { id: 9, tipo: 'sensor',  titulo: 'Sensor en estado crítico', descripcion: 'pH = 5.8 detectado. Alerta automática generada', tiempo: 'Ayer', fecha: '2026-06-01 14:00' },
  { id: 10, tipo: 'usuario', titulo: 'Rol de usuario modificado', descripcion: 'Pedro Martínez ascendido a Administrador', tiempo: 'Hace 2 días', fecha: '2026-05-31 10:00' },
];

export default function Actividades() {
  const [activities, setActivities] = useState(MOCK_ACTIVITIES);
  const [filterTipo, setFilterTipo] = useState('todos');
  const [viewMode, setViewMode]     = useState('timeline');
  const [modalDetail, setModalDetail] = useState(null);
  const [modalNew, setModalNew]     = useState(false);
  const [toast, setToast]           = useState(null);

  // New activity form
  const [form, setForm] = useState({ tipo: 'sistema', titulo: '', descripcion: '' });
  const [saving, setSaving] = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const filtered = activities.filter(a =>
    filterTipo === 'todos' || a.tipo === filterTipo
  );

  const handleDelete = (id) => {
    setActivities(prev => prev.filter(a => a.id !== id));
    showToast('🗑️ Actividad eliminada');
  };

  const handleNew = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      const now = new Date();
      setActivities(prev => [{
        ...form, id: Date.now(),
        tiempo: 'Ahora mismo',
        fecha: now.toISOString().slice(0, 16).replace('T', ' ')
      }, ...prev]);
      setSaving(false);
      setModalNew(false);
      setForm({ tipo: 'sistema', titulo: '', descripcion: '' });
      showToast('✅ Actividad registrada');
    }, 700);
  };

  // Stats per type
  const stats = Object.entries(TIPO_CONFIG).map(([key, cfg]) => ({
    key, ...cfg,
    count: activities.filter(a => a.tipo === key).length
  }));

  const columns = [
    {
      key: 'tipo', label: 'Tipo', width: '120px',
      render: (v) => {
        const cfg = TIPO_CONFIG[v] || TIPO_CONFIG.sistema;
        return <span className={`badge ${cfg.badge}`}>{cfg.icon} {cfg.label}</span>;
      }
    },
    { key: 'titulo', label: 'Evento', render: (v) => <span style={{ fontWeight: 600 }}>{v}</span> },
    { key: 'descripcion', label: 'Descripción', render: (v) => <span style={{ fontSize: '0.82rem', color: '#64748b' }}>{v.length > 70 ? v.slice(0,70)+'…' : v}</span> },
    { key: 'fecha', label: 'Fecha / Hora' },
    { key: 'tiempo', label: 'Hace', render: (v) => <span style={{ fontSize: '0.78rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>{v}</span> },
    {
      key: 'id', label: '', width: '80px',
      render: (_, row) => (
        <div className="table-actions">
          <button className="btn btn-sm btn-outline-primary btn-icon" onClick={() => setModalDetail(row)}>👁️</button>
          <button className="btn btn-sm btn-outline-danger  btn-icon" onClick={() => handleDelete(row.id)}>🗑️</button>
        </div>
      )
    }
  ];

  return (
    <AdminLayout>
      {toast && (
        <div className="toast-container">
          <div className="toast toast-success">
            <span className="toast-icon">✅</span>
            <span className="toast-message">{toast}</span>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">🔔 Actividades del Sistema</h1>
          <p className="page-subtitle">Registro cronológico de eventos y acciones administrativas</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-primary" onClick={() => setModalNew(true)}>➕ Registrar</button>
          <button className="btn btn-outline-primary" onClick={() => window.location.reload()}>🔄 Actualizar</button>
        </div>
      </div>

      {/* Type stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.9rem', marginBottom: '1.5rem' }}>
        {stats.map(s => (
          <div
            key={s.key}
            className="stat-card"
            style={{ cursor: 'pointer', border: filterTipo === s.key ? `2px solid ${s.color}` : '2px solid transparent' }}
            onClick={() => setFilterTipo(filterTipo === s.key ? 'todos' : s.key)}
          >
            <div className="stat-icon-wrap" style={{ background: s.bg, color: s.color, fontSize: '1.4rem' }}>
              {s.icon}
            </div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ fontSize: '1.4rem' }}>{s.count}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter + View toggles */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {[{ key: 'todos', label: 'Todos' }, ...Object.entries(TIPO_CONFIG).map(([k,v]) => ({ key: k, label: v.label }))].map(f => (
            <button
              key={f.key}
              className={`btn btn-sm ${filterTipo === f.key ? 'btn-primary' : 'btn-outline-primary'}`}
              onClick={() => setFilterTipo(f.key)}
            >
              {f.key !== 'todos' && TIPO_CONFIG[f.key]?.icon + ' '}
              {f.label} {f.key !== 'todos' && `(${activities.filter(a => a.tipo === f.key).length})`}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button className={`btn btn-sm ${viewMode === 'timeline' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewMode('timeline')}>⬛ Timeline</button>
          <button className={`btn btn-sm ${viewMode === 'tabla'    ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewMode('tabla')}>📋 Tabla</button>
        </div>
      </div>

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <Card title={`Actividades (${filtered.length})`} icon="📜">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem', fontSize: '0.9rem' }}>
              Sin actividades para mostrar
            </div>
          ) : (
            <div className="activity-feed">
              {filtered.map((act, i) => {
                const cfg = TIPO_CONFIG[act.tipo] || TIPO_CONFIG.sistema;
                return (
                  <div key={act.id} className="activity-item">
                    <div
                      className="activity-dot"
                      style={{ background: cfg.bg, color: cfg.color, fontSize: '1rem' }}
                    >
                      {cfg.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <div>
                          <span className={`badge ${cfg.badge}`} style={{ marginRight: '0.5rem' }}>{cfg.label}</span>
                          <span style={{ fontWeight: 700, fontSize: '0.87rem', color: '#1b3650' }}>{act.titulo}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.73rem', color: '#94a3b8' }}>{act.tiempo}</span>
                          <button className="btn btn-sm btn-icon" style={{ background: 'none', border: 'none', color: '#94a3b8', padding: 0 }} onClick={() => setModalDetail(act)}>👁️</button>
                          <button className="btn btn-sm btn-icon" style={{ background: 'none', border: 'none', color: '#e53e3e', padding: 0 }} onClick={() => handleDelete(act.id)}>🗑️</button>
                        </div>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>{act.descripcion}</div>
                      <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '0.15rem' }}>📅 {act.fecha}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* Table View */}
      {viewMode === 'tabla' && (
        <Card title="Tabla de Actividades" icon="📋">
          <DataTable columns={columns} data={filtered} searchable={true} />
        </Card>
      )}

      {/* Detail Modal */}
      <Modal isOpen={!!modalDetail} onClose={() => setModalDetail(null)} title="🔍 Detalle de Actividad">
        {modalDetail && (
          <div>
            {(() => {
              const cfg = TIPO_CONFIG[modalDetail.tipo] || TIPO_CONFIG.sistema;
              return (
                <div style={{
                  background: cfg.bg, borderRadius: 10, padding: '0.75rem 1rem',
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  color: cfg.color, fontWeight: 700, marginBottom: '1rem'
                }}>
                  {cfg.icon} {cfg.label}
                </div>
              );
            })()}
            {[
              ['Evento:', modalDetail.titulo],
              ['Descripción:', modalDetail.descripcion],
              ['Fecha:', modalDetail.fecha],
              ['Hace:', modalDetail.tiempo],
            ].map(([k,v]) => (
              <div key={k} style={{ marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>{k}</div>
                <div style={{ fontSize: '0.9rem', color: '#1b3650', fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* New Activity Modal */}
      <Modal
        isOpen={modalNew}
        onClose={() => setModalNew(false)}
        title="➕ Registrar Actividad"
        footer={
          <>
            <button className="btn btn-outline-primary" onClick={() => setModalNew(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleNew} disabled={saving}>
              {saving ? '⏳ Guardando...' : '✅ Registrar'}
            </button>
          </>
        }
      >
        <form onSubmit={handleNew}>
          <div className="form-group">
            <label className="form-label">Tipo de Evento</label>
            <select className="form-control" value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))}>
              {Object.entries(TIPO_CONFIG).map(([k,v]) => (
                <option key={k} value={k}>{v.icon} {v.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Título del Evento *</label>
            <input type="text" className="form-control" placeholder="Ej. Sensor actualizado" value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="form-label">Descripción *</label>
            <textarea className="form-control" placeholder="Describe el evento..." value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} required />
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}
