import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

describe("Axios Customize Instance", () => {
  let instance;
  let ensureValidAccessToken;
  let mock;
  let rawAxiosMock;

  const buildJwt = (expiresAtSeconds) => {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const payload = Buffer.from(JSON.stringify({ exp: expiresAtSeconds })).toString("base64url");
    return `${header}.${payload}.signature`;
  };

  beforeEach(async () => {
    vi.stubEnv("VITE_BACKEND_URL", "http://localhost:7025");

    vi.resetModules();

    const module = await import("./axios.customize");
    instance = module.default;
    ensureValidAccessToken = module.ensureValidAccessToken;

    mock = new MockAdapter(instance);
    rawAxiosMock = new MockAdapter(axios);

    localStorage.clear();
    vi.clearAllMocks();
  });

  it("nên có cấu hình baseURL và timeout chính xác", () => {
    expect(instance.defaults.baseURL).toBe("http://localhost:7025");
    expect(instance.defaults.timeout).toBe(20000);
  });

  it("nên tự động thêm Authorization header khi có token", async () => {
    const testToken = "test-token-123";
    localStorage.setItem("access_token", testToken);

    mock.onGet("/test").reply((config) => {
      return [200, { auth: config.headers.Authorization }];
    });
    
    const response = await instance.get("/test");
    
    expect(response.data.auth).toBe(`Bearer ${testToken}`);
  });

  it("nên thiết lập Content-Type là application/json cho dữ liệu thường", async () => {
    mock.onPost("/test").reply((config) => {
      return [200, { contentType: config.headers["Content-Type"] }];
    });

    const response = await instance.post("/test", { name: "AILABEL" });
    expect(response.data.contentType).toBe("application/json");
  });

  it("không được ghi đè Content-Type nếu là FormData (để upload file)", async () => {
    const formData = new FormData();
    formData.append("file", "dummy-content");

    mock.onPost("/upload").reply((config) => {
      return [200, { contentType: config.headers["Content-Type"] }];
    });

    const response = await instance.post("/upload", formData);

    expect(response.data.contentType).not.toBe("application/json");
  });

  it("nên tự refresh token trước khi gửi request nếu access token đã hết hạn", async () => {
    const expiredToken = buildJwt(Math.floor(Date.now() / 1000) - 60);
    const refreshedToken = buildJwt(Math.floor(Date.now() / 1000) + 3600);

    localStorage.setItem("access_token", expiredToken);
    localStorage.setItem("refresh_token", "refresh-token-123");

    rawAxiosMock
      .onPost("http://localhost:7025/api/auth/refresh-token")
      .reply(200, {
        accessToken: refreshedToken,
        refreshToken: "refresh-token-456",
      });

    mock.onGet("/notifications").reply((config) => {
      return [200, { auth: config.headers.Authorization }];
    });

    const response = await instance.get("/notifications");

    expect(response.data.auth).toBe(`Bearer ${refreshedToken}`);
    expect(localStorage.getItem("access_token")).toBe(refreshedToken);
    expect(localStorage.getItem("refresh_token")).toBe("refresh-token-456");
  });

  it("ensureValidAccessToken nên refresh token hết hạn để SignalR có thể dùng lại", async () => {
    const expiredToken = buildJwt(Math.floor(Date.now() / 1000) - 60);
    const refreshedToken = buildJwt(Math.floor(Date.now() / 1000) + 3600);

    localStorage.setItem("access_token", expiredToken);
    localStorage.setItem("refresh_token", "refresh-token-789");

    rawAxiosMock
      .onPost("http://localhost:7025/api/auth/refresh-token")
      .reply(200, {
        accessToken: refreshedToken,
        refreshToken: "refresh-token-999",
      });

    await expect(ensureValidAccessToken()).resolves.toBe(refreshedToken);
    expect(localStorage.getItem("access_token")).toBe(refreshedToken);
    expect(localStorage.getItem("refresh_token")).toBe("refresh-token-999");
  });
});
