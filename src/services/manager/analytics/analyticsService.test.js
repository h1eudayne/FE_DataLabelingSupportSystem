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
      axios.get.mockImplementation((url) => {
        if (url === "/api/projects/managers/test-manager-id") {
          return Promise.resolve({ data: [{ id: "P1" }, { id: "P2" }] });
        }
        if (url === "/api/projects/managers/test-manager-id/statistics") {
           return Promise.resolve({ data: { totalMembers: 5 } });
        }
        if (url === "/api/projects/P1/statistics") {
          return Promise.resolve({ data: { totalAssignments: 10, approvedAssignments: 10, totalItems: 10, completedItems: 10 } });
        }
        if (url === "/api/projects/P2/statistics") {
          return Promise.resolve({ data: { totalAssignments: 20, approvedAssignments: 10, totalItems: 20, completedItems: 10 } });
        }
        return Promise.reject(new Error("Not mocked " + url));
      });

      const stats = await analyticsService.getDashboardStats("test-manager-id");

      expect(stats.totalProjects).toBe(2);
      expect(stats.completed).toBe(1); // P1 is completed
      expect(stats.inProgress).toBe(1); // P2 is in progress
      expect(stats.totalMembers).toBe(5);
    });

    it("Error 400: skip errored projects and continue", async () => {
      axios.get.mockImplementation((url) => {
        if (url === "/api/projects/managers/test-manager-id") {
          return Promise.resolve({ data: [{ id: "P1" }, { id: "P2" }] });
        }
        if (url === "/api/projects/managers/test-manager-id/statistics") {
           return Promise.resolve({ data: null });
        }
        if (url === "/api/projects/P1/statistics") {
          return Promise.reject({ response: { status: 400 } });
        }
        if (url === "/api/projects/P2/statistics") {
          return Promise.resolve({ data: { totalAssignments: 5, totalItems: 5, completedItems: 0 } });
        }
        return Promise.reject(new Error("Not mocked"));
      });

      const stats = await analyticsService.getDashboardStats("test-manager-id");

      expect(stats.totalProjects).toBe(2);
      expect(stats.inProgress).toBe(1); // P2 is in progress
      expect(stats.activeProjects.length).toBe(2);
    });

    it("Critical error (500): stop and throw", async () => {
      axios.get.mockImplementation((url) => {
        if (url === "/api/projects/managers/test-manager-id") {
          return Promise.resolve({ data: [{ id: "P1" }] });
        }
        if (url === "/api/projects/managers/test-manager-id/statistics") {
          return Promise.resolve({ data: null });
        }
        if (url === "/api/projects/P1/statistics") {
          return Promise.reject(new Error("Database Crash"));
        }
      });

      await expect(
        analyticsService.getDashboardStats("test-manager-id"),
      ).rejects.toThrow("Database Crash");
    });

    it("No projects: return zeroed object", async () => {
      axios.get.mockImplementation((url) => {
        if (url === "/api/projects/managers/test-manager-id") {
          return Promise.resolve({ data: [] });
        }
        if (url === "/api/projects/managers/test-manager-id/statistics") {
          return Promise.resolve({ data: null });
        }
      });

      const stats = await analyticsService.getDashboardStats("test-manager-id");

      expect(stats.totalProjects).toBe(0);
      expect(stats.completed).toBe(0);
    });
  });

  describe("getUsers()", () => {
    it("should call correct users endpoint", async () => {
      axios.get.mockResolvedValueOnce({ data: [] });
      await analyticsService.getUsers();
      expect(axios.get).toHaveBeenCalledWith("/api/users?page=1&pageSize=100");
    });
  });
});
