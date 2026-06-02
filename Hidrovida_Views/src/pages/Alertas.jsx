import React, { useState } from 'react';

const mockAlertas = [
  {
    id: 1,
    tipo: 'red',
    titulo: 'Corte de agua programado - Sector Norte',
    fecha: 'Lunes 2 de Junio, 08:00 AM',
    zona: 'Sector Norte - Col. Jardines del Valle',
    motivo: 'Mantenimiento de tubería principal DN400',
    descripcion: 'Se realizará un corte total del suministro de agua por trabajos de mantenimiento en la tubería principal. Se estima restaurar el servicio antes del mediodía.',
  },
  {
    id: 2,
    tipo: 'yellow',
    titulo: 'Mantenimiento preventivo - Sector A',
    fecha: 'Martes 3 de Junio, 06:00 AM',
    zona: 'Sector A - Colonia El Roble',
    motivo: 'Revisión preventiva de tuberías secundarias',
    descripcion: 'Inspección de red de distribución. Puede haber baja presión durante las mañanas.',
  },
  {
    id: 3,
    tipo: 'blue',
    titulo: 'Nueva medición de calidad registrada',
    fecha: 'Hoy, 07:45 AM',
    zona: 'Sistema Central',
    motivo: 'Lectura automática del sensor de pH',
    descripcion: 'Los parámetros de calidad del agua han sido actualizados automáticamente. pH actual: 7.2 – Estado: Óptimo.',
  },
];

const TIPO_ICONS = {
  red: { icon: '⚠️', label: 'Alerta Crítica', cardClass: 'alert-card-red' },
  yellow: { icon: '🔔', label: 'Aviso', cardClass: 'alert-card-yellow' },
  blue: { icon: 'ℹ️', label: 'Información', cardClass: 'alert-card-blue' },
};

export default function Alertas() {
  const [filtro, setFiltro] = useState('todos');
  const [expandedId, setExpandedId] = useState(null);

  const filtradas = filtro === 'todos' ? mockAlertas : mockAlertas.filter(a => a.tipo === filtro);

  return (
    <div className="alertas-page">
      <div className="alertas-header">
        <div>
          <h1 className="alertas-title">Alertas y Avisos</h1>
          <p className="alertas-sub">Mantente informado sobre el estado del servicio de agua</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="alertas-filtros">
        {[
          { value: 'todos', label: 'Todas' },
          { value: 'red', label: '🔴 Críticas' },
          { value: 'yellow', label: '🟡 Avisos' },
          { value: 'blue', label: '🔵 Información' },
        ].map(f => (
          <button
            key={f.value}
            id={`filtro-${f.value}`}
            className={`alertas-filtro-btn${filtro === f.value ? ' active' : ''}`}
            onClick={() => setFiltro(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista de alertas */}
      {filtradas.length === 0 ? (
        <div className="alertas-empty">
          <span style={{ fontSize: '3rem' }}>🔕</span>
          <h4>No hay alertas activas en este momento.</h4>
        </div>
      ) : (
        <div className="alertas-list">
          {filtradas.map(alerta => {
            const tipo = TIPO_ICONS[alerta.tipo];
            const isExpanded = expandedId === alerta.id;
            return (
              <div
                key={alerta.id}
                className={`alertas-card ${tipo.cardClass}`}
                id={`alerta-card-${alerta.id}`}
              >
                <div className="alertas-card-icon-wrap">
                  <span className="alertas-card-icon">{tipo.icon}</span>
                </div>
                <div className="alertas-card-content">
                  <div className="alertas-card-title">{alerta.titulo}</div>
                  <div className="alertas-card-fecha">{alerta.fecha}</div>
                  <div className="alertas-card-meta">
                    <span><strong>Zona afectada:</strong> {alerta.zona}</span>
                    <span><strong>Motivo:</strong> {alerta.motivo}</span>
                  </div>
                  {isExpanded && alerta.descripcion && (
                    <p className="alertas-card-desc">{alerta.descripcion}</p>
                  )}
                  <button
                    className="alertas-toggle-btn"
                    id={`btn-toggle-alerta-${alerta.id}`}
                    onClick={() => setExpandedId(isExpanded ? null : alerta.id)}
                  >
                    {isExpanded ? 'Ver menos ▲' : 'Ver más ▼'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
