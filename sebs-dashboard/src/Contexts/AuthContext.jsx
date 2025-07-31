// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { login as apiLogin, logout as apiLogout, refreshToken } from "../services/AuthServices";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setToken] = useState(() => sessionStorage.getItem("backend-token"));

  useEffect(() => {
    // On mount, check for token in sessionStorage
    const token = sessionStorage.getItem("backend-token");
    applyToken(token);
  }, []);

  function applyToken(token) {
    setToken(token);
    if (token) {
      sessionStorage.setItem("backend-token", token);
      const { exp, ...payload } = jwtDecode(token);
      setUser(payload);
    } else {
      sessionStorage.removeItem("backend-token");
      setUser(null);
    }
  }

  async function login(username, password) {
    const result = await apiLogin(username, password);
    const token = result.token;
    if (!token) throw new Error("No token received");
    applyToken(token);
    return true; 
  }

  async function logout() {
    await apiLogout();
    applyToken(null);
  }

  const isAdmin = () => user?.role === "Admin";

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
