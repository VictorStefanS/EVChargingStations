import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthProvider';

const loginApiMock = vi.fn();
const fetchMock = vi.fn();

vi.mock('../api/fetchClient', () => ({
  login: (...args: unknown[]) => loginApiMock(...args),
}));

vi.mock('../lib/notifications', () => ({
  notify: vi.fn(),
  logError: vi.fn(),
}));

function makeJwt(expMinutesFromNow = 5) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: 'user@example.com',
    exp: Math.floor((Date.now() + expMinutesFromNow * 60 * 1000) / 1000),
  }));
  return `${header}.${payload}.signature`;
}

function TestConsumer() {
  const { login, logout, token, isAuthenticated } = useAuth();

  return (
    <div>
      <span data-testid="auth-state">{String(isAuthenticated)}</span>
      <span data-testid="token">{token ?? 'none'}</span>
      <button onClick={() => login({ email: 'user@test.com', password: 'pw123' })}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    loginApiMock.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('logs in and logs out successfully', async () => {
    const user = userEvent.setup();
    loginApiMock.mockResolvedValue({ token: makeJwt(10) });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('true');
      expect(screen.getByTestId('token')).not.toHaveTextContent('none');
    });

    await user.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => {
      expect(screen.getByTestId('auth-state')).toHaveTextContent('false');
      expect(screen.getByTestId('token')).toHaveTextContent('none');
    });
  });

  it('silently refreshes when the token is near expiry', async () => {
    vi.useFakeTimers();
    const original = makeJwt(5);
    localStorage.setItem('token', original);

    const refreshed = makeJwt(10);
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ token: refreshed }),
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    expect(screen.getByTestId('token')).toHaveTextContent(original);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(4 * 60 * 1000 + 1000);
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/auth/refresh'),
      expect.objectContaining({ method: 'POST', credentials: 'include' })
    );
    expect(screen.getByTestId('token')).toHaveTextContent(refreshed);
  });
});
