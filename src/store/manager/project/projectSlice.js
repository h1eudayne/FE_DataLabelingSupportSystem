import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import projectService from "../../../services/manager/project/projectService";

export const createProjectWithLabels = createAsyncThunk(
  "projects/createWithLabels",
  async ({ projectData, labels }, { rejectWithValue }) => {
    try {
      const projectRes = await projectService.createProject(projectData);
      const newProjectId = projectRes.data.id;

      if (labels && labels.length > 0) {
        const labelPromises = labels.map((label) =>
          projectService.createLabel({ ...label, projectId: newProjectId }),
        );
        await Promise.all(labelPromises);
      }
      return projectRes.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  },
);

export const fetchProjects = createAsyncThunk("projects/fetchAll", async () => {
  const response = await projectService.getManagerProjects();
  return response.data;
});

const projectSlice = createSlice({
  name: "projects",
  initialState: { items: [], loading: false, error: null },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(createProjectWithLabels.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

export default projectSlice.reducer;
