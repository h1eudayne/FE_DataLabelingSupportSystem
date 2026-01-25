import { createSlice } from "@reduxjs/toolkit";

const labelingSlice = createSlice({
  name: "labeling",
  initialState: {
    selectedLabel: null,
    annotationsByAssignment: {}, // { imageId: [] }
  },
  reducers: {
    setSelectedLabel(state, action) {
      state.selectedLabel = action.payload;
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
      state.annotationsByAssignment[assignmentId] =
        state.annotationsByAssignment[assignmentId]?.filter(
          (a) => a.id !== id,
        ) || [];
    },

    setAnnotationsForAssignment(state, action) {
      const { assignmentId, annotations } = action.payload;
      state.annotationsByAssignment[assignmentId] = annotations;
    },

    clearAllAnnotations(state) {
      state.annotationsByAssignment = {};
    },
  },
});

export const {
  setSelectedLabel,
  addAnnotation,
  removeAnnotation,
  setAnnotationsForAssignment,
  clearAllAnnotations,
} = labelingSlice.actions;

export default labelingSlice.reducer;
