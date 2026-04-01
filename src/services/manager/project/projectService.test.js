import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import projectService from "./projectService";

vi.mock("../../axios.customize", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("projectService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getManagerProjects: should call correct API with managerId", async () => {
    const managerId = "manager-123";
    axios.get.mockResolvedValueOnce({ data: [] });
    await projectService.getManagerProjects(managerId);
    expect(axios.get).toHaveBeenCalledWith(
      `/api/projects/managers/${managerId}`,
    );
  });

  it("getProjectById: should call correct API endpoint", async () => {
    axios.get.mockResolvedValueOnce({ data: { id: "1" } });
    await projectService.getProjectById("1");
    expect(axios.get).toHaveBeenCalledWith("/api/projects/1");
  });

  it("createProject: should POST to /api/projects", async () => {
    const data = { name: "Test Project" };
    axios.post.mockResolvedValueOnce({ data: { id: 1 } });
    await projectService.createProject(data);
    expect(axios.post).toHaveBeenCalledWith("/api/projects", data);
  });

  it("updateProject: should PUT to /api/projects/{id}", async () => {
    const data = { name: "Updated" };
    axios.put.mockResolvedValueOnce({ data: {} });
    await projectService.updateProject(5, data);
    expect(axios.put).toHaveBeenCalledWith("/api/projects/5", data);
  });

  it("deleteProject: should DELETE /api/projects/{id}", async () => {
    axios.delete.mockResolvedValueOnce({ data: {} });
    await projectService.deleteProject(3);
    expect(axios.delete).toHaveBeenCalledWith("/api/projects/3");
  });

  it("importData: should POST to /api/projects/{projectId}/imports", async () => {
    const urls = ["https://img1.jpg", "https://img2.jpg"];
    axios.post.mockResolvedValueOnce({ data: {} });
    await projectService.importData(10, urls);
    expect(axios.post).toHaveBeenCalledWith("/api/projects/10/imports", {
      storageUrls: urls,
    });
  });

  it("getProjectStats: should GET /api/projects/{id}/statistics", async () => {
    axios.get.mockResolvedValueOnce({ data: {} });
    await projectService.getProjectStats(7);
    expect(axios.get).toHaveBeenCalledWith("/api/projects/7/statistics");
  });

  it("completeProject: should POST to /api/projects/{id}/complete", async () => {
    axios.post.mockResolvedValueOnce({ data: {} });
    await projectService.completeProject(9);
    expect(axios.post).toHaveBeenCalledWith("/api/projects/9/complete");
  });

  it("getCompletionReview: should GET /api/projects/{id}/completion-review", async () => {
    axios.get.mockResolvedValueOnce({ data: {} });
    await projectService.getCompletionReview(11);
    expect(axios.get).toHaveBeenCalledWith(
      "/api/projects/11/completion-review",
    );
  });

  it("returnCompletionReviewItemForRework: should POST return comment payload", async () => {
    axios.post.mockResolvedValueOnce({ data: {} });
    await projectService.returnCompletionReviewItemForRework(
      11,
      77,
      "Need another pass",
    );
    expect(axios.post).toHaveBeenCalledWith(
      "/api/projects/11/completion-review/items/77/return",
      {
        comment: "Need another pass",
      },
    );
  });
});
