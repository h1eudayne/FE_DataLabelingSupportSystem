import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import commentService from "./commentService";

vi.mock("../../axios.customize", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

describe("commentService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getCommentsByProject: nên gọi đúng endpoint review", async () => {
    axios.get.mockResolvedValue({ data: [{ content: "Lỗi" }] });
    const res = await commentService.getCommentsByProject("P100");
    expect(axios.get).toHaveBeenCalledWith("/api/reviews/projects/P100/tasks");
    expect(res.data).toHaveLength(1);
  });
});
