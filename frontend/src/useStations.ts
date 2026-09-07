import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { components } from './api/types';
import * as api from './api/fetchClient';

type ChargingStation = components['schemas']['ChargingStation'];
type ChargingStationDto = components['schemas']['ChargingStationDto'];

export function useStations() {
  return useQuery<ChargingStation[], Error>(['stations'], api.getStations);
}

// compute distance (km) between two lat/lng points using Haversine
function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useStationsNearby(lat: number | null, lng: number | null, radiusKm = 5) {
  return useQuery(['stationsNearby', lat, lng, radiusKm], async () => {
    if (lat === null || lng === null) return [] as any[];
    const data = await api.getStationsNearby(lat, lng, radiusKm);
    const annotated = data.map((s: any) => {
      const sLat = s.latitude ?? s.lat;
      const sLng = s.longitude ?? s.lng;
      const dist = distanceKm(lat, lng, sLat, sLng);
      return { ...s, _distanceKm: dist };
    });
    annotated.sort((a: any, b: any) => (a._distanceKm ?? 0) - (b._distanceKm ?? 0));
    return annotated;
  }, { enabled: lat !== null && lng !== null });
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
