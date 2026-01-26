import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import taskService from "../../../services/annotator/labeling/taskService";

export const fetchMyProjects = createAsyncThunk(
  "task/fetchMyProjects",
  async (_, { rejectWithValue }) => {
    try {
      const res = await taskService.getMyProjects();
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Lỗi tải dự án");
    }
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState: {
    projects: [],
    currentTask: null,
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentTask: (state, action) => {
      state.currentTask = action.payload;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchMyProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setCurrentTask, clearCurrentTask } = taskSlice.actions;

export default taskSlice.reducer;
