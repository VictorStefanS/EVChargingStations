import React from 'react'
import { MapContainer as RLMapContainer, TileLayer as RLTileLayer, CircleMarker as RLCircleMarker, Popup as RLPopup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useQuery } from '@tanstack/react-query'
import { getStationsNearby } from '../api/fetchClient'

// use loose typing for API result to avoid strict leaflet/react-leaflet type mismatches
type StationLike = any

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

  // annotate stations with distance and sort
  const stationsWithDistance = (stations || []).map((s: StationLike) => {
    const lat = s.latitude ?? s.lat
    const lng = s.longitude ?? s.lng
    const dist = position ? distanceKm(position[0], position[1], lat, lng) : undefined
    return { ...s, _distanceKm: dist }
  }).sort((a: any, b: any) => (a._distanceKm ?? 0) - (b._distanceKm ?? 0))


  if (!position) return <div>Obtaining location&hellip;</div>
  if (isLoading) return <div>Loading stations&hellip;</div>
  if (error) return <div>Error loading stations</div>

  const statusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'green'
      case 'OCCUPIED':
        return 'red'
      case 'MAINTENANCE':
        return 'orange'
      default:
        return 'blue'
    }
  }

  // cast react-leaflet components to any to avoid prop-type mismatches in this environment
  const MapContainer: any = RLMapContainer as any
  const TileLayer: any = RLTileLayer as any
  const CircleMarker: any = RLCircleMarker as any
  const Popup: any = RLPopup as any

  return (
    <div style={{ height: '70vh', width: '100%' }}>
      <div style={{ padding: '0.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <label>Radius: <strong>{radiusKm} km</strong></label>
        <input type="range" min={1} max={50} value={radiusKm} onChange={(e) => setRadiusKm(Number(e.target.value))} />
        <div style={{ marginLeft: 'auto' }}>{(stationsWithDistance || []).length} stations</div>
      </div>

      <MapContainer center={position as any} zoom={13} style={{ height: 'calc(70vh - 40px)', width: '100%' }}>
        <TileLayer
          attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
          url={'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
        />

        {/* user position */}
        <CircleMarker center={position as any} radius={8} pathOptions={{ color: 'blue' }}>
          <Popup>Your location</Popup>
        </CircleMarker>

        {(stationsWithDistance || []).map((s: any, idx: number) => (
          <CircleMarker
            key={s.id ?? idx}
            center={[s.latitude ?? s.lat, s.longitude ?? s.lng]}
            radius={selectedStationId === s.id ? 12 : 8}
            pathOptions={{ color: statusColor(s.status ?? s.stationStatus ?? 'UNKNOWN') }}
            eventHandlers={{ click: () => { onSelectStation?.(s.id); setPosition?.([s.latitude ?? s.lat, s.longitude ?? s.lng]); } }}
          >
            <Popup>
              <div>
                <strong>{s.name}</strong>
                <div>Status: {s.status}</div>
                <div>Distance: {s._distanceKm !== undefined ? `${s._distanceKm.toFixed(2)} km` : '—'}</div>
                <div>
                  <a href={`https://www.google.com/maps/search/?api=1&query=${s.latitude ?? s.lat},${s.longitude ?? s.lng}`} target="_blank" rel="noreferrer">Open in Maps</a>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}

export default StationsMap
