import { createSlice } from "@reduxjs/toolkit";

const labelingSlice = createSlice({
  name: "labeling",
  initialState: {
    annotations: [],
    selectedLabel: null,
  },
  reducers: {
    addAnnotation: (state, action) => {
      state.annotations.push(action.payload);
    },
    removeAnnotation: (state, action) => {
      state.annotations = state.annotations.filter(
        (ann) => ann.id !== action.payload,
      );
    },
    setAnnotations: (state, action) => {
      state.annotations = action.payload;
    },
    setSelectedLabel: (state, action) => {
      state.selectedLabel = action.payload;
    },
    resetWorkspace: (state) => {
      state.annotations = [];
      state.selectedLabel = null;
    },
  },
});

export const {
  addAnnotation,
  removeAnnotation,
  setAnnotations,
  setSelectedLabel,
  resetWorkspace,
} = labelingSlice.actions;
export default labelingSlice.reducer;
