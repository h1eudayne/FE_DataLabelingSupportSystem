import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import commentService from "./commentService";

vi.mock("../../axios.customize", () => ({
  default: { get: vi.fn() },
}));

describe("commentService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getCommentsByProject: should GET /api/reviews/projects/{id}/tasks", async () => {
    axios.get.mockResolvedValue({ data: [{ content: "Error" }] });
    const res = await commentService.getCommentsByProject(5);
    expect(axios.get).toHaveBeenCalledWith(
      "/api/reviews/projects/5/tasks",
    );
    expect(res.data).toHaveLength(1);
  });
});
