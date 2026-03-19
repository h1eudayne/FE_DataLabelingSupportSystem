import { useEffect, useRef } from "react";
import { subscribe } from "../services/signalrManager";
import { toast } from "react-toastify";

/**
 * Hook to auto-refresh page data when a SignalR notification is received.
 * Uses the singleton SignalR connection manager (no duplicate connections).
 *
 * @param {Function} onRefresh - Callback to refetch page data
 * @param {Object}  [options]
 * @param {boolean} [options.enabled=true]       - Whether to connect
 * @param {boolean} [options.showToast=true]      - Show toast on notification
 * @param {string}  [options.toastPrefix=""]      - Prefix for the toast message
 */
const useSignalRRefresh = (onRefresh, options = {}) => {
  const { enabled = true, showToast = true, toastPrefix = "" } = options;
  const onRefreshRef = useRef(onRefresh);

  // Keep callback reference fresh without re-subscribing
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !enabled) return;

    // Subscribe to the shared singleton connection
    const unsubscribe = subscribe("ReceiveNotification", (notification) => {
      const message =
        notification?.Message || notification?.message || "Cập nhật mới";
      const type = notification?.Type || notification?.type || "info";

      console.log("[SignalR Refresh] Received:", message);

      // Show toast notification
      if (showToast) {
        const toastMsg = toastPrefix ? `${toastPrefix}: ${message}` : message;
        if (type === "Success" || type === "success") {
          toast.success(toastMsg, { autoClose: 3000 });
        } else if (type === "Error" || type === "error") {
          toast.error(toastMsg, { autoClose: 4000 });
        } else {
          toast.info(toastMsg, { autoClose: 3000 });
        }
      }

      // Trigger data refetch
      if (onRefreshRef.current) {
        onRefreshRef.current(notification);
      }
    });

    return unsubscribe;
  }, [enabled, showToast, toastPrefix]);
};

export default useSignalRRefresh;
