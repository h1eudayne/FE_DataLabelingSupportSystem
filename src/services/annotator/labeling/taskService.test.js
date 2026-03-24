import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "/src/services/axios.customize";
import taskService from "./taskService";

vi.mock("/src/services/axios.customize", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}));

describe("taskService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getMyProjects: nên gọi đúng endpoint", async () => {
    axios.get.mockResolvedValue({ data: [] });
    await taskService.getMyProjects();
    expect(axios.get).toHaveBeenCalledWith("/api/tasks/projects");
  });

  it("getProjectImages: nên truyền đúng projectId vào URL", async () => {
    await taskService.getProjectImages("ABC");
    expect(axios.get).toHaveBeenCalledWith("/api/tasks/projects/ABC/images");
  });

  it("saveDraft: nên gửi đúng dữ liệu payload", async () => {
    const payload = { taskId: 1, labels: [] };
    await taskService.saveDraft(payload);
    expect(axios.put).toHaveBeenCalledWith("/api/tasks/drafts", payload);
  });

  it("submitTask: nên gọi đúng API submit", async () => {
    const payload = { taskId: 1 };
    await taskService.submitTask(payload);
    expect(axios.post).toHaveBeenCalledWith("/api/tasks/submissions", payload);
  });
});
