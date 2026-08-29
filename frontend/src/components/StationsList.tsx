import React from 'react';
import { useStations, useUpdateStationStatus } from '../useStations';

export const StationsList: React.FC = () => {
  const { data: stations, isLoading, error } = useStations();
  const updateStatus = useUpdateStationStatus();

  if (isLoading) return <div>Loading stations...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div style={{ maxWidth: 800, margin: '1rem auto' }}>
      <h3>Charging Stations</h3>
      <ul>
        {stations?.map((s) => (
          <li key={s.id} style={{ marginBottom: '0.5rem' }}>
            <strong>{s.name}</strong> — {s.status}
            <div style={{ marginTop: '0.25rem' }}>
              <button
                onClick={() => updateStatus.mutate({ id: s.id as number, status: 'AVAILABLE' })}
                style={{ marginRight: '0.25rem' }}
              >
                Set Available
              </button>
              <button
                onClick={() => updateStatus.mutate({ id: s.id as number, status: 'OCCUPIED' })}
                style={{ marginRight: '0.25rem' }}
              >
                Set Occupied
              </button>
              <button onClick={() => updateStatus.mutate({ id: s.id as number, status: 'MAINTENANCE' })}>
                Set Maintenance
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StationsList;
