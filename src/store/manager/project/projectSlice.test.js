import { describe, it, expect, vi, beforeEach } from "vitest";
import projectReducer, {
  fetchProjects,
  createProjectWithLabels,
} from "./projectSlice";
import projectService from "../../../services/manager/project/projectService";

vi.mock("../../../services/manager/project/projectService", () => ({
  default: {
    getManagerProjects: vi.fn(),
    createProject: vi.fn(),
    createLabel: vi.fn(),
  },
}));

describe("projectSlice", () => {
  const initialState = { items: [], loading: false, error: null };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchProjects (AsyncThunk)", () => {
    it("nên cập nhật items khi fetchProjects.fulfilled", async () => {
      const mockProjects = [{ id: "P1", name: "Dự án A" }];
      projectService.getManagerProjects.mockResolvedValueOnce({
        data: mockProjects,
      });

      const action = {
        type: fetchProjects.fulfilled.type,
        payload: mockProjects,
      };
      const state = projectReducer(initialState, action);

      expect(state.items).toEqual(mockProjects);
      expect(state.loading).toBe(false);
    });
  });

  describe("createProjectWithLabels (Complex AsyncThunk)", () => {
    it("nên gọi API tạo dự án và các API tạo nhãn tương ứng", async () => {
      const projectData = { name: "New Project" };
      const labels = [{ name: "Label 1" }, { name: "Label 2" }];
      const mockProjectResponse = { data: { id: "NEW_ID", ...projectData } };

      projectService.createProject.mockResolvedValueOnce(mockProjectResponse);
      projectService.createLabel.mockResolvedValue({ data: { success: true } });

      const action = {
        type: createProjectWithLabels.fulfilled.type,
        payload: mockProjectResponse.data,
      };

      const state = projectReducer(initialState, action);

      expect(state.items).toContainEqual(mockProjectResponse.data);
    });

    it("nên xử lý lỗi khi tạo dự án thất bại", async () => {
      const errorPayload = { message: "Tên dự án đã tồn tại" };
      const action = {
        type: createProjectWithLabels.rejected.type,
        payload: errorPayload,
      };

      const state = projectReducer(initialState, action);

      expect(state.loading).toBe(false);
    });
  });
});
