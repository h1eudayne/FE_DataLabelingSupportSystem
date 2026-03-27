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
      // First call: get projects list
      axios.get.mockResolvedValueOnce({
        data: [{ id: "P1" }, { id: "P2" }],
      });
      // Second call (Promise.all): manager stats (can fail gracefully)
      axios.get.mockResolvedValueOnce({ data: null });
      // Third call: stats for P1
      axios.get.mockResolvedValueOnce({
        data: {
          totalAssignments: 10,
          approvedAssignments: 5,
          rejectedAssignments: 1,
          submittedAssignments: 2,
          pendingAssignments: 2,
          totalItems: 10,
          completedItems: 5,
        },
      });
      // Fourth call: stats for P2
      axios.get.mockResolvedValueOnce({
        data: {
          totalAssignments: 20,
          approvedAssignments: 20,
          rejectedAssignments: 0,
          submittedAssignments: 0,
          pendingAssignments: 0,
          totalItems: 20,
          completedItems: 20,
        },
      });

      const stats = await analyticsService.getDashboardStats(
        "test-manager-id",
      );

      expect(stats.totalProjects).toBe(2);
      // P1: inProgress (approved < total), P2: completed (approved === total)
      expect(stats.completed).toBe(1);
    });

    it("Error 400: skip errored projects and continue", async () => {
      axios.get.mockResolvedValueOnce({
        data: [{ id: "P1" }, { id: "P2" }],
      });
      axios.get.mockResolvedValueOnce({ data: null });

      const error400 = new Error("Bad Request");
      error400.response = { status: 400 };
      axios.get.mockRejectedValueOnce(error400);
      axios.get.mockResolvedValueOnce({
        data: {
          totalAssignments: 5,
          approvedAssignments: 5,
          totalItems: 5,
          completedItems: 5,
        },
      });

      const stats = await analyticsService.getDashboardStats(
        "test-manager-id",
      );

      expect(stats.totalProjects).toBe(2);
    });

    it("Critical error (500): stop and throw", async () => {
      axios.get.mockResolvedValueOnce({ data: [{ id: "P1" }] });
      axios.get.mockResolvedValueOnce({ data: null });
      axios.get.mockRejectedValueOnce(new Error("Database Crash"));

      await expect(
        analyticsService.getDashboardStats("test-manager-id"),
      ).rejects.toThrow("Database Crash");
    });

    it("No projects: return zeroed object", async () => {
      axios.get.mockResolvedValueOnce({ data: [] });
      axios.get.mockResolvedValueOnce({ data: null });

      const stats = await analyticsService.getDashboardStats(
        "test-manager-id",
      );

      expect(stats.totalProjects).toBe(0);
    });
  });

  describe("getUsers()", () => {
    it("should call correct users endpoint with pagination", async () => {
      axios.get.mockResolvedValueOnce({ data: [] });
      await analyticsService.getUsers();
      expect(axios.get).toHaveBeenCalledWith(
        "/api/users?page=1&pageSize=100",
      );
    });
  });
});
