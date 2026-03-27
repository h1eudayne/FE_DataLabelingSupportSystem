import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import labelService from "./labelService";
import projectService from "./projectService";

vi.mock("../../axios.customize", () => ({
  default: {
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("./projectService", () => ({
  default: {
    getProjectDetail: vi.fn(),
  },
}));

describe("labelService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getLabels: should call projectService.getProjectDetail", async () => {
    const projectId = "P1";
    projectService.getProjectDetail.mockResolvedValueOnce({ labels: [{ id: "L1" }] });

    const labels = await labelService.getLabels(projectId);

    expect(projectService.getProjectDetail).toHaveBeenCalledWith(projectId);
    expect(labels).toEqual([{ id: "L1" }]);
  });

  it("createLabel: should POST to /api/managers/projects/{projectId}/labels", async () => {
    const projectId = "P1";
    const labelData = { name: "Dog", color: "#ff0000" };
    axios.post.mockResolvedValueOnce({ data: { id: "L1" } });

    await labelService.createLabel(projectId, labelData);

    expect(axios.post).toHaveBeenCalledWith(`/api/managers/projects/${projectId}/labels`, labelData);
  });

  it("updateLabel: should PUT to /api/managers/projects/{projectId}/labels/{id}", async () => {
    const projectId = "P1";
    const labelId = "L1";
    const updateData = { name: "Cat" };
    axios.put.mockResolvedValueOnce({ data: "Updated" });

    await labelService.updateLabel(projectId, labelId, updateData);

    expect(axios.put).toHaveBeenCalledWith(
      `/api/managers/projects/${projectId}/labels/${labelId}`,
      updateData,
    );
  });

  it("deleteLabel: should DELETE /api/managers/projects/{projectId}/labels/{id}", async () => {
    const projectId = "P1";
    const labelId = "L1";
    axios.delete.mockResolvedValueOnce({ data: "Deleted" });

    await labelService.deleteLabel(projectId, labelId);

    expect(axios.delete).toHaveBeenCalledWith(`/api/managers/projects/${projectId}/labels/${labelId}`);
  });
});
