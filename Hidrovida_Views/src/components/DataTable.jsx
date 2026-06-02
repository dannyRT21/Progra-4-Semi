import React, { useState } from 'react';

export default function DataTable({ columns, data, searchable = true, actions }) {
  const [search, setSearch] = useState('');

  const filtered = data.filter(row =>
    columns.some(col =>
      String(row[col.key] ?? '').toLowerCase().includes(search.toLowerCase())
    )
  );

  return (
    <div>
      {/* Toolbar */}
      {(searchable || actions) && (
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap'
        }}>
          {searchable && (
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Buscar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  onClick={() => setSearch('')}
                >
                  ✕
                </button>
              )}
            </div>
          )}
          {actions && <div style={{ display: 'flex', gap: '0.5rem' }}>{actions}</div>}
        </div>
      )}

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              {columns.map(col => (
                <th key={col.key} style={col.width ? { width: col.width } : {}}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  {search ? `Sin resultados para "${search}"` : 'No hay datos disponibles'}
                </td>
              </tr>
            ) : (
              filtered.map((row, i) => (
                <tr key={row.id ?? i}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Count */}
      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.6rem', textAlign: 'right' }}>
        {filtered.length} de {data.length} registros
      </div>
    </div>
  );
}
