import React from 'react'
import 'leaflet/dist/leaflet.css'
import { useQuery } from '@tanstack/react-query'
import { getStationsNearby } from '../api/fetchClient'

// use loose typing for API result to avoid strict leaflet/react-leaflet type mismatches
type StationLike = any

const StationsMapLeaflet = React.lazy(() => import('./StationsMapLeaflet'))

export const StationsMap: React.FC<{
  position: [number, number] | null
  setPosition: (p: [number, number] | null) => void
  radiusKm: number
  setRadiusKm: (r: number) => void
  selectedStationId: number | null
  onSelectStation: (id: number | null) => void
}> = ({ position, setPosition, radiusKm, setRadiusKm, selectedStationId, onSelectStation }) => {
  // use position and radius from props

  const { data: stations, isLoading, error } = useQuery(['stationsNearby', position, radiusKm], async () => {
    if (!position) return [] as StationLike[]
    return getStationsNearby(position[0], position[1], radiusKm)
  }, {
    enabled: !!position,
    staleTime: 1000 * 60 * 5,
  })

  // compute distance (km) between two lat/lng points using Haversine
  function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const toRad = (v: number) => (v * Math.PI) / 180
    const R = 6371 // km
    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // validate position coordinates (Leaflet requires finite numbers)
  const validPosition = !!position && Number.isFinite(position[0]) && Number.isFinite(position[1])

  // annotate stations with distance and sort; skip stations with invalid coords
  const stationsWithDistance = (stations || [])
    .map((s: StationLike) => {
      const lat = s.latitude ?? s.lat
      const lng = s.longitude ?? s.lng
      const hasCoords = Number.isFinite(lat) && Number.isFinite(lng)
      const dist = validPosition && hasCoords ? distanceKm(position![0], position![1], lat, lng) : undefined
      return hasCoords ? { ...s, _distanceKm: dist } : null
    })
    .filter((s: any) => s != null)
    .sort((a: any, b: any) => (a._distanceKm ?? 0) - (b._distanceKm ?? 0))

  if (!validPosition) return <div>Unable to determine location&hellip;</div>
  if (isLoading) return <div>Loading stations&hellip;</div>
  if (error) return <div>Error loading stations</div>

  return (
    <div style={{ height: '70vh', width: '100%' }}>
      <div style={{ padding: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <label>Radius: <strong>{radiusKm} km</strong></label>
        <input type="range" min={1} max={50} value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} />
        <div style={{ marginLeft: 'auto' }}>{(stationsWithDistance || []).length} stations</div>
      </div>

      <React.Suspense fallback={<div>Loading map…</div>}>
        <StationsMapLeaflet
          position={position as [number, number]}
          stations={stationsWithDistance as any}
          selectedStationId={selectedStationId}
          onSelectStation={(id) => { onSelectStation(id); if (id) {
            const s = (stationsWithDistance as any).find((x: any) => x.id === id)
            if (s) setPosition([s.latitude ?? s.lat, s.longitude ?? s.lng])
          } }}
        />
      </React.Suspense>
    </div>
  )
}

export default StationsMap
