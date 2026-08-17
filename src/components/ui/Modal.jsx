import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, wide }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-[var(--color-surface-raised)] rounded-lg w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-base font-semibold text-[var(--color-ink)]">{title}</h2>
          <button
            onClick={onClose}
            className="text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] transition-colors text-lg leading-none cursor-pointer"
          >
            &times;
          </button>
        </div>
        <div className="px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  )
}
