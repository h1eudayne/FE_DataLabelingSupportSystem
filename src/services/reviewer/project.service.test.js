import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../axios.customize";
import projectService from "./project.service";

vi.mock("../axios.customize", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
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

    expect(axios.get).toHaveBeenCalledWith("/api/reviews/projects");

    expect(result.data).toEqual(mockData);
  });

  it("getReviewProjects: nên ném lỗi khi API trả về lỗi", async () => {
    axios.get.mockRejectedValueOnce(new Error("Internal Server Error"));

    await expect(projectService.getReviewProjects()).rejects.toThrow(
      "Internal Server Error",
    );
  });

  it("getReviewWorkspace: nên gọi đúng endpoint với projectId", async () => {
    const projectId = 123;
    const mockData = [{ id: 1, status: "Submitted" }];
    axios.get.mockResolvedValueOnce({ data: mockData });

    const result = await projectService.getReviewWorkspace(projectId);

    expect(axios.get).toHaveBeenCalledWith(`/api/reviews/projects/${projectId}/tasks`);
    expect(result.data).toEqual(mockData);
  });

  it("submitReview: nên gọi POST đúng endpoint", async () => {
    const mockData = { assignmentId: 1, isApproved: true, comment: "Good" };
    const mockResponse = { Message: "Approved" };
    axios.post.mockResolvedValueOnce({ data: mockResponse });

    const result = await projectService.submitReview(mockData);

    expect(axios.post).toHaveBeenCalledWith("/api/reviews", mockData);
    expect(result.data).toEqual(mockResponse);
  });

  it("getProjectStatistics: nên gọi đúng endpoint với projectId", async () => {
    const projectId = 123;
    const mockData = { total: 100, completed: 50 };
    axios.get.mockResolvedValueOnce({ data: mockData });

    const result = await projectService.getProjectStatistics(projectId);

    expect(axios.get).toHaveBeenCalledWith(`/api/projects/${projectId}/statistics`);
    expect(result.data).toEqual(mockData);
  });

  it("getReviewerStats: nên gọi đúng endpoint", async () => {
    const mockData = { totalReviews: 100, accuracy: 95 };
    axios.get.mockResolvedValueOnce({ data: mockData });

    const result = await projectService.getReviewerStats();

    expect(axios.get).toHaveBeenCalledWith("/api/reviews/stats");
    expect(result.data).toEqual(mockData);
  });

  it("getReviewQueueGroupedByAnnotator: nên gọi đúng endpoint", async () => {
    const projectId = 123;
    const mockData = { groups: [] };
    axios.get.mockResolvedValueOnce({ data: mockData });

    const result = await projectService.getReviewQueueGroupedByAnnotator(projectId);

    expect(axios.get).toHaveBeenCalledWith(`/api/reviews/projects/${projectId}/queue`);
    expect(result.data).toEqual(mockData);
  });

  it("getBatchCompletionStatus: nên gọi đúng endpoint", async () => {
    const projectId = 123;
    const mockData = { batches: [] };
    axios.get.mockResolvedValueOnce({ data: mockData });

    const result = await projectService.getBatchCompletionStatus(projectId);

    expect(axios.get).toHaveBeenCalledWith(`/api/reviews/projects/${projectId}/batch-status`);
    expect(result.data).toEqual(mockData);
  });

  it("submitReview: nên ném lỗi khi API trả về lỗi", async () => {
    axios.post.mockRejectedValueOnce(new Error("Review failed"));

    await expect(projectService.submitReview({})).rejects.toThrow("Review failed");
  });
});
