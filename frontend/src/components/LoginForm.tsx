import React, { useState } from "react";
import { api } from "../api/client";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Call backend /auth/login endpoint using our openapi-fetch client
      const { data, error: apiError } = await api.POST("/auth/login", {
        body: {
          email: email,
          password: password,
        },
      });

      if (apiError) {
        setError("Invalid credentials or server error.");
        return;
      }

      // 2. Extract JWT token from backend response and store it
      if (data?.token) {
        localStorage.setItem("token", data.token);
        onLoginSuccess();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "2rem auto", padding: "1rem" }}>
      <h2>Sign In</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="email" style={{ display: "block", marginBottom: "0.5rem" }}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password" style={{ display: "block", marginBottom: "0.5rem" }}>
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>

        <button type="submit" disabled={loading} style={{ width: "100%", padding: "0.75rem" }}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};