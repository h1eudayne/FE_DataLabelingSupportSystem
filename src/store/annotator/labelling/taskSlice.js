import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import taskService from "../../../services/annotator/labeling/taskService";

export const fetchMyProjects = createAsyncThunk(
  "task/fetchMyProjects",
  async () => {
    const res = await taskService.getMyProjects();
    return res.data;
  },
);

const taskSlice = createSlice({
  name: "task",
  initialState: {
    projects: [],
    loading: false,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchMyProjects.fulfilled, (state, action) => {
      state.projects = action.payload.map((p) => ({
        ...p,
        status: p.progressPercent >= 100 ? "Completed" : p.status || "Assigned",
      }));
    });
  },
});

export default taskSlice.reducer;
