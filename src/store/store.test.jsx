import { describe, it, expect } from "vitest";
import store from "./store";

describe("Redux Store Configuration", () => {
  it("nên khởi tạo store với cấu trúc reducer chính xác", () => {
    const state = store.getState();

    expect(state).toHaveProperty("auth");
    expect(state).toHaveProperty("labeling");
    expect(state).toHaveProperty("task");
    expect(state).toHaveProperty("projects");
  });

  it("nên có giá trị initialState chính xác cho từng slice", () => {
    const state = store.getState();

    expect(state.auth).toBeDefined();

    expect(state.labeling.annotationsByAssignment).toEqual({});
    expect(state.labeling.selectedLabel).toBeNull();

    expect(state.task.projects).toEqual([]);
    expect(state.task.loading).toBe(false);

    expect(state.projects.items).toEqual([]);
  });

  it("nên xử lý được action từ các slice khác nhau", () => {
    store.dispatch({
      type: "labeling/setSelectedLabel",
      payload: { id: 1, name: "Person" },
    });

    const state = store.getState();
    expect(state.labeling.selectedLabel).toEqual({ id: 1, name: "Person" });
  });
});
