import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../../services/axios.customize";

export const fetchTaskById = createAsyncThunk(
  "task/fetchById",
  async (assignmentId) => {
    const response = await axios.get(`/api/Task/detail/${assignmentId}`);
    return response.data;
  },
);

const taskSlice = createSlice({
  name: "task",
  initialState: {
    currentTask: null,
    labels: [],
    status: "idle",
    timer: {
      seconds: 0,
      isActive: false,
    },
    error: null,
  },
  reducers: {
    tick: (state) => {
      if (state.timer.isActive) {
        state.timer.seconds += 1;
      }
    },
    startTimer: (state) => {
      state.timer.isActive = true;
    },
    stopTimer: (state) => {
      state.timer.isActive = false;
    },
    resetTimer: (state) => {
      state.timer.seconds = 0;
      state.timer.isActive = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaskById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.status = "succeeded";

        console.log("Payload từ API:", action.payload);

        const data = action.payload?.data || action.payload;
        state.currentTask = data;

        state.labels = data?.labels || [];
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { tick, startTimer, stopTimer, resetTimer } = taskSlice.actions;
export default taskSlice.reducer;
