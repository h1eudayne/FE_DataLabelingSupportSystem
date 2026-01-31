import { describe, it, expect, vi } from "vitest";
import axios from "../../axios.customize";
import projectService from "./projectService";

vi.mock("../../axios.customize", () => ({
  default: { get: vi.fn() },
}));

describe("projectService", () => {
  it("getById: nên gọi đúng URL với ID dự án", async () => {
    axios.get.mockResolvedValue({ data: { id: "P1", name: "Project 1" } });
    const res = await projectService.getById("P1");
    expect(axios.get).toHaveBeenCalledWith("/api/Project/P1");
    expect(res.data.name).toBe("Project 1");
  });
});
