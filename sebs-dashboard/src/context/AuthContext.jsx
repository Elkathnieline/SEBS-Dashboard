// src/context/AuthContext.jsx
import { createContext, useState, useEffect, useContext } from "react";
import jwt_decode from "jwt-decode";
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
      const { exp, ...payload } = jwt_decode(token);
      setUser(payload);
    } else {
      sessionStorage.removeItem("backend-token");
      setUser(null);
    }
  }

  async function login(username, password) {
    const { accessToken: token, user: userData } = await apiLogin(username, password);
    applyToken(token);
    return userData;
  }

  async function logout() {
    await apiLogout();
    applyToken(null);
  }

  const isAdmin = () => user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
