import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import projectService from "../../../services/manager/project/projectService";

export const fetchProjects = createAsyncThunk(
  "projects/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const user = state.auth?.user;
      const managerId = user?.id;

      if (!managerId) {
        throw new Error("Manager ID not found in token");
      }

      const response = await projectService.getManagerProjects(managerId);
      const projects = response.data;

      const enriched = await Promise.all(
        projects.map(async (project) => {
          try {
            const detail = await projectService.getProjectById(project.id);
            const members = detail.data?.members || [];
            return { ...project, totalMembers: members.length };
          } catch {
            return project;
          }
        }),
      );

      return enriched;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch projects",
      );
    }
  },
);

const projectSlice = createSlice({
  name: "projects",
  initialState: { items: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch projects";
      });
  },
});

export default projectSlice.reducer;
