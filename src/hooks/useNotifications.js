import { useState, useEffect, useCallback, useRef } from "react";
import { subscribe } from "../services/signalrManager";
import notificationService from "../services/notificationService";

/**
 * LocalStorage key helpers — scoped per user to avoid cross-user leaks.
 */
const getStorageKey = (userId) =>
  userId ? `notifications_${userId}` : null;

const loadFromStorage = (userId) => {
  const key = getStorageKey(userId);
  if (!key) return [];
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const saveToStorage = (userId, notifications) => {
  const key = getStorageKey(userId);
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(notifications.slice(0, 50)));
  } catch {
    // Storage full — silently fail
  }
};

const clearStorage = (userId) => {
  const key = getStorageKey(userId);
  if (key) localStorage.removeItem(key);
};

/**
 * Normalize a server notification object to the local shape.
 */
const normalizeServerNotification = (n) => ({
  id: n.id,
  message: n.message || "New notification",
  type: n.type || "info",
  timestamp: n.createdAt || new Date().toISOString(),
  read: !!n.isRead,
});

/**
 * Custom hook for managing notifications via REST API + SignalR real-time.
 *
 * Features:
 * - **Initial load** from REST API (GET /api/notifications)
 * - **Real-time push** via SignalR singleton connection
 * - **Server-sync** for mark-as-read actions (PUT endpoints)
 * - **localStorage cache** as offline fallback
 *
 * @param {string} [userId] - Current user ID for scoped persistence
 */
const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState(() =>
    loadFromStorage(userId)
  );
  const [unreadCount, setUnreadCount] = useState(() => {
    const stored = loadFromStorage(userId);
    return stored.filter((n) => !n.read).length;
  });

  // Keep a ref to userId so the storage sync effect can track changes
  const userIdRef = useRef(userId);
  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  // Fetch notifications from REST API on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    notificationService
      .getMyNotifications()
      .then((res) => {
        const serverNotifs = (res.data || []).map(normalizeServerNotification);
        setNotifications(serverNotifs);
        setUnreadCount(serverNotifs.filter((n) => !n.read).length);
      })
      .catch((err) => {
        console.warn("[Notifications] Failed to fetch from server, using localStorage cache:", err?.message);
        // Keep localStorage data as fallback — already loaded in useState init
      });
  }, [userId]);

  // Persist notifications to localStorage whenever they change
  useEffect(() => {
    saveToStorage(userIdRef.current, notifications);
  }, [notifications]);

  // Subscribe to SignalR real-time events
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const unsubscribe = subscribe("ReceiveNotification", (notification) => {
      console.log("[Notification] Received:", notification);

      const newNotification = {
        id: notification?.Id || notification?.id || Date.now() + Math.random(),
        message:
          notification?.Message || notification?.message || "New notification",
        type: notification?.Type || notification?.type || "info",
        timestamp:
          notification?.CreatedAt ||
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

    // Sync to server (fire-and-forget)
    notificationService.markAsRead(id).catch((err) => {
      console.warn("[Notifications] Failed to sync markAsRead:", err?.message);
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    // Sync to server (fire-and-forget)
    notificationService.markAllAsRead().catch((err) => {
      console.warn("[Notifications] Failed to sync markAllAsRead:", err?.message);
    });
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    clearStorage(userIdRef.current);
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
