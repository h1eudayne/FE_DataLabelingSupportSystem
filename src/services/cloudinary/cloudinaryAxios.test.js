import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

describe("Cloudinary Service - Deep Fixed", () => {
  let uploadToCloudinary;
  let cloudinaryAxios;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    vi.stubEnv("VITE_CLOUDINARY_CLOUD_NAME", "test_cloud");
    vi.stubEnv("VITE_CLOUDINARY_UPLOAD_PRESET", "test_preset");

    vi.doMock("./cloudinaryAxios", () => ({
      default: {
        post: vi.fn(),
      },
    }));

    vi.spyOn(console, "error").mockImplementation(() => {});

    const cloudinaryAxiosModule = await import("./cloudinaryAxios");
    cloudinaryAxios = cloudinaryAxiosModule.default;

    const serviceModule = await import("./cloudinaryService");
    uploadToCloudinary = serviceModule.uploadToCloudinary;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("nên upload thành công và trả về secure_url với đúng cloud_name", async () => {
    const mockFile = new File(["content"], "image.png", { type: "image/png" });
    cloudinaryAxios.post.mockResolvedValueOnce({
      data: { secure_url: "https://res.cloudinary.com/success.png" },
    });

    const result = await uploadToCloudinary(mockFile);

    expect(result).toBe("https://res.cloudinary.com/success.png");

    expect(cloudinaryAxios.post).toHaveBeenCalledWith(
      expect.stringContaining("/v1_1/test_cloud/image/upload"),
      expect.any(FormData),
      expect.objectContaining({
        headers: { "Content-Type": "multipart/form-data" },
      }),
    );
  });

  it("nên ném lỗi tùy chỉnh và không log stderr khi upload thất bại", async () => {
    const mockFile = new File([""], "test.png");
    cloudinaryAxios.post.mockRejectedValueOnce(new Error("Network Error"));

    await expect(uploadToCloudinary(mockFile)).rejects.toThrow(
      "Upload Cloudinary thất bại",
    );

    expect(console.error).toHaveBeenCalled();
  });

  it("nên ném lỗi nếu không có file", async () => {
    await expect(uploadToCloudinary(null)).rejects.toThrow("File is required");
  });
});
