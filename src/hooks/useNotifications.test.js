import { describe, it, expect, vi, beforeEach } from "vitest";

const parseTimestamp = (timestamp) => {
  const value = Date.parse(timestamp || "");
  return Number.isNaN(value) ? 0 : value;
};

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

const buildInitialUnreadCount = (initialUnreadCount) => {
  if (typeof initialUnreadCount === "number") {
    return initialUnreadCount;
  }
  return 0;
};

const computeUnreadCount = (notifications) =>
  notifications.filter((n) => !n.read).length;

const markAsReadUpdate = (notifications, unreadCount, id) => {
  const updated = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  const updatedCount = updated.filter((notification) => !notification.read).length;
  return { notifications: updated, unreadCount: updatedCount };
};

const markAllAsReadUpdate = (notifications) => ({
  notifications: notifications.map((n) => ({ ...n, read: true })),
  unreadCount: 0,
});

const signalRNotificationUpdate = (notifications, unreadCount, notification) => {
  const newNotification = {
    id: notification?.Id || notification?.id || Date.now() + Math.random(),
    title: notification?.Title || notification?.title || "Notification",
    message: notification?.Message || notification?.message || "New notification",
    type: notification?.Type || notification?.type || "info",
    timestamp:
      notification?.CreatedAt ||
      notification?.Timestamp ||
      notification?.timestamp ||
      new Date().toISOString(),
    read: false,
    referenceType: notification?.ReferenceType || notification?.referenceType || null,
    referenceId: notification?.ReferenceId || notification?.referenceId || null,
    actionKey: notification?.ActionKey || notification?.actionKey || null,
    metadata: notification?.Metadata || notification?.metadata || null,
  };
  const updatedNotifications = mergeNotifications([newNotification, ...notifications]);
  return {
    notifications: updatedNotifications,
    unreadCount: updatedNotifications.filter((item) => !item.read).length,
  };
};

describe("BUG-FIX: Notification badge hiện sau login", () => {
  describe("normalizeServerNotification", () => {
    it("nên normalize notification với isRead: false thành read: false", () => {
      const server = { id: 1, message: "Hello", isRead: false };
      const result = normalizeServerNotification(server);
      expect(result.read).toBe(false);
    });

    it("nên normalize notification với isRead: true thành read: true", () => {
      const server = { id: 2, message: "Read", isRead: true };
      const result = normalizeServerNotification(server);
      expect(result.read).toBe(true);
    });

    it("nên fallback message khi không có", () => {
      const server = { id: 3, isRead: false };
      const result = normalizeServerNotification(server);
      expect(result.message).toBe("New notification");
    });

    it("nên giữ metadata/action cho notification cần xử lý", () => {
      const server = {
        id: 4,
        title: "Approval",
        actionKey: "ResolveGlobalUserBanRequest",
        referenceType: "GlobalUserBanRequest",
        referenceId: "42",
        metadata: { requestStatus: "Pending" },
      };
      const result = normalizeServerNotification(server);
      expect(result.actionKey).toBe("ResolveGlobalUserBanRequest");
      expect(result.metadata.requestStatus).toBe("Pending");
    });
  });

  describe("buildInitialUnreadCount", () => {
    it("nên dùng initialUnreadCount khi là số", () => {
      expect(buildInitialUnreadCount(5)).toBe(5);
      expect(buildInitialUnreadCount(0)).toBe(0);
      expect(buildInitialUnreadCount(999)).toBe(999);
    });

    it("nên fallback về 0 khi không phải số", () => {
      expect(buildInitialUnreadCount(undefined)).toBe(0);
      expect(buildInitialUnreadCount(null)).toBe(0);
    });
  });

  describe("computeUnreadCount", () => {
    it("nên đếm đúng số notification chưa đọc", () => {
      const notifs = [
        { id: 1, read: false },
        { id: 2, read: false },
        { id: 3, read: true },
        { id: 4, read: false },
      ];
      expect(computeUnreadCount(notifs)).toBe(3);
    });

    it("nên trả 0 cho mảng rỗng", () => {
      expect(computeUnreadCount([])).toBe(0);
    });

    it("nên trả 0 khi tất cả đã đọc", () => {
      const notifs = [
        { id: 1, read: true },
        { id: 2, read: true },
      ];
      expect(computeUnreadCount(notifs)).toBe(0);
    });
  });

  describe("markAsReadUpdate", () => {
    it("nên giảm unreadCount đúng 1 đơn vị khi đánh dấu đã đọc", () => {
      const notifs = [
        { id: "a", read: false },
        { id: "b", read: false },
      ];
      const result = markAsReadUpdate(notifs, 2, "a");
      expect(result.unreadCount).toBe(1);
      expect(result.notifications.find((n) => n.id === "a").read).toBe(true);
    });

    it("nên giữ unreadCount = 0 khi markAsRead cho notification đã đọc", () => {
      const notifs = [{ id: "a", read: true }];
      const result = markAsReadUpdate(notifs, 0, "a");
      expect(result.unreadCount).toBe(0);
    });

    it("nên không thay đổi notification khác", () => {
      const notifs = [
        { id: "a", read: false, message: "keep" },
        { id: "b", read: false, message: "also keep" },
      ];
      const result = markAsReadUpdate(notifs, 2, "a");
      expect(result.notifications.find((n) => n.id === "b").read).toBe(false);
    });
  });

  describe("markAllAsReadUpdate", () => {
    it("nên đặt tất cả notification thành đã đọc", () => {
      const notifs = [
        { id: 1, read: false },
        { id: 2, read: false },
      ];
      const result = markAllAsReadUpdate(notifs);
      expect(result.unreadCount).toBe(0);
      expect(result.notifications.every((n) => n.read === true)).toBe(true);
    });
  });

  describe("signalRNotificationUpdate - thêm notification mới", () => {
    it("nên thêm notification vào đầu danh sách", () => {
      const existing = [{ id: 1, message: "Old", read: false }];
      const newNotif = { Id: 999, Message: "New notification" };
      const result = signalRNotificationUpdate(existing, 1, newNotif);
      expect(result.notifications[0].id).toBe(999);
      expect(result.notifications[0].message).toBe("New notification");
      expect(result.notifications[0].read).toBe(false);
    });

    it("nên tăng unreadCount thêm 1", () => {
      const result = signalRNotificationUpdate([], 5, { Id: 1 });
      expect(result.unreadCount).toBe(1);
    });

    it("nên giới hạn tối đa 50 notifications", () => {
      const existing = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        read: true,
      }));
      const result = signalRNotificationUpdate(existing, 0, { Id: 999 });
      expect(result.notifications.length).toBeLessThanOrEqual(50);
    });

    it("nên sort notification mới nhất lên trên cùng", () => {
      const existing = [
        { id: 1, message: "Oldest", timestamp: "2026-03-28T08:00:00.000Z", read: false },
        { id: 2, message: "Older", timestamp: "2026-03-29T08:00:00.000Z", read: false },
      ];
      const result = signalRNotificationUpdate(existing, 2, {
        Id: 3,
        Message: "Newest",
        Timestamp: "2026-03-30T08:00:00.000Z",
      });
      expect(result.notifications.map((item) => item.id)).toEqual([3, 2, 1]);
    });

    it("nên dedupe khi SignalR đẩy lại notification đã tồn tại", () => {
      const existing = [
        { id: 10, message: "Existing", timestamp: "2026-03-30T08:00:00.000Z", read: false },
      ];
      const result = signalRNotificationUpdate(existing, 1, {
        Id: 10,
        Message: "Existing",
        Timestamp: "2026-03-30T08:00:00.000Z",
      });
      expect(result.notifications).toHaveLength(1);
      expect(result.unreadCount).toBe(1);
    });
  });
});
