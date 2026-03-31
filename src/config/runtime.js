const DEFAULT_LOCAL_BACKEND_URL = "https://localhost:7025";

const trimTrailingSlash = (value) => value.replace(/\/+$/, "");

const normalizeOptionalUrl = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  return trimmed ? trimTrailingSlash(trimmed) : "";
};

const isAbsoluteUrl = (value) => /^(?:[a-z]+:)?\/\//i.test(value);

const getFallbackBackendUrl = () => {
  if (typeof window !== "undefined") {
    const { hostname, origin } = window.location;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return DEFAULT_LOCAL_BACKEND_URL;
    }

    return trimTrailingSlash(origin);
  }

  return DEFAULT_LOCAL_BACKEND_URL;
};

const configuredBackendUrl = normalizeOptionalUrl(import.meta.env.VITE_BACKEND_URL);

if (!configuredBackendUrl && import.meta.env.PROD && typeof console !== "undefined") {
  console.warn(
    "VITE_BACKEND_URL is not set. Falling back to the current origin. Set VITE_BACKEND_URL explicitly for a separate Railway backend.",
  );
}

export const BACKEND_URL = configuredBackendUrl || getFallbackBackendUrl();

export const SIGNALR_BASE_URL =
  normalizeOptionalUrl(import.meta.env.VITE_SIGNALR_URL) || BACKEND_URL;

export const NOTIFICATION_HUB_URL = `${SIGNALR_BASE_URL}/hubs/notifications`;

export const CLOUDINARY_CLOUD_NAME =
  (import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "").trim();

export const CLOUDINARY_UPLOAD_PRESET =
  (import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "").trim();

export const resolveBackendAssetUrl = (assetUrl) => {
  if (!assetUrl) {
    return "";
  }

  if (
    assetUrl.startsWith("blob:") ||
    assetUrl.startsWith("data:") ||
    isAbsoluteUrl(assetUrl)
  ) {
    return assetUrl;
  }

  const normalizedPath = assetUrl.startsWith("/") ? assetUrl : `/${assetUrl}`;
  return `${BACKEND_URL}${normalizedPath}`;
};
