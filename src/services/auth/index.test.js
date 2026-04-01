import { describe, it, expect, vi, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";

describe("Auth Services Index", () => {
  let instance;
  let mock;

  beforeEach(async () => {
    vi.stubEnv("VITE_BACKEND_URL", "http://localhost:7025");
    vi.resetModules();

    const module = await import("../axios.customize");
    instance = module.default;
    mock = new MockAdapter(instance);
    vi.clearAllMocks();
  });

  it("nên export loginAPI", async () => {
    const { loginAPI } = await import("../auth/index");
    expect(loginAPI).toBeDefined();
    expect(typeof loginAPI).toBe("function");
  });

  it("nên export logoutAPI", async () => {
    const { logoutAPI } = await import("../auth/index");
    expect(logoutAPI).toBeDefined();
    expect(typeof logoutAPI).toBe("function");
  });

  it("nên export refreshTokenAPI", async () => {
    const { refreshTokenAPI } = await import("../auth/index");
    expect(refreshTokenAPI).toBeDefined();
    expect(typeof refreshTokenAPI).toBe("function");
  });

  it("loginAPI nên có thể call endpoint đăng nhập", async () => {
    const mockResponse = {
      Message: "Login successful.",
      AccessToken: "access-token",
      RefreshToken: "refresh-token",
    };

    mock.onPost("/api/auth/login").reply(200, mockResponse);

    const { loginAPI } = await import("../auth/index");
    const result = await loginAPI({ email: "test@test.com", password: "password" });

    expect(result.data).toEqual(mockResponse);
    expect(mock.history.post.length).toBe(1);
    expect(mock.history.post[0].url).toBe("/api/auth/login");
  });

  it("logoutAPI nên hoạt động đúng", async () => {
    const mockResponse = {
      Message: "Logout successful. All tokens have been invalidated.",
    };
    mock.onPost("/api/auth/logout").reply(200, mockResponse);

    const { logoutAPI } = await import("../auth/index");
    const result = await logoutAPI();

    expect(result.data).toEqual(mockResponse);
    expect(mock.history.post.length).toBe(1);
    expect(mock.history.post[0].url).toBe("/api/auth/logout");
  });

  it("refreshTokenAPI nên có thể call endpoint refresh token", async () => {
    const mockResponse = {
      AccessToken: "new-token",
      RefreshToken: "new-refresh-token",
    };
    mock.onPost("/api/auth/refresh-token").reply(200, mockResponse);

    const { refreshTokenAPI } = await import("../auth/index");
    const result = await refreshTokenAPI("old-refresh-token");

    expect(result.data).toEqual(mockResponse);
    expect(mock.history.post.length).toBe(1);
    expect(mock.history.post[0].url).toBe("/api/auth/refresh-token");
  });
});
