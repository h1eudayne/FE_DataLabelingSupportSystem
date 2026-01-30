import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import projectService from "./projectService";

vi.mock("../../axios.customize", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("projectService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getProjectById: nên gọi đúng API endpoint", async () => {
    axios.get.mockResolvedValueOnce({ data: { id: "1" } });
    await projectService.getProjectById("1");
    expect(axios.get).toHaveBeenCalledWith("/api/Project/1");
  });

  it("uploadDirect: nên gửi đúng FormData và header", async () => {
    const formData = new FormData();
    await projectService.uploadDirect("P1", formData);

    expect(axios.post).toHaveBeenCalledWith(
      "/api/Project/P1/upload-direct",
      formData,
      expect.objectContaining({
        headers: { "Content-Type": "multipart/form-data" },
      }),
    );
  });
});
