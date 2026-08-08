/**
 * src/pages/AdminPanel.jsx  ← VERSIÓN CON API
 *
 * Cambios respecto al original:
 * - Ya no recibe `proyectos` ni `onDeleteProyecto` como props.
 * - Carga proyectos desde la API con filtros en cada búsqueda.
 * - Elimina proyectos llamando a eliminarProyecto(id).
 */

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import ConfirmModal from '../components/ui/ConfirmModal'
import { IconSearch, IconDoc, IconTrash, IconPlus } from '../components/ui/Icons'
import { getProyectos, eliminarProyecto, getEstadisticas } from '../api/proyectos'  // ← NUEVO
import { LINEAS_INVESTIGACION } from '../data/mockData'

export default function AdminPanel() {
  const navigate = useNavigate()

  const [proyectos, setProyectos] = useState([])
  const [stats, setStats]         = useState({ activos: 0, investigadores: 0, pdfs: 0 })
  const [loading, setLoading]     = useState(true)
  const [searchInput, setSearchInput]   = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')
  const [lineaFiltro, setLineaFiltro]   = useState('')
  const [estadoFiltro, setEstadoFiltro] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting]         = useState(false)

  // ── Cargar datos de la API ─────────────────────────────────────────────────
  async function cargarProyectos() {
    setLoading(true)
    try {
      const [data, estadisticas] = await Promise.all([
        getProyectos({ search: appliedSearch, linea: lineaFiltro, estado: estadoFiltro }),
        getEstadisticas(),
      ])
      setProyectos(data)
      setStats({
        activos:         estadisticas.activos,
        investigadores:  estadisticas.investigadores,
        pdfs:            estadisticas.con_pdf,
      })
    } catch {
      // Mantener datos anteriores si hay error de red
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargarProyectos() }, [appliedSearch, lineaFiltro, estadoFiltro])

  // ── Eliminar ───────────────────────────────────────────────────────────────
  async function handleConfirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await eliminarProyecto(deleteTarget.id)
      setProyectos((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      setStats((s) => ({ ...s, activos: deleteTarget.estado === 'Activo' ? s.activos - 1 : s.activos }))
    } catch {
      alert('Error al eliminar el proyecto.')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  function truncate(text, len = 50) {
    return text?.length > len ? text.slice(0, len) + '...' : text
  }

  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[420px] h-[280px] opacity-[0.12] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, #0097A7 0, transparent 60%), radial-gradient(circle at 40% 60%, #0D1B2A 0, transparent 55%)' }} />

      <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
        <div className="bg-surface rounded-card shadow-panel p-6 sm:p-8 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-[22px] font-bold text-textprimary">Panel de Proyectos Registrados</h1>
              <p className="text-[13px] text-neutral">Control de Investigaciones Académicas</p>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-3 mb-6 items-end">
            <Input label="Buscar" placeholder="Buscar por Nombre, Línea..."
              icon={<IconSearch />} onDark={false} value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && setAppliedSearch(searchInput)} />
            <Select label="Línea" onDark={false} options={LINEAS_INVESTIGACION}
              value={lineaFiltro} onChange={setLineaFiltro} placeholder="Seleccionar..." />
            <Select label="Estado" onDark={false} options={['Todos', 'Activo', 'Inactivo']}
              value={estadoFiltro} onChange={setEstadoFiltro} placeholder="Todos" />
            <Button variant="primary" icon={<IconSearch className="w-4 h-4" />}
              className="h-[42px]" onClick={() => setAppliedSearch(searchInput)}>
              Buscar
            </Button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-[13px] min-w-[900px]">
              <thead>
                <tr className="bg-primary text-white">
                  {['ID', 'LÍNEA DE INVESTIGACIÓN', 'NOMBRE DEL PROYECTO', 'INVESTIGADOR', 'DESCRIPCIÓN', 'PDF', 'ACCIONES'].map((h) => (
                    <th key={h} className="text-left font-bold px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="text-center text-neutral py-8 animate-pulse">Cargando proyectos...</td></tr>
                ) : proyectos.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-neutral py-8">No se encontraron proyectos.</td></tr>
                ) : proyectos.map((p, idx) => (
                  <tr key={p.id} className={`border-t border-border ${idx % 2 === 0 ? 'bg-white' : 'bg-surface-alt'}`}>
                    <td className="px-4 py-3 font-medium text-textprimary">{p.codigo}</td>
                    <td className="px-4 py-3 text-textprimary">{p.linea}</td>
                    <td className="px-4 py-3 text-textprimary">{p.nombre}</td>
                    {/* ── CAMBIO: campo del backend es investigador_nombre ── */}
                    <td className="px-4 py-3 text-textprimary">{p.investigador_nombre}</td>
                    <td className="px-4 py-3 text-neutral" title={p.descripcion}>{truncate(p.descripcion)}</td>
                    <td className="px-4 py-3">
                      {p.pdf_url ? (
                        <a href={p.pdf_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-primary underline">
                          <IconDoc className="w-4 h-4 text-danger" />
                          {p.pdf_nombre_original || 'Ver PDF'}
                        </a>
                      ) : (
                        <span className="text-neutral text-[12px]">Sin PDF</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => setDeleteTarget(p)}
                        className="flex items-center gap-1.5 btn-danger px-3 py-1.5 text-[12px]">
                        <IconTrash className="w-3.5 h-3.5" />
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-8">
            <Button variant="primary" icon={<IconPlus className="w-4 h-4" />} onClick={() => navigate('/proyecto/nuevo')}>
              Nuevo Proyecto
            </Button>
            <div className="flex gap-8">
              <Stat label="Proyectos Activos" value={stats.activos} />
              <Stat label="Investigadores"    value={stats.investigadores} />
              <Stat label="PDFs subidos"      value={stats.pdfs} />
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal open={!!deleteTarget} onDark={false}
        title="Eliminar proyecto"
        message="¿Eliminar este proyecto? Esta acción no se puede deshacer."
        confirmLabel={deleting ? 'Eliminando...' : 'Confirmar'}
        cancelLabel="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)} />
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div className="text-center sm:text-right">
      <p className="text-[22px] font-bold text-primary leading-none">{value}</p>
      <p className="text-[12px] text-neutral mt-1">{label}</p>
    </div>
  )
}
