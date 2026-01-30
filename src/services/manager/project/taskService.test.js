import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import taskService from "./taskService";

vi.mock("../../axios.customize", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("taskService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("assignTask: nên gọi đúng API endpoint với data", async () => {
    const mockData = { projectId: "P1", userIds: ["U1"] };
    axios.post.mockResolvedValueOnce({ data: { success: true } });

    await taskService.assignTask(mockData);

    expect(axios.post).toHaveBeenCalledWith("/api/Task/assign", mockData);
  });

  it("getMyTasks: nên gọi đúng API để lấy task của tôi", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    await taskService.getMyTasks();

    expect(axios.get).toHaveBeenCalledWith("/api/Task/my-tasks");
  });

  it("getTaskDetail: nên gọi đúng URL kèm assignmentId", async () => {
    const assignmentId = "A_123";
    axios.get.mockResolvedValueOnce({ data: { id: assignmentId } });

    await taskService.getTaskDetail(assignmentId);

    expect(axios.get).toHaveBeenCalledWith(`/api/Task/detail/${assignmentId}`);
  });

  it("submitTask: nên gọi đúng API nộp bài", async () => {
    const submitData = { assignmentId: "A_1", annotations: [] };
    axios.post.mockResolvedValueOnce({ data: "OK" });

    await taskService.submitTask(submitData);

    expect(axios.post).toHaveBeenCalledWith("/api/Task/submit", submitData);
  });
});
