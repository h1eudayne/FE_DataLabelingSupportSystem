import { describe, it, expect } from "vitest";
import labelingReducer, {
  setSelectedLabel,
  setAnnotations,
  addAnnotation,
  removeAnnotation,
  removeLastAnnotation,
} from "./labelingSlice";

describe("labelingSlice", () => {
  const initialState = {
    selectedLabel: null,
    annotationsByAssignment: {},
  };

  it("nên xử lý setSelectedLabel", () => {
    const label = { id: 1, name: "Dog" };
    const state = labelingReducer(initialState, setSelectedLabel(label));
    expect(state.selectedLabel).toEqual(label);
  });

  it("nên xử lý setAnnotations cho một assignment cụ thể", () => {
    const payload = {
      assignmentId: "A1",
      annotations: [{ id: "ann1", label: "Cat" }],
    };
    const state = labelingReducer(initialState, setAnnotations(payload));
    expect(state.annotationsByAssignment["A1"]).toHaveLength(1);
    expect(state.annotationsByAssignment["A1"][0].id).toBe("ann1");
  });

  it("nên xử lý addAnnotation (tự tạo mảng nếu chưa có)", () => {
    const newAnnotation = { assignmentId: "A1", id: "ann2", type: "box" };
    const state = labelingReducer(initialState, addAnnotation(newAnnotation));
    expect(state.annotationsByAssignment["A1"]).toContainEqual(newAnnotation);
  });

  it("nên xử lý removeAnnotation theo ID", () => {
    const startState = {
      ...initialState,
      annotationsByAssignment: {
        A1: [{ id: "ann1" }, { id: "ann2" }],
      },
    };
    const state = labelingReducer(
      startState,
      removeAnnotation({ assignmentId: "A1", id: "ann1" }),
    );
    expect(state.annotationsByAssignment["A1"]).toHaveLength(1);
    expect(state.annotationsByAssignment["A1"][0].id).toBe("ann2");
  });

  it("nên xử lý removeLastAnnotation (Undo)", () => {
    const startState = {
      ...initialState,
      annotationsByAssignment: {
        A1: [{ id: "1" }, { id: "2" }],
      },
    };
    const state = labelingReducer(startState, removeLastAnnotation("A1"));
    expect(state.annotationsByAssignment["A1"]).toHaveLength(1);
    expect(state.annotationsByAssignment["A1"][0].id).toBe("1");
  });
});
