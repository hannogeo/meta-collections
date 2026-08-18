import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polygon } from 'react-leaflet'
import FitBounds from './FitBounds'
import ConfirmDialog from '../ui/ConfirmDialog'

export default function MetaCard({ meta, index, onEdit, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false)
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
    <>
      <div className="group relative">
        <div className="flex items-start gap-4">
          <span className="text-xs text-[var(--color-ink-faint)] tabular-nums pt-1 shrink-0 w-6 text-right">
            {index}
          </span>
          <div className="flex-1 min-w-0 space-y-3">
            {meta.text && (
              <p className="text-sm text-[var(--color-ink)] whitespace-pre-wrap break-words leading-relaxed">
                {meta.text}
              </p>
            )}

            {meta.mapData && (
              <div className="h-[280px] rounded-md overflow-hidden border border-[var(--color-border)]">
                <MapContainer
                  center={[0, 0]}
                  zoom={2}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                  dragging={true}
                  doubleClickZoom={false}
                  touchZoom={true}
                >
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
                </MapContainer>
              </div>
            )}
          </div>

          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-md text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] hover:bg-[var(--color-border)]/40 transition-all cursor-pointer text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
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
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => onDelete(meta.id)}
        title="Delete meta"
        message="Remove this meta? Can't be undone."
      />
    </>
  )
}
