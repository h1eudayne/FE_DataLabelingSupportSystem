import { describe, it, expect, vi, beforeEach } from "vitest";
import axios from "../../axios.customize";
import datasetService from "./datasetService";

vi.mock("../../axios.customize", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("../../cloudinary/cloudinaryService", () => ({
  uploadToCloudinary: vi
    .fn()
    .mockResolvedValue("https://cloudinary.com/test.png"),
}));

describe("datasetService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getProjectDetail: should call correct API with ID", async () => {
    axios.get.mockResolvedValueOnce({ data: {} });
    await datasetService.getProjectDetail("123");
    expect(axios.get).toHaveBeenCalledWith("/api/projects/123");
  });

  it("uploadFiles: should upload to cloudinary then POST imports", async () => {
    const mockFiles = [
      new File([""], "test1.png"),
      new File([""], "test2.png"),
    ];

    axios.post.mockResolvedValueOnce({ data: {} });
    await datasetService.uploadFiles("PROJ_01", mockFiles);

    expect(axios.post).toHaveBeenCalledWith(
      "/api/projects/PROJ_01/imports",
      expect.objectContaining({
        storageUrls: expect.any(Array),
      }),
    );
  });

  it("getStats: should call correct statistics endpoint", async () => {
    axios.get.mockResolvedValueOnce({ data: {} });
    await datasetService.getStats("P1");
    expect(axios.get).toHaveBeenCalledWith("/api/projects/P1/statistics");
  });

  it("exportData: should call correct exports endpoint with blob", async () => {
    axios.get.mockResolvedValueOnce({ data: new Blob() });
    await datasetService.exportData("P1");
    expect(axios.get).toHaveBeenCalledWith("/api/projects/P1/exports", {
      responseType: "blob",
    });
  });
});
