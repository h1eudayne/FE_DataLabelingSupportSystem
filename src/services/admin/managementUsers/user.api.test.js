import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import {
  getUsers,
  createUser,
  updateUser,
  getUserProfile,
  updateStatus,
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
  });

  it("getUsers: nên gọi đúng URL và phương thức GET", async () => {
    const mockData = [{ id: 1, name: "User 1" }];
    axios.get.mockResolvedValue(mockData);

    const result = await getUsers();

    expect(axios.get).toHaveBeenCalledWith("/api/User");
    expect(result).toEqual(mockData);
  });

  it("createUser: nên gửi đúng dữ liệu qua phương thức POST", async () => {
    const newUser = { name: "New User", email: "test@gmail.com" };
    axios.post.mockResolvedValue({ status: 201 });

    await createUser(newUser);

    expect(axios.post).toHaveBeenCalledWith("/api/User", newUser);
  });

  it("updateUser: nên gọi đúng ID và dữ liệu qua phương thức PUT", async () => {
    const id = "123";
    const updateData = { name: "Updated Name" };
    axios.put.mockResolvedValue({ status: 200 });

    await updateUser(id, updateData);

    expect(axios.put).toHaveBeenCalledWith(`/api/User/${id}`, updateData);
  });

  it("getUserProfile: nên gọi đúng endpoint profile", async () => {
    const mockProfile = { id: "123", role: "Admin" };
    axios.get.mockResolvedValue(mockProfile);

    const result = await getUserProfile();

    expect(axios.get).toHaveBeenCalledWith("/api/User/profile");
    expect(result).toEqual(mockProfile);
  });

  it("updateStatus: nên truyền tham số query string chính xác cho PATCH", async () => {
    const id = "999";
    const isActive = true;
    axios.patch.mockResolvedValue({ status: 200 });

    await updateStatus(id, isActive);

    expect(axios.patch).toHaveBeenCalledWith(
      `/api/User/${id}/status?isActive=true`,
    );
  });

  it("Xử lý lỗi: nên ném ra lỗi nếu axios call thất bại", async () => {
    axios.get.mockRejectedValue(new Error("Network Error"));

    await expect(getUsers()).rejects.toThrow("Network Error");
  });
});
