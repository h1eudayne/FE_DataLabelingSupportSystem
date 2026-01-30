import { describe, it, expect, vi, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";

describe("Axios Customize Instance", () => {
  let instance;
  let mock;

  beforeEach(async () => {
    vi.stubEnv("VITE_BACKEND_URL", "http://localhost:8080");

    vi.resetModules();

    const module = await import("./axios.customize");
    instance = module.default;

    mock = new MockAdapter(instance);

    localStorage.clear();
    vi.clearAllMocks();
  });

  it("nên có cấu hình baseURL và timeout chính xác", () => {
    expect(instance.defaults.baseURL).toBe("http://localhost:8080");
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
});
