import { describe, it, expect, vi, beforeEach } from "vitest";
import { loginThunk } from "./auth.thunk";
import { jwtDecode } from "jwt-decode";

vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(),
}));

describe("authSlice - Comprehensive & Edge Case Tests", () => {
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

    vi.spyOn(console, "error").mockImplementation(() => {});

    const module = await import("./auth.slice");
    authReducer = module.default;
    logout = module.logout;
  });

  it("nên khôi phục trạng thái từ localStorage khi khởi tạo", async () => {
    const mockUser = { id: "99", email: "persist@test.com" };
    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.setItem("access_token", "persisted-token");

    vi.resetModules();
    const { default: freshReducer } = await import("./auth.slice");
    const state = freshReducer(undefined, { type: "@@INIT" });

    expect(state.token).toBe("persisted-token");
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it("nên đặt user thành null nhưng vẫn giữ token nếu jwtDecode bị lỗi", () => {
    vi.mocked(jwtDecode).mockImplementation(() => {
      throw new Error("Invalid");
    });

    const action = {
      type: loginThunk.fulfilled.type,
      payload: { accessToken: "bad-token" },
    };
    const state = authReducer(initialStateStatic, action);

    expect(state.token).toBe("bad-token");
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(true);
  });

  it("nên quản lý trạng thái loading qua một chu kỳ thất bại", () => {
    let state = authReducer(initialStateStatic, {
      type: loginThunk.pending.type,
    });
    expect(state.loading).toBe(true);

    state = authReducer(state, {
      type: loginThunk.rejected.type,
      payload: "Error Message",
    });
    expect(state.loading).toBe(false);
    expect(state.error).toBe("Error Message");
  });

  it("nên cập nhật user và lưu vào localStorage khi login thành công", () => {
    const mockUser = { id: "1", role: "Admin" };
    vi.mocked(jwtDecode).mockReturnValue(mockUser);

    const action = {
      type: loginThunk.fulfilled.type,
      payload: { accessToken: "valid-token" },
    };
    const state = authReducer(initialStateStatic, action);

    expect(state.user).toEqual(mockUser);
    expect(localStorage.getItem("access_token")).toBe("valid-token");
  });

  it("nên xóa sạch state và storage khi logout", () => {
    const loggedState = { user: { id: 1 }, token: "tk", isAuthenticated: true };
    localStorage.setItem("access_token", "tk");

    const state = authReducer(loggedState, logout());

    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(localStorage.getItem("access_token")).toBeNull();
  });
});
