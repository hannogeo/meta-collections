import Button from './Button'

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmLabel = 'Delete', variant = 'danger' }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--color-surface-raised)] rounded-lg w-full max-w-sm p-6">
        <h3 className="text-base font-semibold text-[var(--color-ink)] mb-1">{title}</h3>
        <p className="text-sm text-[var(--color-ink-muted)] mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={variant} onClick={() => { onConfirm(); onClose() }}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  )
}
