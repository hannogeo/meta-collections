import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { WORLD, COUNTRIES, getRegion } from '../../lib/regions'

function Flag({ code }) {
  if (code === WORLD.code) {
    return <span className="text-base leading-none shrink-0">{'\u{1F30D}'}</span>
  }
  return <span className={`fi fi-${code.toLowerCase()} shrink-0`} />
}

export default function RegionSelect({ value, onChange, clearable = false }) {
  const ref = useRef(null)
  const popupRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [pos, setPos] = useState(null)

  const selected = getRegion(value)

  useEffect(() => {
    if (!open) return
    function onDocClick(e) {
      if (ref.current && ref.current.contains(e.target)) return
      if (popupRef.current && popupRef.current.contains(e.target)) return
      setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function toggle() {
    if (open) {
      setOpen(false)
      return
    }
    setQuery('')
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const PAD = 8
    const height = 336
    const spaceBelow = window.innerHeight - rect.bottom
    const spaceAbove = rect.top
    const dropUp = spaceBelow < height + PAD && spaceAbove > spaceBelow
    setPos({
      top: dropUp ? undefined : rect.bottom + 4,
      bottom: dropUp ? window.innerHeight - rect.top + 4 : undefined,
      left: rect.left,
      width: rect.width,
    })
    setOpen(true)
  }

  function pick(code) {
    onChange(code)
    setOpen(false)
  }

  function clear(e) {
    e.stopPropagation()
    onChange(null)
    setOpen(false)
  }

  const filtered = query.trim()
    ? COUNTRIES.filter((c) => c.name.toLowerCase().includes(query.trim().toLowerCase()))
    : COUNTRIES

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggle}
        className="w-full px-3 py-2 text-sm bg-transparent border border-[var(--color-border)] rounded-md text-[var(--color-ink)] flex items-center justify-between gap-2 hover:border-[var(--color-border-hover)] focus:outline-none focus:border-[var(--color-ink)] transition-colors cursor-pointer"
      >
        <span className={`flex items-center gap-2 truncate ${selected ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-faint)]'}`}>
          {selected ? (
            <>
              <Flag code={selected.code} />
              <span className="truncate">{selected.name}</span>
            </>
          ) : (
            'Select a region'
          )}
        </span>
        <span className="flex items-center gap-2 shrink-0">
          {selected && clearable && (
            <span
              onClick={clear}
              className="w-4 h-4 flex items-center justify-center rounded-full text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] hover:bg-[var(--color-border)]/40 transition-colors cursor-pointer text-xs leading-none"
              title="Remove region"
            >
              &times;
            </span>
          )}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-[var(--color-ink-faint)] transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </button>

      {open && pos && createPortal(
        <div
          ref={popupRef}
          className="fixed z-[60] bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-md shadow-lg overflow-hidden"
          style={{ top: pos.top, bottom: pos.bottom, left: pos.left, width: pos.width }}
        >
          <div className="p-2 border-b border-[var(--color-border)]">
            <div className="relative">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-ink-faint)] pointer-events-none">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search countries..."
                autoFocus
                className="w-full pl-8 pr-2 py-1.5 text-xs bg-transparent border border-[var(--color-border)] rounded-md text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none focus:border-[var(--color-ink)] transition-colors"
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto py-1">
            <button
              type="button"
              onClick={() => pick(WORLD.code)}
              className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors cursor-pointer ${
                value === WORLD.code
                  ? 'bg-[var(--color-border)]/40 text-[var(--color-ink)]'
                  : 'text-[var(--color-ink)] hover:bg-[var(--color-border)]/30'
              }`}
            >
              <Flag code={WORLD.code} />
              <span className="truncate">{WORLD.name}</span>
            </button>
            <div className="my-1 border-t border-[var(--color-border)]" />
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-[var(--color-ink-faint)]">No countries match</p>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => pick(c.code)}
                  className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors cursor-pointer ${
                    value === c.code
                      ? 'bg-[var(--color-border)]/40 text-[var(--color-ink)]'
                      : 'text-[var(--color-ink)] hover:bg-[var(--color-border)]/30'
                  }`}
                >
                  <Flag code={c.code} />
                  <span className="truncate">{c.name}</span>
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}