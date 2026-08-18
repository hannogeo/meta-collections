import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Polygon, useMapEvents } from 'react-leaflet'
import FitBounds from './FitBounds'

function ClickHandler({ onAddMarker, onAddPolygonPoint, mode }) {
  useMapEvents({
    click(e) {
      if (mode === 'marker') {
        onAddMarker(e.latlng)
      } else if (mode === 'polygon') {
        onAddPolygonPoint(e.latlng)
      }
    },
  })
  return null
}

export default function MapEditor({ value, onChange }) {
  const [mode, setMode] = useState('marker')
  const [polygonPoints, setPolygonPoints] = useState(value?.polygon || [])
  const [markers, setMarkers] = useState(value?.markers || [])
  const prevValueRef = useRef(value)

  useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value
      setMarkers(value?.markers || [])
      setPolygonPoints(value?.polygon || [])
    }
  }, [value])

  function handleAddMarker(latlng) {
    const updated = [...markers, { lat: latlng.lat, lng: latlng.lng }]
    setMarkers(updated)
    emitChange(updated, polygonPoints)
  }

  function handleAddPolygonPoint(latlng) {
    const updated = [...polygonPoints, [latlng.lat, latlng.lng]]
    setPolygonPoints(updated)
    emitChange(markers, updated)
  }

  function emitChange(m, p) {
    onChange({
      markers: m,
      polygon: p.length > 0 ? p : null,
    })
  }

  function removeMarker(index) {
    const updated = markers.filter((_, i) => i !== index)
    setMarkers(updated)
    emitChange(updated, polygonPoints)
  }

  function removePolygonPoint(index) {
    const updated = polygonPoints.filter((_, i) => i !== index)
    setPolygonPoints(updated)
    emitChange(markers, updated)
  }

  function clearPolygon() {
    setPolygonPoints([])
    emitChange(markers, [])
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => setMode('marker')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            mode === 'marker'
              ? 'bg-[var(--color-accent)] text-[var(--color-surface)]'
              : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-border)]/40'
          }`}
        >
          Marker
        </button>
        <button
          type="button"
          onClick={() => setMode('polygon')}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            mode === 'polygon'
              ? 'bg-[var(--color-accent)] text-[var(--color-surface)]'
              : 'text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-border)]/40'
          }`}
        >
          Polygon
        </button>
        {polygonPoints.length > 0 && (
          <button
            type="button"
            onClick={clearPolygon}
            className="px-3 py-1.5 rounded-md text-xs font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 cursor-pointer transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <div className="h-[280px] rounded-md overflow-hidden border border-[var(--color-border)]">
        <MapContainer
          center={[0, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds markers={markers} polygon={polygonPoints.length > 0 ? polygonPoints : null} />
          <ClickHandler onAddMarker={handleAddMarker} onAddPolygonPoint={handleAddPolygonPoint} mode={mode} />
          {markers.map((m, i) => (
            <Marker key={i} position={[m.lat, m.lng]} />
          ))}
          {polygonPoints.length > 0 && (
            <Polygon positions={polygonPoints} />
          )}
        </MapContainer>
      </div>

      <p className="text-[11px] text-[var(--color-ink-faint)]">
        Click the map to place {mode === 'marker' ? 'markers' : 'polygon points'}.
      </p>

      {markers.length > 0 && (
        <div className="space-y-1">
          {markers.map((m, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1">
              <span className="text-[var(--color-ink-muted)] truncate">
                {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
              </span>
              <button
                type="button"
                onClick={() => removeMarker(i)}
                className="text-[var(--color-ink-faint)] hover:text-[var(--color-danger)] ml-3 cursor-pointer transition-colors"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {polygonPoints.length > 0 && (
        <p className="text-xs text-[var(--color-ink-faint)]">
          {polygonPoints.length} polygon {polygonPoints.length === 1 ? 'point' : 'points'}
        </p>
      )}
    </div>
  )
}
