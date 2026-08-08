export default function Textarea({
  label,
  error,
  onDark = true,
  maxLength,
  value = '',
  className = '',
  ...props
}) {
  const fieldClass = onDark ? 'field-dark' : 'field-light'
  const labelClass = onDark ? 'text-textondark/80' : 'text-neutral'
  const counterClass = onDark ? 'text-border' : 'text-neutral'

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className={`text-[12px] font-medium ${labelClass}`}>{label}</label>}
      <textarea
        value={value}
        maxLength={maxLength}
        className={`${fieldClass} w-full text-[13px] py-2.5 px-3 min-h-[100px] resize-y ${
          error ? 'field-error' : ''
        } ${className}`}
        {...props}
      />
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-danger">{error}</span>
        {maxLength && (
          <span className={`text-[11px] ${counterClass}`}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
}
