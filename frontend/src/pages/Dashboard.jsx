import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { IconPlus } from '../components/ui/Icons'

export default function Dashboard({ session, proyectos }) {
  const navigate = useNavigate()
  const isJefe = session?.role === 'jefe'

  const misProyectos = useMemo(
    () => proyectos.filter((p) => p.investigador === session?.nombre),
    [proyectos, session],
  )

  const stats = useMemo(
    () => ({
      totales: proyectos.length,
      activos: proyectos.filter((p) => p.estado === 'Activo').length,
      investigadores: new Set(proyectos.map((p) => p.investigador)).size,
      pdfs: proyectos.filter((p) => p.pdfNombre).length,
      misActivos: misProyectos.filter((p) => p.estado === 'Activo').length,
    }),
    [proyectos, misProyectos],
  )

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

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {isJefe ? (
          <>
            <StatCard label="Proyectos Totales" value={stats.totales} />
            <StatCard label="Proyectos Activos" value={stats.activos} />
            <StatCard label="Investigadores" value={stats.investigadores} />
            <StatCard label="PDFs Subidos" value={stats.pdfs} />
          </>
        ) : (
          <>
            <StatCard label="Mis Proyectos" value={misProyectos.length} />
            <StatCard label="Activos" value={stats.misActivos} />
            <StatCard
              label="Inactivos"
              value={misProyectos.length - stats.misActivos}
            />
            <StatCard label="Con PDF" value={misProyectos.filter((p) => p.pdfNombre).length} />
          </>
        )}
      </div>

      {/* Accesos rápidos */}
      <div className="bg-surface rounded-card shadow-panel p-6 sm:p-8">
        <h2 className="text-[16px] font-bold text-textprimary mb-4">Accesos rápidos</h2>
        <div className="flex flex-wrap gap-3">
          {isJefe ? (
            <>
              <Button variant="primary" onClick={() => navigate('/admin/proyectos')}>
                Ver Panel de Proyectos
              </Button>
              <Button variant="secondary" onClick={() => navigate('/investigadores')}>
                Gestionar Investigadores
              </Button>
              <Button variant="secondary" onClick={() => navigate('/investigadores/nuevo')}>
                Registrar Investigador
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="primary"
                icon={<IconPlus className="w-4 h-4" />}
                onClick={() => navigate('/proyecto/nuevo')}
              >
                Registrar Nuevo Proyecto
              </Button>
              <Button variant="secondary" onClick={() => navigate('/mis-proyectos')}>
                Ver Mis Proyectos
              </Button>
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
                <span
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${
                    p.estado === 'Activo'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-neutral/10 text-neutral'
                  }`}
                >
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