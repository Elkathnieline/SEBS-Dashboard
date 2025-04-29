import axios from "axios";
import { refreshToken } from "../services/authService";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE,
  withCredentials: true,    // send httpOnly refresh token cookie
});

let isRefreshing = false;
let pendingRequests = [];

instance.interceptors.request.use(config => {
  const token = window.accessToken;  // we’ll manage this in memory
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

instance.interceptors.response.use(
  res => res,
  async err => {
    const { config, response: { status } = {} } = err;
    if (status === 401 && !config._retry) {
      if (isRefreshing) {
        // queue up the request until we finish refreshing
        return new Promise(resolve =>
          pendingRequests.push(() => resolve(instance(config)))
        );
      }
      config._retry = true;
      isRefreshing = true;
      try {
        const newToken = await refreshToken();
        window.accessToken = newToken;
        pendingRequests.forEach(cb => cb());
        pendingRequests = [];
        return instance(config);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

export default instance;
