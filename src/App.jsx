import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AdminLayout } from './components/layout/AdminLayout';
import { KioskLayout } from './components/layout/KioskLayout';

// Páginas
import { Login } from './pages/Login';
import { Registro } from './pages/Registro';
import { Dashboard } from './pages/Dashboard';
import { GruposList } from './pages/Grupos/GruposList';
import { GrupoForm } from './pages/Grupos/GrupoForm';
import { AlumnosList } from './pages/Alumnos/AlumnosList';
import { AlumnoForm } from './pages/Alumnos/AlumnoForm';
import { CredencialQR } from './pages/CredencialQR';
import { EscaneoKiosco } from './pages/EscaneoKiosco';
import { AsistenciasReporte } from './pages/AsistenciasReporte';
import { NotFound } from './pages/NotFound';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Rutas públicas de Autenticación y Registro */}
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Registro />} />

            {/* Rutas de Administración Escolar (con Sidebar y Navbar) */}
            <Route element={<AdminLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Grupos */}
              <Route path="/grupos" element={<GruposList />} />
              <Route path="/grupos/nuevo" element={<GrupoForm />} />
              <Route path="/grupos/:id/editar" element={<GrupoForm />} />
              <Route path="/grupos/:id/alumnos" element={<AlumnosList />} />
              
              {/* Alumnos */}
              <Route path="/alumnos" element={<AlumnosList />} />
              <Route path="/alumnos/nuevo" element={<AlumnoForm />} />
              <Route path="/alumnos/:id/editar" element={<AlumnoForm />} />
              <Route path="/alumnos/:id" element={<AlumnoForm />} />
              
              {/* Credencial QR */}
              <Route path="/qr/:matricula" element={<CredencialQR />} />

              {/* Reportes de Asistencias */}
              <Route path="/asistencias" element={<AsistenciasReporte />} />
              <Route path="/reportes" element={<Navigate to="/asistencias" replace />} />
            </Route>

            {/* Ruta Kiosco de Escaneo (Pantalla completa sin sidebar) */}
            <Route element={<KioskLayout />}>
              <Route path="/escaneo" element={<EscaneoKiosco />} />
            </Route>

            {/* 404 No encontrado */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
