import React, { useEffect, useRef } from "react";
import { ToastContainer, cssTransition, toast } from "react-toastify";
import { useLocation } from "react-router-dom";

const TOAST_ICON_BY_TYPE = {
  success: "ri-checkbox-circle-fill",
  error: "ri-close-circle-fill",
  warning: "ri-alert-fill",
  info: "ri-information-fill",
  default: "ri-notification-3-fill",
};

const TOAST_AUTO_CLOSE_BY_METHOD = {
  success: 2800,
  info: 3200,
  warning: 4200,
  warn: 4200,
  error: 5200,
  default: 3200,
};

const TOAST_PATCH_FLAG = "__appToastDefaultsConfigured";
const TOAST_DEDUPE_WINDOW_MS = 4000;
const recentToastTimestamps = new Map();

const AppToastTransition = cssTransition({
  enter: "app-toast-motion-enter",
  exit: "app-toast-motion-exit",
  appendPosition: true,
  collapse: true,
  collapseDuration: 180,
});

const normalizeToastContent = (content) => {
  if (typeof content === "string") {
    return content.trim();
  }

  if (typeof content === "number" || typeof content === "boolean") {
    return String(content);
  }

  return null;
};

const pruneRecentToastEntries = (now) => {
  recentToastTimestamps.forEach((timestamp, key) => {
    if (now - timestamp > TOAST_DEDUPE_WINDOW_MS) {
      recentToastTimestamps.delete(key);
    }
  });
};

const clearRecentToastEntries = () => {
  recentToastTimestamps.clear();
};

const getToastDedupeKey = (methodName, content, options = {}) => {
  if (options.toastId != null) {
    return String(options.toastId);
  }

  const normalizedContent = normalizeToastContent(content);
  return normalizedContent ? `${methodName}:${normalizedContent}` : null;
};

const withToastDefaults = (methodName, originalMethod) => (content, options = {}) =>
{
  const dedupeKey = getToastDedupeKey(methodName, content, options);
  const now = Date.now();

  pruneRecentToastEntries(now);

  if (
    dedupeKey &&
    typeof toast.isActive === "function" &&
    toast.isActive(dedupeKey)
  ) {
    return dedupeKey;
  }

  if (dedupeKey) {
    const lastShownAt = recentToastTimestamps.get(dedupeKey);
    if (typeof lastShownAt === "number" && now - lastShownAt < TOAST_DEDUPE_WINDOW_MS) {
      return dedupeKey;
    }
  }

  const mergedOptions = {
    autoClose:
      TOAST_AUTO_CLOSE_BY_METHOD[methodName] ??
      TOAST_AUTO_CLOSE_BY_METHOD.default,
    closeOnClick: true,
    pauseOnHover: false,
    pauseOnFocusLoss: false,
    draggable: false,
    ...options,
  };

  if (dedupeKey && mergedOptions.toastId == null) {
    mergedOptions.toastId = dedupeKey;
  }

  if (dedupeKey) {
    recentToastTimestamps.set(dedupeKey, now);
  }

  return originalMethod(content, mergedOptions);
};

if (!toast[TOAST_PATCH_FLAG]) {
  ["success", "error", "info", "warning", "warn"].forEach((methodName) => {
    if (typeof toast[methodName] !== "function") {
      return;
    }

    toast[methodName] = withToastDefaults(methodName, toast[methodName]);
  });

  Object.defineProperty(toast, TOAST_PATCH_FLAG, {
    value: true,
    enumerable: false,
    configurable: false,
    writable: false,
  });
}

const AppToastHost = () => {
  const location = useLocation();
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      toast.dismiss();
      toast.clearWaitingQueue?.();
      clearRecentToastEntries();
      previousPathRef.current = location.pathname;
    }
  }, [location.pathname]);

  return (
    <ToastContainer
      position="top-right"
      autoClose={TOAST_AUTO_CLOSE_BY_METHOD.default}
      closeOnClick
      pauseOnHover={false}
      pauseOnFocusLoss={false}
      draggable={false}
      newestOnTop
      limit={4}
      theme="light"
      transition={AppToastTransition}
      toastStyle={{ width: "100%" }}
      icon={({ type }) => (
        <span className={`app-toast__icon app-toast__icon--${type || "default"}`}>
          <i className={TOAST_ICON_BY_TYPE[type] || TOAST_ICON_BY_TYPE.default}></i>
        </span>
      )}
      closeButton={({ closeToast }) => (
        <button
          type="button"
          className="app-toast__close"
          onClick={closeToast}
          aria-label="Close notification"
        >
          <i className="ri-close-line"></i>
        </button>
      )}
      toastClassName={(context) => `app-toast app-toast--${context?.type || "default"}`}
      bodyClassName={() => "app-toast__body"}
      progressClassName={() => "app-toast__progress"}
    />
  );
};

export default AppToastHost;
