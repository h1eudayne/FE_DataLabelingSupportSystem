import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import analyticsService from "./analyticsService";

vi.mock("../../axios.customize", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("analyticsService - Full Coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getProjectStats()", () => {
    it("should throw error if projectId is missing", () => {
      expect(() => analyticsService.getProjectStats(null)).toThrow(
        "projectId is required",
      );
    });

    it("should call correct statistics endpoint", async () => {
      axios.get.mockResolvedValueOnce({ data: {} });
      await analyticsService.getProjectStats("PROJ_01");
      expect(axios.get).toHaveBeenCalledWith(
        "/api/projects/PROJ_01/statistics",
      );
    });
  });

  describe("getDashboardStats() - Aggregation logic", () => {
    it("Success: aggregate data from multiple projects", async () => {
      axios.get.mockResolvedValueOnce({
        data: [{ id: "P1" }, { id: "P2" }],
      });

      axios.get
        .mockResolvedValueOnce({
          data: { totalAssignments: 10, approvedAssignments: 5 },
        })
        .mockResolvedValueOnce({
          data: { totalAssignments: 20, approvedAssignments: 10 },
        });

      const stats = await analyticsService.getDashboardStats("test-manager-id");

      expect(stats.totalProjects).toBe(2);
      expect(stats.totalAssignments).toBe(30);
      expect(stats.completed).toBe(15);
    });

    it("Error 400: skip errored projects and continue", async () => {
      axios.get.mockResolvedValueOnce({
        data: [{ id: "P1" }, { id: "P2" }],
      });

      const error400 = { response: { status: 400 } };
      axios.get
        .mockRejectedValueOnce(error400)
        .mockResolvedValueOnce({ data: { totalAssignments: 5 } });

      const stats = await analyticsService.getDashboardStats("test-manager-id");

      expect(stats.totalProjects).toBe(2);
      expect(stats.totalAssignments).toBe(5);
    });

    it("Critical error (500): stop and throw", async () => {
      axios.get.mockResolvedValueOnce({ data: [{ id: "P1" }] });
      axios.get.mockRejectedValueOnce(new Error("Database Crash"));

      await expect(
        analyticsService.getDashboardStats("test-manager-id"),
      ).rejects.toThrow("Database Crash");
    });

    it("No projects: return zeroed object", async () => {
      axios.get.mockResolvedValueOnce({ data: [] });

      const stats = await analyticsService.getDashboardStats("test-manager-id");

      expect(stats.totalProjects).toBe(0);
      expect(stats.totalAssignments).toBe(0);
    });
  });

  describe("getUsers()", () => {
    it("should call correct users endpoint", async () => {
      axios.get.mockResolvedValueOnce({ data: [] });
      await analyticsService.getUsers();
      expect(axios.get).toHaveBeenCalledWith("/api/users");
    });
  });
});
