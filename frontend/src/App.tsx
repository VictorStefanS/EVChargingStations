import { useState } from "react";
import { LoginForm } from "./components/LoginForm";

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem("token")
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  return (
    <div className="App">
      {!isAuthenticated ? (
        <LoginForm onLoginSuccess={() => setIsAuthenticated(true)} />
      ) : (
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <h2>Welcome back!</h2>
          <p>You are authenticated with JWT.</p>
          <button onClick={handleLogout} style={{ padding: "0.5rem 1rem" }}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export default App;