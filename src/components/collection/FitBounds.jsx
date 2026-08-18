import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

export default function FitBounds({ markers, polygon }) {
  const map = useMap()

  useEffect(() => {
    const points = []

    if (markers) {
      for (const m of markers) {
        points.push([m.lat, m.lng])
      }
    }

    if (polygon) {
      for (const p of polygon) {
        points.push(p)
      }
    }

    if (points.length === 0) return

    if (points.length === 1) {
      map.setView(points[0], 5)
      return
    }

    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 8 })
  }, [markers, polygon, map])

  return null
}
