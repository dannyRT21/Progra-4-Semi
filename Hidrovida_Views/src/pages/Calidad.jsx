import React, { useState } from 'react';

// Mock sensor data
const mockSensor = { ph: 7.2, nivelTanque: 78, cloroResidual: 0.8, ultimaActualizacion: 'Hace 5 minutos' };

function getPhStatus(ph) {
  if (ph >= 6.5 && ph <= 8.5) return {
    color: '#40c41d', bgColor: 'rgba(64,196,29,0.15)', borderColor: '#40c41d', textColor: '#2e7d32',
    text: 'Normal', iconPath: 'M20 6L9 17l-5-5',
    safetyTitle: 'El agua es apta para el consumo',
    safetyDesc: 'Todos los parámetros dentro del rango del MINSAL',
    safetyIconColor: '#3fbc95',
  };
  if ((ph >= 6.0 && ph < 6.5) || (ph > 8.5 && ph <= 9.0)) return {
    color: '#dfc214', bgColor: 'rgba(223,194,20,0.15)', borderColor: '#dfc214', textColor: '#856404',
    text: 'Revisar', iconPath: null,
    safetyTitle: 'Precaución con el agua',
    safetyDesc: 'El pH se encuentra ligeramente fuera del rango óptimo',
    safetyIconColor: '#dfc214',
  };
  return {
    color: '#ff0000', bgColor: 'rgba(255,0,0,0.15)', borderColor: '#ff0000', textColor: '#721c24',
    text: 'Peligro', iconPath: null,
    safetyTitle: 'El agua NO es apta para el consumo',
    safetyDesc: 'Parámetros críticos fuera de la norma del MINSAL',
    safetyIconColor: '#ff0000',
  };
}

export default function Calidad() {
  const ph = mockSensor.ph;
  const waterLevel = mockSensor.nivelTanque;
  const status = getPhStatus(ph);
  const [expandedCard, setExpandedCard] = useState(null);

  const infoCards = [
    {
      id: 'ph',
      title: '¿Qué significa el color del indicador?',
      icon: '💧',
      content: (
        <div className="color-legend-row-ui">
          <div className="color-item-ui"><div className="color-circle-ui" style={{ background: '#40c41d' }} />Seguro</div>
          <div className="color-item-ui"><div className="color-circle-ui" style={{ background: '#dfc214' }} />Revisar</div>
          <div className="color-item-ui"><div className="color-circle-ui" style={{ background: '#ff0000' }} />No tomar</div>
        </div>
      ),
    },
    {
      id: 'ph2',
      title: '¿Qué es el pH del agua?',
      icon: '💧',
      content: (
        <div>
          <p className="calidad-card-text">Mide si el agua es ácida o básica. Un pH entre 6.5 y 8.5 es seguro para tomar.</p>
          <div className="standards-row-ui">
            <div className="standard-item-ui standard-green">✅ MINSAL: 6.5 – 8.5</div>
            <div className="standard-item-ui standard-dark">🌐 OMS: 6.5 – 8.5</div>
          </div>
        </div>
      ),
    },
    {
      id: 'cloro',
      title: '¿Qué es el cloro residual?',
      icon: '🧪',
      content: (
        <div>
          <p className="calidad-card-text">El cloro mata bacterias en el agua. Debe estar entre 0.3 y 1.5 mg/L para ser seguro.</p>
          <div className="standards-row-ui">
            <div className="standard-item-ui standard-green">✅ MINSAL: 0.3 – 1.5 mg/L</div>
            <div className="standard-item-ui standard-dark">🌐 OMS: 0.2 – 1.0 mg/L</div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="calidad-page">
      <div className="calidad-layout">
        {/* ── SIDEBAR ── */}
        <div className="calidad-sidebar">
          {/* pH Card */}
          <div className="calidad-ph-card">
            <div className="calidad-ph-title">PH ACTUAL</div>
            <div className="calidad-ph-value" style={{ color: status.color }}>{ph.toFixed(1)}</div>
            <div
              className="calidad-ph-status"
              style={{
                backgroundColor: status.bgColor,
                borderColor: status.borderColor,
                color: status.textColor,
              }}
            >
              {status.text === 'Normal' ? '✅' : status.text === 'Revisar' ? '⚠️' : '❌'}
              &nbsp;{status.text}
            </div>
          </div>

          {/* Última actualización */}
          <div className="calidad-info-group">
            <div className="calidad-info-row">
              <div className="calidad-info-icon">📅</div>
              <div>
                <div className="calidad-info-label">Última actualización</div>
                <div className="calidad-info-sub">{mockSensor.ultimaActualizacion}</div>
              </div>
            </div>

            {/* Nivel tanque */}
            <div className="calidad-info-row">
              <div className="calidad-info-icon">💧</div>
              <div style={{ flex: 1 }}>
                <div className="calidad-info-label">Nivel de tanque</div>
                <div className="calidad-progress-wrap">
                  <div className="calidad-progress-bg">
                    <div className="calidad-progress-fill" style={{ width: `${waterLevel}%` }} />
                  </div>
                  <div className="calidad-progress-text">{waterLevel}%</div>
                </div>
                <div className="calidad-progress-labels">
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Safety banner */}
          <div className="calidad-safety-banner" style={{ color: status.safetyIconColor }}>
            <div className="calidad-safety-icon">
              {status.safetyIconColor === '#3fbc95' ? '🛡️' : status.safetyIconColor === '#dfc214' ? '⚠️' : '❌'}
            </div>
            <div className="calidad-safety-text">
              <div className="calidad-safety-title">{status.safetyTitle}</div>
              <div className="calidad-safety-desc">{status.safetyDesc}</div>
            </div>
          </div>
        </div>

        {/* ── CARDS COLUMN ── */}
        <div className="calidad-cards-col">
          {infoCards.map(card => (
            <div
              key={card.id}
              className={`calidad-info-card${expandedCard === card.id ? ' expanded' : ''}`}
              id={`calidad-card-${card.id}`}
            >
              <div className="calidad-card-icon">{card.icon}</div>
              <div className="calidad-card-content">
                <h2
                  className="calidad-card-title"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setExpandedCard(expandedCard === card.id ? null : card.id)}
                >
                  {card.title}
                  <span style={{ fontSize: '0.9rem', marginLeft: '0.5rem', opacity: 0.6 }}>
                    {expandedCard === card.id ? '▲' : '▼'}
                  </span>
                </h2>
                {(expandedCard === card.id || true) && card.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
