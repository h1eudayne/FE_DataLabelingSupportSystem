import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import { getSysLogs } from "./systemLog.api";

vi.mock("../../axios.customize", () => ({
  default: { get: vi.fn() },
}));

describe("systemLog.api — getSysLogs()", () => {
  beforeEach(() => vi.clearAllMocks());

  it("should GET /api/logs/system", async () => {
    const mockLogs = [
      {
        id: 1,
        action: "UserLogin",
        userId: "admin-01",
        timestamp: "2026-03-25T08:00:00Z",
        details: "Admin logged in",
      },
      {
        id: 2,
        action: "ProjectCreated",
        userId: "manager-01",
        timestamp: "2026-03-25T09:30:00Z",
        details: "Created project 'Phase 2'",
      },
    ];
    axios.get.mockResolvedValue({ data: mockLogs });

    const result = await getSysLogs();

    expect(axios.get).toHaveBeenCalledWith("/api/logs/system");
    expect(result.data).toHaveLength(2);
    expect(result.data[0].action).toBe("UserLogin");
  });

  it("should handle empty logs", async () => {
    axios.get.mockResolvedValue({ data: [] });

    const result = await getSysLogs();

    expect(result.data).toEqual([]);
  });

  it("should propagate 401 unauthorized errors", async () => {
    const error = new Error("Unauthorized");
    error.response = { status: 401 };
    axios.get.mockRejectedValue(error);

    await expect(getSysLogs()).rejects.toThrow("Unauthorized");
  });
});
