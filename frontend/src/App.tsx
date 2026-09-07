import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { LoginForm } from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import StationsList from './components/StationsList';
import StationsMap from './components/StationsMap';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './auth/AuthProvider';
import { useEffect, useState } from 'react';

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

  // shared map/list state
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [selectedStationId, setSelectedStationId] = useState<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      () => setPosition([0, 0]),
      { enableHighAccuracy: true, timeout: 5000 },
    );
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h2>Welcome back!</h2>
      <p>You are authenticated with JWT.</p>
      <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', marginBottom: '1rem' }}>
        Logout
      </button>

      <div style={{ display: 'flex', gap: '1rem', padding: '1rem' }}>
        <div style={{ flex: 1 }}>
          <StationsList
            position={position}
            radiusKm={radiusKm}
            selectedStationId={selectedStationId}
            onSelectStation={setSelectedStationId}
          />
        </div>
        <div style={{ flex: 1 }}>
          <StationsMap
            position={position}
            setPosition={setPosition}
            radiusKm={radiusKm}
            setRadiusKm={setRadiusKm}
            selectedStationId={selectedStationId}
            onSelectStation={setSelectedStationId}
          />
        </div>
      </div>
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