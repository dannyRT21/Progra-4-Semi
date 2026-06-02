import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import UserLayout from '../layouts/UserLayout.jsx';

// User Pages
import Home         from '../pages/Home.jsx';
import Login        from '../pages/Login.jsx';
import Registro     from '../pages/Registro.jsx';
import InicioUsuario from '../pages/InicioUsuario.jsx';
import Calidad      from '../pages/Calidad.jsx';
import Reportar     from '../pages/Reportar.jsx';
import Alertas      from '../pages/Alertas.jsx';
import Estandares   from '../pages/Estandares.jsx';

// Pages that don't use the layout (standalone auth pages)
const AUTH_PATHS = ['/login', '/registro'];

export default function AppRouter() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin  = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <BrowserRouter>
      <Routes>
        {/* ─── Standalone auth pages (no layout) ─── */}
        <Route path="/login"    element={<Login    onLogin={handleLogin} />} />
        <Route path="/registro" element={<Registro />} />

        {/* ─── Pages with UserLayout ─── */}
        <Route
          path="/*"
          element={
            <UserLayout isLoggedIn={isLoggedIn} onLogout={handleLogout}>
              <Routes>
                <Route path="/"          element={<Home isLoggedIn={isLoggedIn} />} />
                <Route path="/calidad"   element={<Calidad />} />
                <Route path="/reportar"  element={<Reportar />} />
                <Route path="/alertas"   element={<Alertas />} />
                <Route path="/estandares" element={<Estandares />} />

                {/* Protected: user panel (redirect to login if not logged in) */}
                <Route
                  path="/inicio"
                  element={
                    isLoggedIn
                      ? <InicioUsuario />
                      : <Navigate to="/login" replace />
                  }
                />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </UserLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
