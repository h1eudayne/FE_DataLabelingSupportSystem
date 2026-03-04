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

  it("assignTask: should POST with correct AssignTaskRequest format", async () => {
    const mockData = {
      projectId: 5,
      annotatorId: "ann-123",
      quantity: 10,
      reviewerId: "rev-456",
    };
    axios.post.mockResolvedValueOnce({ data: { message: "OK" } });

    await taskService.assignTask(mockData);

    expect(axios.post).toHaveBeenCalledWith("/api/Task/assign", mockData);
  });

  it("getMyTasks: should GET /api/Task/my-tasks", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    await taskService.getMyTasks();

    expect(axios.get).toHaveBeenCalledWith("/api/Task/my-tasks");
  });

  it("getTaskDetail: should GET correct URL with assignmentId", async () => {
    const assignmentId = "A_123";
    axios.get.mockResolvedValueOnce({ data: { id: assignmentId } });

    await taskService.getTaskDetail(assignmentId);

    expect(axios.get).toHaveBeenCalledWith(`/api/Task/detail/${assignmentId}`);
  });

  it("submitTask: should POST to /api/Task/submit", async () => {
    const submitData = {
      assignmentId: 1,
      dataJSON: '{"objects":[]}',
    };
    axios.post.mockResolvedValueOnce({ data: "OK" });

    await taskService.submitTask(submitData);

    expect(axios.post).toHaveBeenCalledWith("/api/Task/submit", submitData);
  });
});
