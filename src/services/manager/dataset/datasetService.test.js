import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import datasetService from "./datasetService";

vi.mock("../../axios.customize", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("datasetService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getProjectDetail: nên gọi đúng API với ID", async () => {
    await datasetService.getProjectDetail("123");
    expect(axios.get).toHaveBeenCalledWith("/api/Project/123");
  });

  it("uploadFiles: nên gửi FormData và đúng headers", async () => {
    const mockFiles = [
      new File([""], "test1.png"),
      new File([""], "test2.png"),
    ];

    await datasetService.uploadFiles("PROJ_01", mockFiles);

    expect(axios.post).toHaveBeenCalledWith(
      "/api/Project/PROJ_01/upload-direct",
      expect.any(FormData),
      expect.objectContaining({
        headers: { "Content-Type": "multipart/form-data" },
      }),
    );
  });

  it("getStats & exportData: nên gọi đúng endpoints", async () => {
    await datasetService.getStats("P1");
    expect(axios.get).toHaveBeenCalledWith("/api/Project/P1/stats");

    await datasetService.exportData("P1");
    expect(axios.get).toHaveBeenCalledWith("/api/Project/P1/export");
  });
});
