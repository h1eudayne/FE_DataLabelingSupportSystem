import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import WorkplaceLabelingTaskPage from "./WorkplaceLabelingTaskPage";
import { setAnnotations } from "../../../store/annotator/labelling/labelingSlice";
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

vi.mock("react-toastify", () => ({
  toast,
}));

vi.mock("../../../components/annotator/labeling/LabelingWorkspace", () => ({
  default: ({
    onRunAiPreview,
    aiPreviewEnabled,
    aiDetecting,
    aiExemplarCount,
  }) => (
    <div data-testid="labeling-workspace">
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

const renderPage = () => {
  const store = createStore();

  const view = render(
    <Provider store={store}>
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
  return { store, ...view };
};

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

    expect(await screen.findByText("Reject rounds:")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Latest reviewer votes:")).toBeInTheDocument();
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
