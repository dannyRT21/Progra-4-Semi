import React from 'react';
import { Link } from 'react-router-dom';

const infoCards = [
  {
    id: 'colores',
    icon: '💧',
    title: '¿Qué significa el color del indicador?',
    content: (
      <div className="color-legend-row-ui">
        <div className="color-item-ui"><div className="color-circle-ui" style={{ background: '#40c41d' }} /> Verde = Seguro</div>
        <div className="color-item-ui"><div className="color-circle-ui" style={{ background: '#dfc214' }} /> Amarillo = Revisar</div>
        <div className="color-item-ui"><div className="color-circle-ui" style={{ background: '#ff0000' }} /> Rojo = No tomar</div>
      </div>
    ),
  },
  {
    id: 'ph',
    icon: '💧',
    title: '¿Qué es el pH del agua?',
    content: (
      <div>
        <p className="calidad-card-text">Mide si el agua es ácida o básica. Un pH entre 6.5 y 8.5 es seguro para tomar.</p>
        <div className="standards-row-ui">
          <div className="standard-item-ui standard-green">
            ✅ MINSAL: 6.5 – 8.5{' '}
            <a href="https://www.salud.gob.sv" target="_blank" rel="noreferrer" className="standards-link">MINSAL</a>
          </div>
          <div className="standard-item-ui standard-dark">
            🌐 OMS: 6.5 – 8.5{' '}
            <a href="https://www.who.int/es" target="_blank" rel="noreferrer" className="standards-link">OMS</a>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 'cloro',
    icon: '🧪',
    title: '¿Qué es el cloro residual?',
    content: (
      <div>
        <p className="calidad-card-text">El cloro mata bacterias en el agua. Debe estar entre 0.3 y 1.5 mg/L para ser seguro.</p>
        <div className="standards-row-ui">
          <div className="standard-item-ui standard-green">
            ✅ MINSAL: 0.3 – 1.5 mg/L{' '}
            <a href="https://www.salud.gob.sv" target="_blank" rel="noreferrer" className="standards-link">MINSAL</a>
          </div>
          <div className="standard-item-ui standard-dark">
            🌐 OMS: 0.2 – 1.0 mg/L
          </div>
        </div>
      </div>
    ),
  },
];

export default function Estandares() {
  return (
    <div className="estandares-page">
      <div className="page-container-narrow">
        {infoCards.map(card => (
          <div key={card.id} className="estandares-info-card">
            <div className="estandares-card-icon">{card.icon}</div>
            <div className="estandares-card-content">
              <h2 className="estandares-card-title">{card.title}</h2>
              {card.content}
            </div>
          </div>
        ))}

        {/* Bottom Info Banner */}
        <div className="estandares-info-banner">
          <span className="estandares-banner-icon">🛡️</span>
          <span>
            Estos valores están basados en las recomendaciones del Ministerio de Salud (MINSAL) y la Organización Mundial de la Salud (OMS).
          </span>
        </div>
      </div>
    </div>
  );
}
