import { useState, useEffect, useCallback, useRef } from "react";
import {
  startConnection,
  stopConnection,
  onReceiveNotification,
} from "../services/signalrService";

/**
 * Custom hook for managing real-time notifications via SignalR.
 * Handles React Strict Mode double-mount gracefully.
 * @returns {{ notifications, unreadCount, markAsRead, markAllAsRead, clearAll }}
 */
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    const token = localStorage.getItem("access_token");
    if (!token) return;

    // Use AbortController to cancel connection if component unmounts
    const abortController = new AbortController();

    // Start SignalR connection with abort signal
    startConnection(abortController.signal);

    // Listen for incoming notifications
    const unsubscribe = onReceiveNotification((message, type, timestamp) => {
      if (!mountedRef.current) return;

      const newNotification = {
        id: Date.now() + Math.random(),
        message: message || "New notification",
        type: type || "info",
        timestamp: timestamp || new Date().toISOString(),
        read: false,
      };

      setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      mountedRef.current = false;
      abortController.abort(); // Cancel any pending connection
      unsubscribe();
      stopConnection();
    };
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
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
