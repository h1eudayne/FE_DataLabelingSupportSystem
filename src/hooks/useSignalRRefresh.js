import { useEffect, useRef } from "react";
import { subscribe } from "../services/signalrManager";
import { toast } from "react-toastify";
import { debugLog } from "../utils/devLogger";

const SIGNALR_TOAST_DEDUPE_WINDOW_MS = 10000;
const recentNotificationTimestamps = new Map();

const pruneRecentNotifications = (now) => {
  recentNotificationTimestamps.forEach((timestamp, key) => {
    if (now - timestamp > SIGNALR_TOAST_DEDUPE_WINDOW_MS) {
      recentNotificationTimestamps.delete(key);
    }
  });
};

const getNotificationDedupeKey = (notification, type, message) =>
  String(
    notification?.id ??
      notification?.Id ??
      notification?.notificationId ??
      notification?.NotificationId ??
      `${type}:${message}`,
  );

const useSignalRRefresh = (onRefresh, options = {}) => {
  const { enabled = true, showToast = true, toastPrefix = "" } = options;
  const onRefreshRef = useRef(onRefresh);

  
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !enabled) return;

    
    const unsubscribe = subscribe("ReceiveNotification", (notification) => {
      const message =
        notification?.Message || notification?.message || "New update";
      const type = notification?.Type || notification?.type || "info";

      debugLog("[SignalR Refresh] Received:", message);

      if (showToast) {
        const now = Date.now();
        const dedupeKey = getNotificationDedupeKey(notification, type, message);

        pruneRecentNotifications(now);

        const lastShownAt = recentNotificationTimestamps.get(dedupeKey);
        const isDuplicateToast =
          typeof lastShownAt === "number" &&
          now - lastShownAt < SIGNALR_TOAST_DEDUPE_WINDOW_MS;

        const toastMsg = toastPrefix ? `${toastPrefix}: ${message}` : message;
        if (!isDuplicateToast) {
          recentNotificationTimestamps.set(dedupeKey, now);

          if (type === "Success" || type === "success") {
            toast.success(toastMsg, { autoClose: 3000 });
          } else if (type === "Error" || type === "error") {
            toast.error(toastMsg, { autoClose: 4000 });
          } else {
            toast.info(toastMsg, { autoClose: 3000 });
          }
        }
      }

      
      if (onRefreshRef.current) {
        onRefreshRef.current(notification);
      }
    });

    return unsubscribe;
  }, [enabled, showToast, toastPrefix]);
};

export default useSignalRRefresh;
