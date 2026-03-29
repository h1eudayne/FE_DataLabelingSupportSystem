import { describe, it, expect, vi, beforeEach } from "vitest";
import { loginThunk } from "./auth.thunk";
import { loginAPI } from "../../services/auth";

vi.mock("../../services/auth", () => ({
  loginAPI: vi.fn(),
}));

describe("authThunk - Synced with Backend API Contract", () => {
  const dispatch = vi.fn();
  const getState = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("should extract accessToken from response and save to localStorage", async () => {
    const mockRes = {
      data: {
        message: "Login successful.",
        accessToken: "jwt_token_xyz",
        refreshToken: "refresh_token_xyz",
        tokenType: "Bearer",
        unreadNotifications: 0,
      },
    };
    loginAPI.mockResolvedValue(mockRes);

    const result = await loginThunk({
      email: "staff@test.com",
      password: "123",
    })(dispatch, getState, undefined);

    expect(localStorage.getItem("access_token")).toBe("jwt_token_xyz");
    expect(localStorage.getItem("unreadNotifications")).toBe("0");
    expect(result.payload).toEqual({
      token: "jwt_token_xyz",
      unreadNotifications: 0,
    });
  });

  it("should reject when server returns error 500 without message", async () => {
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

  it("should reject with 'Invalid response from server' when accessToken is missing", async () => {
    const mockRes = {
      data: { message: "OK but no token" },
    };
    loginAPI.mockResolvedValue(mockRes);

    const result = await loginThunk({ email: "test@test.com", password: "1" })(
      dispatch,
      getState,
      undefined,
    );

    expect(result.payload).toBe("Invalid response from server");
  });

  it("should call API with correct email and password", async () => {
    loginAPI.mockResolvedValue({
      data: {
        message: "Login successful.",
        accessToken: "t",
        refreshToken: "r",
        tokenType: "Bearer",
        unreadNotifications: 0,
      },
    });
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

  it("should return complex error object from server response", async () => {
    const complexError = {
      response: {
        data: {
          message: "Account is deactivated or banned.",
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
    expect(result.payload.message).toBe("Account is deactivated or banned.");
  });

  it("should save token and unreadNotifications to localStorage BEFORE action completes", async () => {
    const mockRes = {
      data: {
        message: "Login successful.",
        accessToken: "final_token",
        refreshToken: "final_refresh",
        tokenType: "Bearer",
        unreadNotifications: 5,
      },
    };
    loginAPI.mockResolvedValue(mockRes);

    const result = await loginThunk({ email: "a@b.com", password: "1" })(
      dispatch,
      getState,
      undefined,
    );

    expect(localStorage.getItem("access_token")).toBe("final_token");
    expect(localStorage.getItem("unreadNotifications")).toBe("5");
    expect(result.payload).toEqual({
      token: "final_token",
      unreadNotifications: 5,
    });
  });

  it("should handle login with pending notifications", async () => {
    const mockRes = {
      data: {
        message: "Login successful.",
        accessToken: "token_with_notifs",
        refreshToken: "refresh_with_notifs",
        tokenType: "Bearer",
        unreadNotifications: 10,
      },
    };
    loginAPI.mockResolvedValue(mockRes);

    const result = await loginThunk({
      email: "user@test.com",
      password: "123",
    })(dispatch, getState, undefined);

    expect(localStorage.getItem("unreadNotifications")).toBe("10");
    expect(result.payload.unreadNotifications).toBe(10);
  });

  it("BUG-FIX: should correctly read unreadNotifications from backend response (camelCase)", async () => {
    const mockRes = {
      data: {
        message: "Login successful.",
        accessToken: "token_fixed_bug",
        refreshToken: "refresh_fixed_bug",
        tokenType: "Bearer",
        unreadNotifications: 7,
      },
    };
    loginAPI.mockResolvedValue(mockRes);

    const result = await loginThunk({ email: "fix@test.com", password: "123" })(
      dispatch,
      getState,
      undefined,
    );

    expect(localStorage.getItem("unreadNotifications")).toBe("7");
    expect(result.payload.unreadNotifications).toBe(7);
  });

  it("BUG-FIX: should handle zero notifications after login", async () => {
    const mockRes = {
      data: {
        message: "Login successful.",
        accessToken: "token_zero_notifs",
        refreshToken: "refresh_zero_notifs",
        tokenType: "Bearer",
        unreadNotifications: 0,
      },
    };
    loginAPI.mockResolvedValue(mockRes);

    const result = await loginThunk({
      email: "zero@test.com",
      password: "123",
    })(dispatch, getState, undefined);

    expect(localStorage.getItem("unreadNotifications")).toBe("0");
    expect(result.payload.unreadNotifications).toBe(0);
  });

  it("BUG-FIX: should handle large notification count", async () => {
    const mockRes = {
      data: {
        message: "Login successful.",
        accessToken: "token_many_notifs",
        refreshToken: "refresh_many_notifs",
        tokenType: "Bearer",
        unreadNotifications: 999,
      },
    };
    loginAPI.mockResolvedValue(mockRes);

    const result = await loginThunk({
      email: "many@test.com",
      password: "123",
    })(dispatch, getState, undefined);

    expect(localStorage.getItem("unreadNotifications")).toBe("999");
    expect(result.payload.unreadNotifications).toBe(999);
  });
});
