// src/services/AuthServices.js

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_DEV_API_URL || "http://localhost:3000";

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/api/Auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }
  return await res.json();
}

export async function refreshToken() {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Token refresh failed");
  }
  const data = await res.json();
  return data.accessToken;
}

