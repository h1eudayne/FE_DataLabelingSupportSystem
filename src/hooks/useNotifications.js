import { useState, useEffect, useCallback, useRef } from "react";
import { subscribe } from "../services/signalrManager";
import notificationService from "../services/notificationService";


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
  }
};

const clearStorage = (userId) => {
  const key = getStorageKey(userId);
  if (key) localStorage.removeItem(key);
};


const normalizeServerNotification = (n) => ({
  id: n.id,
  message: n.message || "New notification",
  type: n.type || "info",
  timestamp: n.createdAt || new Date().toISOString(),
  read: !!n.isRead,
});


const useNotifications = (userId, initialUnreadCount) => {
  const [notifications, setNotifications] = useState(() =>
    loadFromStorage(userId)
  );
  const [unreadCount, setUnreadCount] = useState(() => {
    if (typeof initialUnreadCount === "number") {
      return initialUnreadCount;
    }
    const stored = loadFromStorage(userId);
    return stored.filter((n) => !n.read).length;
  });

  const hasFetchedRef = useRef(false);
  const userIdRef = useRef(userId);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const fetchNotifications = useCallback(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !userIdRef.current) return;

    notificationService
      .getMyNotifications()
      .then((res) => {
        const rawData = Array.isArray(res) ? res : (res?.data || []);
        const serverNotifs = rawData.map(normalizeServerNotification);

        setNotifications(serverNotifs);

        const serverUnreadCount = serverNotifs.filter((n) => !n.read).length;
        setUnreadCount(serverUnreadCount);
      })
      .catch((err) => {
        console.warn("[Notifications] Failed to fetch from server:", err?.message);
      });
  }, []);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const handleReconnect = () => fetchNotifications();
    window.addEventListener("signalr-reconnected", handleReconnect);
    return () => window.removeEventListener("signalr-reconnected", handleReconnect);
  }, [fetchNotifications]);

  useEffect(() => {
    saveToStorage(userIdRef.current, notifications);
  }, [notifications]);


  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    const unsubscribe = subscribe("ReceiveNotification", (notification) => {
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


    notificationService.markAsRead(id).catch((err) => {
      console.warn("[Notifications] Failed to sync markAsRead:", err?.message);
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);


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
