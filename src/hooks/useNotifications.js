import { useState, useEffect, useCallback, useRef } from "react";
import { createConnection } from "../services/signalrService";

/**
 * Custom hook for managing real-time notifications via SignalR.
 * Each mount creates its own connection instance to avoid
 * React Strict Mode race conditions with shared singleton.
 */
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const connectionRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    let cancelled = false;

    // Delay to skip the first mount in React Strict Mode
    const timerId = setTimeout(async () => {
      if (cancelled) return;

      // Create a fresh connection for this mount
      const connection = createConnection();
      connectionRef.current = connection;

      // Register notification handler BEFORE starting
      connection.on("ReceiveNotification", (notification) => {
        if (cancelled) return;
        console.log("[Notification] Received:", notification);

        const newNotification = {
          id: Date.now() + Math.random(),
          message: notification?.Message || notification?.message || "New notification",
          type: notification?.Type || notification?.type || "info",
          timestamp: notification?.Timestamp || notification?.timestamp || new Date().toISOString(),
          read: false,
        };

        setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
        setUnreadCount((prev) => prev + 1);
      });

      // Log state changes for debugging
      connection.onreconnecting(() => console.warn("[SignalR] Reconnecting..."));
      connection.onreconnected((id) => console.log("[SignalR] Reconnected:", id));
      connection.onclose((err) => {
        if (!cancelled) console.log("[SignalR] Connection closed", err);
      });

      try {
        await connection.start();
        if (cancelled) {
          // Component unmounted during start - stop immediately
          connection.stop();
          return;
        }
        console.log("[SignalR] Connected! State:", connection.state);
      } catch (err) {
        if (!cancelled) {
          console.error("[SignalR] Connection failed:", err);
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
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
};

export default useNotifications;
