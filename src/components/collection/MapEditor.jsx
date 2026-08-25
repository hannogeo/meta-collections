import { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import FitBounds from './FitBounds'

const PIN_COLORS = ['#e53935', '#1e88e5', '#43a047']

function createPinIcon(color) {
  return L.divIcon({
    html: `<svg width="25" height="34" viewBox="0 0 25 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 22.5 12.5 34 12.5 34S25 22.5 25 12.5C25 5.6 19.4 0 12.5 0Z" fill="${color}"/>
      <circle cx="12.5" cy="12" r="4.5" fill="white"/>
    </svg>`,
    className: '',
    iconSize: [25, 34],
    iconAnchor: [12.5, 34],
  })
}

const pinIcons = PIN_COLORS.map((c) => createPinIcon(c))

function ClickHandler({ onAddMarker }) {
  useMapEvents({
    click(e) {
      onAddMarker(e.latlng)
    },
  })
  return null
}

const MAX_PINS = 3

export default function MapEditor({ value, onChange }) {
  const [markers, setMarkers] = useState(value?.markers || [])
  const prevValueRef = useRef(value)

  useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value
      setMarkers(value?.markers || [])
    }
  }, [value])

  function handleAddMarker(latlng) {
    if (markers.length >= MAX_PINS) return
    const updated = [...markers, { lat: latlng.lat, lng: latlng.lng }]
    setMarkers(updated)
    onChange({ markers: updated })
  }

  function removeMarker(index) {
    const updated = markers.filter((_, i) => i !== index)
    setMarkers(updated)
    onChange({ markers: updated })
  }

  return (
    <div className="space-y-3">
      <div className="h-[280px] rounded-md overflow-hidden border border-[var(--color-border)]">
        <MapContainer
          center={[0, 0]}
          zoom={2}
          style={{ height: '100%', width: '100%' }}
          className="z-0 collection-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds markers={markers} />
          <ClickHandler onAddMarker={handleAddMarker} />
          {markers.map((m, i) => (
            <Marker key={i} position={[m.lat, m.lng]} icon={pinIcons[i]} />
          ))}
        </MapContainer>
      </div>

      <p className="text-[11px] text-[var(--color-ink-faint)]">
        {markers.length >= MAX_PINS
          ? `Maximum of ${MAX_PINS} pins reached.`
          : `Click the map to place a pin. ${MAX_PINS - markers.length} ${MAX_PINS - markers.length === 1 ? 'pin' : 'pins'} left.`}
      </p>

      {markers.length > 0 && (
        <div className="space-y-1">
          {markers.map((m, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1">
              <span className="flex items-center gap-2 text-[var(--color-ink-muted)] truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: PIN_COLORS[i] }}
                />
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
    </div>
  )
}
