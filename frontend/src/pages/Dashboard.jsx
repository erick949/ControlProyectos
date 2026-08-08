/**
 * src/pages/Dashboard.jsx  ← VERSIÓN CON API
 *
 * Cambios respecto al original:
 * - Ya no recibe `proyectos` como prop.
 * - Llama a getEstadisticas() y getProyectos() al montar.
 * - Muestra un estado de carga y maneja errores de red.
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { IconPlus } from '../components/ui/Icons'
import { getEstadisticas, getProyectos } from '../api/proyectos'   // ← NUEVO

export default function Dashboard({ session }) {
  const navigate = useNavigate()
  const isJefe = session?.role === 'jefe'

  // ── NUEVO: estado local para datos de la API ───────────────────────────────
  const [stats, setStats]           = useState(null)
  const [misProyectos, setMisProyectos] = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')

  useEffect(() => {
    async function cargarDatos() {
      setLoading(true)
      try {
        // Ambas peticiones en paralelo
        const [estadisticas, proyectosData] = await Promise.all([
          getEstadisticas(),
          getProyectos(),
        ])
        setStats(estadisticas)
        setMisProyectos(proyectosData)
      } catch (err) {
        setError('No se pudieron cargar los datos. Intenta de nuevo.')
      } finally {
        setLoading(false)
      }
    }
    cargarDatos()
  }, [])
  // ──────────────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-[13px] text-neutral animate-pulse">Cargando...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-[1100px] mx-auto px-4 py-10">
        <p className="text-[13px] text-danger">{error}</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-[24px] font-bold text-textprimary">
          Hola, {session?.nombre || 'usuario'} 👋
        </h1>
        <p className="text-[13px] text-neutral mt-1">
          {isJefe
            ? 'Esto es lo que está pasando en el sistema de investigaciones.'
            : 'Este es el resumen de tu actividad como investigador.'}
        </p>
      </div>

      {/* Tarjetas de estadísticas — datos vienen de la API */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {isJefe ? (
          <>
            <StatCard label="Proyectos Totales" value={stats?.totales ?? 0} />
            <StatCard label="Proyectos Activos" value={stats?.activos ?? 0} />
            <StatCard label="Investigadores"    value={stats?.investigadores ?? 0} />
            <StatCard label="PDFs Subidos"      value={stats?.con_pdf ?? 0} />
          </>
        ) : (
          <>
            <StatCard label="Mis Proyectos" value={stats?.totales ?? 0} />
            <StatCard label="Activos"       value={stats?.activos ?? 0} />
            <StatCard label="Inactivos"     value={stats?.inactivos ?? 0} />
            <StatCard label="Con PDF"       value={stats?.con_pdf ?? 0} />
          </>
        )}
      </div>

      {/* Accesos rápidos — sin cambios */}
      <div className="bg-surface rounded-card shadow-panel p-6 sm:p-8">
        <h2 className="text-[16px] font-bold text-textprimary mb-4">Accesos rápidos</h2>
        <div className="flex flex-wrap gap-3">
          {isJefe ? (
            <>
              <Button variant="primary"   onClick={() => navigate('/admin/proyectos')}>Ver Panel de Proyectos</Button>
              <Button variant="secondary" onClick={() => navigate('/investigadores')}>Gestionar Investigadores</Button>
              <Button variant="secondary" onClick={() => navigate('/investigadores/nuevo')}>Registrar Investigador</Button>
            </>
          ) : (
            <>
              <Button variant="primary" icon={<IconPlus className="w-4 h-4" />} onClick={() => navigate('/proyecto/nuevo')}>
                Registrar Nuevo Proyecto
              </Button>
              <Button variant="secondary" onClick={() => navigate('/mis-proyectos')}>Ver Mis Proyectos</Button>
            </>
          )}
        </div>
      </div>

      {/* Últimos proyectos (solo investigador) */}
      {!isJefe && misProyectos.length > 0 && (
        <div className="bg-surface rounded-card shadow-panel p-6 sm:p-8 mt-6">
          <h2 className="text-[16px] font-bold text-textprimary mb-4">Últimos proyectos registrados</h2>
          <ul className="flex flex-col divide-y divide-border">
            {misProyectos.slice(0, 4).map((p) => (
              <li key={p.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-textprimary truncate">{p.nombre}</p>
                  <p className="text-[12px] text-neutral truncate">{p.linea}</p>
                </div>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                  p.estado === 'Activo' ? 'bg-emerald-50 text-emerald-600' : 'bg-neutral/10 text-neutral'
                }`}>
                  {p.estado}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="bg-surface rounded-card shadow-panel p-5 text-center sm:text-left">
      <p className="text-[26px] font-bold text-primary leading-none">{value}</p>
      <p className="text-[12px] text-neutral mt-1.5">{label}</p>
    </div>
  )
}
