import { beforeEach, describe, expect, it, vi } from "vitest";

describe("runtime config", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("uses VITE_BACKEND_URL as the axios base URL", async () => {
    vi.stubEnv("VITE_BACKEND_URL", "https://api.example.com/");

    const { BACKEND_URL } = await import("./runtime");

    expect(BACKEND_URL).toBe("https://api.example.com");
  });

  it("builds the notification hub URL from the SignalR base URL", async () => {
    vi.stubEnv("VITE_BACKEND_URL", "https://api.example.com");
    vi.stubEnv("VITE_SIGNALR_URL", "https://rt.example.com/");

    const { NOTIFICATION_HUB_URL } = await import("./runtime");

    expect(NOTIFICATION_HUB_URL).toBe("https://rt.example.com/hubs/notifications");
  });

  it("resolves relative backend asset URLs safely", async () => {
    vi.stubEnv("VITE_BACKEND_URL", "https://api.example.com");

    const { resolveBackendAssetUrl } = await import("./runtime");

    expect(resolveBackendAssetUrl("/avatars/a.png")).toBe("https://api.example.com/avatars/a.png");
    expect(resolveBackendAssetUrl("avatars/a.png")).toBe("https://api.example.com/avatars/a.png");
    expect(resolveBackendAssetUrl("https://cdn.example.com/a.png")).toBe("https://cdn.example.com/a.png");
  });
});
