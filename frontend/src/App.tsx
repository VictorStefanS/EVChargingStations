import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginForm } from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import StationsList from './components/StationsList';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './auth/AuthProvider';

function LoginPage() {
  const navigate = useNavigate();
  return <LoginForm onLoginSuccess={() => navigate('/app')} />;
}

function RegisterPage() {
  const navigate = useNavigate();
  return <RegisterForm onRegistered={() => navigate('/login')} />;
}

function AppMain() {
  const navigate = useNavigate();
  const auth = useAuth();
  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Welcome back!</h2>
      <p>You are authenticated with JWT.</p>
      <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}>
        Logout
      </button>
      <StationsList />
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Navigate to="/app" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppMain />} />
      </Route>

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;