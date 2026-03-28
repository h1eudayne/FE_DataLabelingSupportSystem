import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../../axios.customize";
import forgotPasswordApi from "./forgotPassword.api";

vi.mock("../../../axios.customize", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("forgotPassword API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("forgotPasswordApi", () => {
    it("nên gọi API với email đúng và trả về response khi thành công", async () => {
      const mockResponse = {
        data: {
          message: "A new password has been generated and sent to your email.",
          NewPassword: "abc12345",
        },
      };
      axios.post.mockResolvedValue(mockResponse);

      const email = "test@example.com";
      const result = await forgotPasswordApi(email);

      expect(axios.post).toHaveBeenCalledWith("/api/auth/forgot-password", {
        email: email,
      });
      expect(result).toEqual(mockResponse);
    });

    it("nên throw error khi API trả về lỗi 400", async () => {
      const error = {
        response: {
          status: 400,
          data: {
            message: "Email not found in the system.",
          },
        },
      };
      axios.post.mockRejectedValue(error);

      const email = "nonexistent@example.com";

      await expect(forgotPasswordApi(email)).rejects.toEqual(error);
      expect(axios.post).toHaveBeenCalledWith("/api/auth/forgot-password", {
        email: email,
      });
    });

    it("nên throw error khi mạng lỗi", async () => {
      const networkError = new Error("Network Error");
      axios.post.mockRejectedValue(networkError);

      const email = "test@example.com";

      await expect(forgotPasswordApi(email)).rejects.toThrow("Network Error");
    });

    it("nên gọi API với email rỗng nếu được cung cấp", async () => {
      const mockResponse = {
        data: {
          message: "Email not found in the system.",
        },
      };
      axios.post.mockResolvedValue(mockResponse);

      const email = "";
      await forgotPasswordApi(email);

      expect(axios.post).toHaveBeenCalledWith("/api/auth/forgot-password", {
        email: email,
      });
    });
  });
});
