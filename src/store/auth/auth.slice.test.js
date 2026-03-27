import { describe, it, expect, vi, beforeEach } from "vitest";
import { loginThunk } from "./auth.thunk";
import { jwtDecode } from "jwt-decode";

vi.mock("jwt-decode", () => ({
  jwtDecode: vi.fn(),
}));

describe("authSlice - Synced with Backend JWT Contract", () => {
  let authReducer;
  let logout;
  let setUnreadNotifications;

  const initialStateStatic = {
    user: null,
    token: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    unreadNotifications: 0,
  };

  beforeEach(async () => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.resetModules();

    vi.spyOn(console, "error").mockImplementation(() => {});

    const module = await import("./auth.slice");
    authReducer = module.default;
    logout = module.logout;
    setUnreadNotifications = module.setUnreadNotifications;
  });

  it("should restore state from localStorage on init", async () => {
    const mockUser = { id: "99", email: "persist@test.com" };
    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.setItem("access_token", "persisted-token");
    localStorage.setItem("unreadNotifications", "5");

    vi.resetModules();
    const { default: freshReducer } = await import("./auth.slice");
    const state = freshReducer(undefined, { type: "@@INIT" });

    expect(state.token).toBe("persisted-token");
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(state.unreadNotifications).toBe(5);
  });

  it("should set user to null but keep token if jwtDecode throws", () => {
    vi.mocked(jwtDecode).mockImplementation(() => {
      throw new Error("Invalid");
    });

    const action = {
      type: loginThunk.fulfilled.type,
      payload: { token: "bad-token", unreadNotifications: 0 },
    };
    const state = authReducer(initialStateStatic, action);

    expect(state.token).toBe("bad-token");
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(true);
  });

  it("should manage loading state through a failure cycle", () => {
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

  it("should map .NET JWT claims to camelCase user object on login success", () => {
    const mockDecoded = {
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "user-123",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress": "admin@system.com",
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Manager",
      "FullName": "Admin User",
      "AvatarUrl": "https://example.com/avatar.png",
    };
    vi.mocked(jwtDecode).mockReturnValue(mockDecoded);

    const action = {
      type: loginThunk.fulfilled.type,
      payload: { token: "valid-jwt-token", unreadNotifications: 3 },
    };
    const state = authReducer(initialStateStatic, action);

    expect(state.user).toEqual({
      id: "user-123",
      email: "admin@system.com",
      role: "Manager",
      fullName: "Admin User",
      avatarUrl: "https://example.com/avatar.png",
    });
    expect(localStorage.getItem("access_token")).toBe("valid-jwt-token");
    expect(state.isAuthenticated).toBe(true);
    expect(state.unreadNotifications).toBe(3);
  });

  it("should clear all state and storage on logout", () => {
    const loggedState = { user: { id: 1 }, token: "tk", isAuthenticated: true, unreadNotifications: 10 };
    localStorage.setItem("access_token", "tk");
    localStorage.setItem("unreadNotifications", "10");

    const state = authReducer(loggedState, logout());

    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
    expect(state.unreadNotifications).toBe(0);
    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("unreadNotifications")).toBeNull();
  });

  it("should set unreadNotifications via setUnreadNotifications action", () => {
    const state = authReducer(initialStateStatic, setUnreadNotifications(15));

    expect(state.unreadNotifications).toBe(15);
    expect(localStorage.getItem("unreadNotifications")).toBe("15");
  });
});
