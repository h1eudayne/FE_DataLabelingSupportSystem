import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
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

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      // Optional: Redirect to login or dispatch a logout action
      // Since we can't easily access the Redux store or Router here without circular deps,
      // we rely on the app to detect the missing token on the next navigation/render.
      // Or force a reload:
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default instance;
