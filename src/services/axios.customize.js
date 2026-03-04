import axios from "axios";

export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const instance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 20000,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

export default instance;
