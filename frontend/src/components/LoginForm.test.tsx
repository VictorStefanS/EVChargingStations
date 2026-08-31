import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginForm } from './LoginForm';

const mockLogin = vi.fn();

vi.mock('../auth/AuthProvider', () => ({
  useAuth: () => ({
    login: mockLogin,
    logout: vi.fn(),
    token: null,
    isAuthenticated: false,
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    mockLogin.mockReset();
  });

  it('submits valid credentials and calls onLoginSuccess', async () => {
    const user = userEvent.setup();
    const onLoginSuccess = vi.fn();
    mockLogin.mockResolvedValue(undefined);

    render(<LoginForm onLoginSuccess={onLoginSuccess} />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'Password123!',
    });
    expect(onLoginSuccess).toHaveBeenCalledTimes(1);
  });

  it('shows an error when login fails', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValue(new Error('bad credentials'));

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText(/invalid credentials or server error/i)).toBeInTheDocument();
  });
});
