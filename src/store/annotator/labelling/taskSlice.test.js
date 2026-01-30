import { describe, it, expect, vi, beforeEach } from "vitest";
import taskReducer, {
  fetchMyProjects,
  setCurrentTask,
  clearCurrentTask,
} from "./taskSlice";

vi.mock("../../../services/annotator/labeling/taskService", () => ({
  default: {
    getMyProjects: vi.fn(),
  },
}));

describe("taskSlice", () => {
  const initialState = {
    projects: [],
    currentTask: null,
    loading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Reducers đồng bộ", () => {
    it("nên xử lý setCurrentTask", () => {
      const task = { id: "T1", name: "Task 1" };
      const state = taskReducer(initialState, setCurrentTask(task));
      expect(state.currentTask).toEqual(task);
    });

    it("nên xử lý clearCurrentTask", () => {
      const state = taskReducer(
        { ...initialState, currentTask: {} },
        clearCurrentTask(),
      );
      expect(state.currentTask).toBeNull();
    });
  });

  describe("ExtraReducers (fetchMyProjects)", () => {
    it("nên set loading = true khi fetchMyProjects.pending", () => {
      const action = { type: fetchMyProjects.pending.type };
      const state = taskReducer(initialState, action);
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("nên lưu projects khi fetchMyProjects.fulfilled", () => {
      const mockProjects = [{ id: "P1" }, { id: "P2" }];
      const action = {
        type: fetchMyProjects.fulfilled.type,
        payload: mockProjects,
      };
      const state = taskReducer(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.projects).toEqual(mockProjects);
    });

    it("nên lưu lỗi khi fetchMyProjects.rejected", () => {
      const errorMsg = "Lỗi mạng";
      const action = {
        type: fetchMyProjects.rejected.type,
        payload: errorMsg,
      };
      const state = taskReducer(initialState, action);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMsg);
    });
  });
});
