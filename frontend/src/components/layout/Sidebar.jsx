import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

// Íconos inline optimizados para fondo oscuro
const ic = { fill: 'none', viewBox: '0 0 24 24', strokeWidth: 1.5, stroke: 'currentColor' }

const IconHome = (p) => (
  <svg {...ic} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0L22.28 12M4.5 9.75V19.5a1.5 1.5 0 001.5 1.5h3.75v-6h4.5v6h3.75a1.5 1.5 0 001.5-1.5V9.75" /></svg>
)
const IconPlusCircle = (p) => (
  <svg {...ic} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
)
const IconFolder = (p) => (
  <svg {...ic} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75a2.25 2.25 0 012.25-2.25h3.879a1.5 1.5 0 011.06.44l1.622 1.62a1.5 1.5 0 001.06.44h5.129a2.25 2.25 0 012.25 2.25v8.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6.75z" /></svg>
)
const IconClipboard = (p) => (
  <svg {...ic} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6M9 3.75h6a1.5 1.5 0 011.5 1.5V6h-9V5.25a1.5 1.5 0 011.5-1.5zM6 6h12a1.5 1.5 0 011.5 1.5V19.5A1.5 1.5 0 0118 21H6a1.5 1.5 0 01-1.5-1.5V7.5A1.5 1.5 0 016 6z" /></svg>
)
const IconUsers = (p) => (
  <svg {...ic} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0112.749 0zM15.75 8.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>
)
const IconUserCircle = (p) => (
  <svg {...ic} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.964 0a9 9 0 10-11.964 0m11.964 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
)
const IconPower = (p) => (
  <svg {...ic} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1012.728 0M12 3v9" /></svg>
)
const IconMenu = (p) => (
  <svg {...ic} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" /></svg>
)
const IconX = (p) => (
  <svg {...ic} {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
)

const NAV_BY_ROLE = {
  jefe: [
    { to: '/dashboard', label: 'Inicio', icon: IconHome },
    { to: '/admin/proyectos', label: 'Panel de Proyectos', icon: IconFolder },
    { to: '/investigadores', label: 'Investigadores', icon: IconUsers },
    { to: '/perfil', label: 'Mi Perfil', icon: IconUserCircle },
  ],
  investigador: [
    { to: '/dashboard', label: 'Inicio', icon: IconHome },
    { to: '/proyecto/nuevo', label: 'Nuevo Proyecto', icon: IconPlusCircle },
    { to: '/mis-proyectos', label: 'Mis Proyectos', icon: IconClipboard },
    { to: '/perfil', label: 'Mi Perfil', icon: IconUserCircle },
  ],
}

const ROLE_LABEL = {
  jefe: 'Jefe de Depto.',
  investigador: 'Investigador',
}

// Definición de colores para fácil mantenimiento
const colors = {
  bg: 'bg-neutral-950',          // Fondo principal (casi negro)
  bgSecondary: 'bg-neutral-900', // Fondo de tarjeta de usuario / hovers
  border: 'border-neutral-800',  // Líneas divisorias
  textMain: 'text-neutral-100',  // Texto blanco principal
  textMuted: 'text-neutral-400', // Texto gris secundario
  accent: 'text-amber-400',      // Color de acento para iconos activos
  activeBg: 'bg-neutral-800/60'  // Fondo de item de menú activo
}

export default function Sidebar({ session, onLogout }) {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const items = NAV_BY_ROLE[session?.role] || []
  const roleLabel = ROLE_LABEL[session?.role] || ''
  const displayName = session?.nombre || 'Usuario'

  // Clases dinámicas para los links de navegación
  const getLinkClasses = ({ isActive }) =>
    `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm transition-all duration-200 group ${
      isActive
        ? `${colors.activeBg} ${colors.textMain} font-semibold shadow-inner`
        : `${colors.textMuted} hover:${colors.bgSecondary} hover:${colors.textMain}`
    }`

  function SidebarContent() {
    return (
      <div className={`flex h-full flex-col ${colors.bg} ${colors.border} border-r`}>
        {/* Marca / Header */}
        <div className={`px-6 pt-7 pb-6 shrink-0 ${colors.border} border-b`}>
          <div className="flex items-center gap-3">
            {/* Contenedor del logo con un ligero gradiente oscuro */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center p-2 shadow-lg border border-neutral-700">
              <img
                src="/logo.png"
                alt="Proyecta"
                className="w-full h-full object-contain filter brightness-0 invert" // Hace el logo blanco
              />
            </div>
            <div>
              <p className={`${colors.textMain} font-bold text-lg leading-tight tracking-tight`}>
                Proyecta
              </p>
              <p className={`${colors.textMuted} text-xs font-medium tracking-wide uppercase`}>
                Investigación
              </p>
            </div>
          </div>
        </div>

        {/* Tarjeta de Usuario (Estilo Oscuro Elevado) */}
        <div className="px-4 mt-6 shrink-0">
          <div className={`${colors.bgSecondary} ${colors.border} border rounded-2xl p-4 flex items-center gap-4 shadow-xl`}>
            <div className="w-10 h-10 rounded-full bg-neutral-700 border-2 border-neutral-600 text-neutral-100 font-bold text-sm flex items-center justify-center shrink-0 shadow-inner">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`${colors.textMain} text-sm font-semibold truncate`}>
                {displayName}
              </p>
              <span className={`inline-block mt-1 px-2 py-0.5 bg-neutral-800 ${colors.textMuted} text-[11px] font-medium rounded-md border border-neutral-700`}>
                {roleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto mt-2">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={getLinkClasses}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? colors.accent : colors.textMuted + ' group-hover:' + colors.textMain}`} />
                  <span className="truncate">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sección Inferior (Cerrar sesión) */}
        <div className={`p-4 ${colors.border} border-t ${colors.bgSecondary}/50`}>
          <button
            type="button"
            onClick={() => {
              onLogout?.()
              navigate('/login')
            }}
            className={`flex w-full items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium ${colors.textMuted} hover:bg-red-950/40 hover:text-red-300 transition-colors duration-200 group`}
          >
            <IconPower className="w-5 h-5 shrink-0 text-neutral-500 group-hover:text-red-400 transition-colors" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Barra superior móvil (Adaptada a oscuro) */}
      <div className={`lg:hidden flex items-center justify-between px-5 py-3 ${colors.bg} ${colors.border} border-b sticky top-0 z-30 w-full shadow-lg`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neutral-800 flex items-center justify-center p-1.5 border border-neutral-700">
            <img src="/logo.png" alt="Proyecta" className="w-full h-full object-contain filter brightness-0 invert" />
          </div>
          <p className={`${colors.textMain} font-bold text-XVI`}>Proyecta</p>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className={`${colors.textMuted} hover:${colors.textMain} p-2 rounded-lg hover:${colors.bgSecondary} transition-colors`}
          aria-label="Abrir menú"
        >
          <IconMenu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar fija en escritorio */}
      <aside className="hidden lg:flex lg:flex-col w-[260px] shrink-0 h-screen sticky top-0 z-30">
        <SidebarContent />
      </aside>

      {/* Panel deslizante en móvil (Overlay oscuro) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          {/* Overlay más oscuro para resaltar el sidebar */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[280px] shadow-2xl transform transition-transform duration-300 ease-in-out">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-5 text-neutral-500 hover:text-neutral-100 p-1.5 rounded-full hover:bg-neutral-800 z-50"
              aria-label="Cerrar menú"
            >
              <IconX className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}