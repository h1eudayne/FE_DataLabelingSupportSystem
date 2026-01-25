import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import taskService from "../../../services/annotator/labeling/taskService";

/* =====================================================
   THUNKS
===================================================== */

// 🔹 Lấy danh sách project/task của annotator
export const fetchMyProjects = createAsyncThunk(
  "task/fetchMyProjects",
  async (_, { rejectWithValue }) => {
    try {
      const res = await taskService.getMyProjects();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Fetch projects failed");
    }
  },
);

// 🔹 Submit task (backend sẽ tự tính progress & status)
export const submitTask = createAsyncThunk(
  "task/submitTask",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await taskService.submitTask(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Submit failed");
    }
  },
);

/* =====================================================
   SLICE
===================================================== */

const taskSlice = createSlice({
  name: "task",
  initialState: {
    projects: [], // danh sách task/project
    loading: false,
    error: null,
  },

  reducers: {
    // 🔹 Khi lưu draft 1 ảnh → cập nhật completedImages + progress
    updateDraftProgress(state, action) {
      const { projectId, completedImages, progressPercent } = action.payload;

      const project = state.projects.find((p) => p.projectId === projectId);

      if (project) {
        project.completedImages = completedImages;
        project.progressPercent = progressPercent;

        // ⚠️ Status luôn sync theo progress
        project.status = progressPercent >= 100 ? "Completed" : "InProgress";
      }
    },
  },

  extraReducers: (builder) => {
    builder
      /* ---------- FETCH PROJECTS ---------- */
      .addCase(fetchMyProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyProjects.fulfilled, (state, action) => {
        state.loading = false;

        // 🔥 Chuẩn hoá dữ liệu từ API
        state.projects = action.payload.map((p) => ({
          projectId: p.projectId,
          projectName: p.projectName,
          description: p.description,
          deadline: p.deadline,
          assignedDate: p.assignedDate,

          totalImages: p.totalImages,
          completedImages: p.completedImages,
          progressPercent: p.progressPercent,

          // ⚠️ FIX LỖI: 100% nhưng vẫn InProgress
          status:
            p.progressPercent >= 100 ? "Completed" : p.status || "Assigned",

          thumbnailUrl: p.thumbnailUrl,
        }));
      })
      .addCase(fetchMyProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      /* ---------- SUBMIT TASK ---------- */
      .addCase(submitTask.fulfilled, (state, action) => {
        const updated = action.payload;

        const project = state.projects.find(
          (p) => p.projectId === updated.projectId,
        );

        if (project) {
          project.completedImages = updated.completedImages;
          project.progressPercent = updated.progressPercent;
          project.status =
            updated.progressPercent >= 100 ? "Completed" : "InProgress";
        }
      });
  },
});

/* =====================================================
   EXPORTS
===================================================== */

export const { updateDraftProgress } = taskSlice.actions;

export default taskSlice.reducer;
