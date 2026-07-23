import createClient from "openapi-fetch";
import type { paths } from "./types";

// Create the configured fetch client
export const api = createClient<paths>({
  baseUrl: "http://localhost:8080"
});

// Middleware to automatically attach your JWT token if it exists in localStorage
api.use({
  onRequest({ request }) {
    const token = localStorage.getItem("token");
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  },
});