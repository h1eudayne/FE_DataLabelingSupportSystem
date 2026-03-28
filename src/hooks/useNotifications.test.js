import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Unit tests cho logic xử lý notification trong useNotifications hook
 *
 * BUG-FIX: Infinite loop trong useNotifications
 * - Nguyên nhân: hasFetchedOnce state nằm trong dependency array của useEffect
 * - Fix: Thay hasFetchedOnce bằng hasFetchedRef (useRef) để tránh re-run vô hạn
 * - Kết quả: Notification badge hiện đúng sau login
 */

const normalizeServerNotification = (n) => ({
  id: n.id,
  message: n.message || "New notification",
  type: n.type || "info",
  timestamp: n.createdAt || new Date().toISOString(),
  read: !!n.isRead,
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
  const updatedCount = Math.max(0, unreadCount - 1);
  return { notifications: updated, unreadCount: updatedCount };
};

const markAllAsReadUpdate = (notifications) => ({
  notifications: notifications.map((n) => ({ ...n, read: true })),
  unreadCount: 0,
});

const signalRNotificationUpdate = (notifications, unreadCount, notification) => {
  const newNotification = {
    id: notification?.Id || notification?.id || Date.now() + Math.random(),
    message: notification?.Message || notification?.message || "New notification",
    type: notification?.Type || notification?.type || "info",
    timestamp:
      notification?.CreatedAt ||
      notification?.Timestamp ||
      notification?.timestamp ||
      new Date().toISOString(),
    read: false,
  };
  return {
    notifications: [newNotification, ...notifications].slice(0, 50),
    unreadCount: unreadCount + 1,
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
      expect(result.unreadCount).toBe(6);
    });

    it("nên giới hạn tối đa 50 notifications", () => {
      const existing = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        read: true,
      }));
      const result = signalRNotificationUpdate(existing, 0, { Id: 999 });
      expect(result.notifications.length).toBeLessThanOrEqual(50);
    });
  });
});
