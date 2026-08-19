import { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Polygon } from 'react-leaflet'
import FitBounds from './FitBounds'
import ConfirmDialog from '../ui/ConfirmDialog'

export default function MetaCard({ meta, index, onEdit, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [animState, setAnimState] = useState(null)
  const mapRef = useRef(null)
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
      if (e.key === 'Escape') handleCollapse()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [expanded])

  const handleExpand = useCallback(() => {
    const el = mapRef.current
    if (!el) { setExpanded(true); return }

    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    const padX = window.innerWidth < 640 ? 24 : 40
    const padY = window.innerWidth < 640 ? 24 : 40
    const targetW = Math.min(vw - padX * 2, 960)
    const targetH = vh * 0.8
    const targetX = (vw - targetW) / 2
    const targetY = (vh - targetH) / 2

    setAnimState({
      srcX: rect.left,
      srcY: rect.top,
      srcW: rect.width,
      srcH: rect.height,
      targetX,
      targetY,
      targetW,
      targetH,
      phase: 'capturing',
    })
  }, [])

  useEffect(() => {
    if (!animState || animState.phase !== 'capturing') return

    const el = mapRef.current
    if (!el) { setExpanded(true); setAnimState(null); return }

    const canvas = document.createElement('canvas')
    canvas.width = el.offsetWidth * devicePixelRatio
    canvas.height = el.offsetHeight * devicePixelRatio
    const ctx = canvas.getContext('2d')
    ctx.scale(devicePixelRatio, devicePixelRatio)

    const { srcX, srcY, srcW, srcH, targetX, targetY, targetW, targetH } = animState

    const clone = el.cloneNode(true)
    Object.assign(clone.style, {
      position: 'fixed',
      left: srcX + 'px',
      top: srcY + 'px',
      width: srcW + 'px',
      height: srcH + 'px',
      zIndex: '10000',
      borderRadius: '6px',
      overflow: 'hidden',
      pointerEvents: 'none',
      transition: 'none',
      margin: '0',
      border: '1px solid var(--color-border)',
    })

    document.body.appendChild(clone)

    requestAnimationFrame(() => {
      clone.style.transition = 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.3s ease'
      clone.style.left = targetX + 'px'
      clone.style.top = targetY + 'px'
      clone.style.width = targetW + 'px'
      clone.style.height = targetH + 'px'
      clone.style.borderRadius = '8px'
    })

    const timer = setTimeout(() => {
      clone.remove()
      setExpanded(true)
      setAnimState(null)
    }, 320)

    return () => { clearTimeout(timer); clone.remove() }
  }, [animState])

  const handleCollapse = useCallback(() => {
    const el = mapRef.current
    if (!el) { setExpanded(false); return }

    const rect = el.getBoundingClientRect()
    const clone = document.querySelector('.map-clone-overlay')
    if (!clone) { setExpanded(false); return }

    const cloneRect = clone.getBoundingClientRect()

    const newClone = clone.cloneNode(true)
    Object.assign(newClone.style, {
      transition: 'none',
      left: cloneRect.left + 'px',
      top: cloneRect.top + 'px',
      width: cloneRect.width + 'px',
      height: cloneRect.height + 'px',
    })

    setExpanded(false)

    document.body.appendChild(newClone)
    requestAnimationFrame(() => {
      newClone.style.transition = 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-radius 0.3s ease'
      newClone.style.left = rect.left + 'px'
      newClone.style.top = rect.top + 'px'
      newClone.style.width = rect.width + 'px'
      newClone.style.height = rect.height + 'px'
      newClone.style.borderRadius = '6px'
    })

    setTimeout(() => newClone.remove(), 320)
  }, [])

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
              <div ref={mapRef} className="relative h-[280px] rounded-md overflow-hidden border border-[var(--color-border)]">
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
                    onClick={handleExpand}
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
          </div>

          <div className="relative shrink-0" ref={menuRef}>
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
          </div>
        </div>
      </div>

      {expanded && (
        <div
          className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/40 p-6 sm:p-10 animate-overlay-in"
          onClick={handleCollapse}
        >
          <div
            className="relative w-full max-w-5xl h-[80vh] rounded-lg overflow-hidden border border-[var(--color-border)] shadow-2xl bg-[var(--color-surface)]"
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
              onClick={handleCollapse}
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
