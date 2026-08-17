import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Polygon } from 'react-leaflet'
import FitBounds from './FitBounds'
import ConfirmDialog from '../ui/ConfirmDialog'

export default function MetaCard({ meta, index, onEdit, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false)

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
                  scrollWheelZoom={false}
                  dragging={false}
                  doubleClickZoom={false}
                  touchZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <FitBounds markers={meta.mapData.markers} polygon={meta.mapData.polygon} zoom={meta.mapData.zoom} />
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

          <div className="opacity-0 group-hover:opacity-100 flex flex-col gap-1 transition-all shrink-0">
            <button
              onClick={() => onEdit(meta)}
              className="text-[var(--color-ink-faint)] hover:text-[var(--color-ink)] text-xs cursor-pointer transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="text-[var(--color-ink-faint)] hover:text-[var(--color-danger)] text-xs cursor-pointer transition-colors"
            >
              &times;
            </button>
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
