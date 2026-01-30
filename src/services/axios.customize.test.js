import { describe, it, expect, vi, beforeEach } from "vitest";
import MockAdapter from "axios-mock-adapter";

describe("Axios Customize Instance", () => {
  let instance;
  let mock;

  beforeEach(async () => {
    // 1. Giả lập biến môi trường TRƯỚC khi load module
    vi.stubEnv("VITE_BACKEND_URL", "http://localhost:8080");

    // 2. Xóa cache của module để đảm bảo mỗi test case dùng một instance mới hoàn toàn
    vi.resetModules();

    // 3. Import động instance sau khi đã cấu hình xong môi trường
    const module = await import("./axios.customize");
    instance = module.default;

    // 4. Khởi tạo mock cho instance mới này
    mock = new MockAdapter(instance);

    localStorage.clear();
    vi.clearAllMocks();
  });

  it("nên có cấu hình baseURL và timeout chính xác", () => {
    // Bây giờ baseURL sẽ ăn theo giá trị stubEnv ở trên
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
      // Axios normalize tên header thành chữ thường hoặc giữ nguyên tùy version,
      // nhưng config.headers thường truy cập được qua key này
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

    // Khi là FormData, interceptor của bạn sẽ không set application/json
    // Axios sẽ để trình duyệt tự set 'multipart/form-data; boundary=...'
    expect(response.data.contentType).not.toBe("application/json");
  });
});
