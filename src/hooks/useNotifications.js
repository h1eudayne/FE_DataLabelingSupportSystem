import { useState, useEffect, useCallback, useRef } from "react";
import { subscribe } from "../services/signalrManager";
import notificationService from "../services/notificationService";
import {
  normalizeServerDateTime,
  parseDateTimeToMillis,
} from "../utils/dateTime";

const NOTIFICATION_REFRESH_INTERVAL_MS = 30000;

const getStorageKey = (userId) =>
  userId ? `notifications_${userId}` : null;

const parseTimestamp = (timestamp) => parseDateTimeToMillis(timestamp);

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

const parseNotificationMetadata = (metadata) => {
  if (!metadata) {
    return null;
  }

  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata);
    } catch {
      return null;
    }
  }

  if (typeof metadata === "object") {
    return metadata;
  }

  return null;
};


const normalizeServerNotification = (n) => ({
  id: n.id ?? n.Id,
  title: n.title || n.Title || "Notification",
  message: n.message || n.Message || "New notification",
  type: n.type || n.Type || "info",
  timestamp:
    normalizeServerDateTime(
      n.createdAt || n.CreatedAt || n.timestamp || n.Timestamp,
    ) || new Date().toISOString(),
  read: !!(n.isRead ?? n.IsRead),
  referenceType: n.referenceType || n.ReferenceType || null,
  referenceId: n.referenceId || n.ReferenceId || null,
  actionKey: n.actionKey || n.ActionKey || null,
  metadata: parseNotificationMetadata(
    n.metadata ?? n.Metadata ?? n.metadataJson ?? n.MetadataJson,
  ),
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

  const userIdRef = useRef(userId);

  useEffect(() => {
    userIdRef.current = userId;
  }, [userId]);

  const fetchNotifications = useCallback(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !userIdRef.current) {
      return Promise.resolve([]);
    }

    return notificationService
      .getMyNotifications()
      .then((res) => {
        const rawData = Array.isArray(res) ? res : (res?.data || []);
        const serverNotifs = mergeNotifications(rawData.map(normalizeServerNotification));

        setNotifications(serverNotifs);

        const serverUnreadCount = serverNotifs.filter((n) => !n.read).length;
        setUnreadCount(serverUnreadCount);

        return serverNotifs;
      })
      .catch((err) => {
        if (err?.response?.status !== 401) {
          console.warn("[Notifications] Failed to fetch from server:", err?.message);
        }

        return [];
      });
  }, []);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(typeof initialUnreadCount === "number" ? initialUnreadCount : 0);
      return;
    }

    const storedNotifications = loadFromStorage(userId);
    setNotifications(storedNotifications);
    setUnreadCount(
      storedNotifications.length > 0
        ? storedNotifications.filter((notification) => !notification.read).length
        : (typeof initialUnreadCount === "number" ? initialUnreadCount : 0),
    );

    fetchNotifications().catch(() => []);
  }, [fetchNotifications, initialUnreadCount, userId]);

  useEffect(() => {
    const handleReconnect = () => {
      fetchNotifications().catch(() => []);
    };
    window.addEventListener("signalr-reconnected", handleReconnect);
    return () => window.removeEventListener("signalr-reconnected", handleReconnect);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleExternalRefresh = () => {
      fetchNotifications().catch(() => []);
    };
    window.addEventListener("notifications:refresh", handleExternalRefresh);
    return () => window.removeEventListener("notifications:refresh", handleExternalRefresh);
  }, [fetchNotifications]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !userId) return;

    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications().catch(() => []);
      }
    };

    const intervalId = window.setInterval(
      refreshIfVisible,
      NOTIFICATION_REFRESH_INTERVAL_MS,
    );

    window.addEventListener("focus", refreshIfVisible);
    document.addEventListener("visibilitychange", refreshIfVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", refreshIfVisible);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [fetchNotifications, userId]);

  useEffect(() => {
    saveToStorage(userIdRef.current, notifications);
  }, [notifications]);


  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !userId) return;

    const unsubscribe = subscribe("ReceiveNotification", (notification) => {
      const newNotification = {
        id: notification?.Id || notification?.id || Date.now() + Math.random(),
        title: notification?.Title || notification?.title || "Notification",
        message:
          notification?.Message || notification?.message || "New notification",
        type: notification?.Type || notification?.type || "info",
        timestamp:
          normalizeServerDateTime(
            notification?.CreatedAt ||
              notification?.Timestamp ||
              notification?.timestamp,
          ) ||
          new Date().toISOString(),
        read: false,
        referenceType:
          notification?.ReferenceType || notification?.referenceType || null,
        referenceId:
          notification?.ReferenceId || notification?.referenceId || null,
        actionKey: notification?.ActionKey || notification?.actionKey || null,
        metadata: parseNotificationMetadata(
          notification?.Metadata ??
            notification?.metadata ??
            notification?.MetadataJson ??
            notification?.metadataJson,
        ),
      };

      setNotifications((prev) => {
        const updated = mergeNotifications([newNotification, ...prev]);
        setUnreadCount(updated.filter((item) => !item.read).length);
        return updated;
      });
    });

    return unsubscribe;
  }, [userId]);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );

      setUnreadCount(updated.filter((notification) => !notification.read).length);
      return updated;
    });


    notificationService.markAsRead(id).catch((err) => {
      if (err?.response?.status !== 401) {
        console.warn("[Notifications] Failed to sync markAsRead:", err?.message);
      }
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);


    notificationService.markAllAsRead().catch((err) => {
      if (err?.response?.status !== 401) {
        console.warn("[Notifications] Failed to sync markAllAsRead:", err?.message);
      }
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

  const updateNotification = useCallback((id, updater) => {
    setNotifications((prev) => {
      const updated = mergeNotifications(
        prev.map((notification) => {
          if (notification.id !== id) {
            return notification;
          }

          const patch =
            typeof updater === "function"
              ? updater(notification)
              : updater;

          return {
            ...notification,
            ...patch,
            metadata:
              patch && Object.prototype.hasOwnProperty.call(patch, "metadata")
                ? patch.metadata
                : notification.metadata,
          };
        }),
      );

      setUnreadCount(updated.filter((notification) => !notification.read).length);
      return updated;
    });
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    updateNotification,
    clearAll,
    refreshNotifications: fetchNotifications,
  };
};

export default useNotifications;
