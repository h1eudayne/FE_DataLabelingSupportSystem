import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import {
  getUsers,
  createUser,
  updateUser,
  getUserProfile,
  updateStatus,
  resolveGlobalBanRequest,
  adminResetPassword,
} from "./user.api";

vi.mock("../../axios.customize", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("User API Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("getUsers: nên gọi đúng URL và phương thức GET", async () => {
    const mockData = [{ id: 1, name: "User 1" }];
    axios.get.mockResolvedValue(mockData);

    const result = await getUsers();

    expect(axios.get).toHaveBeenCalledWith("/api/users", {
      params: { page: 1, pageSize: 20 },
    });
    expect(result).toEqual(mockData);
  });

  it("createUser: nên gửi đúng dữ liệu qua phương thức POST", async () => {
    const newUser = { name: "New User", email: "test@gmail.com" };
    axios.post.mockResolvedValue({ status: 201 });

    await createUser(newUser);

    expect(axios.post).toHaveBeenCalledWith("/api/users", newUser);
  });

  it("updateUser: nên gọi đúng ID và dữ liệu qua phương thức PUT", async () => {
    const id = "123";
    const updateData = { name: "Updated Name" };
    axios.put.mockResolvedValue({ status: 200 });

    await updateUser(id, updateData);

    expect(axios.put).toHaveBeenCalledWith(`/api/users/${id}`, updateData);
  });

  it("getUserProfile: nên gọi đúng endpoint profile", async () => {
    const mockProfile = { id: "123", role: "Admin" };
    axios.get.mockResolvedValue(mockProfile);

    const result = await getUserProfile();

    expect(axios.get).toHaveBeenCalledWith("/api/users/me");
    expect(result).toEqual(mockProfile);
  });

  it("getUserProfile: nên ưu tiên cached user và không gọi network", async () => {
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: "u-1",
        role: "Admin",
        fullName: "Cached Admin",
        email: "cached@example.com",
        avatarUrl: "/avatars/cached.png",
      }),
    );

    const result = await getUserProfile();

    expect(axios.get).not.toHaveBeenCalled();
    expect(result.data).toEqual({
      id: "u-1",
      role: "Admin",
      fullName: "Cached Admin",
      email: "cached@example.com",
      avatarUrl: "/avatars/cached.png",
    });
  });

  it("updateStatus: nên truyền tham số query string chính xác cho PATCH", async () => {
    const id = "999";
    const isActive = true;
    axios.patch.mockResolvedValue({ status: 200 });

    await updateStatus(id, isActive);

    expect(axios.patch).toHaveBeenCalledWith(
      `/api/users/${id}/status?isActive=true`,
    );
  });

  it("resolveGlobalBanRequest: nên gọi đúng endpoint và payload quyết định", async () => {
    axios.post.mockResolvedValue({ status: 200 });

    await resolveGlobalBanRequest(42, true, "Approve request");

    expect(axios.post).toHaveBeenCalledWith(
      "/api/users/global-ban-requests/42/resolve",
      {
        approve: true,
        decisionNote: "Approve request",
      },
    );
  });

  it("adminResetPassword: nên chỉ gọi endpoint reset để backend tự sinh mật khẩu tạm", async () => {
    axios.put.mockResolvedValue({ status: 200 });

    await adminResetPassword("user-42");

    expect(axios.put).toHaveBeenCalledWith(
      "/api/users/user-42/change-password",
      {},
    );
  });

  it("Xử lý lỗi: nên ném ra lỗi nếu axios call thất bại", async () => {
    axios.get.mockRejectedValue(new Error("Network Error"));

    await expect(getUsers()).rejects.toThrow("Network Error");
  });
});
