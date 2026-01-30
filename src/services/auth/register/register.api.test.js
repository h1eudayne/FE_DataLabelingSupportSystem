import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import registerApi from "./register.api";

vi.mock("../../axios.customize", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("registerApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("nên gọi đúng URL và gửi đúng dữ liệu đăng ký", async () => {
    const mockUser = {
      fullName: "Nguyễn Văn A",
      email: "test@example.com",
      password: "password123",
    };

    axios.post.mockResolvedValue({ status: 201, data: { message: "Success" } });

    await registerApi(mockUser.fullName, mockUser.email, mockUser.password);

    expect(axios.post).toHaveBeenCalledWith("/api/auth/register", {
      fullName: mockUser.fullName,
      email: mockUser.email,
      password: mockUser.password,
    });
  });

  it("nên trả về dữ liệu từ server khi đăng ký thành công", async () => {
    const responseData = { id: 1, email: "test@example.com" };
    axios.post.mockResolvedValue({ data: responseData });

    const result = await registerApi("User", "test@example.com", "123");

    expect(result.data).toEqual(responseData);
  });

  it("nên ném ra lỗi (reject) khi server trả về lỗi 400 hoặc 500", async () => {
    const errorMessage = "Email đã tồn tại";
    axios.post.mockRejectedValue(new Error(errorMessage));

    await expect(registerApi("User", "email@exist.com", "123")).rejects.toThrow(
      errorMessage,
    );
  });

  it("nên xử lý trường hợp các tham số bị rỗng", async () => {
    axios.post.mockResolvedValue({ status: 400 });

    await registerApi("", "", "");

    expect(axios.post).toHaveBeenCalledWith("/api/auth/register", {
      fullName: "",
      email: "",
      password: "",
    });
  });
});
