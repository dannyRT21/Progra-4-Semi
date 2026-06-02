import React from 'react';

export default function Card({ title, subtitle, icon, actions, children, style = {} }) {
  return (
    <div className="card" style={style}>
      <div className="card-body">
        {(title || actions) && (
          <div className="card-header-section">
            <div>
              {title && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {icon && <span style={{ fontSize: '1.1rem' }}>{icon}</span>}
                  <span className="card-title-text">{title}</span>
                </div>
              )}
              {subtitle && (
                <div style={{ fontSize: '0.78rem', color: '#4a657c', marginTop: '0.15rem' }}>
                  {subtitle}
                </div>
              )}
            </div>
            {actions && <div>{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
