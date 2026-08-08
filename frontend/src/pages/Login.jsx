import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ADMIN_CREDENTIALS } from '../data/mockData'

// --- Íconos inline ---
const iconBase = { fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.75, stroke: 'currentColor' }

const IconUser = (p) => (
  <svg {...iconBase} {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0" />
  </svg>
)
const IconLock = (p) => (
  <svg {...iconBase} {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3M5.25 10.5h13.5a1 1 0 011 1v8.5a1 1 0 01-1 1H5.25a1 1 0 01-1-1v-8.5a1 1 0 011-1z" />
  </svg>
)
const IconEye = (p) => (
  <svg {...iconBase} {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)
const IconEyeOff = (p) => (
  <svg {...iconBase} {...p}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.774 3.162 10.066 7.5a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.243L9.88 9.88" />
  </svg>
)

// --- Puntos decorativos del fondo (índigo + ámbar, alternados) ---
const DOTS = [
  { top: '15%', left: '8%', color: 'bg-indigo-400/50' },
  { top: '22%', left: '92%', color: 'bg-amber-400/40' },
  { top: '38%', left: '18%', color: 'bg-indigo-400/50' },
  { top: '10%', left: '55%', color: 'bg-amber-400/40' },
  { top: '68%', left: '6%', color: 'bg-indigo-400/50' },
  { top: '72%', left: '88%', color: 'bg-amber-400/40' },
  { top: '85%', left: '35%', color: 'bg-indigo-400/50' },
  { top: '30%', left: '75%', color: 'bg-amber-400/40' },
  { top: '55%', left: '95%', color: 'bg-indigo-400/50' },
  { top: '80%', left: '60%', color: 'bg-amber-400/40' },
  { top: '5%', left: '30%', color: 'bg-indigo-400/50' },
  { top: '48%', left: '3%', color: 'bg-amber-400/40' },
]

export default function Login({ onLogin }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ usuario: '', contrasena: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')

  function handleChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
    setGeneralError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const newErrors = {}
    if (!form.usuario.trim()) newErrors.usuario = 'Este campo es obligatorio.'
    if (!form.contrasena.trim()) newErrors.contrasena = 'Este campo es obligatorio.'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Jefe de Departamento de Investigación
    if (form.usuario === ADMIN_CREDENTIALS.usuario && form.contrasena === ADMIN_CREDENTIALS.contrasena) {
      onLogin?.({ role: 'jefe', nombre: 'Jefe de Investigación' })
      navigate('/dashboard')
      return
    }

    // Investigador (cualquier otra credencial no vacía, según la lógica de demo existente)
    if (form.usuario.length > 0) {
      onLogin?.({ role: 'investigador', nombre: form.usuario.split('@')[0] })
      navigate('/dashboard')
      return
    }

    setGeneralError('Usuario o contraseña incorrectos.')
  }

  const inputBase =
    'w-full h-11 rounded-lg bg-white border border-[#e2e2ec] pl-9 pr-3 text-[13px] text-[#1e1b2e] placeholder-[#a3a3b2] outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15'
  const inputError = 'border-red-400 focus:border-red-500 focus:ring-red-500/15'

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#fbfbfe] via-[#f4f4f9] to-[#eef0f7] flex items-center justify-center p-4">
      {/* Glow ambiental */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-indigo-400/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-amber-300/10 blur-[100px]" />

      {/* Puntos decorativos */}
      {DOTS.map((d, i) => (
        <span
          key={i}
          className={`pointer-events-none absolute w-1 h-1 rounded-full ${d.color}`}
          style={{ top: d.top, left: d.left }}
        />
      ))}

      {/* Tarjeta del Formulario (con mt-12 para compensar la parte del logo que sobresale) */}
      <div className="relative w-full max-w-[400px] mt-12 rounded-2xl border border-indigo-500/15 bg-white/90 px-9 pb-9 pt-12 text-[#1e1b2e] shadow-[0_20px_50px_rgba(30,27,75,0.10),0_2px_8px_rgba(30,27,75,0.06)] backdrop-blur-xl flex flex-col items-center">

        {/* LOGO TRASLAPADO */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
          <img
            src="/logo.png"
            alt="Logo Proyecta"
            className="w-24 h-24 object-contain drop-shadow-[0_10px_15px_rgba(30,27,75,0.25)]"
          />
        </div>

        {/* Encabezado e Identidad */}
        <div className="text-center mb-6 mt-2">
          <p className="text-[10px] text-indigo-600 tracking-[0.25em] uppercase font-bold mt-1 mb-5">
            Control de Proyectos
          </p>
          <h2 className="text-2xl font-bold tracking-tight uppercase text-[#1e1b2e]">Bienvenido</h2>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} noValidate className="w-full flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-[#5b5b6b]">Usuario o Correo Electrónico</label>
            <div className="relative flex items-center">
              <IconUser className="absolute left-3 w-4 h-4 text-[#a3a3b2] pointer-events-none" />
              <input
                type="text"
                placeholder="nombre@empresa.com"
                value={form.usuario}
                onChange={(e) => handleChange('usuario', e.target.value)}
                className={`${inputBase} ${errors.usuario ? inputError : ''}`}
              />
            </div>
            {errors.usuario && <span className="text-[11px] text-red-500">{errors.usuario}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-[#5b5b6b]">Contraseña</label>
            <div className="relative flex items-center">
              <IconLock className="absolute left-3 w-4 h-4 text-[#a3a3b2] pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={form.contrasena}
                onChange={(e) => handleChange('contrasena', e.target.value)}
                className={`${inputBase} pr-9 ${errors.contrasena ? inputError : ''}`}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 text-[#a3a3b2] hover:text-indigo-600 transition-colors"
              >
                {showPassword ? <IconEyeOff className="w-4 h-4" /> : <IconEye className="w-4 h-4" />}
              </button>
            </div>
            {errors.contrasena && <span className="text-[11px] text-red-500">{errors.contrasena}</span>}
          </div>

          {generalError && (
            <p className="text-xs text-red-600 text-center bg-red-50 py-1.5 rounded border border-red-200">
              {generalError}
            </p>
          )}

          <button
            type="submit"
            className="mt-3 w-full py-3 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-700 text-white font-extrabold text-[13px] uppercase tracking-widest shadow-[0_8px_20px_rgba(79,70,229,0.28)] transition-all hover:shadow-[0_10px_28px_rgba(99,102,241,0.38),0_0_0_4px_rgba(245,158,11,0.08)] hover:-translate-y-0.5 active:translate-y-0"
          >
            Iniciar Sesión
          </button>

          <div className="text-center mt-1">
            <Link
              to="#"
              className="text-[13px] text-[#5b5b6b] hover:text-indigo-600 underline underline-offset-2 transition-colors"
            >
              ¿Olvidé mi contraseña?
            </Link>
          </div>
        </form>

        {/* Separador y registro */}
        <div className="w-full border-t border-[#e2e2ec] mt-6 pt-4 text-center">
          <p className="text-[13px] text-[#5b5b6b]">
            Nuevo en Proyecta?{' '}
            <Link to="/registro" className="text-indigo-600 font-semibold underline underline-offset-2 hover:text-indigo-700">
              Regístrate aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}