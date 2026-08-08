/**
 * src/pages/RegistroProyecto.jsx  ← VERSIÓN CON API
 *
 * Cambios respecto al original:
 * - Ya no recibe `onCreateProyecto` como prop.
 * - handleSubmit llama a crearProyecto() de api/proyectos.js.
 * - Envía multipart/form-data con el PDF real al backend.
 * - Maneja errores de validación del servidor (p.ej. descripción < 50 chars).
 */

import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Textarea from '../components/ui/Textarea'
import Button from '../components/ui/Button'
import ConfirmModal from '../components/ui/ConfirmModal'
import { IconSearch, IconDoc, IconCheck, IconX } from '../components/ui/Icons'
import { crearProyecto } from '../api/proyectos'   // ← NUEVO

const MAX_MB = 10

export default function RegistroProyecto({ session }) {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [form, setForm]   = useState({ linea: '', nombre: '', descripcion: '' })
  const [file, setFile]   = useState(null)
  const [errors, setErrors] = useState({})
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [uploading, setUploading]   = useState(false)

  const nombreInvestigador = session?.nombre || 'Investigador'

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function handleFileSelect(e) {
    const selected = e.target.files?.[0]
    if (!selected) return
    if (selected.type !== 'application/pdf') {
      setErrors((er) => ({ ...er, file: 'Solo se permiten archivos en formato .pdf' }))
      setFile(null); return
    }
    if (selected.size > MAX_MB * 1024 * 1024) {
      setErrors((er) => ({ ...er, file: `El archivo excede el tamaño máximo de ${MAX_MB} MB.` }))
      setFile(null); return
    }
    setErrors((er) => ({ ...er, file: undefined }))
    setFile(selected)
  }

  function validate() {
    const e = {}
    if (!form.linea.trim())       e.linea = 'Este campo es obligatorio.'
    if (!form.nombre.trim())      e.nombre = 'Este campo es obligatorio.'
    else if (form.nombre.length > 120) e.nombre = 'Máximo 120 caracteres.'
    if (!form.descripcion.trim()) e.descripcion = 'Este campo es obligatorio.'
    else if (form.descripcion.length < 50) e.descripcion = 'Mínimo 50 caracteres.'
    if (!file) e.file = 'Debes cargar la memoria técnica en PDF.'
    return e
  }

  // ── CAMBIO PRINCIPAL ───────────────────────────────────────────────────────
  async function handleSubmit(evt) {
    evt.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }

    setUploading(true)
    try {
      await crearProyecto({
        linea:       form.linea,
        nombre:      form.nombre,
        descripcion: form.descripcion,
        estado:      'Activo',
        pdf:         file,
      })
      setSuccessMsg('Proyecto guardado correctamente.')
      setForm({ linea: '', nombre: '', descripcion: '' })
      setFile(null)
      // Redirigir después de un momento
      setTimeout(() => navigate('/mis-proyectos'), 1200)
    } catch (err) {
      // Mostrar errores de validación del backend en los campos correspondientes
      if (err.data) {
        const apiErrors = {}
        Object.entries(err.data).forEach(([key, val]) => {
          apiErrors[key] = Array.isArray(val) ? val[0] : val
        })
        setErrors(apiErrors)
      } else {
        setErrors({ form: 'Error al guardar el proyecto. Intenta de nuevo.' })
      }
    } finally {
      setUploading(false)
    }
  }
  // ──────────────────────────────────────────────────────────────────────────

  function confirmCancel() {
    setForm({ linea: '', nombre: '', descripcion: '' })
    setFile(null); setErrors({})
    setShowCancelConfirm(false)
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-10">
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-textprimary">Registro de Nuevo Proyecto</h1>
        <p className="text-[13px] text-neutral mt-1">
          Investigador: <span className="font-semibold text-textprimary">{nombreInvestigador}</span>
        </p>
      </div>

      <div className="bg-surface rounded-card shadow-panel p-6 sm:p-8">
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div className="border-l-[3px] border-primary pl-4 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Input label="Línea de Investigación" placeholder="Control Inteligente de Proyectos..."
                icon={<IconSearch />} onDark={false} value={form.linea}
                onChange={(e) => update('linea', e.target.value)} error={errors.linea} />
              <Input label="Nombre del Proyecto" placeholder="Optimización de Flujos de Trabajo..."
                maxLength={120} onDark={false} value={form.nombre}
                onChange={(e) => update('nombre', e.target.value)} error={errors.nombre} />
            </div>
            <Textarea label="Descripción" placeholder="Describe el objetivo, metodología y alcance..."
              maxLength={1000} onDark={false} value={form.descripcion}
              onChange={(e) => update('descripcion', e.target.value)} error={errors.descripcion} />
          </div>

          <div className="border-l-[3px] border-primary pl-4">
            <label className="text-[12px] font-medium text-neutral block mb-1.5">Cargar PDF</label>
            {!file ? (
              <>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 bg-primary hover:opacity-90 text-white text-[13px] font-semibold px-4 py-2.5 rounded-lg transition-opacity">
                  <IconDoc className="w-4 h-4" />Cargar PDF
                </button>
                <p className="text-[11px] text-neutral mt-1">Máx. 10MB</p>
              </>
            ) : (
              <div className="flex items-center gap-2 bg-surface-alt border border-border rounded-lg px-3 py-2.5 w-fit">
                <IconDoc className="w-4 h-4 text-danger" />
                <span className="text-[13px] text-textprimary">{file.name}</span>
                <button type="button" onClick={() => setFile(null)} className="text-neutral hover:text-danger ml-1">
                  <IconX className="w-4 h-4" />
                </button>
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileSelect} />
            {errors.file && <p className="text-[11px] text-danger mt-1.5">{errors.file}</p>}
          </div>

          {errors.form && <p className="text-[12px] text-danger text-center">{errors.form}</p>}
          {successMsg  && <p className="text-[12px] text-emerald-600 text-center">{successMsg}</p>}

          <div className="flex flex-col sm:flex-row gap-3 mt-2 sm:justify-end sm:max-w-md sm:ml-auto sm:w-full">
            <Button type="submit" variant="primary" icon={<IconCheck className="w-4 h-4" />}
              fullWidth className="py-3" disabled={uploading}>
              {uploading ? 'Guardando...' : 'Guardar'}
            </Button>
            <button type="button" onClick={() => setShowCancelConfirm(true)}
              className="w-full flex items-center justify-center gap-2 border border-danger text-danger bg-transparent rounded-full font-semibold text-[12px] py-3 hover:bg-danger/5 transition-colors">
              <IconX className="w-4 h-4" />Cancelar
            </button>
          </div>
        </form>
      </div>

      <ConfirmModal open={showCancelConfirm} onDark={false}
        title="¿Cancelar registro?" message="¿Seguro que deseas cancelar? Los datos no serán guardados."
        confirmLabel="Sí" cancelLabel="No"
        onConfirm={confirmCancel} onCancel={() => setShowCancelConfirm(false)} />
    </div>
  )
}
