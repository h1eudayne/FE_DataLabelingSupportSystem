import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import disputeService from "./disputeService";

vi.mock("../../axios.customize", () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

describe("disputeService", () => {
  beforeEach(() => vi.clearAllMocks());

  // ── getDisputes ──────────────────────────────────────────────

  describe("getDisputes()", () => {
    it("should GET /api/disputes with projectId param", async () => {
      const mockData = [
        {
          id: 1,
          assignmentId: 10,
          annotatorId: "user-1",
          annotatorName: "Alice",
          reason: "Incorrect rejection",
          status: "Pending",
          managerComment: null,
          createdAt: "2026-03-01T10:00:00Z",
          resolvedAt: null,
          projectId: 5,
          projectName: "Object Detection",
          dataItemUrl: "https://example.com/img.jpg",
          assignmentStatus: "Rejected",
          reviewerName: "Bob",
        },
      ];
      axios.get.mockResolvedValue({ data: mockData });

      const result = await disputeService.getDisputes(5);

      expect(axios.get).toHaveBeenCalledWith("/api/disputes", {
        params: { projectId: 5 },
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].reason).toBe("Incorrect rejection");
    });

    it("should handle empty disputes list", async () => {
      axios.get.mockResolvedValue({ data: [] });

      const result = await disputeService.getDisputes(99);

      expect(axios.get).toHaveBeenCalledWith("/api/disputes", {
        params: { projectId: 99 },
      });
      expect(result.data).toEqual([]);
    });

    it("should propagate network errors", async () => {
      axios.get.mockRejectedValue(new Error("Network Error"));

      await expect(disputeService.getDisputes(1)).rejects.toThrow(
        "Network Error",
      );
    });
  });

  // ── resolveDispute ───────────────────────────────────────────

  describe("resolveDispute()", () => {
    it("should POST /api/disputes/resolve with accept payload", async () => {
      const payload = {
        disputeId: 1,
        isAccepted: true,
        managerComment: "Dispute accepted — reassigning task.",
      };
      axios.post.mockResolvedValue({ data: { message: "OK" } });

      await disputeService.resolveDispute(payload);

      expect(axios.post).toHaveBeenCalledWith(
        "/api/disputes/resolve",
        payload,
      );
    });

    it("should POST /api/disputes/resolve with reject payload", async () => {
      const payload = {
        disputeId: 2,
        isAccepted: false,
        managerComment: "Rejection was correct.",
      };
      axios.post.mockResolvedValue({ data: { message: "OK" } });

      await disputeService.resolveDispute(payload);

      expect(axios.post).toHaveBeenCalledWith(
        "/api/disputes/resolve",
        payload,
      );
    });

    it("should allow managerComment to be omitted", async () => {
      const payload = { disputeId: 3, isAccepted: true };
      axios.post.mockResolvedValue({ data: { message: "OK" } });

      await disputeService.resolveDispute(payload);

      expect(axios.post).toHaveBeenCalledWith(
        "/api/disputes/resolve",
        payload,
      );
    });

    it("should propagate server errors (400/500)", async () => {
      const error = new Error("Bad Request");
      error.response = { status: 400 };
      axios.post.mockRejectedValue(error);

      await expect(
        disputeService.resolveDispute({ disputeId: 99, isAccepted: true }),
      ).rejects.toThrow("Bad Request");
    });
  });
});
