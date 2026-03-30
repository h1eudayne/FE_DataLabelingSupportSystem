import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import WorkplaceLabelingTaskPage from "./WorkplaceLabelingTaskPage";
import labelingReducer from "../../../store/annotator/labelling/labelingSlice";
import taskReducer from "../../../store/annotator/labelling/taskSlice";
import taskService from "../../../services/annotator/labeling/taskService";
import projectService from "../../../services/annotator/labeling/projectService";

const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
}));

vi.mock("react-toastify", () => ({
  toast,
}));

vi.mock("../../../components/annotator/labeling/LabelingWorkspace", () => ({
  default: () => <div data-testid="labeling-workspace" />,
}));

vi.mock("../../../components/annotator/labeling/LabelToolbox", () => ({
  default: () => <div data-testid="label-toolbox" />,
}));

vi.mock("../../../components/annotator/labeling/tasks/CommentSection", () => ({
  default: () => <div data-testid="comment-section" />,
}));

vi.mock("../../../services/annotator/labeling/taskService", () => ({
  default: {
    getProjectImages: vi.fn(),
    saveDraft: vi.fn(),
    submitTask: vi.fn(),
    submitMultiple: vi.fn(),
    createDispute: vi.fn(),
    getMyDisputes: vi.fn(),
  },
}));

vi.mock("../../../services/annotator/labeling/projectService", () => ({
  default: {
    getById: vi.fn(),
  },
}));

const createStore = () =>
  configureStore({
    reducer: {
      labeling: labelingReducer,
      task: taskReducer,
    },
  });

const renderPage = () =>
  render(
    <Provider store={createStore()}>
      <MemoryRouter initialEntries={["/annotator-workspace/123"]}>
        <Routes>
          <Route
            path="/annotator-workspace/:assignmentId"
            element={<WorkplaceLabelingTaskPage />}
          />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );

beforeEach(() => {
  vi.clearAllMocks();
  sessionStorage.clear();
  window.confirm = vi.fn(() => true);
  window.scrollTo = vi.fn();

  projectService.getById.mockResolvedValue({
    data: {
      id: 123,
      name: "Demo Project",
      labels: [],
    },
  });

  taskService.getProjectImages.mockResolvedValue({
    data: [
      {
        id: 1,
        dataItemId: 101,
        dataItemUrl: "https://example.com/image-1.jpg",
        status: "New",
        rejectionReason: null,
        annotationData: JSON.stringify({
          annotations: [
            {
              id: "ann-1",
              type: "BBOX",
              width: 10,
              height: 10,
              labelName: "Object",
            },
          ],
          __checklist: {},
          __defaultFlags: [],
        }),
      },
    ],
  });

  taskService.getMyDisputes.mockResolvedValue({ data: [] });
  taskService.saveDraft.mockResolvedValue({ data: { message: "ok" } });
  taskService.submitTask.mockResolvedValue({ data: { message: "ok" } });
  taskService.createDispute.mockResolvedValue({ data: { message: "ok" } });
});

describe("WorkplaceLabelingTaskPage", () => {
  it("renders the batch panel without crashing when opening batch submit", async () => {
    const user = userEvent.setup();
    renderPage();

    const batchButton = await screen.findByRole("button", {
      name: /workspace\.batchSubmit/i,
    });

    await user.click(batchButton);

    expect(await screen.findByText("workspace.selectImages")).toBeInTheDocument();
    expect(screen.getByText("workspace.imageLabel 1")).toBeInTheDocument();
  });

  it("handles non-array batch errors without crashing the page", async () => {
    const user = userEvent.setup();
    taskService.submitMultiple.mockResolvedValue({
      data: {
        successCount: 0,
        failureCount: 1,
        errors: "Task ID 1: Missing annotation data.",
      },
    });

    renderPage();

    const batchButton = await screen.findByRole("button", {
      name: /workspace\.batchSubmit/i,
    });
    await user.click(batchButton);

    const checkboxes = await screen.findAllByRole("checkbox");
    await user.click(checkboxes[1]);

    const submitButton = screen.getByRole("button", {
      name: /workspace\.submitCount/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(taskService.submitMultiple).toHaveBeenCalledWith({
        assignmentIds: [1],
      });
    });

    expect(await screen.findByText("workspace.selectImages")).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith("workspace.batchFailed");
    expect(toast.error).toHaveBeenCalledWith(
      "Task ID 1: Missing annotation data.",
      { autoClose: 5000 },
    );
  });
});
