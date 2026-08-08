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

  // ── NUEVO: normalizar opciones a siempre { value, label } ──
  const normalized = useMemo(() =>
    options.map((o) =>
      typeof o === 'string' ? { value: o, label: o } : o
    ), [options])

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
    if (!searchable || !query) return normalized
    return normalized.filter((o) =>
      o.label.toLowerCase().includes(query.toLowerCase())
    )
  }, [normalized, query, searchable])

  // ── NUEVO: mostrar el label del valor seleccionado ──
  const selectedLabel = normalized.find((o) => o.value === value)?.label || value

  const fieldClass = onDark ? 'field-dark' : 'field-light'
  const labelClass = 'text-[#5b5b6b] font-semibold'
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
        {/* ── CAMBIO: mostrar label en lugar de value crudo ── */}
        <span className={value ? textColor : 'text-[#a3a3b2]'}>
          {selectedLabel || placeholder}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-indigo-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          style={{ backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
          className={`absolute left-0 right-0 top-full mt-1.5 rounded-xl overflow-hidden z-[100] ${panelBg}`}
        >
          {searchable && (
            <div className="p-2 border-b border-[#e2e2ec] bg-[#f7f7fb]">
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
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
              // ── CAMBIO: key y onClick usan opt.value ──
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.value)  // ← envía "ID", "IT", etc.
                    setOpen(false)
                    setQuery('')
                  }}
                  className={`w-full text-left px-3 py-2.5 text-[13px] transition-colors ${textColor} ${itemHover}`}
                >
                  {opt.label}  {/* ← muestra "Investigación y Desarrollo" */}
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