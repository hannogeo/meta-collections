import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

export default function FitBounds({ markers }) {
  const map = useMap()

  useEffect(() => {
    if (!markers || markers.length === 0) return

    const points = markers.map((m) => [m.lat, m.lng])

    if (points.length === 1) {
      map.setView(points[0], 5)
      return
    }

    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 })
  }, [markers, map])

  return null
}
