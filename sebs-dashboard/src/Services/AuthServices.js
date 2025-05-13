// src/services/AuthServices.js

const API_BASE = "/auth";

export async function login(username, password) {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
    credentials: "include", 
  });

  if (!res.ok) {
    throw new Error("Login failed");
  }
  return await res.json();
}

export async function refreshToken() {
  const res = await fetch(`${API_BASE}/refresh`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Token refresh failed");
  }
  const data = await res.json();
  return data.accessToken;
}

export async function logout() {
  await fetch(`${API_BASE}/logout`, {
    method: "POST",
    credentials: "include",
  });
}
