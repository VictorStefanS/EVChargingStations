import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { components } from './api/types';
import * as api from './api/fetchClient';

type ChargingStation = components['schemas']['ChargingStation'];
type ChargingStationDto = components['schemas']['ChargingStationDto'];

export function useStations() {
  return useQuery<ChargingStation[], Error>(['stations'], api.getStations);
}

export function useCreateStation() {
  const qc = useQueryClient();
  return useMutation<ChargingStation, Error, ChargingStationDto>(api.createStation, {
    onSuccess: () => qc.invalidateQueries(['stations']),
  });
}

export function useUpdateStationStatus() {
  const qc = useQueryClient();
  return useMutation<ChargingStation, Error, { id: number; status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' }>(
    ({ id, status }) => api.updateStationStatus(id, status),
    {
      onSuccess: () => qc.invalidateQueries(['stations']),
    }
  );
}
