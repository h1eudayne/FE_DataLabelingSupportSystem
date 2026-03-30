import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import reviewAuditService from "./reviewAuditService";

vi.mock("../../axios.customize", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

describe("reviewAuditService", () => {
  beforeEach(() => vi.clearAllMocks());

  

  describe("getTasksForReview()", () => {
    it("should GET /api/reviews/projects/{id}/tasks", async () => {
      const mockTasks = [
        {
          assignmentId: 101,
          dataItemId: 5001,
          storageUrl: "https://example.com/image.jpg",
          projectName: "Object Detection",
          status: "Submitted",
          annotatorId: "user-1",
          annotatorName: "Alice",
        },
      ];
      axios.get.mockResolvedValue({ data: mockTasks });

      const result = await reviewAuditService.getTasksForReview(10);

      expect(axios.get).toHaveBeenCalledWith(
        "/api/reviews/projects/10/tasks",
      );
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe("Submitted");
    });

    it("should handle empty task list", async () => {
      axios.get.mockResolvedValue({ data: [] });

      const result = await reviewAuditService.getTasksForReview(99);

      expect(axios.get).toHaveBeenCalledWith(
        "/api/reviews/projects/99/tasks",
      );
      expect(result.data).toEqual([]);
    });

    it("should propagate network errors", async () => {
      axios.get.mockRejectedValue(new Error("Network Error"));

      await expect(
        reviewAuditService.getTasksForReview(1),
      ).rejects.toThrow("Network Error");
    });
  });

  

  describe("auditReview()", () => {
    it("should POST /api/reviews/audits with correct decision", async () => {
      const payload = {
        reviewLogId: 42,
        isCorrectDecision: true,
        auditComment: "Reviewer made the right call.",
      };
      axios.post.mockResolvedValue({ data: { message: "OK" } });

      await reviewAuditService.auditReview(payload);

      expect(axios.post).toHaveBeenCalledWith(
        "/api/reviews/audits",
        payload,
      );
    });

    it("should POST /api/reviews/audits with incorrect decision", async () => {
      const payload = {
        reviewLogId: 43,
        isCorrectDecision: false,
        auditComment: "Reviewer missed a bounding box error.",
      };
      axios.post.mockResolvedValue({ data: { message: "OK" } });

      await reviewAuditService.auditReview(payload);

      expect(axios.post).toHaveBeenCalledWith(
        "/api/reviews/audits",
        payload,
      );
    });

    it("should allow auditComment to be omitted", async () => {
      const payload = { reviewLogId: 44, isCorrectDecision: true };
      axios.post.mockResolvedValue({ data: { message: "OK" } });

      await reviewAuditService.auditReview(payload);

      expect(axios.post).toHaveBeenCalledWith(
        "/api/reviews/audits",
        payload,
      );
    });

    it("should propagate server errors", async () => {
      const error = new Error("Internal Server Error");
      error.response = { status: 500 };
      axios.post.mockRejectedValue(error);

      await expect(
        reviewAuditService.auditReview({
          reviewLogId: 99,
          isCorrectDecision: true,
        }),
      ).rejects.toThrow("Internal Server Error");
    });
  });

  describe("escalation APIs", () => {
    it("should GET /api/reviews/projects/{id}/escalations", async () => {
      axios.get.mockResolvedValue({ data: [{ assignmentId: 10, escalationType: "PenaltyReview" }] });

      const result = await reviewAuditService.getEscalations(15);

      expect(axios.get).toHaveBeenCalledWith(
        "/api/reviews/projects/15/escalations",
      );
      expect(result.data[0].escalationType).toBe("PenaltyReview");
    });

    it("should POST /api/reviews/escalations/resolve", async () => {
      const payload = {
        assignmentId: 10,
        action: "approve",
        comment: "Aligned with guideline v1.0",
      };
      axios.post.mockResolvedValue({ data: { message: "OK" } });

      await reviewAuditService.resolveEscalation(payload);

      expect(axios.post).toHaveBeenCalledWith(
        "/api/reviews/escalations/resolve",
        payload,
      );
    });
  });
});
