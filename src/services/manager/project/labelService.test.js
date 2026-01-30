import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import labelService from "./labelService";

vi.mock("../../axios.customize", () => ({
  default: {
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("labelService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createLabel: nên gọi API post tạo nhãn mới", async () => {
    const labelData = { name: "Dog", color: "#ff0000" };
    axios.post.mockResolvedValueOnce({ data: { id: "L1" } });

    await labelService.createLabel(labelData);

    expect(axios.post).toHaveBeenCalledWith("/api/Label", labelData);
  });

  it("updateLabel: nên gọi API put với đúng ID và data", async () => {
    const labelId = "L1";
    const updateData = { name: "Cat" };
    axios.put.mockResolvedValueOnce({ data: "Updated" });

    await labelService.updateLabel(labelId, updateData);

    expect(axios.put).toHaveBeenCalledWith(`/api/Label/${labelId}`, updateData);
  });

  it("deleteLabel: nên gọi API delete với đúng ID", async () => {
    const labelId = "L1";
    axios.delete.mockResolvedValueOnce({ data: "Deleted" });

    await labelService.deleteLabel(labelId);

    expect(axios.delete).toHaveBeenCalledWith(`/api/Label/${labelId}`);
  });
});
