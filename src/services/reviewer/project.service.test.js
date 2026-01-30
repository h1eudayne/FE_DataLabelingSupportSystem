import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../axios.customize";
import projectService from "./project.service";

vi.mock("../axios.customize", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("projectService (Reviewer)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getReviewProjects: nên gọi đúng endpoint dành cho reviewer", async () => {
    const mockData = [
      { id: "P1", name: "Project Review 1" },
      { id: "P2", name: "Project Review 2" },
    ];
    axios.get.mockResolvedValueOnce({ data: mockData });

    const result = await projectService.getReviewProjects();

    expect(axios.get).toHaveBeenCalledWith("/api/Project/reviewer/me");

    expect(result.data).toEqual(mockData);
  });

  it("getReviewProjects: nên ném lỗi khi API trả về lỗi", async () => {
    axios.get.mockRejectedValueOnce(new Error("Internal Server Error"));

    await expect(projectService.getReviewProjects()).rejects.toThrow(
      "Internal Server Error",
    );
  });
});
