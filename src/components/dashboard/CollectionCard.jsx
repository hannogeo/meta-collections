import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

export default function CollectionCard({ collection, onRename, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  return (
    <Link
      to={`/collections/${collection.id}`}
      className="group relative bg-[var(--color-surface-raised)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] rounded-lg p-5 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-[var(--color-ink)] truncate pr-6">
            {collection.name}
          </h3>
          <p className="text-xs text-[var(--color-ink-faint)] mt-2 tabular-nums">
            {collection.metaCount || 0} {collection.metaCount === 1 ? 'meta' : 'metas'}
          </p>
        </div>
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setMenuOpen((o) => !o)
            }}
            className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] hover:bg-[var(--color-border)]/40 transition-all cursor-pointer"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="3" r="1.5"/>
              <circle cx="8" cy="8" r="1.5"/>
              <circle cx="8" cy="13" r="1.5"/>
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-md shadow-sm py-1 min-w-[120px] z-20">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setMenuOpen(false)
                  onRename(collection)
                }}
                className="w-full text-left px-3 py-2 text-sm text-[var(--color-ink)] hover:bg-[var(--color-border)]/30 transition-colors cursor-pointer"
              >
                Rename
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setMenuOpen(false)
                  onDelete(collection)
                }}
                className="w-full text-left px-3 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger)]/5 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
