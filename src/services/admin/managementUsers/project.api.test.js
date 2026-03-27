import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import projectApi from "./project.api";

vi.mock("../../axios.customize", () => ({
  default: { get: vi.fn() },
}));

describe("admin/project.api", () => {
  beforeEach(() => vi.clearAllMocks());

  

  describe("getAllProjectsUser()", () => {
    it("should GET /api/projects", async () => {
      const mockProjects = [
        { id: 1, name: "Project A", status: "Active" },
        { id: 2, name: "Project B", status: "Completed" },
      ];
      axios.get.mockResolvedValue({ data: mockProjects });

      const result = await projectApi.getAllProjectsUser();

      expect(axios.get).toHaveBeenCalledWith("/api/projects");
      expect(result.data).toHaveLength(2);
      expect(result.data[0].name).toBe("Project A");
    });

    it("should handle empty project list", async () => {
      axios.get.mockResolvedValue({ data: [] });

      const result = await projectApi.getAllProjectsUser();

      expect(result.data).toEqual([]);
    });
  });

  

  describe("getProjectById()", () => {
    it("should GET /api/projects/{id}", async () => {
      const mockProject = {
        id: 5,
        name: "Object Detection",
        status: "Active",
        totalDataItems: 1000,
      };
      axios.get.mockResolvedValue({ data: mockProject });

      const result = await projectApi.getProjectById(5);

      expect(axios.get).toHaveBeenCalledWith("/api/projects/5");
      expect(result.data.name).toBe("Object Detection");
    });

    it("should propagate 404 when project not found", async () => {
      const error = new Error("Not Found");
      error.response = { status: 404 };
      axios.get.mockRejectedValue(error);

      await expect(projectApi.getProjectById(999)).rejects.toThrow(
        "Not Found",
      );
    });
  });
});
