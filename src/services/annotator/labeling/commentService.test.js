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
    expect(axios.get).toHaveBeenCalledWith("/api/Review/project/P100");
    expect(res.data).toHaveLength(1);
  });

  it("postComment: nên thực hiện phương thức POST với dữ liệu", async () => {
    const newComment = { projectId: "P1", text: "Cần sửa lại" };
    await commentService.postComment(newComment);
    expect(axios.post).toHaveBeenCalledWith("/api/Review", newComment);
  });
});
