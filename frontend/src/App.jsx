import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import RegistroInvestigador from './pages/RegistroInvestigador'
import RegistroProyecto from './pages/RegistroProyecto'
import AdminPanel from './pages/AdminPanel'
import Dashboard from './pages/Dashboard'
import MisProyectos from './pages/MisProyectos'
import GestionInvestigadores from './pages/GestionInvestigadores'
import Perfil from './pages/Perfil'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/layout/ProtectedRoute'
import { PROYECTOS_EJEMPLO } from './data/mockData'



import { loadSession } from './api/client'  // ← importar

export default function App() {
  const [session, setSession] = useState(() => loadSession())
  const [proyectos, setProyectos] = useState(PROYECTOS_EJEMPLO)

  function handleLogin(sessionData) {
    setSession(sessionData)
  }

  function handleLogout() {
    setSession(null)
  }

  function handleCreateProyecto(data) {
    setProyectos((prev) => [
      {
        id: `PR${String(prev.length + 1).padStart(3, '0')}`,
        estado: 'Activo',
        ...data,
      },
      ...prev,
    ])
  }

  function handleDeleteProyecto(id) {
    setProyectos((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <Routes>
      {/* Públicas: no requieren cuenta */}
      <Route
        path="/"
        element={<Navigate to={session ? '/dashboard' : '/login'} replace />}
      />
      <Route
        path="/login"
        element={session ? <Navigate to="/dashboard" replace /> : <Login onLogin={handleLogin} />}
      />
      <Route path="/registro" element={<RegistroInvestigador />} />

      {/* Autenticadas: envueltas en el layout con sidebar */}
      <Route
        element={
          <ProtectedRoute session={session}>
            <AppLayout session={session} onLogout={handleLogout} />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard session={session} proyectos={proyectos} />} />
        <Route path="/perfil" element={<Perfil session={session} />} />

        {/* Solo investigador */}
        <Route
          path="/proyecto/nuevo"
          element={
            <ProtectedRoute session={session} roles={['investigador']}>
              <RegistroProyecto session={session} onCreateProyecto={handleCreateProyecto} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mis-proyectos"
          element={
            <ProtectedRoute session={session} roles={['investigador']}>
              <MisProyectos session={session} proyectos={proyectos} />
            </ProtectedRoute>
          }
        />

        {/* Solo jefe de departamento */}
        <Route
          path="/admin/proyectos"
          element={
            <ProtectedRoute session={session} roles={['jefe']}>
              <AdminPanel proyectos={proyectos} onDeleteProyecto={handleDeleteProyecto} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/investigadores"
          element={
            <ProtectedRoute session={session} roles={['jefe']}>
              <GestionInvestigadores proyectos={proyectos} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/investigadores/nuevo"
          element={
            <ProtectedRoute session={session} roles={['jefe']}>
              <RegistroInvestigador session={session} />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to={session ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}