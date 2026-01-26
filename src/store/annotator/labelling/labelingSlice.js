import { createSlice } from "@reduxjs/toolkit";

const labelingSlice = createSlice({
  name: "labeling",
  initialState: {
    selectedLabel: null,
    annotationsByAssignment: {},
  },
  reducers: {
    setSelectedLabel(state, action) {
      state.selectedLabel = action.payload;
    },

    setAnnotations(state, action) {
      const { assignmentId, annotations } = action.payload;
      state.annotationsByAssignment[assignmentId] = annotations || [];
    },

    addAnnotation(state, action) {
      const { assignmentId } = action.payload;
      if (!state.annotationsByAssignment[assignmentId]) {
        state.annotationsByAssignment[assignmentId] = [];
      }
      state.annotationsByAssignment[assignmentId].push(action.payload);
    },

    removeAnnotation(state, action) {
      const { assignmentId, id } = action.payload;
      state.annotationsByAssignment[assignmentId] = (
        state.annotationsByAssignment[assignmentId] || []
      ).filter((a) => a.id !== id);
    },

    removeLastAnnotation(state, action) {
      const assignmentId = action.payload;
      const list = state.annotationsByAssignment[assignmentId];
      if (list && list.length > 0) {
        list.pop();
      }
    },
  },
});

export const {
  setSelectedLabel,
  setAnnotations,
  addAnnotation,
  removeAnnotation,
  removeLastAnnotation,
} = labelingSlice.actions;

export default labelingSlice.reducer;
