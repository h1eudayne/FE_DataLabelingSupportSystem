import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import WorkplaceLabelingTaskPage from "./WorkplaceLabelingTaskPage";
import {
  setAnnotations,
  setSelectedLabel,
} from "../../../store/annotator/labelling/labelingSlice";
import labelingReducer from "../../../store/annotator/labelling/labelingSlice";
import taskReducer from "../../../store/annotator/labelling/taskSlice";
import taskService from "../../../services/annotator/labeling/taskService";
import projectService from "../../../services/annotator/labeling/projectService";
import aiService from "../../../services/annotator/labeling/aiService";
import extractDetectionsFromPreviewImage from "../../../services/annotator/labeling/aiPreviewParser";

const toast = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
}));

const commentSectionMock = vi.hoisted(() => vi.fn());
const showConfirmDialog = vi.hoisted(() => vi.fn());

vi.mock("react-toastify", () => ({
  toast,
}));

vi.mock("../../../utils/appDialog", () => ({
  showConfirmDialog,
}));

vi.mock("../../../components/annotator/labeling/LabelingWorkspace", () => ({
  default: ({
    assignmentId,
    imageUrl,
    referenceAnnotations = [],
    onRunAiPreview,
    aiPreviewEnabled,
    aiDetecting,
    aiExemplarCount,
  }) => (
    <div data-testid="labeling-workspace">
      <span data-testid="workspace-assignment-id">{assignmentId}</span>
      <span data-testid="workspace-image-url">{imageUrl}</span>
      <span data-testid="workspace-reference-count">{referenceAnnotations.length}</span>
      <span data-testid="workspace-reference-labels">
        {referenceAnnotations.map((annotation) => annotation.labelName).join(",")}
      </span>
      <span data-testid="ai-exemplar-count">{aiExemplarCount}</span>
      <button
        type="button"
        onClick={() => onRunAiPreview?.()}
        disabled={!aiPreviewEnabled || aiDetecting}
      >
        workspace.aiToolbarButton
      </button>
    </div>
  ),
}));

vi.mock("../../../components/annotator/labeling/LabelToolbox", () => ({
  default: ({ allowedLabelIds = null }) => (
    <div data-testid="label-toolbox">
      {Array.isArray(allowedLabelIds) ? allowedLabelIds.join(",") : "all"}
    </div>
  ),
}));

vi.mock("../../../components/annotator/labeling/tasks/CommentSection", () => ({
  default: (props) => {
    commentSectionMock(props);
    return <div data-testid="comment-section" />;
  },
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

vi.mock("../../../services/annotator/labeling/aiService", () => ({
  default: {
    detectObjects: vi.fn(),
    getStatus: vi.fn(),
  },
}));

vi.mock("../../../services/annotator/labeling/aiPreviewParser", () => ({
  default: vi.fn(),
}));

const createStore = () =>
  configureStore({
    reducer: {
      labeling: labelingReducer,
      task: taskReducer,
    },
  });

const renderPage = (initialEntries = ["/annotator-workspace/123"]) => {
  const store = createStore();

  const view = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route
            path="/annotator-workspace/:assignmentId"
            element={<WorkplaceLabelingTaskPage />}
          />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
  return { store, ...view };
};

beforeEach(() => {
  vi.clearAllMocks();
  commentSectionMock.mockClear();
  sessionStorage.clear();
  showConfirmDialog.mockResolvedValue({ isConfirmed: true });
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
              x: 10,
              y: 20,
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
  aiService.getStatus.mockResolvedValue({
    data: {
      available: true,
      message: "AI service is ready for inference.",
      note: "First request may take 30-60 seconds due to model loading.",
    },
  });
  extractDetectionsFromPreviewImage.mockResolvedValue({
    boxes: [],
    previewBoxes: [],
    previewImageSize: null,
    targetImageSize: null,
    boxesWereRescaled: false,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("WorkplaceLabelingTaskPage", () => {
  it("opens the target image from the query string instead of defaulting to the first image", async () => {
    taskService.getProjectImages.mockResolvedValue({
      data: [
        {
          id: 1,
          dataItemId: 101,
          dataItemUrl: "https://example.com/image-1.jpg",
          status: "New",
          rejectionReason: null,
          annotationData: JSON.stringify({ annotations: [] }),
        },
        {
          id: 2,
          dataItemId: 202,
          dataItemUrl: "https://example.com/image-2.jpg",
          status: "Approved",
          rejectionReason: null,
          annotationData: JSON.stringify({ annotations: [] }),
        },
      ],
    });

    renderPage(["/annotator-workspace/123?imageId=2&dataItemId=202"]);

    await waitFor(() => {
      expect(screen.getByTestId("workspace-assignment-id")).toHaveTextContent("2");
    });
    expect(screen.getByTestId("workspace-image-url")).toHaveTextContent(
      "https://example.com/image-2.jpg",
    );
  });

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

  it("opens the batch panel immediately without waiting for draft save", async () => {
    const user = userEvent.setup();
    const pendingSave = new Promise(() => {});
    taskService.saveDraft.mockReturnValue(pendingSave);

    const { store } = renderPage();

    const batchButton = await screen.findByRole("button", {
      name: /workspace\.batchSubmit/i,
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    act(() => {
      store.dispatch(
        setAnnotations({
          assignmentId: 1,
          annotations: [
            {
              id: "ann-1",
              type: "BBOX",
              width: 10,
              height: 10,
              labelName: "Object",
            },
            {
              id: "ann-2",
              type: "BBOX",
              width: 20,
              height: 20,
              labelName: "Object",
            },
          ],
        }),
      );
    });

    await user.click(batchButton);

    expect(await screen.findByText("workspace.selectImages")).toBeInTheDocument();
    expect(taskService.saveDraft).toHaveBeenCalledTimes(1);
  });

  it("keeps the selected label while autosaving the same assignment", async () => {
    const { store } = renderPage();

    await screen.findByTestId("workspace-assignment-id");
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 600));
    });

    act(() => {
      store.dispatch(
        setSelectedLabel({
          id: 77,
          name: "Vehicle",
          color: "#22c55e",
        }),
      );
      store.dispatch(
        setAnnotations({
          assignmentId: 1,
          annotations: [
            {
              id: "ann-autosave",
              type: "BBOX",
              x: 12,
              y: 18,
              width: 26,
              height: 30,
              labelId: 77,
              labelName: "Vehicle",
              color: "#22c55e",
            },
          ],
        }),
      );
    });

    await waitFor(
      () => {
        expect(taskService.saveDraft).toHaveBeenCalled();
      },
      { timeout: 4000 },
    );

    expect(store.getState().labeling.selectedLabel?.id).toBe(77);
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

  it("hides batch submit after all images are submitted", async () => {
    const user = userEvent.setup();

    taskService.getProjectImages
      .mockResolvedValueOnce({
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
                  x: 10,
                  y: 20,
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
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 1,
            dataItemId: 101,
            dataItemUrl: "https://example.com/image-1.jpg",
            status: "Submitted",
            rejectionReason: null,
            annotationData: JSON.stringify({
              annotations: [
                {
                  id: "ann-1",
                  type: "BBOX",
                  x: 10,
                  y: 20,
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

    taskService.submitMultiple.mockResolvedValue({
      data: {
        successCount: 1,
        failureCount: 0,
        errors: [],
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

    await waitFor(() => {
      expect(
        screen.queryByRole("button", {
          name: /workspace\.batchSubmit/i,
        }),
      ).not.toBeInTheDocument();
    });
  });

  it("shows reject rounds separately from the latest reviewer votes on resolved disputes", async () => {
    taskService.getProjectImages.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          dataItemId: 101,
          dataItemUrl: "https://example.com/image-1.jpg",
          status: "Rejected",
          rejectCount: 3,
          rejectionReason: "Need tighter box",
          annotationData: JSON.stringify({
            annotations: [
              {
                id: "ann-1",
                type: "BBOX",
                x: 10,
                y: 20,
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
    taskService.getMyDisputes.mockResolvedValueOnce({
      data: [
        {
          assignmentId: 1,
          status: "Rejected",
          resolutionType: "annotator_wrong",
          rejectCount: 3,
          managerComment: "[Guideline v1.0] wrong",
          reviewerFeedbacks: [
            { verdict: "Rejected" },
            { verdict: "Rejected" },
          ],
        },
      ],
    });

    renderPage();

    expect(await screen.findByText("workspace.rejectRounds")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("workspace.latestReviewerVotes")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        commentSectionMock.mock.calls.some(
          ([props]) =>
            props.managerComment === "[Guideline v1.0] wrong" &&
            props.managerStatus === "Rejected",
        ),
      ).toBe(true);
    });
  });

  it("passes manager feedback from rejected assignments to the comment section", async () => {
    taskService.getProjectImages.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          dataItemId: 101,
          dataItemUrl: "https://example.com/image-1.jpg",
          status: "Rejected",
          rejectCount: 2,
          rejectionReason: "Need tighter box",
          managerDecision: "reject",
          managerComment: "Penalty kept after manager review",
          annotationData: JSON.stringify({
            annotations: [
              {
                id: "ann-1",
                type: "BBOX",
                x: 10,
                y: 20,
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

    renderPage();

    await waitFor(() => {
      expect(
        commentSectionMock.mock.calls.some(
          ([props]) =>
            props.rejectionReason === "Need tighter box" &&
            props.managerComment === "Penalty kept after manager review" &&
            props.managerStatus === "Rejected",
        ),
      ).toBe(true);
    });
  });

  it("passes all reviewer feedback entries to the comment section when an image has multiple reviewer rejects", async () => {
    taskService.getProjectImages.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          dataItemId: 101,
          dataItemUrl: "https://example.com/image-1.jpg",
          status: "Rejected",
          rejectCount: 2,
          rejectionReason: "Legacy fallback comment",
          annotationData: JSON.stringify({
            annotations: [
              {
                id: "ann-1",
                type: "BBOX",
                x: 10,
                y: 20,
                width: 10,
                height: 10,
                labelName: "Object",
              },
            ],
            __checklist: {},
            __defaultFlags: [],
          }),
          reviewerFeedbacks: [
            {
              reviewLogId: 11,
              reviewerId: "reviewer-1",
              reviewerName: "Reviewer One",
              comment: "Wrong class",
              errorCategories: "classification",
              reviewedAt: "2026-04-01T09:00:00.000Z",
              verdict: "Rejected",
            },
            {
              reviewLogId: 12,
              reviewerId: "reviewer-2",
              reviewerName: "Reviewer Two",
              comment: "Bounding box too loose",
              errorCategories: "bbox",
              reviewedAt: "2026-04-01T09:05:00.000Z",
              verdict: "Rejected",
            },
          ],
        },
      ],
    });

    renderPage();

    await waitFor(() => {
      expect(
        commentSectionMock.mock.calls.some(([props]) => {
          const reviewerFeedbacks = props.reviewerFeedbacks ?? [];
          return (
            reviewerFeedbacks.length === 2 &&
            reviewerFeedbacks.some(
              (feedback) =>
                feedback.sourceName === "Reviewer One" &&
                feedback.comment === "Wrong class",
            ) &&
            reviewerFeedbacks.some(
              (feedback) =>
                feedback.sourceName === "Reviewer Two" &&
                feedback.comment === "Bounding box too loose",
            )
          );
        }),
      ).toBe(true);
    });
  });

  it("hides dispute action when manager already rejected the image for resubmission", async () => {
    taskService.getProjectImages.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          dataItemId: 101,
          dataItemUrl: "https://example.com/image-1.jpg",
          status: "Rejected",
          rejectCount: 2,
          rejectionReason: "Need tighter box",
          managerDecision: "reject",
          managerComment: "Please revise and resubmit instead of disputing again",
          annotationData: JSON.stringify({
            annotations: [
              {
                id: "ann-1",
                type: "BBOX",
                x: 10,
                y: 20,
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

    renderPage();

    await screen.findByText("workspace.rejectedAlert");

    expect(
      screen.queryByRole("button", { name: /workspace\.disputeBtn/i }),
    ).not.toBeInTheDocument();
  });

  it("keeps old annotations as locked reference and submits only the rebuilt payload for edited labels", async () => {
    const user = userEvent.setup();
    sessionStorage.setItem("guideline_read_123", "true");

    projectService.getById.mockResolvedValueOnce({
      data: {
        id: 123,
        name: "Demo Project",
        labels: [
          { id: 10, name: "Vehicle v2", color: "#8b5cf6", isDefault: false, checklist: [] },
          { id: 99, name: "KeepMe", color: "#22c55e", isDefault: false, checklist: [] },
        ],
      },
    });

    taskService.getProjectImages.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          dataItemId: 101,
          dataItemUrl: "https://example.com/image-1.jpg",
          status: "Rejected",
          managerComment: "Manager updated label guidance",
          annotationData: JSON.stringify({
            annotations: [
              {
                id: "editable-vehicle-legacy",
                type: "BBOX",
                x: 14,
                y: 24,
                width: 18,
                height: 22,
                labelId: 10,
                labelName: "Vehicle",
                color: "#ef4444",
              },
            ],
            __checklist: {},
            __defaultFlags: [],
            __lockedAnnotations: [
              {
                id: "old-vehicle",
                type: "BBOX",
                x: 10,
                y: 20,
                width: 30,
                height: 40,
                labelId: 10,
                labelName: "Vehicle",
                color: "#ef4444",
              },
              {
                id: "old-keep",
                type: "BBOX",
                x: 60,
                y: 80,
                width: 25,
                height: 25,
                labelId: 99,
                labelName: "KeepMe",
                color: "#22c55e",
              },
            ],
            __relabelLabelIds: [10],
            __relabelReason: "Only the edited label must be redrawn.",
          }),
        },
      ],
    });

    const { store } = renderPage();

    expect(await screen.findByText("workspace.relabelRestrictedTitle")).toBeInTheDocument();
    expect(screen.getByTestId("label-toolbox")).toHaveTextContent("10");
    expect(screen.getByTestId("workspace-reference-count")).toHaveTextContent("1");
    expect(screen.getByTestId("workspace-reference-labels")).toHaveTextContent(
      "KeepMe",
    );
    expect(store.getState().labeling.selectedLabel?.name).toBe("Vehicle v2");
    expect(store.getState().labeling.annotationsByAssignment[1]).toEqual([]);

    act(() => {
      store.dispatch(
        setAnnotations({
          assignmentId: 1,
          annotations: [
            {
              id: "new-vehicle",
              type: "BBOX",
              x: 100,
              y: 120,
              width: 35,
              height: 45,
              labelId: 10,
              labelName: "Vehicle v2",
              color: "#8b5cf6",
            },
          ],
        }),
      );
    });

    const submitButton = await screen.findByRole("button", {
      name: /workspace\.resubmit/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(taskService.submitTask).toHaveBeenCalledTimes(1);
    });

    const submitPayload = taskService.submitTask.mock.calls[0][0];
    const parsedPayload = JSON.parse(submitPayload.dataJSON);

    expect(parsedPayload.__lockedAnnotations).toBeUndefined();
    expect(parsedPayload.__relabelLabelIds).toBeUndefined();
    expect(parsedPayload.annotations).toHaveLength(2);
    expect(
      parsedPayload.annotations.some((annotation) => annotation.labelId === 99),
    ).toBe(true);
    expect(
      parsedPayload.annotations.some((annotation) => annotation.id === "new-vehicle"),
    ).toBe(true);
  });

  it("keeps newly redrawn restricted-label annotations after fetching the page again", async () => {
    sessionStorage.setItem("guideline_read_123", "true");

    projectService.getById.mockResolvedValueOnce({
      data: {
        id: 123,
        name: "Demo Project",
        labels: [
          { id: 10, name: "Vehicle v2", color: "#8b5cf6", isDefault: false, checklist: [] },
          { id: 99, name: "KeepMe", color: "#22c55e", isDefault: false, checklist: [] },
        ],
      },
    });

    taskService.getProjectImages.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          dataItemId: 101,
          dataItemUrl: "https://example.com/image-1.jpg",
          status: "Rejected",
          managerComment: "Relabel the updated class only",
          annotationData: JSON.stringify({
            annotations: [
              {
                id: "new-vehicle-after-reload",
                type: "BBOX",
                x: 100,
                y: 120,
                width: 35,
                height: 45,
                labelId: 10,
                labelName: "Vehicle v2",
                color: "#8b5cf6",
              },
            ],
            __checklist: {},
            __defaultFlags: [],
            __lockedAnnotations: [
              {
                id: "old-keep",
                type: "BBOX",
                x: 60,
                y: 80,
                width: 25,
                height: 25,
                labelId: 99,
                labelName: "KeepMe",
                color: "#22c55e",
              },
            ],
            __relabelLabelIds: [10],
            __relabelReason: "Only the edited label must be redrawn.",
          }),
        },
      ],
    });

    const { store } = renderPage();

    await screen.findByText("workspace.relabelRestrictedTitle");

    expect(screen.getByTestId("workspace-reference-count")).toHaveTextContent("1");
    expect(screen.getByTestId("workspace-reference-labels")).toHaveTextContent(
      "KeepMe",
    );
    await waitFor(() => {
      expect(store.getState().labeling.annotationsByAssignment[1]).toEqual([
        expect.objectContaining({
          id: "new-vehicle-after-reload",
          labelId: 10,
          labelName: "Vehicle v2",
        }),
      ]);
    });
  });

  it("disables AI preview when there are no valid exemplar annotations", async () => {
    taskService.getProjectImages.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          dataItemId: 101,
          dataItemUrl: "https://example.com/image-1.jpg",
          status: "New",
          rejectionReason: null,
          annotationData: JSON.stringify({
            annotations: [],
            __checklist: {},
            __defaultFlags: [],
          }),
        },
      ],
    });

    renderPage();

    const aiButton = await screen.findByRole("button", {
      name: /workspace\.aiToolbarButton/i,
    });

    expect(aiButton).toBeDisabled();
    expect(aiService.detectObjects).not.toHaveBeenCalled();
  });

  it("runs AI preview and renders the returned preview image", async () => {
    const user = userEvent.setup();
    extractDetectionsFromPreviewImage.mockResolvedValueOnce({
      boxes: [
        { xmin: 30, ymin: 40, xmax: 60, ymax: 80 },
        { xmin: 90, ymin: 50, xmax: 120, ymax: 95 },
      ],
      previewBoxes: [
        { xmin: 15, ymin: 20, xmax: 30, ymax: 40 },
        { xmin: 45, ymin: 25, xmax: 60, ymax: 48 },
      ],
      previewImageSize: { width: 160, height: 100 },
      targetImageSize: { width: 320, height: 200 },
      boxesWereRescaled: true,
    });
    aiService.detectObjects.mockResolvedValueOnce({
      data: {
        count: 4,
        resultImageUrl: "https://example.com/ai-preview.jpg",
        diagnostics: {
          providerRequestSubmitted: true,
          providerResultReceived: true,
          completeEventReceived: true,
          previewImageReturned: true,
          rawDetectionStateReturned: false,
          rawDetectionsReturned: false,
          predictEndpoint: "/gradio_api/call/initial_process",
          outputItemsCount: 2,
          resultSource: "preview_image_only",
        },
        processingTimeMs: 4200,
        thresholdUsed: 0.33,
        message: "Detected 4 objects.",
      },
    });

    const { store } = renderPage();

    const aiButton = await screen.findByRole("button", {
      name: /workspace\.aiToolbarButton/i,
    });
    await user.click(aiButton);

    await waitFor(() => {
      expect(aiService.detectObjects).toHaveBeenCalledWith({
        assignmentId: 1,
        imageUrl: "https://example.com/image-1.jpg",
        exemplars: [
          {
            xmin: 10,
            ymin: 20,
            xmax: 20,
            ymax: 30,
            label: "Object",
          },
        ],
        threshold: 0.33,
        enableMask: false,
      });
    });

    expect(await screen.findByTestId("ai-preview-image")).toBeInTheDocument();
    expect(screen.getByText("Detected 4 objects.")).toBeInTheDocument();
    expect(screen.getByText("workspace.aiDiagnosticsTitle")).toBeInTheDocument();
    expect(screen.getByText("workspace.aiDiagnosticsPreviewOnly")).toBeInTheDocument();
    expect(screen.getByText("workspace.aiPreviewCoordinatesRescaled")).toBeInTheDocument();
    expect(store.getState().labeling.annotationsByAssignment[1]).toHaveLength(3);
    expect(
      store.getState().labeling.annotationsByAssignment[1].filter(
        (annotation) => annotation.aiGenerated,
      ),
    ).toHaveLength(2);
    expect(toast.success).toHaveBeenCalledWith("workspace.aiBoxesInserted");
  });

  it("prefers raw detections returned from the backend over preview parsing", async () => {
    const user = userEvent.setup();
    aiService.detectObjects.mockResolvedValueOnce({
      data: {
        count: 2,
        detections: [
          { xmin: 31, ymin: 41, xmax: 61, ymax: 81, confidence: 0.92 },
          { xmin: 91, ymin: 51, xmax: 121, ymax: 96, confidence: 0.88 },
        ],
        resultImageUrl: "https://example.com/ai-preview-raw.jpg",
        diagnostics: {
          providerRequestSubmitted: true,
          providerResultReceived: true,
          completeEventReceived: true,
          previewImageReturned: true,
          rawDetectionStateReturned: true,
          rawDetectionsReturned: true,
          predictEndpoint: "/gradio_api/call/initial_process",
          outputItemsCount: 8,
          resultSource: "raw_detections",
        },
        processingTimeMs: 1800,
        thresholdUsed: 0.33,
        message: "Detected 2 objects.",
      },
    });

    const { store } = renderPage();

    const aiButton = await screen.findByRole("button", {
      name: /workspace\.aiToolbarButton/i,
    });
    await user.click(aiButton);

    expect(await screen.findByTestId("ai-preview-image")).toBeInTheDocument();
    expect(screen.getByText("workspace.aiRawCoordinatesUsed")).toBeInTheDocument();
    expect(screen.getByText("workspace.aiDiagnosticsRawReturned")).toBeInTheDocument();
    expect(extractDetectionsFromPreviewImage).not.toHaveBeenCalled();
    expect(
      store.getState().labeling.annotationsByAssignment[1].filter(
        (annotation) => annotation.aiGenerated,
      ),
    ).toHaveLength(2);
  });

  it("uses the adjusted AI threshold when running preview", async () => {
    const user = userEvent.setup();
    extractDetectionsFromPreviewImage.mockResolvedValueOnce({
      boxes: [],
      previewBoxes: [],
      previewImageSize: null,
      targetImageSize: null,
      boxesWereRescaled: false,
    });
    aiService.detectObjects.mockResolvedValueOnce({
      data: {
        count: 2,
        resultImageUrl: "https://example.com/ai-preview-threshold.jpg",
        processingTimeMs: 2100,
        thresholdUsed: 0.15,
        message: "Detected 2 objects.",
      },
    });

    renderPage();

    const thresholdInput = await screen.findByLabelText(
      /workspace\.aiThresholdLabel/i,
    );
    fireEvent.change(thresholdInput, { target: { value: "0.15" } });

    const aiButton = await screen.findByRole("button", {
      name: /workspace\.aiToolbarButton/i,
    });
    await user.click(aiButton);

    await waitFor(() => {
      expect(aiService.detectObjects).toHaveBeenCalledWith({
        assignmentId: 1,
        imageUrl: "https://example.com/image-1.jpg",
        exemplars: [
          {
            xmin: 10,
            ymin: 20,
            xmax: 20,
            ymax: 30,
            label: "Object",
          },
        ],
        threshold: 0.15,
        enableMask: false,
      });
    });
  });

  it("keeps the AI preview as preview-only when count is zero but the image still has highlighted regions", async () => {
    const user = userEvent.setup();
    extractDetectionsFromPreviewImage.mockResolvedValueOnce({
      boxes: [
        { xmin: 60, ymin: 80, xmax: 120, ymax: 160 },
      ],
      previewBoxes: [
        { xmin: 30, ymin: 40, xmax: 60, ymax: 80 },
      ],
      previewImageSize: { width: 160, height: 100 },
      targetImageSize: { width: 320, height: 200 },
      boxesWereRescaled: true,
    });
    aiService.detectObjects.mockResolvedValueOnce({
      data: {
        count: 0,
        resultImageUrl: "https://example.com/ai-preview-fallback.jpg",
        diagnostics: {
          providerRequestSubmitted: true,
          providerResultReceived: true,
          completeEventReceived: true,
          previewImageReturned: true,
          rawDetectionStateReturned: false,
          rawDetectionsReturned: false,
          predictEndpoint: "/gradio_api/call/initial_process",
          outputItemsCount: 2,
          resultSource: "preview_image_only",
        },
        processingTimeMs: 1700,
        thresholdUsed: 0.25,
        thresholdAttempts: [0.33, 0.25],
        message: "No objects detected.",
      },
    });

    const { store } = renderPage();

    const aiButton = await screen.findByRole("button", {
      name: /workspace\.aiToolbarButton/i,
    });
    await user.click(aiButton);

    await waitFor(() => {
      expect(aiService.detectObjects).toHaveBeenCalledTimes(1);
    });

    expect(aiService.detectObjects).toHaveBeenCalledWith({
      assignmentId: 1,
      imageUrl: "https://example.com/image-1.jpg",
      exemplars: [
        {
          xmin: 10,
          ymin: 20,
          xmax: 20,
          ymax: 30,
          label: "Object",
        },
      ],
      threshold: 0.33,
      enableMask: false,
    });

    expect(await screen.findByText("workspace.aiPreviewNoRawCoordinates")).toBeInTheDocument();
    expect(screen.getByText("workspace.aiPreviewCoordinateUnavailableHelp")).toBeInTheDocument();
    expect(screen.getByText("workspace.aiDiagnosticsPreviewOnly")).toBeInTheDocument();
    expect(screen.getByText("workspace.aiThresholdAutoAdjusted")).toBeInTheDocument();
    expect(
      store.getState().labeling.annotationsByAssignment[1].filter(
        (annotation) => annotation.aiGenerated,
      ),
    ).toHaveLength(0);
    expect(toast.success).toHaveBeenCalledWith("workspace.aiPreviewLoaded");
  });

  it("removes inserted AI boxes from the canvas", async () => {
    const user = userEvent.setup();
    extractDetectionsFromPreviewImage.mockResolvedValueOnce({
      boxes: [
        { xmin: 30, ymin: 40, xmax: 60, ymax: 80 },
      ],
      previewBoxes: [
        { xmin: 30, ymin: 40, xmax: 60, ymax: 80 },
      ],
      previewImageSize: { width: 200, height: 120 },
      targetImageSize: { width: 200, height: 120 },
      boxesWereRescaled: false,
    });
    aiService.detectObjects.mockResolvedValueOnce({
      data: {
        count: 1,
        resultImageUrl: "https://example.com/ai-preview-remove.jpg",
        processingTimeMs: 900,
        thresholdUsed: 0.33,
        message: "Detected 1 object.",
      },
    });

    const { store } = renderPage();

    const aiButton = await screen.findByRole("button", {
      name: /workspace\.aiToolbarButton/i,
    });
    await user.click(aiButton);

    const clearAiBoxesButton = await screen.findByRole("button", {
      name: /workspace\.aiClearInsertedBoxes/i,
    });
    await user.click(clearAiBoxesButton);

    expect(
      store.getState().labeling.annotationsByAssignment[1].filter(
        (annotation) => annotation.aiGenerated,
      ),
    ).toHaveLength(0);
    expect(toast.info).toHaveBeenCalledWith("workspace.aiInsertedBoxesCleared");
  });

  it("shows the backend error when AI preview fails", async () => {
    const user = userEvent.setup();
    aiService.detectObjects.mockRejectedValueOnce({
      response: {
        data: {
          message: "HF Space is warming up.",
        },
      },
    });

    renderPage();

    const aiButton = await screen.findByRole("button", {
      name: /workspace\.aiToolbarButton/i,
    });
    await user.click(aiButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("HF Space is warming up.");
    });
  });
});
