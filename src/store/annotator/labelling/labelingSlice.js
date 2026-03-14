import { createSlice } from "@reduxjs/toolkit";

const MAX_UNDO = 50;

const labelingSlice = createSlice({
  name: "labeling",
  initialState: {
    selectedLabel: null,
    annotationsByAssignment: {},
    checklistByAssignment: {},
    defaultFlagsByAssignment: {},
    undoStack: [],
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
      const list = state.annotationsByAssignment[assignmentId] || [];
      const removed = list.find((a) => a.id === id);
      if (removed) {
        state.undoStack.push({ assignmentId, annotation: { ...removed } });
        if (state.undoStack.length > MAX_UNDO) {
          state.undoStack.shift();
        }
      }
      state.annotationsByAssignment[assignmentId] = list.filter(
        (a) => a.id !== id,
      );
    },

    removeLastAnnotation(state, action) {
      const assignmentId = action.payload;
      const list = state.annotationsByAssignment[assignmentId];
      if (list && list.length > 0) {
        const removed = list.pop();
        state.undoStack.push({ assignmentId, annotation: { ...removed } });
        if (state.undoStack.length > MAX_UNDO) {
          state.undoStack.shift();
        }
      }
    },

    undoLastAction(state, action) {
      const assignmentId = action.payload;
      for (let i = state.undoStack.length - 1; i >= 0; i--) {
        if (state.undoStack[i].assignmentId === assignmentId) {
          const entry = state.undoStack.splice(i, 1)[0];
          if (!state.annotationsByAssignment[assignmentId]) {
            state.annotationsByAssignment[assignmentId] = [];
          }
          state.annotationsByAssignment[assignmentId].push(entry.annotation);
          return;
        }
      }
    },

    setChecklistState(state, action) {
      const { assignmentId, checklistData } = action.payload;
      state.checklistByAssignment[assignmentId] = checklistData || {};
    },

    toggleChecklistItem(state, action) {
      const { assignmentId, labelId, itemIndex } = action.payload;
      if (!state.checklistByAssignment[assignmentId]) {
        state.checklistByAssignment[assignmentId] = {};
      }
      if (!state.checklistByAssignment[assignmentId][labelId]) {
        state.checklistByAssignment[assignmentId][labelId] = [];
      }
      const list = state.checklistByAssignment[assignmentId][labelId];
      while (list.length <= itemIndex) {
        list.push(false);
      }
      list[itemIndex] = !list[itemIndex];
    },

    resetChecklist(state, action) {
      const { assignmentId } = action.payload;
      state.checklistByAssignment[assignmentId] = {};
    },

    setDefaultFlags(state, action) {
      const { assignmentId, flags } = action.payload;
      state.defaultFlagsByAssignment[assignmentId] = flags || [];
    },

    toggleDefaultFlag(state, action) {
      const { assignmentId, labelId } = action.payload;
      if (!state.defaultFlagsByAssignment[assignmentId]) {
        state.defaultFlagsByAssignment[assignmentId] = [];
      }
      const list = state.defaultFlagsByAssignment[assignmentId];
      const idx = list.indexOf(labelId);
      if (idx >= 0) {
        list.splice(idx, 1);
      } else {
        list.push(labelId);
      }
    },

    resetDefaultFlags(state, action) {
      const { assignmentId } = action.payload;
      state.defaultFlagsByAssignment[assignmentId] = [];
    },
  },
});

export const {
  setSelectedLabel,
  setAnnotations,
  addAnnotation,
  removeAnnotation,
  removeLastAnnotation,
  undoLastAction,
  setChecklistState,
  toggleChecklistItem,
  resetChecklist,
  setDefaultFlags,
  toggleDefaultFlag,
  resetDefaultFlags,
} = labelingSlice.actions;

export default labelingSlice.reducer;

