import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  timeout: 20000,
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    const isCloudinary =
      config.url?.includes("cloudinary.com") ||
      config.baseURL?.includes("cloudinary.com");

    if (token && !isCloudinary) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("401 Unauthorized – token expired or invalid");
    }
    return Promise.reject(error);
  },
);

export default instance;
