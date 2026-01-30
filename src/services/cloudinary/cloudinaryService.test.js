import { describe, it, expect, vi, beforeEach } from "vitest";
import cloudinaryAxios from "./cloudinaryAxios";
import { uploadToCloudinary } from "./cloudinaryService";

vi.mock("./cloudinaryAxios", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("cloudinaryService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      "Upload Cloudinary thất bại",
    );
  });
});
