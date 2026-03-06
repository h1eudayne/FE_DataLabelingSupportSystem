import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import projectService from "../../../services/manager/project/projectService";

export const fetchProjects = createAsyncThunk(
  "projects/fetchAll",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const user = state.auth?.user;
      const managerId = user?.nameid;

      if (!managerId) {
        throw new Error("Manager ID not found in token");
      }

      const response = await projectService.getManagerProjects(managerId);
      const projects = response.data || [];

      // Enrich each project with statistics for accurate progress
      const enrichedProjects = await Promise.all(
        projects.map(async (project) => {
          try {
            const statsRes = await projectService.getProjectStats(project.id);
            const s = statsRes.data;
            const totalAsgn = s.totalAssignments ?? 0;
            const approvedAsgn = s.approvedAssignments ?? 0;
            const subAsgn = s.submittedAssignments ?? 0;
            // Progress = (submitted + approved) / total
            const realProgress =
              totalAsgn > 0
                ? Math.round(((subAsgn + approvedAsgn) / totalAsgn) * 100)
                : Number(project.progress || 0);
            return { ...project, progress: realProgress };
          } catch {
            // If stats call fails, keep original progress
            return project;
          }
        }),
      );

      return enrichedProjects;
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
