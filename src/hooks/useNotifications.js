import { useState, useEffect, useCallback } from "react";
import { subscribe } from "../services/signalrManager";

/**
 * Custom hook for managing real-time notifications via SignalR.
 * Uses the singleton SignalR connection manager (no duplicate connections).
 */
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    // Subscribe to the shared singleton connection
    const unsubscribe = subscribe("ReceiveNotification", (notification) => {
      console.log("[Notification] Received:", notification);

      const newNotification = {
        id: Date.now() + Math.random(),
        message:
          notification?.Message || notification?.message || "New notification",
        type: notification?.Type || notification?.type || "info",
        timestamp:
          notification?.Timestamp ||
          notification?.timestamp ||
          new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
      setUnreadCount((prev) => prev + 1);
    });

    return unsubscribe;
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
