import { describe, it, expect, vi, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";

describe("RefreshTokenAPI", () => {
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

  it("nên refresh token thành công", async () => {
    const refreshToken = "old-refresh-token";
    const mockResponse = {
      Message: "Token refreshed successfully.",
      AccessToken: "new-access-token",
      RefreshToken: "new-refresh-token",
      TokenType: "Bearer",
      ExpiresIn: 1800,
    };

    mock.onPost("/api/auth/refresh-token").reply(200, mockResponse);

    const refreshTokenAPI = (await import("../auth/refreshToken.api")).default;
    const result = await refreshTokenAPI(refreshToken);

    expect(result.data).toEqual(mockResponse);
    expect(mock.history.post.length).toBe(1);
    expect(mock.history.post[0].url).toBe("/api/auth/refresh-token");
    expect(JSON.parse(mock.history.post[0].data)).toEqual({ refreshToken });
  });

  it("nên throw error khi refresh token thất bại", async () => {
    mock.onPost("/api/auth/refresh-token").reply(401, "Invalid or expired refresh token.");

    const refreshTokenAPI = (await import("../auth/refreshToken.api")).default;

    await expect(refreshTokenAPI("invalid-token")).rejects.toThrow();
  });

  it("nên gửi đúng payload với refresh token", async () => {
    const testToken = "test-refresh-token-12345";
    mock.onPost("/api/auth/refresh-token").reply(200, { AccessToken: "token", RefreshToken: "token" });

    const refreshTokenAPI = (await import("../auth/refreshToken.api")).default;
    await refreshTokenAPI(testToken);

    const requestBody = JSON.parse(mock.history.post[0].data);
    expect(requestBody.refreshToken).toBe(testToken);
  });

  it("nên handle 500 server error", async () => {
    mock.onPost("/api/auth/refresh-token").reply(500, "Internal server error");

    const refreshTokenAPI = (await import("../auth/refreshToken.api")).default;

    await expect(refreshTokenAPI("some-token")).rejects.toThrow();
  });
});
