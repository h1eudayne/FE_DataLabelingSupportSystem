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

  it("uploadDirect: should POST with FormData and correct header", async () => {
    const formData = new FormData();
    axios.post.mockResolvedValueOnce({ data: {} });
    await projectService.uploadDirect("P1", formData);
    expect(axios.post).toHaveBeenCalledWith(
      "/api/projects/P1/uploads/direct",
      formData,
      expect.objectContaining({
        headers: { "Content-Type": "multipart/form-data" },
      }),
    );
  });

  it("getProjectStats: should GET /api/projects/{id}/statistics", async () => {
    axios.get.mockResolvedValueOnce({ data: {} });
    await projectService.getProjectStats(7);
    expect(axios.get).toHaveBeenCalledWith("/api/projects/7/statistics");
  });
});
