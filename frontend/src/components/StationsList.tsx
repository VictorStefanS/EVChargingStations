import React from 'react';
import { useStations, useUpdateStationStatus, useStationsNearby } from '../useStations';

export const StationsList: React.FC<{
  position: [number, number] | null
  radiusKm: number
  selectedStationId?: number | null
  onSelectStation?: (id: number | null) => void
}> = ({ position, radiusKm, selectedStationId, onSelectStation }) => {
  const fallback = useStations();
  const nearby = useStationsNearby(position ? position[0] : null, position ? position[1] : null, radiusKm);
  const { data: stations, isLoading, error } = position ? nearby : fallback;
  const updateStatus = useUpdateStationStatus();

  if (isLoading) return <div>Loading stations...</div>;
  if (error) return <div>Error: {error instanceof Error ? error.message : String(error)}</div>;

  return (
    <div style={{ maxWidth: 800, margin: '1rem auto' }}>
      <h3>Charging Stations</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Name</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Status</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Distance</th>
            <th style={{ textAlign: 'left', padding: '0.5rem' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stations?.map((s: any) => (
            <tr key={s.id} style={{ background: selectedStationId === s.id ? '#eef' : 'transparent' }} onClick={() => onSelectStation?.(s.id)}>
              <td style={{ padding: '0.5rem' }}>{s.name}</td>
              <td style={{ padding: '0.5rem' }}>{s.status}</td>
              <td style={{ padding: '0.5rem' }}>{s._distanceKm !== undefined ? `${s._distanceKm.toFixed(2)} km` : '—'}</td>
              <td style={{ padding: '0.5rem' }}>
                <button onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: s.id as number, status: 'AVAILABLE' }); }} style={{ marginRight: '0.25rem' }}>
                  Set Available
                </button>
                <button onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: s.id as number, status: 'OCCUPIED' }); }} style={{ marginRight: '0.25rem' }}>
                  Set Occupied
                </button>
                <button onClick={(e) => { e.stopPropagation(); updateStatus.mutate({ id: s.id as number, status: 'MAINTENANCE' }); }}>
                  Set Maintenance
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StationsList;
