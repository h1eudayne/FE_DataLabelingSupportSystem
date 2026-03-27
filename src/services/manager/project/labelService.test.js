import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import labelService from "./labelService";

vi.mock("../../axios.customize", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("labelService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getLabels: should GET /api/labels with projectId query param", async () => {
    const projectId = "P1";
    axios.get.mockResolvedValueOnce({ data: [{ id: "L1", name: "Dog" }] });

    await labelService.getLabels(projectId);

    expect(axios.get).toHaveBeenCalledWith(`/api/labels?projectId=${projectId}`);
  });

  it("createLabel: should POST to /api/labels with projectId in body", async () => {
    const projectId = "P1";
    const labelData = { name: "Dog", color: "#ff0000" };
    axios.post.mockResolvedValueOnce({ data: { id: "L1" } });

    await labelService.createLabel(projectId, labelData);

    expect(axios.post).toHaveBeenCalledWith("/api/labels", {
      ...labelData,
      projectId,
    });
  });

  it("updateLabel: should PUT to /api/labels/{id}", async () => {
    const labelId = "L1";
    const updateData = { name: "Cat" };
    axios.put.mockResolvedValueOnce({ data: "Updated" });

    await labelService.updateLabel(labelId, updateData);

    expect(axios.put).toHaveBeenCalledWith(
      `/api/labels/${labelId}`,
      updateData,
    );
  });

  it("deleteLabel: should DELETE /api/labels/{id}", async () => {
    const labelId = "L1";
    axios.delete.mockResolvedValueOnce({ data: "Deleted" });

    await labelService.deleteLabel(labelId);

    expect(axios.delete).toHaveBeenCalledWith(`/api/labels/${labelId}`);
  });

  it("getLabelUsageCount: should GET /api/labels/{id}/usage-count", async () => {
    const labelId = "L1";
    axios.get.mockResolvedValueOnce({ data: { count: 42 } });

    await labelService.getLabelUsageCount(labelId);

    expect(axios.get).toHaveBeenCalledWith(`/api/labels/${labelId}/usage-count`);
  });
});
