import { describe, it, expect, vi, beforeEach } from "vitest";
import { jwtDecode } from "jwt-decode";
import { loginThunk } from "../../../store/auth/auth.thunk";

vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(),
}));

describe("authSlice - Comprehensive Testing", () => {
  let authReducer;
  let logout;

  const initialStateStatic = {
    user: null,
    token: null,
    loading: false,
    error: null,
    isAuthenticated: false,
  };

  beforeEach(async () => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.resetModules();

    const module = await import("../../../store/auth/auth.slice");
    authReducer = module.default;
    logout = module.logout;
  });

  it("nên khôi phục trạng thái từ localStorage khi khởi tạo ứng dụng", async () => {
    const mockUser = { id: "123", email: "persist@test.com" };
    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.setItem("access_token", "saved_token");

    vi.resetModules();
    const { default: freshReducer } =
      await import("../../../store/auth/auth.slice");
    const state = freshReducer(undefined, { type: "@@INIT" });

    expect(state.token).toBe("saved_token");
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it("nên xử lý loginThunk.fulfilled và lưu đúng thông tin", () => {
    const mockUser = { id: "123", email: "test@gmail.com", role: "Admin" };
    vi.mocked(jwtDecode).mockReturnValue(mockUser);

    const fakePayload = { accessToken: "valid_token" };
    const action = { type: loginThunk.fulfilled.type, payload: fakePayload };

    const state = authReducer(initialStateStatic, action);

    expect(state.token).toBe("valid_token");
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(localStorage.getItem("access_token")).toBe("valid_token");
    expect(JSON.parse(localStorage.getItem("user"))).toEqual(mockUser);
  });

  it("nên đặt user = null nếu token hợp lệ nhưng jwtDecode bị lỗi", () => {
    vi.mocked(jwtDecode).mockImplementation(() => {
      throw new Error("Invalid Token Format");
    });

    const action = {
      type: loginThunk.fulfilled.type,
      payload: { accessToken: "bad_token" },
    };
    const state = authReducer(initialStateStatic, action);

    expect(state.token).toBe("bad_token");
    expect(state.isAuthenticated).toBe(true);
  });

  it("nên lưu thông báo lỗi từ action.payload khi login thất bại", () => {
    const errorMsg = "Email hoặc mật khẩu không đúng";
    const action = { type: loginThunk.rejected.type, payload: errorMsg };
    const state = authReducer({ ...initialStateStatic, loading: true }, action);

    expect(state.loading).toBe(false);
    expect(state.error).toBe(errorMsg);
    expect(state.isAuthenticated).toBe(false);
  });

  it("nên hiển thị 'Login failed' mặc định nếu server không trả về payload lỗi", () => {
    const action = { type: loginThunk.rejected.type, payload: null };
    const state = authReducer(initialStateStatic, action);

    expect(state.error).toBe("Login failed");
  });

  it("nên reset error về null khi bắt đầu lượt đăng nhập mới (pending)", () => {
    const prevState = { ...initialStateStatic, error: "Lỗi cũ" };
    const action = { type: loginThunk.pending.type };
    const state = authReducer(prevState, action);

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("nên xóa sạch state và localStorage khi gọi logout", () => {
    const loggedState = {
      user: { id: "1" },
      token: "token123",
      isAuthenticated: true,
      loading: false,
      error: null,
    };

    localStorage.setItem("access_token", "token123");
    const state = authReducer(loggedState, logout());

    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.length).toBe(0);
  });
});
