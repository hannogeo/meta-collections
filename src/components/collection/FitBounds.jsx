import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

export default function FitBounds({ markers, polygon, zoom }) {
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
      map.setView(points[0], zoom || 6)
      return
    }

    const bounds = L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: zoom || 12 })
  }, [markers, polygon, zoom, map])

  return null
}
