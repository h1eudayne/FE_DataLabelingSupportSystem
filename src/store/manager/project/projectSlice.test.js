import { describe, it, expect, vi, beforeEach } from "vitest";
import projectReducer, { fetchProjects } from "./projectSlice";

vi.mock("../../../services/manager/project/projectService", () => ({
  default: {
    getManagerProjects: vi.fn(),
    createProject: vi.fn(),
  },
}));

describe("projectSlice", () => {
  const initialState = { items: [], loading: false, error: null };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchProjects states", () => {
    it("should set loading=true on pending", () => {
      const action = { type: fetchProjects.pending.type };
      const state = projectReducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("should set items on fulfilled", () => {
      const mockProjects = [
        { id: 1, name: "Project A", status: "Active" },
        { id: 2, name: "Project B", status: "Expired" },
      ];
      const action = {
        type: fetchProjects.fulfilled.type,
        payload: mockProjects,
      };
      const state = projectReducer(initialState, action);

      expect(state.items).toEqual(mockProjects);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("should set error on rejected", () => {
      const errorMsg = "Manager ID not found";
      const action = {
        type: fetchProjects.rejected.type,
        payload: errorMsg,
      };
      const state = projectReducer(initialState, action);

      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMsg);
    });
  });
});
