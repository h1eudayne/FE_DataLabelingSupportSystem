import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import projectService from "./projectService";

vi.mock("../../axios.customize", () => ({
  default: { get: vi.fn() },
}));

describe("projectService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getById: should GET /api/projects/{id}", async () => {
    axios.get.mockResolvedValue({ data: { id: 1, name: "Project 1" } });
    const res = await projectService.getById(1);
    expect(axios.get).toHaveBeenCalledWith("/api/projects/1");
    expect(res.data.name).toBe("Project 1");
  });
});
