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
    it("nên ném lỗi nếu không truyền projectId", () => {
      expect(() => analyticsService.getProjectStats(null)).toThrow(
        "projectId is required",
      );
    });

    it("nên gọi đúng endpoint khi có projectId", async () => {
      axios.get.mockResolvedValueOnce({ data: {} });
      await analyticsService.getProjectStats("PROJ_01");
      expect(axios.get).toHaveBeenCalledWith("/api/Project/PROJ_01/stats");
    });
  });

  describe("getDashboardStats() - Logic tổng hợp", () => {
    it("TH Thành công: Tổng hợp dữ liệu từ nhiều dự án", async () => {
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

      const stats = await analyticsService.getDashboardStats();

      expect(stats.totalProjects).toBe(2);
      expect(stats.totalAssignments).toBe(30);
      expect(stats.completed).toBe(15);
    });

    it("TH Lỗi 400: Nên bỏ qua dự án bị lỗi và tiếp tục tính toán", async () => {
      axios.get.mockResolvedValueOnce({ data: [{ id: "P1" }, { id: "P2" }] });

      const error400 = { response: { status: 400 } };
      axios.get
        .mockRejectedValueOnce(error400)
        .mockResolvedValueOnce({ data: { totalAssignments: 5 } });

      const stats = await analyticsService.getDashboardStats();

      expect(stats.totalProjects).toBe(2);
      expect(stats.totalAssignments).toBe(5);
    });

    it("TH Lỗi nghiêm trọng (500): Nên dừng lại và ném lỗi", async () => {
      axios.get.mockResolvedValueOnce({ data: [{ id: "P1" }] });
      axios.get.mockRejectedValueOnce(new Error("Database Crash"));

      await expect(analyticsService.getDashboardStats()).rejects.toThrow(
        "Database Crash",
      );
    });

    it("TH Không có dự án: Trả về object chứa các giá trị 0", async () => {
      axios.get.mockResolvedValueOnce({ data: [] });

      const stats = await analyticsService.getDashboardStats();

      expect(stats.totalProjects).toBe(0);
      expect(stats.totalAssignments).toBe(0);
    });
  });

  describe("getUsers()", () => {
    it("nên gọi đúng endpoint lấy danh sách user", async () => {
      axios.get.mockResolvedValueOnce({ data: [] });
      await analyticsService.getUsers();
      expect(axios.get).toHaveBeenCalledWith("/api/User");
    });
  });
});
