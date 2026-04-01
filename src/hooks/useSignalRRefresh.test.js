import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import useSignalRRefresh from "./useSignalRRefresh";

const { subscribeMock, toastApi } = vi.hoisted(() => ({
  subscribeMock: vi.fn(),
  toastApi: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("../services/signalrManager", () => ({
  subscribe: (...args) => subscribeMock(...args),
}));

vi.mock("react-toastify", () => ({
  toast: toastApi,
}));

vi.mock("../utils/devLogger", () => ({
  debugLog: vi.fn(),
}));

const TestHarness = ({ enabled = true, showToast = true, onRefresh = vi.fn() }) => {
  useSignalRRefresh(onRefresh, { enabled, showToast });
  return null;
};

describe("useSignalRRefresh", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("access_token", "token-123");
    subscribeMock.mockReset();
    toastApi.success.mockReset();
    toastApi.error.mockReset();
    toastApi.info.mockReset();
  });

  it("dedupe toast for duplicated notifications in a short window", () => {
    const onRefresh = vi.fn();
    const unsubscribe = vi.fn();
    let notificationHandler;

    subscribeMock.mockImplementation((eventName, callback) => {
      notificationHandler = callback;
      return unsubscribe;
    });

    render(React.createElement(TestHarness, { onRefresh }));

    expect(subscribeMock).toHaveBeenCalledWith(
      "ReceiveNotification",
      expect.any(Function),
    );

    const duplicateNotification = {
      id: "notif-1",
      type: "info",
      message: "Task waiting for review.",
    };

    notificationHandler(duplicateNotification);
    notificationHandler(duplicateNotification);

    expect(toastApi.info).toHaveBeenCalledTimes(1);
    expect(toastApi.info).toHaveBeenCalledWith(
      "Task waiting for review.",
      expect.objectContaining({ autoClose: 3000 }),
    );
    expect(onRefresh).toHaveBeenCalledTimes(2);
  });
});
