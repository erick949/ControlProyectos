export default function Input({
  label,
  error,
  icon = null,
  suffixIcon = null,
  onSuffixClick,
  onDark = true,
  disabled = false,
  className = '',
  ...props
}) {
  // Ambas variantes ahora viven en el tema claro/índigo.
  // onDark = true  -> input "sobre tarjeta de vidrio" (fondo blanco puro, borde más marcado)
  // onDark = false -> input "sobre fondo plano claro" (mismo look, disponible por compatibilidad)
  const fieldClass = onDark
    ? 'bg-white text-[#1e1b2e] border border-[#e2e2ec] focus:border-indigo-500 placeholder:text-[#a3a3b2] rounded-lg shadow-sm'
    : 'bg-white text-[#1e1b2e] border border-[#e2e2ec] focus:border-indigo-500 placeholder:text-[#a3a3b2] rounded-lg shadow-sm'

  const labelClass = onDark ? 'text-[#5b5b6b] font-semibold' : 'text-[#5b5b6b] font-semibold'

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className={`text-[12px] ${labelClass}`}>{label}</label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 text-[#a3a3b2] pointer-events-none [&>svg]:w-4 [&>svg]:h-4">
            {icon}
          </span>
        )}
        <input
          disabled={disabled}
          className={`${fieldClass} w-full text-[13px] py-2.5 transition-colors outline-none focus:ring-2 focus:ring-indigo-500/15 ${icon ? 'pl-9' : 'pl-3'} ${
            suffixIcon ? 'pr-9' : 'pr-3'
          } ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15' : ''} ${
            disabled ? 'bg-[#f4f4f9] text-[#a3a3b2] opacity-80 cursor-not-allowed border-[#e2e2ec]' : ''
          } ${className}`}
          {...props}
        />
        {suffixIcon && (
          <button
            type="button"
            onClick={onSuffixClick}
            className="absolute right-3 text-[#a3a3b2] hover:text-indigo-600 transition-colors [&>svg]:w-4 [&>svg]:h-4"
            tabIndex={-1}
          >
            {suffixIcon}
          </button>
        )}
      </div>
      {error && <span className="text-[11px] text-red-500 font-medium">{error}</span>}
    </div>
  )
}