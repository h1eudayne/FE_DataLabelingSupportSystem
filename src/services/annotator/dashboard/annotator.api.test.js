import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "/src/services/axios.customize.js";
import {
  getProfile,
  getAssignedProjects,
  getDashboardStats,
  getMyTasks,
  getReviewerFeedbackByProject,
  getAllReviewerFeedback,
  getMyAccuracy,
} from "./annotator.api";

vi.mock("/src/services/axios.customize.js", () => ({
  default: {
    get: vi.fn(),
  },
}));

describe("Annotator API Suite - Full Coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe("getDashboardStats() - Các trường hợp biên", () => {
    it("TH Thành công: Tính toán đúng khi có nhiều trạng thái dự án", async () => {
      const mockProjects = [
        { status: "InProgress", totalImages: 10, completedImages: 4 },
        { status: "Completed", totalImages: 5, completedImages: 5 },
        { status: "Pending", totalImages: 20, completedImages: 0 },
      ];
      axios.get.mockResolvedValueOnce({ data: mockProjects });

      const stats = await getDashboardStats();

      expect(stats.totalAssigned).toBe(35);
      expect(stats.submitted).toBe(9);
      expect(stats.inProgress).toBe(6);
    });

    it("TH Dữ liệu thiếu: Nên trả về 0 nếu các field images bị undefined/null", async () => {
      const mockProjects = [{ status: "InProgress" }];
      axios.get.mockResolvedValueOnce({ data: mockProjects });

      const stats = await getDashboardStats();

      expect(stats.totalAssigned).toBe(0);
      expect(stats.inProgress).toBe(0);
    });

    it("TH Danh sách rỗng: Nên trả về object mặc định toàn số 0", async () => {
      axios.get.mockResolvedValueOnce({ data: [] });
      const stats = await getDashboardStats();
      expect(stats.totalAssigned).toBe(0);
      expect(stats.submitted).toBe(0);
    });
  });

  describe("getMyTasks()", () => {
    it("nên trả về mảng rỗng ngay lập tức nếu không truyền projectId", async () => {
      const result = await getMyTasks(undefined);
      expect(result).toEqual([]);
      expect(axios.get).not.toHaveBeenCalled();
    });

    it("nên gọi đúng URL endpoint khi có projectId", async () => {
      axios.get.mockResolvedValueOnce({ data: [{ id: 1 }] });
      await getMyTasks("PROJ_001");
      expect(axios.get).toHaveBeenCalledWith(
        "/api/tasks/projects/PROJ_001/images",
      );
    });
  });

  describe("getReviewerFeedbackByProject()", () => {
    it("nên trả về mảng rỗng nếu projectId rỗng", async () => {
      expect(await getReviewerFeedbackByProject("")).toEqual([]);
    });

    it("nên gom đủ feedback từ reviewer và manager, kèm role và ngày trả về", async () => {
      axios.get
        .mockResolvedValueOnce({
          data: [
            {
              id: 5,
              dataItemId: 55,
              dataItemUrl: "https://example.com/car-55.jpg",
              status: "Rejected",
              rejectionReason: "Bounding box is too loose",
              errorCategory: "BBox",
              managerDecision: "reject",
              managerComment: "Please relabel based on guideline v2",
              latestReviewAt: "2026-04-01T09:00:00.000Z",
              reviewerFeedbacks: [
                {
                  reviewLogId: 501,
                  reviewerId: "reviewer-1",
                  reviewerName: "Reviewer One",
                  comment: "Bounding box is too loose",
                  errorCategories: "BBox",
                  reviewedAt: "2026-04-01T09:00:00.000Z",
                },
              ],
            },
          ],
        })
        .mockResolvedValueOnce({
          data: [
            {
              assignmentId: 5,
              reviewerName: "Reviewer One",
              managerName: "Manager One",
              resolvedAt: "2026-04-01T10:00:00.000Z",
            },
          ],
        });

      const result = await getReviewerFeedbackByProject({
        projectId: 100,
        projectName: "Project A",
      });

      expect(result).toEqual([
        {
          feedbackId: "manager-5",
          assignmentId: 5,
          dataItemId: 55,
          dataItemUrl: "https://example.com/car-55.jpg",
          taskName: "car-55.jpg",
          projectId: 100,
          projectName: "Project A",
          taskStatus: "Rejected",
          sourceRole: "Manager",
          sourceName: "Manager One",
          errorType: "BBox",
          comment: "Please relabel based on guideline v2",
          returnedDate: "2026-04-01T10:00:00.000Z",
        },
        {
          feedbackId: 501,
          reviewLogId: 501,
          assignmentId: 5,
          dataItemId: 55,
          dataItemUrl: "https://example.com/car-55.jpg",
          taskName: "car-55.jpg",
          projectId: 100,
          projectName: "Project A",
          taskStatus: "Rejected",
          sourceRole: "Reviewer",
          sourceName: "Reviewer One",
          errorType: "BBox",
          comment: "Bounding box is too loose",
          returnedDate: "2026-04-01T09:00:00.000Z",
        },
      ]);
      expect(axios.get).toHaveBeenNthCalledWith(
        1,
        "/api/tasks/projects/100/images",
      );
      expect(axios.get).toHaveBeenNthCalledWith(2, "/api/disputes", {
        params: { projectId: 100 },
      });
    });

    it("nên tách riêng từng feedback khi một ảnh bị nhiều reviewer trả về", async () => {
      axios.get
        .mockResolvedValueOnce({
          data: [
            {
              id: 9,
              dataItemId: 99,
              dataItemUrl: "https://example.com/car-99.jpg",
              status: "Rejected",
              latestReviewAt: "2026-04-01T09:05:00.000Z",
              reviewerFeedbacks: [
                {
                  reviewLogId: 901,
                  reviewerId: "reviewer-1",
                  reviewerName: "Reviewer One",
                  comment: "Wrong class",
                  errorCategories: "classification",
                  reviewedAt: "2026-04-01T09:00:00.000Z",
                },
                {
                  reviewLogId: 902,
                  reviewerId: "reviewer-2",
                  reviewerName: "Reviewer Two",
                  comment: "Bounding box too loose",
                  errorCategories: "bbox",
                  reviewedAt: "2026-04-01T09:05:00.000Z",
                },
              ],
            },
          ],
        })
        .mockResolvedValueOnce({ data: [] });

      const result = await getReviewerFeedbackByProject({
        projectId: 200,
        projectName: "Project Multi Reviewer",
      });

      expect(result).toEqual([
        {
          feedbackId: 902,
          reviewLogId: 902,
          assignmentId: 9,
          dataItemId: 99,
          dataItemUrl: "https://example.com/car-99.jpg",
          taskName: "car-99.jpg",
          projectId: 200,
          projectName: "Project Multi Reviewer",
          taskStatus: "Rejected",
          sourceRole: "Reviewer",
          sourceName: "Reviewer Two",
          errorType: "bbox",
          comment: "Bounding box too loose",
          returnedDate: "2026-04-01T09:05:00.000Z",
        },
        {
          feedbackId: 901,
          reviewLogId: 901,
          assignmentId: 9,
          dataItemId: 99,
          dataItemUrl: "https://example.com/car-99.jpg",
          taskName: "car-99.jpg",
          projectId: 200,
          projectName: "Project Multi Reviewer",
          taskStatus: "Rejected",
          sourceRole: "Reviewer",
          sourceName: "Reviewer One",
          errorType: "classification",
          comment: "Wrong class",
          returnedDate: "2026-04-01T09:00:00.000Z",
        },
      ]);
    });

    it("nên bắt lỗi (catch) và trả về [] khi server lỗi 500", async () => {
      axios.get.mockRejectedValueOnce(new Error("Internal Server Error"));
      const result = await getReviewerFeedbackByProject("P1");
      expect(result).toEqual([]);
    });
  });

  describe("getAllReviewerFeedback() - Logic phức tạp", () => {
    it.skip("nên bỏ qua các dự án không có ID và thu thập feedback dự án hợp lệ", async () => {
      const mockProjects = [{ id: "P1" }, { name: "No ID Project" }];
      axios.get.mockResolvedValueOnce({ data: mockProjects });

      axios.get.mockResolvedValueOnce({ data: [{ comment: "Good" }] });

      const results = await getAllReviewerFeedback();

      expect(results).toHaveLength(1);
      expect(results[0].comment).toBe("Good");
      expect(axios.get).toHaveBeenCalledTimes(2);
    });

    it("nên trả về mảng rỗng nếu getAssignedProjects trả về null/undefined", async () => {
      axios.get.mockResolvedValueOnce({ data: null });
      const result = await getAllReviewerFeedback();
      expect(result).toEqual([]);
    });
  });

  describe("getMyAccuracy()", () => {
    it("nên giữ nguyên 0% khi annotator đã bị manager chốt sai, không fallback thành 100%", async () => {
      localStorage.setItem("user", JSON.stringify({ id: "annotator-1" }));

      axios.get
        .mockResolvedValueOnce({
          data: [{ projectId: 101, projectName: "Rejected Project" }],
        })
        .mockResolvedValueOnce({
          data: {
            annotatorPerformances: [
              {
                annotatorId: "annotator-1",
                finalAccuracy: 0,
                annotatorAccuracy: 0,
                tasksAssigned: 1,
                tasksCompleted: 0,
                tasksRejected: 1,
                resolvedTasks: 1,
              },
            ],
          },
        });

      const result = await getMyAccuracy();

      expect(result).toEqual({
        overallAccuracy: 0,
        perProject: [
          {
            projectName: "Rejected Project",
            accuracy: 0,
            tasksAssigned: 1,
            tasksCompleted: 0,
            tasksResolved: 1,
          },
        ],
      });
    });
  });

  describe("getProfile() & getAssignedProjects()", () => {
    it("getProfile nên trả về data từ res.data", async () => {
      const user = { email: "test@ai.com" };
      axios.get.mockResolvedValueOnce({ data: user });
      expect(await getProfile()).toEqual(user);
    });

    it("getProfile nên ưu tiên cached user và không gọi /api/users/me", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: "annotator-1",
          role: "Annotator",
          fullName: "Cached Annotator",
          email: "annotator@example.com",
          avatarUrl: "/avatars/annotator.png",
        }),
      );

      await expect(getProfile()).resolves.toEqual({
        id: "annotator-1",
        role: "Annotator",
        fullName: "Cached Annotator",
        email: "annotator@example.com",
        avatarUrl: "/avatars/annotator.png",
      });
      expect(axios.get).not.toHaveBeenCalled();
    });
  });
});
