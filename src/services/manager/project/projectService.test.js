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
    expect(axios.get).toHaveBeenCalledWith(`/api/Project/manager/${managerId}`);
  });

  it("getProjectById: should call correct API endpoint", async () => {
    axios.get.mockResolvedValueOnce({ data: { id: "1" } });
    await projectService.getProjectById("1");
    expect(axios.get).toHaveBeenCalledWith("/api/Project/1");
  });

  it("createProject: should POST to /api/Project", async () => {
    const data = { name: "Test Project" };
    axios.post.mockResolvedValueOnce({ data: { id: 1 } });
    await projectService.createProject(data);
    expect(axios.post).toHaveBeenCalledWith("/api/Project", data);
  });

  it("updateProject: should PUT to /api/Project/{id}", async () => {
    const data = { name: "Updated" };
    axios.put.mockResolvedValueOnce({ data: {} });
    await projectService.updateProject(5, data);
    expect(axios.put).toHaveBeenCalledWith("/api/Project/5", data);
  });

  it("deleteProject: should DELETE /api/Project/{id}", async () => {
    axios.delete.mockResolvedValueOnce({ data: {} });
    await projectService.deleteProject(3);
    expect(axios.delete).toHaveBeenCalledWith("/api/Project/3");
  });

  it("importData: should POST to /api/projects/{projectId}/import", async () => {
    const urls = ["https://img1.jpg", "https://img2.jpg"];
    axios.post.mockResolvedValueOnce({ data: {} });
    await projectService.importData(10, urls);
    expect(axios.post).toHaveBeenCalledWith("/api/projects/10/import", {
      storageUrls: urls,
    });
  });

  it("uploadDirect: should POST with FormData and correct header", async () => {
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

  it("getProjectStats: should GET /api/ProjectStats/{id}", async () => {
    axios.get.mockResolvedValueOnce({ data: {} });
    await projectService.getProjectStats(7);
    expect(axios.get).toHaveBeenCalledWith("/api/ProjectStats/7");
  });
});
