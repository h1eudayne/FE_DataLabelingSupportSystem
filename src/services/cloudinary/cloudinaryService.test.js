import { describe, it, expect, vi, beforeEach } from "vitest";
import cloudinaryAxios from "./cloudinaryAxios";

vi.mock("./cloudinaryAxios", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("cloudinaryService", () => {
  let uploadToCloudinary;

  beforeEach(async () => {
    vi.stubEnv("VITE_CLOUDINARY_CLOUD_NAME", "test_cloud");
    vi.stubEnv("VITE_CLOUDINARY_UPLOAD_PRESET", "test_preset");
    vi.resetModules();
    vi.clearAllMocks();
    uploadToCloudinary = (await import("./cloudinaryService")).uploadToCloudinary;
  });

  it("nên ném lỗi nếu không có file truyền vào", async () => {
    await expect(uploadToCloudinary(null)).rejects.toThrow("File is required");
  });

  it("nên trả về secure_url khi upload thành công", async () => {
    const mockFile = new File([""], "test.png", { type: "image/png" });
    const mockUrl = "https://cloudinary.com/test.png";

    cloudinaryAxios.post.mockResolvedValueOnce({
      data: { secure_url: mockUrl },
    });

    const result = await uploadToCloudinary(mockFile);

    expect(result).toBe(mockUrl);
    expect(cloudinaryAxios.post).toHaveBeenCalledWith(
      expect.stringContaining("/image/upload"),
      expect.any(FormData),
      expect.any(Object),
    );
  });

  it("nên ném lỗi tùy chỉnh khi API Cloudinary thất bại", async () => {
    const mockFile = new File([""], "test.png");
    cloudinaryAxios.post.mockRejectedValueOnce(new Error("Network Error"));

    await expect(uploadToCloudinary(mockFile)).rejects.toThrow(
      "Cloudinary upload failed",
    );
  });

  it("nên báo lỗi rõ ràng nếu thiếu cấu hình Cloudinary", async () => {
    vi.unstubAllEnvs();
    vi.stubEnv("VITE_CLOUDINARY_CLOUD_NAME", "");
    vi.stubEnv("VITE_CLOUDINARY_UPLOAD_PRESET", "");
    vi.resetModules();
    vi.clearAllMocks();

    const { uploadToCloudinary: uploadWithoutConfig } = await import("./cloudinaryService");
    const mockFile = new File([""], "test.png");

    await expect(uploadWithoutConfig(mockFile)).rejects.toThrow(
      "Cloudinary configuration is missing. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.",
    );
  });
});
