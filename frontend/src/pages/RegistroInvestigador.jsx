import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthBackground from '../components/layout/AuthBackground'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Button from '../components/ui/Button'
import { IconUser } from '../components/ui/Icons'
import { DIVISIONES, LINEAS_INVESTIGACION } from '../data/mockData'

// Avatares por defecto situados en public/
const PRESET_AVATARS = [
  { id: 'mujer', name: 'Avatar Femenino', src: '/usuarioMujer.png' },
  { id: 'hombre', name: 'Avatar Masculino', src: '/usuarioHombre.png' },
]

function generarClave() {
  const n = Math.floor(100 + Math.random() * 900)
  return `InvestigadorID-${n}`
}

// session presente => un jefe está dando de alta a un investigador desde dentro del sistema.
// session ausente  => alguien nuevo se está autorregistrando (no requiere cuenta previa).
export default function RegistroInvestigador({ session }) {
  const navigate = useNavigate()
  const [clave] = useState(generarClave())
  const isInternal = !!session

  const [avatar, setAvatar] = useState('/usuarioMujer.png')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [pastedUrlInput, setPastedUrlInput] = useState('')

  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    nombre: '',
    areaParticipacion: '',
    division: '',
    email: '',
    linea: '',
  })
  const [errors, setErrors] = useState({})
  const [successMsg, setSuccessMsg] = useState('')

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  useEffect(() => {
    if (!isModalOpen) return

    function handleGlobalPaste(e) {
      const items = e.clipboardData?.items
      if (!items) return

      for (let item of items) {
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile()
          if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
              setAvatar(event.target.result)
              setIsModalOpen(false)
            }
            reader.readAsDataURL(file)
            break
          }
        }
      }
    }

    window.addEventListener('paste', handleGlobalPaste)
    return () => window.removeEventListener('paste', handleGlobalPaste)
  }, [isModalOpen])

  function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatar(event.target.result)
        setIsModalOpen(false)
      }
      reader.readAsDataURL(file)
    }
  }

  function handleApplyPastedUrl() {
    if (pastedUrlInput.trim()) {
      setAvatar(pastedUrlInput.trim())
      setPastedUrlInput('')
      setIsModalOpen(false)
    }
  }

  function validate() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Este campo es obligatorio.'
    if (!form.areaParticipacion.trim()) e.areaParticipacion = 'Este campo es obligatorio.'
    if (!form.division) e.division = 'Este campo es obligatorio.'
    if (!form.email.trim()) {
      e.email = 'Este campo es obligatorio.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      e.email = 'Formato de correo electrónico inválido.'
    }
    if (!form.linea) e.linea = 'Este campo es obligatorio.'
    return e
  }

  function handleSubmit(evt) {
    evt.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    console.log('Datos guardados:', { ...form, clave, avatar })

    if (isInternal) {
      setSuccessMsg('Investigador registrado correctamente.')
      setTimeout(() => navigate('/investigadores'), 1200)
    } else {
      setSuccessMsg('Registro guardado correctamente. Redirigiendo a inicio de sesión...')
      setTimeout(() => navigate('/login'), 1200)
    }
  }

  function handleCancel() {
    setForm({ nombre: '', areaParticipacion: '', division: '', email: '', linea: '' })
    setErrors({})
    if (isInternal) navigate('/investigadores')
  }

  const avatarPickerModal = isModalOpen && (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-[#e2e2ec] rounded-xl p-6 w-full max-w-md text-[#1e1b2e] shadow-2xl animate-fade-in">
        <h2 className="text-lg font-bold mb-4">Seleccionar Imagen de Perfil</h2>

        <div className="mb-5">
          <p className="text-xs text-[#5b5b6b] mb-2">Avatares predeterminados:</p>
          <div className="flex gap-4">
            {PRESET_AVATARS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setAvatar(item.src)
                  setIsModalOpen(false)
                }}
                className={`flex flex-col items-center p-2 rounded-lg border transition-all ${
                  avatar === item.src
                    ? 'border-indigo-500 bg-indigo-50 scale-105'
                    : 'border-[#e2e2ec] hover:border-indigo-300'
                }`}
              >
                <img src={item.src} alt={item.name} className="w-16 h-16 rounded-full object-cover mb-1" />
                <span className="text-[11px] text-[#5b5b6b]">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <p className="text-xs text-[#5b5b6b] mb-2">Cargar propia imagen o pegar (Ctrl + V):</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 border-2 border-dashed border-[#d4d4e0] hover:border-indigo-500 rounded-lg text-xs font-semibold text-[#5b5b6b] hover:text-[#1e1b2e] transition-colors flex items-center justify-center gap-2"
          >
            <span>📁 Seleccionar archivo local</span>
          </button>
        </div>

        <div className="mb-6">
          <p className="text-xs text-[#5b5b6b] mb-1">O pega el enlace de la imagen:</p>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="https://ejemplo.com/foto.jpg"
              value={pastedUrlInput}
              onChange={(e) => setPastedUrlInput(e.target.value)}
              className="flex-1 bg-white border border-[#e2e2ec] rounded-md px-3 py-1.5 text-xs text-[#1e1b2e] focus:outline-none focus:border-indigo-500"
            />
            <Button variant="primary" type="button" onClick={handleApplyPastedUrl} className="text-xs px-3 py-1.5">
              Aplicar
            </Button>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)} className="text-xs">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )

  const formContent = (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input label="Clave" value={clave} disabled onDark={!isInternal} />
        <Input
          label="Nombre"
          placeholder="Elena"
          onDark={!isInternal}
          value={form.nombre}
          onChange={(e) => update('nombre', e.target.value)}
          error={errors.nombre}
        />
        <Input
          label="AP (Área de Participación)"
          placeholder="Desarrollo de Software"
          onDark={!isInternal}
          value={form.areaParticipacion}
          onChange={(e) => update('areaParticipacion', e.target.value)}
          error={errors.areaParticipacion}
        />
        <Select
          label="División"
          options={DIVISIONES}
          value={form.division}
          onChange={(v) => update('division', v)}
          placeholder="Investigación y Desarrollo"
          error={errors.division}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          placeholder="elena.rodriguez@example.com"
          onDark={!isInternal}
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          error={errors.email}
        />
        <Select
          label="Línea de Investigación"
          options={LINEAS_INVESTIGACION}
          value={form.linea}
          onChange={(v) => update('linea', v)}
          placeholder="Inteligencia Artificial Aplicada"
          searchable
          error={errors.linea}
        />
      </div>

      {successMsg && <p className="text-[12px] text-emerald-600 text-center">{successMsg}</p>}

      <div className="flex flex-col sm:flex-row gap-3 mt-2 sm:justify-end sm:max-w-md sm:ml-auto sm:w-full">
        <Button type="submit" variant="primary" fullWidth className="py-3">
          Guardar
        </Button>
        <Button type="button" variant="secondary" fullWidth className="py-3" onClick={handleCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  )

  const avatarPicker = (
    <div className="relative group shrink-0">
      <div className="w-26 h-26 rounded-full border-2 border-indigo-500 bg-indigo-50 overflow-hidden flex items-center justify-center">
        {avatar ? (
          <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <IconUser className="w-8 h-8 text-indigo-500" />
        )}
      </div>
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        title="Cambiar foto de perfil"
        className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold"
      >
        Editar
      </button>
    </div>
  )

  // Registro interno: se ve dentro del layout con sidebar, mismo lenguaje visual que el resto del panel.
  if (isInternal) {
    return (
      <div className="max-w-[900px] mx-auto px-4 sm:px-8 py-10">
        <div className="flex items-center gap-4 mb-8">
          {avatarPicker}
          <div>
            <h1 className="text-[22px] font-bold text-textprimary">Registrar Nuevo Investigador</h1>
            <p className="text-[13px] text-neutral mt-1">
              Da de alta a un investigador dentro del sistema
            </p>
          </div>
        </div>

        <div className="bg-surface rounded-card shadow-panel p-6 sm:p-8">{formContent}</div>

        {avatarPickerModal}
      </div>
    )
  }

  // Autorregistro público: no requiere cuenta previa.
  return (
    <AuthBackground maxWidth="max-w-[860px]">
      <div className="glass-card p-8 relative">
        <div className="flex items-start justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            {avatarPicker}
            <h1 className="text-[24px] font-bold text-[#1e1b2e] uppercase leading-snug">
              Tarjeta de Registro de Nuevo Investigador
            </h1>
          </div>
        </div>

        {formContent}

        <p className="text-center text-[10px] text-[#a3a3b2] mt-8">
          SISTEMA DE CONTROL DE PROYECTOS v3.2 — Todos los derechos reservados
        </p>
      </div>

      {avatarPickerModal}
    </AuthBackground>
  )
}