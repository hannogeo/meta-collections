import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import EmojiPicker from './EmojiPicker'

export default function CollectionCard({ collection, onRename, onDelete, onUpdateEmoji }) {
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
    <div className="group relative bg-[var(--color-surface-raised)] border border-[var(--color-border)] hover:border-[var(--color-border-hover)] rounded-lg p-4 transition-all flex items-center">
      <Link
        to={`/collections/${collection.id}`}
        className="absolute inset-0 rounded-lg z-0"
        tabIndex={-1}
      />
      <EmojiPicker
        value={collection.emoji || ''}
        onChange={(e) => onUpdateEmoji(collection.id, e)}
      >
        <div
          className="group/emoji relative z-10 w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--color-border)]/50 transition-colors text-xl shrink-0 cursor-pointer"
          title="Change icon"
        >
          {collection.emoji || (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-[var(--color-ink-faint)]">
              <circle cx="10" cy="10" r="8" strokeDasharray="3 3"/>
            </svg>
          )}
          {collection.emoji && (
            <span
              onClick={(e) => { e.stopPropagation(); onUpdateEmoji(collection.id, '') }}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-danger)] hover:border-[var(--color-danger)]/30 flex items-center justify-center cursor-pointer text-[10px] leading-none transition-all opacity-0 group-hover/emoji:opacity-100 pointer-events-none group-hover/emoji:pointer-events-auto"
              title="Remove icon"
            >
              &times;
            </span>
          )}
        </div>
      </EmojiPicker>
      <div className="flex-1 min-w-0 relative z-10 pl-3 pointer-events-none">
        <h3 className="text-sm font-medium text-[var(--color-ink)] truncate">
          {collection.name}
        </h3>
        <p className="text-xs text-[var(--color-ink-faint)] mt-0.5 tabular-nums">
          {collection.metaCount || 0} {collection.metaCount === 1 ? 'meta' : 'metas'}
        </p>
      </div>
      <div className="relative shrink-0 z-10" ref={menuRef}>
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
  )
}
