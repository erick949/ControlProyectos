export default function Button({
  children,
  variant = 'primary',
  icon = null,
  fullWidth = false,
  onDark = true,
  className = '',
  ...props
}) {
  const base = 'px-5 py-3 inline-flex items-center justify-center gap-2 transition-colors'
  const width = fullWidth ? 'w-full' : ''

  const variants = {
    primary: 'btn-primary',
    secondary: onDark ? 'btn-secondary' : 'btn-secondary-light',
    danger: 'btn-danger py-2.5',
  }

  return (
    <button className={`${base} ${width} ${variants[variant]} ${className}`} {...props}>
      {icon && <span aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </button>
  )
}
