import React from 'react'
import { MapContainer as RLMapContainer, TileLayer as RLTileLayer, CircleMarker as RLCircleMarker, Popup as RLPopup } from 'react-leaflet'

type StationLike = any

export const StationsMapLeaflet: React.FC<{
  position: [number, number]
  stations: StationLike[]
  selectedStationId: number | null
  onSelectStation: (id: number | null) => void
}> = ({ position, stations, selectedStationId, onSelectStation }) => {
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

  // cast components to any to avoid strict type mismatches
  const MapContainer: any = RLMapContainer as any
  const TileLayer: any = RLTileLayer as any
  const CircleMarker: any = RLCircleMarker as any
  const Popup: any = RLPopup as any

  return (
    <MapContainer center={position as any} zoom={13} style={{ height: 'calc(70vh - 40px)', width: '100%' }}>
      <TileLayer
        attribution={'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
        url={'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
      />

      {/* user position */}
      <CircleMarker center={position as any} radius={8} pathOptions={{ color: 'blue' }}>
        <Popup>Your location</Popup>
      </CircleMarker>

      {stations.map((s: any, idx: number) => (
        <CircleMarker
          key={s.id ?? idx}
          center={[s.latitude ?? s.lat, s.longitude ?? s.lng]}
          radius={selectedStationId === s.id ? 12 : 8}
          pathOptions={{ color: statusColor(s.status ?? s.stationStatus ?? 'UNKNOWN') }}
          eventHandlers={{ click: () => { onSelectStation?.(s.id); } }}
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
  )
}

export default StationsMapLeaflet
