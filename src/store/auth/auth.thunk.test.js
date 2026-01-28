import { describe, it, expect, vi, beforeEach } from "vitest";
import { loginThunk } from "./auth.thunk";
import { loginAPI } from "../../services/auth";

vi.mock("../../services/auth", () => ({
  loginAPI: vi.fn(),
}));

describe("authThunk - Advanced Test Cases", () => {
  const dispatch = vi.fn();
  const getState = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("nên lưu đúng định dạng JSON cho user vào localStorage khi thành công", async () => {
    const mockRes = {
      accessToken: "token_xyz",
      user: { id: 99, role: "Staff" },
      data: { accessToken: "token_xyz" },
    };
    loginAPI.mockResolvedValue(mockRes);

    await loginThunk({ email: "staff@test.com", password: "123" })(
      dispatch,
      getState,
      undefined,
    );

    const storedUser = JSON.parse(localStorage.getItem("user"));
    expect(storedUser).toEqual({ id: 99, role: "Staff" });
    expect(localStorage.getItem("access_token")).toBe("token_xyz");
  });

  it("nên trả về 'Login failed' khi server trả về lỗi 500 mà không có message", async () => {
    const mockError = {
      response: {
        status: 500,
      },
    };
    loginAPI.mockRejectedValue(mockError);

    const result = await loginThunk({ email: "admin@test.com", password: "1" })(
      dispatch,
      getState,
      undefined,
    );

    expect(result.payload).toBe("Login failed");
  });

  it("vẫn phải hoạt động nếu res.user bị undefined (kiểm tra tính an toàn)", async () => {
    const mockRes = {
      accessToken: "token_only",
      data: { accessToken: "token_only" },
    };
    loginAPI.mockResolvedValue(mockRes);

    const result = await loginThunk({ email: "test@test.com", password: "1" })(
      dispatch,
      getState,
      undefined,
    );

    expect(result.type).toBe("auth/login/fulfilled");
  });

  it("phải gọi API với đúng thông tin email và password được cung cấp", async () => {
    loginAPI.mockResolvedValue({ data: {} });
    const credentials = {
      email: "special_user@gmail.com",
      password: "SpecialPassword!@#",
    };

    await loginThunk(credentials)(dispatch, getState, undefined);

    expect(loginAPI).toHaveBeenCalledWith(
      credentials.email,
      credentials.password,
    );
  });

  it("nên trả về object lỗi nếu server trả về cấu trúc lỗi phức tạp", async () => {
    const complexError = {
      response: {
        data: {
          code: "AUTH_001",
          message: "Account is locked",
          details: "Too many failed attempts",
        },
      },
    };
    loginAPI.mockRejectedValue(complexError);

    const result = await loginThunk({ email: "lock@test.com", password: "1" })(
      dispatch,
      getState,
      undefined,
    );

    expect(result.payload).toEqual(complexError.response.data);
    expect(result.payload.code).toBe("AUTH_001");
  });

  it("phải lưu vào localStorage TRƯỚC KHI kết thúc action fulfilled", async () => {
    const mockRes = {
      accessToken: "final_token",
      user: { id: 1 },
      data: { success: true },
    };
    loginAPI.mockResolvedValue(mockRes);

    const result = await loginThunk({ email: "a@b.com", password: "1" })(
      dispatch,
      getState,
      undefined,
    );

    expect(localStorage.getItem("access_token")).toBe("final_token");
    expect(result.payload).toEqual(mockRes.data);
  });
});
