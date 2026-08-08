import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { IconSearch, IconPlus, IconUser } from '../components/ui/Icons'

export default function GestionInvestigadores({ proyectos }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const investigadores = useMemo(() => {
    const map = new Map()
    for (const p of proyectos) {
      if (!map.has(p.investigador)) {
        map.set(p.investigador, { nombre: p.investigador, lineas: new Set(), total: 0, activos: 0 })
      }
      const entry = map.get(p.investigador)
      entry.lineas.add(p.linea)
      entry.total += 1
      if (p.estado === 'Activo') entry.activos += 1
    }
    return Array.from(map.values()).sort((a, b) => a.nombre.localeCompare(b.nombre))
  }, [proyectos])

  const filtrados = useMemo(
    () =>
      investigadores.filter((i) =>
        i.nombre.toLowerCase().includes(search.toLowerCase()),
      ),
    [investigadores, search],
  )

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-textprimary">Investigadores</h1>
          <p className="text-[13px] text-neutral">Investigadores con proyectos registrados en el sistema</p>
        </div>
        <Button
          variant="primary"
          icon={<IconPlus className="w-4 h-4" />}
          onClick={() => navigate('/investigadores/nuevo')}
        >
          Registrar Investigador
        </Button>
      </div>

      <div className="bg-surface rounded-card shadow-panel p-6 sm:p-8">
        <div className="max-w-sm mb-6">
          <Input
            label="Buscar"
            placeholder="Buscar por nombre..."
            icon={<IconSearch />}
            onDark={false}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtrados.length === 0 ? (
          <p className="text-center text-[13px] text-neutral py-10">
            No se encontraron investigadores.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtrados.map((inv) => (
              <div
                key={inv.nombre}
                className="border border-border rounded-lg p-4 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <IconUser className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-textprimary truncate">
                      {inv.nombre}
                    </p>
                    <p className="text-[11px] text-neutral truncate">
                      {Array.from(inv.lineas).slice(0, 2).join(', ')}
                      {inv.lineas.size > 2 ? '…' : ''}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 text-[12px] text-neutral">
                  <span>
                    <strong className="text-textprimary">{inv.total}</strong> proyectos
                  </span>
                  <span>
                    <strong className="text-textprimary">{inv.activos}</strong> activos
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}