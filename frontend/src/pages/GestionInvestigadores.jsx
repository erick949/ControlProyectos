/**
 * ══════════════════════════════════════════════════════
 *  src/pages/GestionInvestigadores.jsx  ← VERSIÓN CON API
 * ══════════════════════════════════════════════════════
 *
 * Cambios:
 * - Ya no recibe `proyectos` como prop.
 * - Carga investigadores desde la API.
 * - Búsqueda en tiempo real llamando a la API con el parámetro `search`.
 */

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { IconSearch, IconPlus, IconUser } from '../components/ui/Icons'
import { getInvestigadores } from '../api/usuarios'   // ← NUEVO

export default function GestionInvestigadores() {
  const navigate = useNavigate()
  const [investigadores, setInvestigadores] = useState([])
  const [search, setSearch]   = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => cargar(search), 300)  // debounce 300ms
    return () => clearTimeout(timer)
  }, [search])

  async function cargar(q = '') {
    setLoading(true)
    try {
      const data = await getInvestigadores(q)
      setInvestigadores(data)
    } catch {
      // silenciar
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-textprimary">Investigadores</h1>
          <p className="text-[13px] text-neutral">Investigadores registrados en el sistema</p>
        </div>
        <Button variant="primary" icon={<IconPlus className="w-4 h-4" />} onClick={() => navigate('/investigadores/nuevo')}>
          Registrar Investigador
        </Button>
      </div>

      <div className="bg-surface rounded-card shadow-panel p-6 sm:p-8">
        <div className="max-w-sm mb-6">
          <Input label="Buscar" placeholder="Buscar por nombre..." icon={<IconSearch />}
            onDark={false} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {loading ? (
          <p className="text-center text-[13px] text-neutral py-10 animate-pulse">Cargando...</p>
        ) : investigadores.length === 0 ? (
          <p className="text-center text-[13px] text-neutral py-10">No se encontraron investigadores.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {investigadores.map((inv) => (
              <div key={inv.id} className="border border-border rounded-lg p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    {/* ── CAMBIO: muestra avatar si existe ── */}
                    {inv.perfil?.avatar
                      ? <img src={inv.perfil.avatar} alt={inv.nombre} className="w-10 h-10 rounded-full object-cover" />
                      : <IconUser className="w-5 h-5 text-primary" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-textprimary truncate">{inv.nombre}</p>
                    <p className="text-[11px] text-neutral truncate">{inv.perfil?.linea_investigacion || inv.email}</p>
                  </div>
                </div>
                <div className="flex gap-4 text-[12px] text-neutral">
                  <span><strong className="text-textprimary">{inv.perfil?.division_display || '—'}</strong> división</span>
                  <span className="truncate">{inv.perfil?.area_participacion || ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
