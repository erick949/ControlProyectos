import { useMemo, useRef, useState, useEffect } from 'react'

export default function Select({
  label,
  error,
  options = [],
  value,
  onChange,
  placeholder = 'Seleccionar...',
  onDark = true,
  searchable = false,
  className = '',
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapperRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = useMemo(() => {
    if (!searchable || !query) return options
    return options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
  }, [options, query, searchable])

  const fieldClass = onDark ? 'field-dark' : 'field-light'
  const labelClass = 'text-[#5b5b6b] font-semibold'

  // Panel tipo "vidrio claro": blanco casi opaco + blur, borde índigo tenue,
  // igual criterio que .glass-card en index.css.
  const panelBg = 'bg-white/92 border border-indigo-500/15 shadow-[0_15px_35px_rgba(30,27,75,0.15)]'

  const itemHover = 'hover:bg-indigo-50'
  const textColor = 'text-[#1e1b2e]'

  return (
    <div className="flex flex-col gap-1.5 w-full relative" ref={wrapperRef}>
      {label && <label className={`text-[12px] font-medium ${labelClass}`}>{label}</label>}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${fieldClass} w-full text-[13px] py-2.5 px-3 flex items-center justify-between text-left ${
          error ? 'field-error' : ''
        } ${className}`}
      >
        <span className={value ? textColor : 'text-[#a3a3b2]'}>{value || placeholder}</span>
        <svg
          className={`w-3.5 h-3.5 text-indigo-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
          className={`absolute left-0 right-0 top-full mt-1.5 rounded-xl overflow-hidden z-[100] ${panelBg}`}
        >
          {searchable && (
            <div className="p-2 border-b border-[#e2e2ec] bg-[#f7f7fb]">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar..."
                className={`${fieldClass} w-full text-[13px] py-2 px-3`}
              />
            </div>
          )}
          <ul className="max-h-48 overflow-y-auto divide-y divide-[#e2e2ec]">
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-[12px] text-[#a3a3b2]">Sin resultados</li>
            )}
            {filtered.map((opt) => (
              <li key={opt}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt)
                    setOpen(false)
                    setQuery('')
                  }}
                  className={`w-full text-left px-3 py-2.5 text-[13px] transition-colors ${textColor} ${itemHover}`}
                >
                  {opt}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {error && <span className="text-[11px] text-red-500">{error}</span>}
    </div>
  )
}