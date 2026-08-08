import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { IconDoc, IconPlus } from '../components/ui/Icons'

export default function MisProyectos({ session, proyectos }) {
  const navigate = useNavigate()
  const [estadoFiltro, setEstadoFiltro] = useState('Todos')

  const misProyectos = useMemo(
    () => proyectos.filter((p) => p.investigador === session?.nombre),
    [proyectos, session],
  )

  const filtrados = useMemo(
    () =>
      misProyectos.filter(
        (p) => estadoFiltro === 'Todos' || p.estado === estadoFiltro,
      ),
    [misProyectos, estadoFiltro],
  )

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-textprimary">Mis Proyectos</h1>
          <p className="text-[13px] text-neutral">Proyectos que has registrado en el sistema</p>
        </div>
        <Button
          variant="primary"
          icon={<IconPlus className="w-4 h-4" />}
          onClick={() => navigate('/proyecto/nuevo')}
        >
          Nuevo Proyecto
        </Button>
      </div>

      <div className="bg-surface rounded-card shadow-panel p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-5">
          {['Todos', 'Activo', 'Inactivo'].map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEstadoFiltro(e)}
              className={`text-[12px] font-semibold px-3.5 py-1.5 rounded-full border transition-colors ${
                estadoFiltro === e
                  ? 'bg-primary text-white border-primary'
                  : 'text-neutral border-border hover:border-primary hover:text-primary'
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        {filtrados.length === 0 ? (
          <div className="text-center py-14">
            <p className="text-[13px] text-neutral mb-4">
              {misProyectos.length === 0
                ? 'Todavía no has registrado ningún proyecto.'
                : 'No hay proyectos con ese estado.'}
            </p>
            {misProyectos.length === 0 && (
              <Button variant="primary" onClick={() => navigate('/proyecto/nuevo')}>
                Registrar mi primer proyecto
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {filtrados.map((p) => (
              <div key={p.id} className="py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[14px] font-semibold text-textprimary">{p.nombre}</p>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                        p.estado === 'Activo'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-neutral/10 text-neutral'
                      }`}
                    >
                      {p.estado}
                    </span>
                  </div>
                  <p className="text-[12px] text-neutral mt-1">{p.linea}</p>
                  <p className="text-[12px] text-neutral mt-1 line-clamp-2">{p.descripcion}</p>
                </div>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center gap-1.5 text-primary underline text-[12px] shrink-0"
                >
                  <IconDoc className="w-4 h-4 text-danger" />
                  {p.pdfNombre}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}