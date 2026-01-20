// labelingSlice.js
import { createSlice } from "@reduxjs/toolkit";

const labelingSlice = createSlice({
  name: "labeling",
  initialState: {
    annotations: [],
    selectedLabel: null,
    history: [],
  },
  reducers: {
    addAnnotation: (state, action) => {
      state.history.push([...state.annotations]);
      state.annotations.push(action.payload);
    },
    importAiAnnotations: (state, action) => {
      state.annotations = [...state.annotations, ...action.payload];
    },
    setSelectedLabel: (state, action) => {
      state.selectedLabel = action.payload;
    },
  },
});

export const { addAnnotation, setSelectedLabel, importAiAnnotations } =
  labelingSlice.actions;
export default labelingSlice.reducer;
