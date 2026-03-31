const isDebugLoggingEnabled =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEBUG_LOGS === "true";

export function debugLog(...args) {
  if (isDebugLoggingEnabled) {
    console.log(...args);
  }
}

export function debugWarn(...args) {
  if (isDebugLoggingEnabled) {
    console.warn(...args);
  }
}

export function debugInfo(...args) {
  if (isDebugLoggingEnabled) {
    console.info(...args);
  }
}

export function isDebugEnabled() {
  return isDebugLoggingEnabled;
}
