import React, { useState } from 'react';

const CATEGORIAS = [
  { value: 'agua_sucia', label: 'Agua sucia', icon: '💧' },
  { value: 'mal_olor',   label: 'Mal olor',   icon: '💨' },
  { value: 'tuberia_rota', label: 'Tubería rota', icon: '🔧' },
  { value: 'sin_agua',  label: 'Sin agua',    icon: '🚫' },
];

const initForm = {
  categoria: 'agua_sucia',
  descripcion: '',
  sector: '',
  nombre: '',
  telefono: '',
};

export default function Reportar() {
  const [form, setForm] = useState(initForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleCategory = (value) => {
    setForm(prev => ({ ...prev, categoria: value }));
  };

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) { setError('Geolocalización no disponible en este navegador.'); return; }
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setForm(prev => ({ ...prev, sector: `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}` }));
        setGettingLocation(false);
      },
      () => { setError('No se pudo obtener la ubicación.'); setGettingLocation(false); }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.telefono) { setError('Por favor ingresa tu nombre y teléfono de contacto.'); return; }
    if (!form.sector) { setError('Por favor ingresa tu ubicación.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setForm(initForm);
    }, 1000);
  };

  const handleReset = () => {
    setForm(initForm);
    setSuccess(false);
    setError('');
  };

  return (
    <div className="reportar-page">
      <h2 className="reportar-section-title">Categoría del problema</h2>
      <p className="reportar-section-sub">Selecciona la categoría que mejor describe el problema</p>

      {/* Categorías */}
      <div className="reportar-categories">
        {CATEGORIAS.map(cat => (
          <button
            key={cat.value}
            id={`cat-${cat.value}`}
            className={`category-card${form.categoria === cat.value ? ' selected' : ''}`}
            onClick={() => handleCategory(cat.value)}
            type="button"
          >
            <span className="category-card-icon">{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {success && (
        <div className="reportar-success-banner">
          ✅ Reporte enviado correctamente. Un encargado se comunicará contigo para el seguimiento.
        </div>
      )}

      {error && (
        <div className="reportar-error-banner">⚠️ {error}</div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Detalles */}
        <div className="reportar-form-group">
          <h2 className="reportar-section-title">Detalles del problema *</h2>
          <p className="reportar-section-sub">Cuéntanos más detalles ¿Qué sucedió específicamente?</p>
          <textarea
            name="descripcion"
            className="reportar-custom-input"
            placeholder="Cuéntanos más detalles ¿qué sucedió específicamente?"
            value={form.descripcion}
            onChange={handleChange}
            rows={4}
            id="reportar-descripcion"
          />
        </div>

        {/* Ubicación */}
        <div className="reportar-form-group">
          <h2 className="reportar-section-title">Ubicación *</h2>
          <p className="reportar-section-sub">Indica el lugar donde ocurre el problema</p>
          <div className="reportar-location-row">
            <input
              type="text"
              name="sector"
              className="reportar-custom-input"
              placeholder="Sector / casa / calle / referencia"
              value={form.sector}
              onChange={handleChange}
              id="reportar-sector"
            />
            <button
              type="button"
              className="btn-location-ui"
              onClick={obtenerUbicacion}
              disabled={gettingLocation}
              id="btn-obtener-ubicacion"
            >
              {gettingLocation ? '⏳ Obteniendo...' : '📍 Usar mi ubicación'}
            </button>
          </div>
        </div>

        {/* Contacto */}
        <div className="reportar-form-group">
          <h2 className="reportar-section-title">Tu información de contacto *</h2>
          <p className="reportar-section-sub">Para que podamos informarte sobre el seguimiento</p>
          <div className="reportar-contact-row">
            <input
              type="text"
              name="nombre"
              className="reportar-custom-input"
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={handleChange}
              id="reportar-nombre"
            />
            <input
              type="tel"
              name="telefono"
              className="reportar-custom-input"
              placeholder="Tu teléfono"
              value={form.telefono}
              onChange={handleChange}
              id="reportar-telefono"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="reportar-actions-row">
          <button
            type="submit"
            className="btn-send-report"
            disabled={loading}
            id="btn-enviar-reporte"
          >
            {loading ? 'ENVIANDO...' : 'ENVIAR'}
          </button>
          <button
            type="button"
            className="btn-cancel-report"
            onClick={handleReset}
            id="btn-cancelar-reporte"
          >
            CANCELAR
          </button>
        </div>
      </form>

      {/* Info Banner */}
      <div className="reportar-info-banner">
        <span className="reportar-info-icon">🛡️</span>
        <span>La directiva recibirá el mensaje inmediatamente. Un encargado se comunicará contigo para el seguimiento.</span>
      </div>
    </div>
  );
}
