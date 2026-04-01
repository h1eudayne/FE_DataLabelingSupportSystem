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
        data: [
          { id: "P1", status: "InProgress" },
          { id: "P2", status: "Completed" },
        ],
      });
      
      axios.get.mockResolvedValueOnce({ data: null });
      
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
      
      axios.get.mockResolvedValueOnce({
        data: {
          totalAssignments: 20,
          approvedAssignments: 20,
          rejectedAssignments: 0,
          submittedAssignments: 0,
          pendingAssignments: 0,
          totalItems: 20,
          completedItems: 20,
          projectStatus: "Completed",
        },
      });

      const stats = await analyticsService.getDashboardStats(
        "test-manager-id",
      );

      expect(stats.totalProjects).toBe(2);
      expect(stats.completed).toBe(1);
      expect(stats.inProgress).toBe(1);
      expect(stats.submitted).toBe(0);
    });

    it("AwaitingManagerConfirmation is not counted as completed", async () => {
      axios.get.mockResolvedValueOnce({
        data: [{ id: "P1", status: "AwaitingManagerConfirmation" }],
      });
      axios.get.mockResolvedValueOnce({ data: null });
      axios.get.mockResolvedValueOnce({
        data: {
          totalAssignments: 10,
          approvedAssignments: 10,
          rejectedAssignments: 0,
          submittedAssignments: 0,
          pendingAssignments: 0,
          totalItems: 10,
          completedItems: 10,
          projectStatus: "AwaitingManagerConfirmation",
        },
      });

      const stats = await analyticsService.getDashboardStats(
        "test-manager-id",
      );

      expect(stats.completed).toBe(0);
      expect(stats.inProgress).toBe(1);
      expect(stats.submitted).toBe(1);
      expect(stats.activeProjects[0].status).toBe("AwaitingManagerConfirmation");
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
