import React, { useState } from 'react';
import { createUser } from '../api/fetchClient';
import { useAuth } from '../auth/AuthProvider';

interface RegisterFormProps {
  onRegistered: () => void;
}

function validateEmail(email: string) {
  // simple RFC5322-ish email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string) {
  const minLength = 8;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const valid = password.length >= minLength && hasNumber && hasLetter;
  const messages: string[] = [];
  if (password.length < minLength) messages.push(`At least ${minLength} characters`);
  if (!hasNumber) messages.push('At least one number');
  if (!hasLetter) messages.push('At least one letter');
  return { valid, messages };
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onRegistered }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const emailValid = validateEmail(email);
  const passwordValidation = validatePassword(password);

  const auth = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!emailValid) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!passwordValidation.valid) {
      setError('Password does not meet requirements: ' + passwordValidation.messages.join(', '));
      return;
    }

    setLoading(true);

    try {
      await createUser({ firstName, lastName, email, password });
      setSuccess('Account created.');
      // Optionally auto-login: use auth context to log in
      try {
        await auth.login({ email, password });
        onRegistered();
        return;
      } catch (ignored) {
        // if auto-login fails, fall back to showing message
      }
      onRegistered();
    } catch (err: any) {
      setError(err?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '2rem auto', padding: '1rem' }}>
      <h2>Create account</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '0.75rem' }}>
          <label>First name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label>Last name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
          {!emailValid && email.length > 0 && (
            <div style={{ color: 'orange', fontSize: '0.9rem' }}>Please enter a valid email.</div>
          )}
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
          <div style={{ fontSize: '0.9rem', color: '#555', marginTop: '0.5rem' }}>
            Password must have: {" "}
            <span style={{ color: password.length >= 8 ? 'green' : 'red' }}>8+ chars</span>,{' '}
            <span style={{ color: /\d/.test(password) ? 'green' : 'red' }}>a number</span>,{' '}
            <span style={{ color: /[a-zA-Z]/.test(password) ? 'green' : 'red' }}>a letter</span>
          </div>
        </div>

        <button type="submit" disabled={loading || !emailValid || !passwordValidation.valid} style={{ padding: '0.6rem 1rem' }}>
          {loading ? 'Creating...' : 'Create account'}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
