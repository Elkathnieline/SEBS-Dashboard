// src/services/AuthServices.js
import { apiService } from './ApiService.js';

export async function login(username, password) {
  const res = await fetch(`${apiService.getBaseUrl()}/api/Auth/login`, {
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
  const res = await fetch(`${apiService.getBaseUrl()}/auth/refresh`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Token refresh failed");
  }
  const data = await res.json();
  return data.accessToken;
}

