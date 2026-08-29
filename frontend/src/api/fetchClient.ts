import type { components } from './types';
import { getAuthToken } from '../auth/tokenStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  const token = getAuthToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include', // include cookies for login/refresh flows
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed ${res.status}: ${text}`);
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    // @ts-ignore
    return (await res.text()) as T;
  }

  return (await res.json()) as T;
}

// DTO type aliases
type UserRegistrationDto = components['schemas']['UserRegistrationDto'];
type User = components['schemas']['User'];
type LoginRequestDto = components['schemas']['LoginRequestDto'];
type LoginResponseDto = components['schemas']['LoginResponseDto'];
type ChargingStationDto = components['schemas']['ChargingStationDto'];
type ChargingStation = components['schemas']['ChargingStation'];
type ChargingSessionDto = components['schemas']['ChargingSessionDto'];

// API helpers
export async function login(payload: LoginRequestDto): Promise<LoginResponseDto> {
  return apiFetch<LoginResponseDto>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createUser(payload: UserRegistrationDto): Promise<User> {
  return apiFetch<User>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getStations(): Promise<ChargingStation[]> {
  return apiFetch<ChargingStation[]>('/stations', { method: 'GET' });
}

export async function createStation(payload: ChargingStationDto): Promise<ChargingStation> {
  return apiFetch<ChargingStation>('/stations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function startSession(stationId: number): Promise<ChargingSessionDto> {
  const params = new URLSearchParams({ stationId: String(stationId) });
  return apiFetch<ChargingSessionDto>(`/api/sessions/start?${params.toString()}`, {
    method: 'POST',
  });
}

export async function stopSession(): Promise<ChargingSessionDto> {
  return apiFetch<ChargingSessionDto>('/api/sessions/stop', { method: 'POST' });
}

export async function updateStationStatus(id: number, status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE'):
  Promise<ChargingStation> {
  const params = new URLSearchParams({ status });
  return apiFetch<ChargingStation>(`/stations/${id}/status?${params.toString()}`, {
    method: 'PATCH',
  });
}

export async function getSessionHistory(): Promise<ChargingSessionDto[]> {
  return apiFetch<ChargingSessionDto[]>('/api/sessions', { method: 'GET' });
}

export default {
  login,
  createUser,
  getStations,
  createStation,
  startSession,
  stopSession,
  updateStationStatus,
  getSessionHistory,
};