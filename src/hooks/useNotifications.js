import { useState, useEffect, useCallback, useRef } from "react";
import { subscribe } from "../services/signalrManager";
import notificationService from "../services/notificationService";


const getStorageKey = (userId) =>
  userId ? `notifications_${userId}` : null;

const parseTimestamp = (timestamp) => {
  const value = Date.parse(timestamp || "");
  return Number.isNaN(value) ? 0 : value;
};

const isPendingActionNotification = (notification) =>
  Boolean(
    notification?.actionKey &&
    notification?.metadata &&
    notification.metadata.requestStatus === "Pending",
  );

const sortNotifications = (notifications) =>
  [...notifications].sort((left, right) => {
    const timeDiff = parseTimestamp(right.timestamp) - parseTimestamp(left.timestamp);
    if (timeDiff !== 0) {
      return timeDiff;
    }
    return String(right.id).localeCompare(String(left.id));
  });

const mergeNotifications = (notifications) => {
  const merged = new Map();

  notifications.forEach((notification) => {
    if (!notification?.id) {
      return;
    }

    const existing = merged.get(notification.id);
    merged.set(notification.id, existing ? { ...existing, ...notification } : notification);
  });

  return sortNotifications([...merged.values()]).slice(0, 50);
};

const loadFromStorage = (userId) => {
  const key = getStorageKey(userId);
  if (!key) return [];
  try {
    const stored = JSON.parse(localStorage.getItem(key)) || [];
    return mergeNotifications(stored);
  } catch {
    return [];
  }
};

const saveToStorage = (userId, notifications) => {
  const key = getStorageKey(userId);
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(mergeNotifications(notifications)));
  } catch {
  }
};

const clearStorage = (userId) => {
  const key = getStorageKey(userId);
  if (key) localStorage.removeItem(key);
};


const normalizeServerNotification = (n) => ({
  id: n.id,
  title: n.title || "Notification",
  message: n.message || "New notification",
  type: n.type || "info",
  timestamp: n.createdAt || new Date().toISOString(),
  read: !!n.isRead,
  referenceType: n.referenceType || null,
  referenceId: n.referenceId || null,
  actionKey: n.actionKey || null,
  metadata: n.metadata || null,
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
        const serverNotifs = mergeNotifications(rawData.map(normalizeServerNotification));

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
        title: notification?.Title || notification?.title || "Notification",
        message:
          notification?.Message || notification?.message || "New notification",
        type: notification?.Type || notification?.type || "info",
        timestamp:
          notification?.CreatedAt ||
          notification?.Timestamp ||
          notification?.timestamp ||
          new Date().toISOString(),
        read: false,
        referenceType:
          notification?.ReferenceType || notification?.referenceType || null,
        referenceId:
          notification?.ReferenceId || notification?.referenceId || null,
        actionKey: notification?.ActionKey || notification?.actionKey || null,
        metadata: notification?.Metadata || notification?.metadata || null,
      };

      setNotifications((prev) => {
        const updated = mergeNotifications([newNotification, ...prev]);
        setUnreadCount(updated.filter((item) => !item.read).length);
        return updated;
      });
    });

    return unsubscribe;
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );

      setUnreadCount(updated.filter((notification) => !notification.read).length);
      return updated;
    });


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
    setNotifications((prev) => {
      const preserved = prev.filter(isPendingActionNotification);
      setUnreadCount(preserved.filter((notification) => !notification.read).length);
      saveToStorage(userIdRef.current, preserved);
      return preserved;
    });
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    refreshNotifications: fetchNotifications,
  };
};

export default useNotifications;
