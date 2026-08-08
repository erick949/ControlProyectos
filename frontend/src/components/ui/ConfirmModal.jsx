import Button from './Button'

/**
 * Modal de confirmación genérico.
 * Usado en: "¿Seguro que deseas cancelar?" (Registro de Proyecto)
 * y "¿Eliminar este proyecto?" (Panel Admin).
 */
export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = true,
  onDark = true,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  const cardClass = onDark
    ? 'glass-card text-textondark'
    : 'bg-white rounded-card shadow-panel text-textprimary'
  const titleClass = onDark ? 'text-textondark' : 'text-textprimary'
  const messageClass = onDark ? 'text-textondark/80' : 'text-neutral'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className={`w-full max-w-sm p-6 text-center ${cardClass}`}>
        <h3 className={`text-[18px] font-bold uppercase mb-2 ${titleClass}`}>{title}</h3>
        <p className={`text-[13px] mb-6 ${messageClass}`}>{message}</p>
        <div className="flex gap-3">
          <Button variant="secondary" onDark={onDark} className="flex-1" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            className="flex-1 !py-3"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
