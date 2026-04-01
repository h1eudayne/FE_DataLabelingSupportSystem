import axios from "axios";
import { BACKEND_URL } from "../config/runtime";
import { jwtDecode } from "jwt-decode";

const instance = axios.create({
  baseURL: BACKEND_URL,
  timeout: 20000,
});

let isRefreshing = false;
let failedQueue = [];

const TOKEN_REFRESH_BUFFER_SECONDS = 30;
const REFRESH_TOKEN_URL = "/api/auth/refresh-token";

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const isRefreshTokenRequest = (config) =>
  typeof config?.url === "string" &&
  (config.url === REFRESH_TOKEN_URL || config.url.endsWith(REFRESH_TOKEN_URL));

const clearAuthAndRedirect = () => {
  localStorage.clear();
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

const isTokenExpiredOrExpiring = (token) => {
  if (!token) {
    return true;
  }

  try {
    const decoded = jwtDecode(token);
    const exp = Number(decoded?.exp);

    if (!Number.isFinite(exp) || exp <= 0) {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    return exp <= now + TOKEN_REFRESH_BUFFER_SECONDS;
  } catch {
    return false;
  }
};

const requestNewTokens = async (refreshToken) => {
  const response = await axios.post(
    `${BACKEND_URL}${REFRESH_TOKEN_URL}`,
    { refreshToken },
    {
      timeout: 20000,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const { accessToken, refreshToken: newRefreshToken } = response.data || {};

  if (!accessToken || !newRefreshToken) {
    throw new Error("Invalid refresh token response.");
  }

  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", newRefreshToken);
  return accessToken;
};

const refreshAccessToken = async () => {
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  const refreshToken = localStorage.getItem("refresh_token");

  if (!refreshToken) {
    clearAuthAndRedirect();
    throw new Error("Missing refresh token.");
  }

  isRefreshing = true;

  try {
    const accessToken = await requestNewTokens(refreshToken);
    processQueue(null, accessToken);
    return accessToken;
  } catch (refreshError) {
    processQueue(refreshError, null);
    clearAuthAndRedirect();
    throw refreshError;
  } finally {
    isRefreshing = false;
  }
};

const ensureValidAccessToken = async () => {
  let token = localStorage.getItem("access_token");

  if (!token) {
    return null;
  }

  if (isTokenExpiredOrExpiring(token)) {
    token = await refreshAccessToken();
  }

  return token;
};

instance.interceptors.request.use(async (config) => {
  const nextConfig = config;
  nextConfig.headers = nextConfig.headers || {};

  if (!(nextConfig.data instanceof FormData)) {
    nextConfig.headers["Content-Type"] = "application/json";
  }

  if (isRefreshTokenRequest(nextConfig)) {
    delete nextConfig.headers.Authorization;
    return nextConfig;
  }

  const token = await ensureValidAccessToken();

  if (token) {
    nextConfig.headers.Authorization = `Bearer ${token}`;
  }

  return nextConfig;
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (isRefreshTokenRequest(originalRequest)) {
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const accessToken = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status === 403 && !originalRequest._forbiddenRetry) {
      originalRequest._forbiddenRetry = true;

      try {
        const accessToken = await refreshAccessToken();
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return instance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export {
  BACKEND_URL,
  clearAuthAndRedirect,
  ensureValidAccessToken,
  isTokenExpiredOrExpiring,
  refreshAccessToken,
};
export default instance;
