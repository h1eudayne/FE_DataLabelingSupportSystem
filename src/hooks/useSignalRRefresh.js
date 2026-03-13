import { useEffect, useRef } from "react";
import { createConnection } from "../services/signalrService";
import { toast } from "react-toastify";

/**
 * Hook to auto-refresh page data when a SignalR notification is received.
 *
 * @param {Function} onRefresh - Callback to refetch page data
 * @param {Object}  [options]
 * @param {boolean} [options.enabled=true]       - Whether to connect
 * @param {boolean} [options.showToast=true]      - Show toast on notification
 * @param {string}  [options.toastPrefix=""]      - Prefix for the toast message
 */
const useSignalRRefresh = (onRefresh, options = {}) => {
  const { enabled = true, showToast = true, toastPrefix = "" } = options;
  const connectionRef = useRef(null);
  const onRefreshRef = useRef(onRefresh);

  // Keep callback reference fresh without re-subscribing
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !enabled) return;

    let cancelled = false;

    // Delay to skip Strict Mode first-mount cleanup
    const timerId = setTimeout(async () => {
      if (cancelled) return;

      const connection = createConnection();
      connectionRef.current = connection;

      // Listen for notifications
      connection.on("ReceiveNotification", (notification) => {
        if (cancelled) return;

        const message =
          notification?.Message || notification?.message || "Cập nhật mới";
        const type =
          notification?.Type || notification?.type || "info";

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

      // State change handlers
      connection.onreconnecting(() =>
        console.warn("[SignalR Refresh] Reconnecting...")
      );
      connection.onreconnected(() =>
        console.log("[SignalR Refresh] Reconnected — refetching data...")
      );
      connection.onclose((err) => {
        if (!cancelled)
          console.log("[SignalR Refresh] Connection closed", err);
      });

      try {
        await connection.start();
        if (cancelled) {
          connection.stop();
          return;
        }
        console.log("[SignalR Refresh] Connected!", connection.state);
      } catch (err) {
        if (!cancelled) {
          console.error("[SignalR Refresh] Connection failed:", err);
        }
      }
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timerId);
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
      }
    };
  }, [enabled, showToast, toastPrefix]);
};

export default useSignalRRefresh;
