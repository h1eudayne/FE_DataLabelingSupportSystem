import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockConnection = {
  state: "Disconnected",
  start: vi.fn(),
  stop: vi.fn(() => Promise.resolve()),
  on: vi.fn(),
  off: vi.fn(),
  onreconnected: vi.fn(),
  onreconnecting: vi.fn(),
  onclose: vi.fn(),
};

vi.mock("@microsoft/signalr", () => ({
  HubConnectionState: {
    Disconnected: "Disconnected",
    Connecting: "Connecting",
    Connected: "Connected",
    Reconnecting: "Reconnecting",
  },
  LogLevel: {
    None: "None",
  },
  HubConnectionBuilder: class {
    withUrl() {
      return this;
    }

    withHubProtocol() {
      return this;
    }

    withAutomaticReconnect() {
      return this;
    }

    configureLogging() {
      return this;
    }

    build() {
      return mockConnection;
    }
  },
}));

vi.mock("@microsoft/signalr-protocol-msgpack", () => ({
  MessagePackHubProtocol: class {},
}));

vi.mock("./axios.customize", () => ({
  ensureValidAccessToken: vi.fn(() => Promise.resolve("token-123")),
  refreshAccessToken: vi.fn(() => Promise.resolve("token-456")),
}));

describe("signalrManager", () => {
  let signalrManager;
  let consoleErrorSpy;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("access_token", "token-123");

    mockConnection.state = "Disconnected";
    mockConnection.start.mockReset();
    mockConnection.stop.mockClear();
    mockConnection.on.mockClear();
    mockConnection.off.mockClear();
    mockConnection.onreconnected.mockClear();
    mockConnection.onreconnecting.mockClear();
    mockConnection.onclose.mockClear();

    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    signalrManager = await import("./signalrManager");
  });

  afterEach(() => {
    signalrManager?.disconnect?.();
    consoleErrorSpy?.mockRestore();
  });

  it("silences the already-starting SignalR race instead of logging an error", async () => {
    mockConnection.start.mockImplementation(async () => {
      mockConnection.state = "Connecting";
      throw new Error(
        "Cannot start a HubConnection that is not in the 'Disconnected' state",
      );
    });

    const unsubscribe = signalrManager.subscribe("ReceiveNotification", vi.fn());

    await Promise.resolve();
    await Promise.resolve();

    expect(mockConnection.start).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    unsubscribe();
  });
});
