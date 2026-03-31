import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import aiService from "./aiService";

vi.mock("../../axios.customize", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("aiService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detectObjects: should POST to /api/ai/detect", async () => {
    const payload = {
      assignmentId: 12,
      exemplars: [{ xmin: 10, ymin: 20, xmax: 30, ymax: 40 }],
      threshold: 0.33,
    };

    axios.post.mockResolvedValueOnce({ data: { count: 5 } });

    await aiService.detectObjects(payload);

    expect(axios.post).toHaveBeenCalledWith("/api/ai/detect", payload);
  });

  it("getStatus: should GET /api/ai/status", async () => {
    axios.get.mockResolvedValueOnce({ data: { available: true } });

    await aiService.getStatus();

    expect(axios.get).toHaveBeenCalledWith("/api/ai/status");
  });
});
