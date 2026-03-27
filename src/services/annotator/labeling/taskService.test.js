import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import taskService from "./taskService";

vi.mock("../../axios.customize", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

describe("taskService (annotator)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getMyProjects: should GET /api/tasks/projects", async () => {
    axios.get.mockResolvedValue({ data: [] });
    await taskService.getMyProjects();
    expect(axios.get).toHaveBeenCalledWith("/api/tasks/projects");
  });

  it("getProjectImages: should GET /api/tasks/projects/{id}/images", async () => {
    axios.get.mockResolvedValue({ data: [] });
    await taskService.getProjectImages(5);
    expect(axios.get).toHaveBeenCalledWith("/api/tasks/projects/5/images");
  });

  it("saveDraft: should PUT /api/tasks/drafts with correct payload", async () => {
    const payload = { assignmentId: 1, dataJSON: '{"objects":[]}' };
    axios.put.mockResolvedValue({ data: { message: "OK" } });
    await taskService.saveDraft(payload);
    expect(axios.put).toHaveBeenCalledWith("/api/tasks/drafts", payload);
  });

  it("submitTask: should POST /api/tasks/submissions", async () => {
    const payload = { assignmentId: 1, dataJSON: '{"objects":[]}' };
    axios.post.mockResolvedValue({ data: { message: "OK" } });
    await taskService.submitTask(payload);
    expect(axios.post).toHaveBeenCalledWith(
      "/api/tasks/submissions",
      payload,
    );
  });

  it("submitMultiple: should POST /api/tasks/submissions/batch", async () => {
    const payload = { assignmentIds: [1, 2, 3] };
    axios.post.mockResolvedValue({ data: { message: "OK" } });
    await taskService.submitMultiple(payload);
    expect(axios.post).toHaveBeenCalledWith(
      "/api/tasks/submissions/batch",
      payload,
    );
  });

  it("createDispute: should POST /api/disputes", async () => {
    const payload = { assignmentId: 10, reason: "Incorrect rejection" };
    axios.post.mockResolvedValue({ data: { message: "OK" } });
    await taskService.createDispute(payload);
    expect(axios.post).toHaveBeenCalledWith("/api/disputes", payload);
  });

  it("getMyDisputes: should GET /api/disputes with projectId param", async () => {
    axios.get.mockResolvedValue({ data: [] });
    await taskService.getMyDisputes(5);
    expect(axios.get).toHaveBeenCalledWith("/api/disputes", {
      params: { projectId: 5 },
    });
  });
});
