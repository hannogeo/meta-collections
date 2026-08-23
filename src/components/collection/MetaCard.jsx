import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polygon } from 'react-leaflet'
import FitBounds from './FitBounds'
import ConfirmDialog from '../ui/ConfirmDialog'

export default function MetaCard({ meta, index, onEdit, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
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

  useEffect(() => {
    if (!expanded) return
    function handleKey(e) {
      if (e.key === 'Escape') setExpanded(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [expanded])

  function renderMap() {
    return (
      <>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds markers={meta.mapData.markers} polygon={meta.mapData.polygon} />
        {meta.mapData.markers?.map((m, i) => (
          <Marker key={i} position={[m.lat, m.lng]} />
        ))}
        {meta.mapData.polygon && (
          <Polygon positions={meta.mapData.polygon} />
        )}
      </>
    )
  }

  return (
    <>
      <div className="group relative bg-[var(--color-surface-raised)] border border-[var(--color-border)] rounded-lg p-5">
        <div className="flex items-start gap-4">
          <span className="text-xs text-[var(--color-ink-faint)] tabular-nums pt-0.5 shrink-0 w-6 text-right">
            {index}
          </span>
          <div className="flex-1 min-w-0 space-y-3">
            {meta.text && (
              <p className="text-sm text-[var(--color-ink)] whitespace-pre-wrap break-words leading-relaxed">
                {meta.text}
              </p>
            )}

            {meta.mapData && (
              <div className="relative h-[280px] rounded-md overflow-hidden border border-[var(--color-border)]">
                {!expanded && (
                  <MapContainer
                    center={[0, 0]}
                    zoom={2}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                    dragging={true}
                    doubleClickZoom={false}
                    touchZoom={true}
                  >
                    {renderMap()}
                  </MapContainer>
                )}
                {!expanded && (
                  <button
                    onClick={() => setExpanded(true)}
                    className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)] shadow-sm transition-colors cursor-pointer"
                    title="Expand map"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h6v6"/>
                      <path d="M9 21H3v-6"/>
                      <path d="M21 3l-7 7"/>
                      <path d="M3 21l7-7"/>
                    </svg>
                  </button>
                )}
              </div>
            )}

            {meta.examples && meta.examples.length > 0 && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                {meta.examples.map((ex, i) => (
                  <a
                    key={i}
                    href={ex.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 opacity-50">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/>
                      <line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    <span className="truncate">{ex.title}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="relative shrink-0" ref={menuRef}>
            {onEdit && (
              <>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
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
                      onClick={() => { setMenuOpen(false); onEdit(meta) }}
                      className="w-full text-left px-3 py-2 text-sm text-[var(--color-ink)] hover:bg-[var(--color-border)]/30 transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); setShowConfirm(true) }}
                      className="w-full text-left px-3 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger)]/5 transition-colors cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/40 p-6 sm:p-10 animate-overlay-in"
          onClick={() => setExpanded(false)}
        >
          <div
            className="relative w-full max-w-5xl h-[80vh] rounded-lg overflow-hidden border border-[var(--color-border)] shadow-2xl bg-[var(--color-surface)] animate-map-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            <MapContainer
              center={[0, 0]}
              zoom={2}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
              dragging={true}
              doubleClickZoom={true}
              touchZoom={true}
            >
              {renderMap()}
            </MapContainer>
            <button
              onClick={() => setExpanded(false)}
              className="absolute top-3 right-3 z-[10000] w-8 h-8 flex items-center justify-center rounded-md bg-[var(--color-surface-raised)] border border-[var(--color-border)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface)] shadow-sm transition-colors cursor-pointer"
              title="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {onDelete && (
        <ConfirmDialog
          open={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={() => onDelete(meta.id)}
          title="Delete meta"
          message="Remove this meta? Can't be undone."
        />
      )}
    </>
  )
}
