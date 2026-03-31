import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import LabelingWorkspace from "../../../components/annotator/labeling/LabelingWorkspace";
import LabelToolbox from "../../../components/annotator/labeling/LabelToolbox";

import CommentSection from "../../../components/annotator/labeling/tasks/CommentSection";

import {
  setAnnotations,
  setSelectedLabel,
  setChecklistState,
  resetChecklist,
  removeAnnotation,
  setDefaultFlags,
  toggleDefaultFlag,
} from "../../../store/annotator/labelling/labelingSlice";

import { setCurrentTask } from "../../../store/annotator/labelling/taskSlice";

import taskService from "../../../services/annotator/labeling/taskService";
import projectService from "../../../services/annotator/labeling/projectService";
import aiService from "../../../services/annotator/labeling/aiService";
import extractDetectionsFromPreviewImage from "../../../services/annotator/labeling/aiPreviewParser";
import { resolveBackendAssetUrl } from "../../../config/runtime";

const STATUS_CLASSES = {
  New: "stitch-ws-badge stitch-ws-badge-new",
  InProgress: "stitch-ws-badge stitch-ws-badge-inprogress",
  Rejected: "stitch-ws-badge stitch-ws-badge-rejected",
  Submitted: "stitch-ws-badge stitch-ws-badge-submitted",
  Approved: "stitch-ws-badge stitch-ws-badge-approved",
};

const STATUS_LABEL_KEYS = {
  New: "workspace.statusNew",
  InProgress: "workspace.statusInProgress",
  Rejected: "workspace.statusRejected",
  Submitted: "workspace.statusSubmitted",
  Approved: "workspace.statusApproved",
};

const STATUS_CONFIG = {
  New: {
    cls: STATUS_CLASSES.New,
    labelKey: STATUS_LABEL_KEYS.New,
  },
  InProgress: {
    cls: STATUS_CLASSES.InProgress,
    labelKey: STATUS_LABEL_KEYS.InProgress,
  },
  Rejected: {
    cls: STATUS_CLASSES.Rejected,
    labelKey: STATUS_LABEL_KEYS.Rejected,
  },
  Submitted: {
    cls: STATUS_CLASSES.Submitted,
    labelKey: STATUS_LABEL_KEYS.Submitted,
  },
  Approved: {
    cls: STATUS_CLASSES.Approved,
    labelKey: STATUS_LABEL_KEYS.Approved,
  },
};

const EMPTY_ARRAY = [];
const EMPTY_OBJECT = {};
const MAX_AI_EXEMPLARS = 3;
const DEFAULT_AI_THRESHOLD = 0.33;
const MIN_AI_THRESHOLD = 0.05;
const MAX_AI_THRESHOLD = 0.95;
const AI_THRESHOLD_STEP = 0.01;

const clampAiThreshold = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return DEFAULT_AI_THRESHOLD;
  }

  return Math.min(MAX_AI_THRESHOLD, Math.max(MIN_AI_THRESHOLD, parsed));
};

const normalizeAiThresholdAttempts = (thresholdAttempts, fallbackThreshold) => {
  const normalized = Array.isArray(thresholdAttempts)
    ? thresholdAttempts
        .map((value) => Number(clampAiThreshold(value).toFixed(2)))
        .filter(Number.isFinite)
    : [];

  if (normalized.length === 0) {
    return [Number(clampAiThreshold(fallbackThreshold).toFixed(2))];
  }

  return normalized.filter((value, index) => normalized.indexOf(value) === index);
};

const normalizeAiDiagnostics = (diagnostics) => {
  if (!diagnostics || typeof diagnostics !== "object") {
    return null;
  }

  return {
    providerRequestSubmitted: Boolean(diagnostics.providerRequestSubmitted),
    providerResultReceived: Boolean(diagnostics.providerResultReceived),
    completeEventReceived: Boolean(diagnostics.completeEventReceived),
    previewImageReturned: Boolean(diagnostics.previewImageReturned),
    rawDetectionStateReturned: Boolean(diagnostics.rawDetectionStateReturned),
    rawDetectionsReturned: Boolean(diagnostics.rawDetectionsReturned),
    providerUrl:
      typeof diagnostics.providerUrl === "string" ? diagnostics.providerUrl : "",
    predictEndpoint:
      typeof diagnostics.predictEndpoint === "string"
        ? diagnostics.predictEndpoint
        : "",
    eventId: typeof diagnostics.eventId === "string" ? diagnostics.eventId : "",
    outputItemsCount: Number.isFinite(Number(diagnostics.outputItemsCount))
      ? Number(diagnostics.outputItemsCount)
      : 0,
    resultSource:
      typeof diagnostics.resultSource === "string"
        ? diagnostics.resultSource
        : "",
  };
};

const buildAiDiagnosticsNote = (diagnostics, t) => {
  if (!diagnostics?.providerResultReceived) {
    return "";
  }

  if (diagnostics.rawDetectionsReturned) {
    return t("workspace.aiDiagnosticsRawReturned");
  }

  if (diagnostics.previewImageReturned) {
    return t("workspace.aiDiagnosticsPreviewOnly");
  }

  return t("workspace.aiDiagnosticsNoUsableOutput");
};

const normalizeBackendDetections = (detections) => {
  if (!Array.isArray(detections)) {
    return [];
  }

  return detections
    .map((detection) => {
      const xmin = Number(detection?.xmin);
      const ymin = Number(detection?.ymin);
      const xmax = Number(detection?.xmax);
      const ymax = Number(detection?.ymax);

      if (
        !Number.isFinite(xmin) ||
        !Number.isFinite(ymin) ||
        !Number.isFinite(xmax) ||
        !Number.isFinite(ymax) ||
        xmax <= xmin ||
        ymax <= ymin
      ) {
        return null;
      }

      return {
        xmin: Math.round(xmin),
        ymin: Math.round(ymin),
        xmax: Math.round(xmax),
        ymax: Math.round(ymax),
        confidence: Number.isFinite(Number(detection?.confidence))
          ? Number(detection.confidence)
          : null,
      };
    })
    .filter(Boolean);
};

const toAiExemplar = (annotation) => {
  if (!annotation) return null;

  if (Array.isArray(annotation.points) && annotation.points.length > 0) {
    const xs = annotation.points
      .map((point) => Number(point?.x))
      .filter(Number.isFinite);
    const ys = annotation.points
      .map((point) => Number(point?.y))
      .filter(Number.isFinite);

    if (xs.length === 0 || ys.length === 0) {
      return null;
    }

    const xmin = Math.round(Math.min(...xs));
    const ymin = Math.round(Math.min(...ys));
    const xmax = Math.round(Math.max(...xs));
    const ymax = Math.round(Math.max(...ys));

    if (xmax <= xmin || ymax <= ymin) {
      return null;
    }

    return {
      xmin,
      ymin,
      xmax,
      ymax,
      label: annotation.labelName || null,
      labelId: annotation.labelId || null,
      color: annotation.color || null,
    };
  }

  const x = Number(annotation.x);
  const y = Number(annotation.y);
  const width = Number(annotation.width);
  const height = Number(annotation.height);

  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height)
  ) {
    return null;
  }

  const xmin = Math.round(Math.min(x, x + width));
  const ymin = Math.round(Math.min(y, y + height));
  const xmax = Math.round(Math.max(x, x + width));
  const ymax = Math.round(Math.max(y, y + height));

  if (xmax <= xmin || ymax <= ymin) {
    return null;
  }

  return {
    xmin,
    ymin,
    xmax,
    ymax,
    label: annotation.labelName || null,
    labelId: annotation.labelId || null,
    color: annotation.color || null,
  };
};

const normalizeBatchErrors = (value) => {
  if (Array.isArray(value)) {
    return value.filter(
      (message) => typeof message === "string" && message.trim().length > 0,
    );
  }

  if (typeof value === "string" && value.trim()) {
    return [value];
  }

  if (
    value &&
    typeof value === "object" &&
    typeof value.message === "string" &&
    value.message.trim()
  ) {
    return [value.message];
  }

  return [];
};

const WorkplaceLabelingTaskPage = () => {
  const { t } = useTranslation();
  const { assignmentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [images, setImages] = useState([]);
  const [labels, setLabels] = useState([]);
  const [projectInfo, setProjectInfo] = useState(null);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [guidelineRead, setGuidelineRead] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBatchPanel, setShowBatchPanel] = useState(false);
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [goingBack, setGoingBack] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeSubmitting, setDisputeSubmitting] = useState(false);
  const [disputeStatus, setDisputeStatus] = useState(null);
  const [disputeResult, setDisputeResult] = useState(null);

  const [highlightedAnnotationId, setHighlightedAnnotationId] = useState(null);
  const [collapsedPanels, setCollapsedPanels] = useState(new Set());
  const [aiDetecting, setAiDetecting] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);
  const [aiThreshold, setAiThreshold] = useState(DEFAULT_AI_THRESHOLD);
  const [aiStatus, setAiStatus] = useState({
    loading: true,
    available: null,
    message: "",
    note: "",
  });

  const togglePanel = (panelName) => {
    setCollapsedPanels((prev) => {
      const next = new Set(prev);
      if (next.has(panelName)) next.delete(panelName);
      else next.add(panelName);
      return next;
    });
  };
  const [saveStatus, setSaveStatus] = useState("saved");
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const isDirtyRef = React.useRef(false);
  const aiPanelRef = React.useRef(null);

  const currentImage = images[currentImgIndex];

  const allAnnotations = useSelector(
    (state) => state.labeling.annotationsByAssignment || EMPTY_OBJECT,
  );

  const allChecklistStates = useSelector(
    (state) => state.labeling.checklistByAssignment || EMPTY_OBJECT,
  );

  const allDefaultFlags = useSelector(
    (state) => state.labeling.defaultFlagsByAssignment || EMPTY_OBJECT,
  );

  const annotations = useSelector(
    (state) =>
      state.labeling.annotationsByAssignment[currentImage?.id] || EMPTY_ARRAY,
  );

  const checklistState = useSelector(
    (state) =>
      state.labeling.checklistByAssignment[currentImage?.id] || EMPTY_OBJECT,
  );

  const currentDefaultFlags = useSelector(
    (state) =>
      state.labeling.defaultFlagsByAssignment[currentImage?.id] || EMPTY_ARRAY,
  );

  const aiExemplars = useMemo(() => {
    const prioritizedAnnotations = [...annotations].sort((left, right) => {
      if (left.id === highlightedAnnotationId) return -1;
      if (right.id === highlightedAnnotationId) return 1;
      return 0;
    });

    const normalized = prioritizedAnnotations
      .map((annotation) => toAiExemplar(annotation))
      .filter(Boolean);

    if (normalized.length === 0) {
      return [];
    }

    const primaryExemplar = normalized[0];
    const primaryLabelKey = primaryExemplar.labelId ?? primaryExemplar.label ?? "";

    return normalized
      .filter((exemplar) => (exemplar.labelId ?? exemplar.label ?? "") === primaryLabelKey)
      .slice(0, MAX_AI_EXEMPLARS);
  }, [annotations, highlightedAnnotationId]);

  const unlockedLabelIds = useMemo(() => {
    const ids = new Set();
    labels.forEach((label) => {
      const items = label.checklist || [];
      if (items.length === 0) {
        ids.add(label.id);
        return;
      }
      const checked = checklistState[label.id] || [];
      const allChecked = items.every((_, idx) => checked[idx] === true);
      if (allChecked) {
        ids.add(label.id);
      }
    });
    return ids;
  }, [labels, checklistState]);

  const getErrorMessage = useCallback((err, fallbackMessage) => {
    const responseData = err?.response?.data;

    if (typeof responseData?.message === "string" && responseData.message.trim()) {
      return responseData.message;
    }

    if (typeof responseData === "string" && responseData.trim()) {
      return responseData;
    }

    if (typeof err?.message === "string" && err.message.trim()) {
      return err.message;
    }

    return fallbackMessage;
  }, []);

  const buildAiAnnotations = useCallback(
    (detectedBoxes) => {
      if (!currentImage || !aiExemplars.length) {
        return [];
      }

      const primaryExemplar = aiExemplars[0];
      const batchId = `ai-${currentImage.id}-${Date.now()}`;

      return detectedBoxes.map((box, index) => ({
        id: `${batchId}-${index}`,
        assignmentId: currentImage.id,
        labelId: primaryExemplar.labelId,
        labelName: primaryExemplar.label || t("workspace.aiGeneratedLabel"),
        color: primaryExemplar.color || "#F59E0B",
        type: "BBOX",
        x: box.xmin,
        y: box.ymin,
        width: Math.max(1, box.xmax - box.xmin),
        height: Math.max(1, box.ymax - box.ymin),
        aiGenerated: true,
        aiBatchId: batchId,
      }));
    },
    [aiExemplars, currentImage, t],
  );

  const replaceAiAnnotationsInCanvas = useCallback(
    (detectedBoxes) => {
      if (!currentImage) {
        return 0;
      }

      const manualAnnotations = annotations.filter((annotation) => !annotation.aiGenerated);
      const generatedAnnotations = buildAiAnnotations(detectedBoxes);

      dispatch(
        setAnnotations({
          assignmentId: currentImage.id,
          annotations: [...manualAnnotations, ...generatedAnnotations],
        }),
      );

      return generatedAnnotations.length;
    },
    [annotations, buildAiAnnotations, currentImage, dispatch],
  );

  const handleClearAiInsertedBoxes = useCallback(() => {
    if (!currentImage) {
      return;
    }

    const remainingAnnotations = annotations.filter((annotation) => !annotation.aiGenerated);
    const removedCount = annotations.length - remainingAnnotations.length;

    dispatch(
      setAnnotations({
        assignmentId: currentImage.id,
        annotations: remainingAnnotations,
      }),
    );

    setAiPreview((prev) =>
      prev
        ? {
            ...prev,
            appliedCount: 0,
            detections: [],
            extractionNote: "",
          }
        : prev,
    );

    if (removedCount > 0) {
      toast.info(t("workspace.aiInsertedBoxesCleared", { count: removedCount }));
    }
  }, [annotations, currentImage, dispatch, t]);

  const hasValidAnnotations = useCallback((annotationData) => {
    if (!annotationData) return false;
    try {
      const parsed = JSON.parse(annotationData);
      if (parsed && parsed.__defaultFlags && parsed.__defaultFlags.length > 0) {
        return true;
      }
      if (parsed && parsed.annotations) {
        return parsed.annotations.length > 0;
      }
      if (Array.isArray(parsed)) {
        return parsed.length > 0;
      }
    } catch {
      return false;
    }
    return false;
  }, []);

  const buildDataJSONForAssignment = useCallback(
    (assignmentId, fallbackDataJSON = "") => {
      const assignmentAnnotations = allAnnotations[assignmentId];
      const assignmentChecklist = allChecklistStates[assignmentId];
      const assignmentFlags = allDefaultFlags[assignmentId];
      const hasLocalState =
        assignmentAnnotations !== undefined ||
        assignmentChecklist !== undefined ||
        assignmentFlags !== undefined;

      if (!hasLocalState) {
        return fallbackDataJSON || "";
      }

      return JSON.stringify({
        annotations: assignmentAnnotations || [],
        __checklist: assignmentChecklist || {},
        __defaultFlags: assignmentFlags || [],
      });
    },
    [allAnnotations, allChecklistStates, allDefaultFlags],
  );

  const batchImageEntries = useMemo(
    () =>
      images.map((img, idx) => {
        const reduxAnns = allAnnotations[img.id];
        const reduxFlags = allDefaultFlags[img.id];
        const isEligible =
          img.status !== "Submitted" && img.status !== "Approved";
        const hasData =
          hasValidAnnotations(img.annotationData) ||
          Boolean(reduxAnns?.length) ||
          Boolean(reduxFlags?.length);

        return {
          img,
          idx,
          config: STATUS_CONFIG[img.status] || STATUS_CONFIG.New,
          hasData,
          isEligible,
          isSelectable: isEligible && hasData,
        };
      }),
    [images, allAnnotations, allDefaultFlags, hasValidAnnotations],
  );

  const selectableBatchIds = useMemo(
    () =>
      batchImageEntries
        .filter((entry) => entry.isSelectable)
        .map((entry) => entry.img.id),
    [batchImageEntries],
  );

  const selectableBatchIdSet = useMemo(
    () => new Set(selectableBatchIds),
    [selectableBatchIds],
  );

  const selectedBatchIds = useMemo(
    () => selectableBatchIds.filter((id) => selectedIds.has(id)),
    [selectableBatchIds, selectedIds],
  );

  const selectedBatchIdSet = useMemo(
    () => new Set(selectedBatchIds),
    [selectedBatchIds],
  );

  const allSelectableSelected =
    selectableBatchIds.length > 0 &&
    selectedBatchIds.length === selectableBatchIds.length;

  const aiStatusBadge = aiStatus.loading
    ? {
        className: "stitch-ws-badge stitch-ws-badge-inprogress",
        label: t("workspace.aiStatusChecking"),
      }
    : aiStatus.available
      ? {
          className: "stitch-ws-badge stitch-ws-badge-approved",
          label: t("workspace.aiStatusReady"),
        }
      : {
          className: "stitch-ws-badge stitch-ws-badge-rejected",
          label: t("workspace.aiStatusCold"),
        };

  const refreshAiStatus = useCallback(async () => {
    setAiStatus((prev) => ({ ...prev, loading: true }));

    try {
      const response = await aiService.getStatus();
      const statusData = response?.data || response || {};

      setAiStatus({
        loading: false,
        available:
          typeof statusData.available === "boolean"
            ? statusData.available
            : null,
        message:
          statusData.message ||
          t("workspace.aiStatusUnavailable"),
        note: statusData.note || "",
      });
    } catch (err) {
      console.error("AI status check failed:", err);
      setAiStatus({
        loading: false,
        available: null,
        message: t("workspace.aiStatusUnavailable"),
        note: "",
      });
    }
  }, [t]);


  useEffect(() => {
    window.scrollTo(0, 0);
  }, [assignmentId]);

  useEffect(() => {
    void refreshAiStatus();
  }, [refreshAiStatus]);

  useEffect(() => {
    setSelectedIds((prev) => {
      let changed = false;
      const next = new Set();

      prev.forEach((id) => {
        if (selectableBatchIdSet.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [selectableBatchIdSet]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [projectRes, imgRes] = await Promise.all([
          projectService.getById(assignmentId),
          taskService.getProjectImages(assignmentId),
        ]);

        const projectData = projectRes?.data || projectRes;
        setProjectInfo(projectData);
        setLabels(projectData?.labels || []);

        let allImages = imgRes?.data;
        if (Array.isArray(imgRes)) {
          allImages = imgRes;
        } else if (imgRes?.data && Array.isArray(imgRes.data)) {
          allImages = imgRes.data;
        } else {
          allImages = [];
        }

        if (!Array.isArray(allImages)) {
          allImages = [];
        }

        const packStart = parseInt(searchParams.get("packStart"), 10);
        const packEnd = parseInt(searchParams.get("packEnd"), 10);

        let sliced;
        if (!isNaN(packStart) && !isNaN(packEnd) && packEnd > packStart) {
          sliced = allImages.slice(packStart, packEnd);
        } else {
          sliced = allImages;
        }

        const sortedSlice = [...sliced].sort((a, b) => {
          const priority = {
            New: 1,
            InProgress: 2,
            Rejected: 3,
            Submitted: 4,
            Approved: 5,
          };
          return (priority[a.status] || 99) - (priority[b.status] || 99);
        });

        setImages(sortedSlice);

        const sessionKey = `guideline_read_${assignmentId}`;
        if (sessionStorage.getItem(sessionKey)) {
          setGuidelineRead(true);
        }
      } catch (err) {
        console.error(err);
        toast.error(t("workspace.loadError"));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assignmentId]);

  useEffect(() => {
    if (!currentImage) return;

    setAiPreview(null);

    dispatch(setSelectedLabel(null));
    dispatch(setCurrentTask(currentImage));

    let parsedAnnotations = [];
    let parsedChecklist = {};
    let parsedDefaultFlags = [];
    try {
      if (currentImage.annotationData) {
        const parsed = JSON.parse(currentImage.annotationData);
        if (parsed && parsed.__checklist) {
          parsedAnnotations = parsed.annotations || [];
          parsedChecklist = parsed.__checklist || {};
          parsedDefaultFlags = parsed.__defaultFlags || [];
        } else if (Array.isArray(parsed)) {
          parsedAnnotations = parsed;
        }
      }
    } catch (e) {
      console.error(e);
    }

    dispatch(
      setAnnotations({
        assignmentId: currentImage.id,
        annotations: parsedAnnotations,
      }),
    );

    dispatch(
      setDefaultFlags({
        assignmentId: currentImage.id,
        flags: parsedDefaultFlags,
      }),
    );

    if (Object.keys(parsedChecklist).length > 0) {
      dispatch(
        setChecklistState({
          assignmentId: currentImage.id,
          checklistData: parsedChecklist,
        }),
      );
    } else {
      dispatch(resetChecklist({ assignmentId: currentImage.id }));
    }
  }, [currentImage?.id, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(setSelectedLabel(null));
    };
  }, [dispatch]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable;
      if (isInput) return;

      if (!e.shiftKey) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentImgIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentImgIndex((prev) => Math.min(images.length - 1, prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [images.length]);

  useEffect(() => {
    setIsInitialLoad(true);
    const timer = setTimeout(() => setIsInitialLoad(false), 500);
    return () => clearTimeout(timer);
  }, [currentImgIndex]);

  useEffect(() => {
    if (isInitialLoad || !currentImage) return;
    if (
      currentImage.status === "Submitted" ||
      currentImage.status === "Approved"
    )
      return;

    isDirtyRef.current = true;
    setSaveStatus("unsaved");

    const timer = setTimeout(() => {
      saveDraft(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [annotations, checklistState, currentDefaultFlags]);

  const buildDataJSON = useCallback(() => {
    if (!currentImage) return "";

    return buildDataJSONForAssignment(
      currentImage.id,
      currentImage.annotationData || "",
    );
  }, [currentImage, buildDataJSONForAssignment]);

  const saveDraft = useCallback(
    async (silent = false) => {
      if (!currentImage) return false;

      setSaveStatus("saving");
      try {
        const dataJSON = buildDataJSON();

        await taskService.saveDraft({
          assignmentId: currentImage.id,
          dataJSON,
        });

        setImages((prev) =>
          prev.map((img) =>
            img.id === currentImage.id
              ? {
                ...img,
                annotationData: dataJSON,
                status: img.status === "New" ? "InProgress" : img.status,
              }
              : img,
          ),
        );

        isDirtyRef.current = false;
        setSaveStatus("saved");
        setLastSavedTime(new Date());
        if (!silent) toast.success(t("workspace.draftSaved"));
        return true;
      } catch (err) {
        console.error(err);
        setSaveStatus("unsaved");
        toast.error(t("workspace.draftFailed"));
        return false;
      }
    },
    [currentImage, buildDataJSON],
  );

  const handleClearAiPreview = useCallback(() => {
    setAiPreview(null);
  }, []);

  const handleRunAiPreview = useCallback(async () => {
    if (!currentImage) return;

    if (aiExemplars.length === 0) {
      toast.warning(t("workspace.aiNeedExemplars"));
      return;
    }

    setCollapsedPanels((prev) => {
      if (!prev.has("ai")) return prev;
      const next = new Set(prev);
      next.delete("ai");
      return next;
    });
    requestAnimationFrame(() => {
      if (typeof aiPanelRef.current?.scrollIntoView === "function") {
        aiPanelRef.current.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    });
    setAiDetecting(true);

    try {
      const exemplarPayload = aiExemplars.map((exemplar) => ({
        xmin: exemplar.xmin,
        ymin: exemplar.ymin,
        xmax: exemplar.xmax,
        ymax: exemplar.ymax,
        label: exemplar.label,
      }));
      const requestedThreshold = Number(
        clampAiThreshold(aiThreshold).toFixed(2),
      );
      const response = await aiService.detectObjects({
        assignmentId: currentImage.id,
        imageUrl: currentImage.dataItemUrl,
        exemplars: exemplarPayload,
        threshold: requestedThreshold,
        enableMask: false,
      });

      const detectionResult = response?.data || response || {};
      let extractedBoxes = normalizeBackendDetections(detectionResult.detections);
      let finalPreviewParseError = null;
      let previewImageSize = null;
      let targetImageSize = null;
      let boxesWereRescaled = false;
      let usedBackendDetections = extractedBoxes.length > 0;

      if (!usedBackendDetections && detectionResult.resultImageUrl) {
        try {
          const previewParseResult = await extractDetectionsFromPreviewImage(
            detectionResult.resultImageUrl,
            {
              targetImageUrl: resolveBackendAssetUrl(currentImage.dataItemUrl),
            },
          );

          if (Array.isArray(previewParseResult)) {
            extractedBoxes = previewParseResult;
          } else {
            extractedBoxes = previewParseResult?.boxes || [];
            previewImageSize = previewParseResult?.previewImageSize || null;
            targetImageSize = previewParseResult?.targetImageSize || null;
            boxesWereRescaled = Boolean(previewParseResult?.boxesWereRescaled);
          }
        } catch (previewParseError) {
          finalPreviewParseError = previewParseError;
          console.error("AI preview parsing failed:", previewParseError);
        }
      }

      const finalThresholdUsed = Number(
        clampAiThreshold(
          detectionResult.thresholdUsed ??
            requestedThreshold,
        ).toFixed(2),
      );
      const attemptedThresholds = normalizeAiThresholdAttempts(
        detectionResult.thresholdAttempts,
        finalThresholdUsed,
      );
      const normalizedDiagnostics = normalizeAiDiagnostics(
        detectionResult.diagnostics,
      );
      const nextPreview = {
        ...detectionResult,
        thresholdUsed: finalThresholdUsed,
        assignmentId: currentImage.id,
        exemplarCount: aiExemplars.length,
        detections: extractedBoxes,
        appliedCount: 0,
        previewExtractedCount: extractedBoxes.length,
        previewImageSize,
        targetImageSize,
        boxesWereRescaled,
        detectionSource: usedBackendDetections ? "huggingface_raw" : "preview_inference",
        extractionNote: "",
        coordinateNote: "",
        diagnostics: normalizedDiagnostics,
        diagnosticsNote: buildAiDiagnosticsNote(normalizedDiagnostics, t),
        retryNote: "",
        thresholdAttempts: attemptedThresholds,
      };

      let successMessage = detectionResult.message || t("workspace.aiPreviewLoaded");
      const reportedCount =
        typeof detectionResult.count === "number" ? detectionResult.count : null;

      if (attemptedThresholds.length > 1) {
        const retryParams = {
          from: requestedThreshold.toFixed(2),
          to: finalThresholdUsed.toFixed(2),
        };
        nextPreview.retryNote =
          (reportedCount ?? 0) > 0 || extractedBoxes.length > 0
            ? t("workspace.aiThresholdAutoAdjusted", retryParams)
            : t("workspace.aiThresholdRetryExhausted", retryParams);
      }

      if (extractedBoxes.length > 0) {
        if (reportedCount === 0 && !usedBackendDetections) {
          replaceAiAnnotationsInCanvas([]);
          nextPreview.extractionNote = t("workspace.aiPreviewNoRawCoordinates", {
            count: extractedBoxes.length,
          });
          successMessage = t("workspace.aiPreviewLoaded");
        } else {
          const appliedCount = replaceAiAnnotationsInCanvas(extractedBoxes);
          nextPreview.appliedCount = appliedCount;

          if (appliedCount > 0) {
            successMessage = t("workspace.aiBoxesInserted", {
              count: appliedCount,
            });

            if (usedBackendDetections) {
              nextPreview.coordinateNote = t("workspace.aiRawCoordinatesUsed", {
                count: appliedCount,
              });
            } else if (previewImageSize && targetImageSize) {
              nextPreview.coordinateNote = t(
                boxesWereRescaled
                  ? "workspace.aiPreviewCoordinatesRescaled"
                  : "workspace.aiPreviewCoordinatesDerived",
                {
                  previewWidth: previewImageSize.width,
                  previewHeight: previewImageSize.height,
                  originalWidth: targetImageSize.width,
                  originalHeight: targetImageSize.height,
                },
              );
            }

            if (!usedBackendDetections && reportedCount !== null && reportedCount !== appliedCount) {
              nextPreview.extractionNote = t("workspace.aiBoxesInsertedPartial", {
                detected: reportedCount,
                inserted: appliedCount,
              });
            }
          } else if ((reportedCount ?? 0) > 0) {
            nextPreview.extractionNote = t("workspace.aiBoxesNotExtracted");
            successMessage = t("workspace.aiPreviewLoaded");
          }
        }
      } else if ((reportedCount ?? 0) > 0 || finalPreviewParseError) {
        nextPreview.extractionNote = t("workspace.aiBoxesNotExtracted");
        replaceAiAnnotationsInCanvas([]);
        successMessage = t("workspace.aiPreviewLoaded");
      } else {
        replaceAiAnnotationsInCanvas([]);
      }

      setAiPreview(nextPreview);
      toast.success(successMessage);
    } catch (err) {
      const errorMessage = getErrorMessage(err, t("workspace.aiDetectFailed"));
      console.error("AI preview failed:", {
        status: err?.response?.status ?? null,
        message: errorMessage,
        response: err?.response?.data ?? null,
        assignmentId: currentImage?.id ?? null,
      });
      toast.error(errorMessage);
    } finally {
      setAiDetecting(false);
      void refreshAiStatus();
    }
  }, [
    aiExemplars,
    aiThreshold,
    currentImage,
    replaceAiAnnotationsInCanvas,
    getErrorMessage,
    refreshAiStatus,
    t,
  ]);

  const handlePrev = () => {
    if (currentImgIndex > 0) {
      setCurrentImgIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentImgIndex < images.length - 1) {
      setCurrentImgIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentImage) return;

    if (annotations.length === 0 && currentDefaultFlags.length === 0) {
      toast.warning(t("workspace.noLabelWarning"));
      return;
    }

    try {
      const draftSaved = await saveDraft(true);
      if (!draftSaved) {
        toast.error(t("workspace.draftFailBeforeSubmit"));
        return;
      }

      const dataJSON = buildDataJSON();

      await taskService.submitTask({
        assignmentId: currentImage.id,
        dataJSON,
      });

      setImages((prev) =>
        prev.map((img) =>
          img.id === currentImage.id
            ? { ...img, status: "Submitted", annotationData: dataJSON }
            : img,
        ),
      );

      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(currentImage.id);
        return next;
      });

      const isResubmit = currentImage.status === "Rejected";
      toast.success(
        isResubmit
          ? t("workspace.resubmitSuccess")
          : t("workspace.submitSuccess"),
      );
    } catch (err) {
      console.error(err);
      toast.error(t("workspace.submitFailed"));
    }
  };

  const handleToggleSelect = (imgId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(imgId)) {
        next.delete(imgId);
      } else {
        next.add(imgId);
      }
      return next;
    });
  };

  const handleSelectAllEligible = () => {
    if (allSelectableSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableBatchIds));
    }
  };

  const refetchImages = useCallback(async (preferredImage = null) => {
    try {
      const imgRes = await taskService.getProjectImages(assignmentId);

      let allImages = imgRes?.data;
      if (Array.isArray(imgRes)) {
        allImages = imgRes;
      } else if (imgRes?.data && Array.isArray(imgRes.data)) {
        allImages = imgRes.data;
      } else {
        allImages = [];
      }

      if (!Array.isArray(allImages)) {
        allImages = [];
      }

      const packStart = parseInt(searchParams.get("packStart"), 10);
      const packEnd = parseInt(searchParams.get("packEnd"), 10);

      let sliced;
      if (!isNaN(packStart) && !isNaN(packEnd) && packEnd > packStart) {
        sliced = allImages.slice(packStart, packEnd);
      } else {
        sliced = allImages;
      }

      const sortedSlice = [...sliced].sort((a, b) => {
        const priority = {
          New: 1,
          InProgress: 2,
          Rejected: 3,
          Submitted: 4,
          Approved: 5,
        };
        return (priority[a.status] || 99) - (priority[b.status] || 99);
      });

      setImages(sortedSlice);
      setCurrentImgIndex((prev) => {
        if (sortedSlice.length === 0) return 0;

        if (preferredImage?.dataItemId != null) {
          const nextIndex = sortedSlice.findIndex(
            (img) => img.dataItemId === preferredImage.dataItemId,
          );
          if (nextIndex >= 0) return nextIndex;
        }

        if (preferredImage?.id != null) {
          const nextIndex = sortedSlice.findIndex(
            (img) => img.id === preferredImage.id,
          );
          if (nextIndex >= 0) return nextIndex;
        }

        return Math.min(prev, sortedSlice.length - 1);
      });
    } catch (err) {
      console.error("Refetch images failed:", err);
    }
  }, [assignmentId, searchParams]);

  const syncDraftsForAssignments = useCallback(
    async (assignmentIds) => {
      const pendingIds = assignmentIds.filter((id) => id != null);
      if (pendingIds.length === 0) return [];

      const imageLookup = new Map(images.map((img) => [img.id, img]));
      const syncedDrafts = new Map();
      const syncErrors = [];

      for (const assignmentId of pendingIds) {
        const image = imageLookup.get(assignmentId);
        if (!image) continue;

        const dataJSON = buildDataJSONForAssignment(
          assignmentId,
          image.annotationData || "",
        );

        if (!hasValidAnnotations(dataJSON)) {
          syncErrors.push(
            `${t("workspace.draftFailed")} (Task ID ${assignmentId})`,
          );
          continue;
        }

        try {
          await taskService.saveDraft({
            assignmentId,
            dataJSON,
          });

          syncedDrafts.set(assignmentId, {
            annotationData: dataJSON,
            status: image.status === "New" ? "InProgress" : image.status,
          });
        } catch (err) {
          syncErrors.push(
            getErrorMessage(
              err,
              `${t("workspace.draftFailed")} (Task ID ${assignmentId})`,
            ),
          );
        }
      }

      if (syncedDrafts.size > 0) {
        setImages((prev) =>
          prev.map((img) =>
            syncedDrafts.has(img.id)
              ? { ...img, ...syncedDrafts.get(img.id) }
              : img,
          ),
        );
      }

      return syncErrors;
    },
    [images, buildDataJSONForAssignment, hasValidAnnotations, getErrorMessage, t],
  );

  const handleBatchSubmit = async () => {
    const assignmentIds = [...selectedBatchIds];

    if (assignmentIds.length === 0) {
      toast.warning(t("workspace.batchNoSelection"));
      return;
    }

    const confirmed = window.confirm(
      t("workspace.batchConfirm", { count: assignmentIds.length }),
    );
    if (!confirmed) return;

    setBatchSubmitting(true);
    try {
      const preferredImage = currentImage
        ? { id: currentImage.id, dataItemId: currentImage.dataItemId }
        : null;

      const draftSyncErrors = await syncDraftsForAssignments(assignmentIds);
      if (draftSyncErrors.length > 0) {
        draftSyncErrors.forEach((message) =>
          toast.error(message, { autoClose: 5000 }),
        );
        return;
      }

      const res = await taskService.submitMultiple({
        assignmentIds,
      });

      const result = res?.data || res || {};
      const successCount = result.successCount ?? result.SuccessCount ?? 0;
      const failureCount = result.failureCount ?? result.FailureCount ?? 0;
      const errors = normalizeBatchErrors(result.errors ?? result.Errors);

      if (successCount > 0 && failureCount === 0) {
        toast.success(
          t("workspace.batchSuccess", { count: successCount }),
        );
      } else if (successCount > 0 && failureCount > 0) {
        toast.warning(
          t("workspace.batchPartial", {
            success: successCount,
            total: assignmentIds.length,
            fail: failureCount,
          }),
        );
        if (errors.length > 0) {
          errors.forEach((errMsg) =>
            toast.error(errMsg, { autoClose: 5000 }),
          );
        }
      } else {
        toast.error(t("workspace.batchFailed"));
        if (errors.length > 0) {
          errors.forEach((errMsg) =>
            toast.error(errMsg, { autoClose: 5000 }),
          );
        }
      }

      if (successCount > 0) {
        await refetchImages(preferredImage);
      }

      const failedIds = errors
        .map((message) => {
          const match = /Task ID\s+(\d+)/i.exec(message);
          return match ? Number(match[1]) : null;
        })
        .filter((id) => Number.isInteger(id));

      setSelectedIds(new Set(successCount > 0 ? failedIds : assignmentIds));
      setShowBatchPanel(successCount === 0 || failedIds.length > 0);
    } catch (err) {
      console.error(err);
      toast.error(getErrorMessage(err, t("workspace.batchError")));
    } finally {
      setBatchSubmitting(false);
    }
  };

  const handleGuidelineConfirm = () => {
    setGuidelineRead(true);
    const sessionKey = `guideline_read_${assignmentId}`;
    sessionStorage.setItem(sessionKey, "true");
  };

  const handleGoBack = async () => {
    setGoingBack(true);
    try {
      if (
        currentImage &&
        isDirtyRef.current &&
        currentImage.status !== "Submitted" &&
        currentImage.status !== "Approved"
      ) {
        await saveDraft(true);
      }
    } catch (err) {
      console.error("Save draft before leaving failed:", err);
    } finally {
      navigate(`/annotator-project-packs/${assignmentId}`);
    }
  };

  const handleCreateDispute = async () => {
    if (!currentImage || !disputeReason.trim()) {
      toast.warning(t("workspace.disputeReasonRequired"));
      return;
    }

    setDisputeSubmitting(true);
    try {
      await taskService.createDispute({
        assignmentId: currentImage.id,
        reason: disputeReason.trim(),
      });
      toast.success(t("workspace.disputeSuccess"));
      setDisputeStatus("Pending");
      setShowDisputeForm(false);
      setDisputeReason("");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        t("workspace.disputeFailed");
      toast.error(typeof msg === "string" ? msg : t("workspace.disputeFailed"));
    } finally {
      setDisputeSubmitting(false);
    }
  };

  useEffect(() => {
    if (!currentImage) {
      setDisputeStatus(null);
      setDisputeResult(null);
      setShowDisputeForm(false);
      return;
    }

    const checkDispute = async () => {
      try {
        const res = await taskService.getMyDisputes(assignmentId);
        const disputes = res.data || res || [];
        const currentImageId = currentImage?.id;

        if (!currentImageId) return;

        const pending = disputes.find(
          (d) => d.assignmentId === currentImageId && d.status === "Pending",
        );
        const resolved = disputes.find(
          (d) => d.assignmentId === currentImageId && (d.status === "Resolved" || d.status === "Rejected"),
        );

        setDisputeStatus(pending ? "Pending" : null);
        setDisputeResult(resolved || null);

        if (resolved) {
          setShowDisputeForm(false);
          if (resolved.status === "Resolved" && currentImage.status !== "Rejected") {
          }
        }
      } catch {
        setDisputeStatus(null);
        setDisputeResult(null);
      }
    };

    if (currentImage.status === "Rejected") {
      checkDispute();
    } else {
      setDisputeStatus(null);
      setDisputeResult(null);
      setShowDisputeForm(false);
    }
  }, [currentImage, assignmentId]);

  if (loading)
    return <div className="text-center mt-5">{t("workspace.loadingData")}</div>;

  if (!guidelineRead && labels.length > 0) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center mt-4">
          <div className="col-lg-8">
            <div className="card shadow border-0">
              <div className="card-header bg-warning bg-opacity-10 py-3">
                <h5 className="card-title mb-0 text-warning fw-bold">
                  <i className="ri-book-read-line me-2"></i>
                  {t("workspace.guidelineTitle")}
                </h5>
              </div>
              <div className="card-body">
                {projectInfo?.annotationGuide && (
                  <div className="alert alert-info mb-4">
                    <h6 className="fw-bold mb-2">
                      <i className="ri-file-text-line me-1"></i>
                      {t("workspace.guidelineOverview")}
                    </h6>
                    <p className="mb-0">{projectInfo.annotationGuide}</p>
                  </div>
                )}

                <h6 className="fw-bold mb-3">
                  <i className="ri-price-tag-3-line me-1"></i>
                  {t("workspace.labelListCriteria")}
                </h6>

                {labels.map((label) => (
                  <div
                    key={label.id}
                    className="card mb-3 border-start border-4"
                    style={{ borderColor: label.color }}
                  >
                    <div className="card-body py-2 px-3">
                      <div className="d-flex align-items-center mb-1">
                        <span
                          className="rounded-circle me-2"
                          style={{
                            width: "14px",
                            height: "14px",
                            backgroundColor: label.color,
                          }}
                        ></span>
                        <strong>{label.name}</strong>
                      </div>
                      {label.guideLine && (
                        <p className="text-muted small mb-1">
                          {label.guideLine}
                        </p>
                      )}
                      {label.exampleImageUrl && (
                        <div className="mb-2">
                          <small className="fw-bold text-dark d-block mb-1">
                            <i className="ri-image-line me-1"></i>
                            {t("workspace.sampleImage")}
                          </small>
                          <img
                            src={label.exampleImageUrl}
                            alt={`${label.name} sample`}
                            style={{
                              maxWidth: "100%",
                              maxHeight: 160,
                              objectFit: "contain",
                              borderRadius: 6,
                              border: "1px solid #dee2e6",
                              backgroundColor: "#f8f9fa",
                            }}
                          />
                        </div>
                      )}
                      {label.checklist && label.checklist.length > 0 && (
                        <div className="mt-1">
                          <small className="fw-bold text-dark">
                            {t("workspace.criteriaHint")}
                          </small>
                          <ul className="small mb-0 mt-1">
                            {label.checklist.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="card-footer text-center py-3">
                <button
                  className="btn btn-warning px-5 fw-bold"
                  onClick={handleGuidelineConfirm}
                >
                  <i className="ri-check-double-line me-2"></i>
                  {t("workspace.guidelineConfirm")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentImage)
    return <div className="text-center mt-5">{t("workspace.noImages")}</div>;

  const isReadOnly =
    currentImage.status === "Submitted" ||
    currentImage.status === "Approved" ||
    (currentImage.status === "Rejected" && disputeStatus === "Pending") ||
    (currentImage.status === "Rejected" && disputeResult?.status === "Resolved" && disputeResult?.resolutionType === "annotator_correct");

  const aiCanRun = !isReadOnly && aiExemplars.length > 0;
  const aiReportedCount = aiPreview?.count ?? 0;
  const aiPrimaryBadgeLabel = t("workspace.aiDetectedObjects", {
    count: aiReportedCount,
  });
  const aiStatusGuidance = aiDetecting
    ? t("workspace.aiDetectingHelp")
    : aiPreview
      ? aiPreview.appliedCount > 0
        ? t("workspace.aiPreviewAppliedHelp", {
            count: aiPreview.appliedCount,
          })
        : (aiPreview.previewExtractedCount ?? 0) > 0 && aiReportedCount === 0
          ? t("workspace.aiPreviewCoordinateUnavailableHelp", {
              count: aiPreview.previewExtractedCount,
            })
        : aiReportedCount === 0
          ? t("workspace.aiPreviewNoObjectsHelp")
          : t("workspace.aiPreviewLoadedHelp")
      : aiCanRun
        ? t("workspace.aiStatusReadyHelp")
        : t("workspace.aiNeedExemplarsHelp", {
            max: MAX_AI_EXEMPLARS,
          });

  const isRejected = currentImage.status === "Rejected";

  const needsResubmit = isRejected && disputeResult?.status === "Rejected" && disputeResult?.resolutionType === "annotator_wrong";
  const latestApprovedVotes = disputeResult?.reviewerFeedbacks?.filter(
    (feedback) => feedback.verdict === "Approved" || feedback.verdict === "Approve",
  ).length ?? 0;
  const latestRejectedVotes = disputeResult?.reviewerFeedbacks?.filter(
    (feedback) => feedback.verdict === "Rejected" || feedback.verdict === "Reject",
  ).length ?? 0;
  const rejectRounds = disputeResult?.rejectCount ?? currentImage.rejectCount ?? 0;

  const doneCount = images.filter(
    (img) => img.status === "Submitted" || img.status === "Approved",
  ).length;
  const progressPercent =
    images.length > 0 ? Math.round((doneCount / images.length) * 100) : 0;

  return (
    <div>
      { }
      <div className="stitch-ws-header-bar">
        <button
          className="back-btn"
          onClick={handleGoBack}
          disabled={goingBack}
        >
          {goingBack ? (
            <>
              <span className="spinner-border spinner-border-sm" />{" "}
              {t("workspace.goingBack")}
            </>
          ) : (
            <>
              <i className="ri-arrow-left-line"></i> {t("workspace.goBack")}
            </>
          )}
        </button>

        <span className="stitch-ws-header-title">
          <i className="ri-image-edit-line me-1"></i>
          {projectInfo?.name || "Workspace"} — {t("workspace.imageOf")}{" "}
          {currentImgIndex + 1}/{images.length}
        </span>

        <span
          className={STATUS_CLASSES[currentImage.status] || STATUS_CLASSES.New}
        >
          {t(STATUS_LABEL_KEYS[currentImage.status] || STATUS_LABEL_KEYS.New)}
        </span>

        {!isReadOnly && (
          <span className={`stitch-ws-save-badge ${saveStatus}`}>
            {saveStatus === "saved" && (
              <>
                <i className="ri-check-line"></i> Saved{" "}
                {lastSavedTime &&
                  lastSavedTime.toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </>
            )}
            {saveStatus === "saving" && (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  style={{ width: 10, height: 10 }}
                ></span>{" "}
                Saving...
              </>
            )}
            {saveStatus === "unsaved" && (
              <>
                <i className="ri-circle-fill" style={{ fontSize: 6 }}></i>{" "}
                Unsaved
              </>
            )}
          </span>
        )}

        <button
          className="back-btn"
          onClick={() => setShowShortcuts(!showShortcuts)}
          title={t("workspace.shortcuts")}
        >
          <i className="ri-keyboard-line"></i>
        </button>
      </div>

      { }
      {showShortcuts && (
        <div className="stitch-ws-card mb-2">
          <div className="stitch-ws-card-body" style={{ padding: "8px 14px" }}>
            <div className="d-flex flex-wrap gap-3">
              <div className="stitch-ws-shortcut">
                <span>Undo</span>
                <span className="stitch-ws-kbd">Ctrl+Z</span>
              </div>
              <div className="stitch-ws-shortcut">
                <span>{t("workspace.deleteLastBox")}</span>
                <span className="stitch-ws-kbd">Delete</span>
              </div>
              <div className="stitch-ws-shortcut">
                <span>{t("workspace.deleteOneBox")}</span>
                <span className="stitch-ws-text-muted">Double-click</span>
              </div>
              <div className="stitch-ws-shortcut">
                <span>Zoom</span>
                <span className="stitch-ws-kbd">Ctrl+Scroll</span>
              </div>
              <div className="stitch-ws-shortcut">
                <span>{t("workspace.moveShortcut")}</span>
                <span className="stitch-ws-kbd">Arrow keys</span>
              </div>
              <div className="stitch-ws-shortcut">
                <span>{t("workspace.prevNextImage")}</span>
                <span>
                  <span className="stitch-ws-kbd me-1">Shift+←</span>
                  <span className="stitch-ws-kbd">Shift+→</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      { }
      <div className="stitch-ws-layout">
        { }
        <div className="stitch-ws-left-panel">
          { }
          <div className={`stitch-ws-card ${collapsedPanels.has("progress") ? "collapsed" : ""}`}>
            <div
              className="stitch-ws-card-header"
              style={{ cursor: "pointer" }}
              onClick={() => togglePanel("progress")}
            >
              <span>
                <i className="ri-bar-chart-line me-1"></i>
                {t("workspace.progress")}
              </span>
              <span className="d-flex align-items-center gap-2">
                <span className="stitch-ws-text-primary" style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                  {doneCount}/{images.length} ({progressPercent}%)
                </span>
                <i className={`ri-arrow-${collapsedPanels.has("progress") ? "down" : "up"}-s-line`} style={{ fontSize: 14, opacity: 0.5 }}></i>
              </span>
            </div>
            <div
              className="stitch-ws-card-body"
              style={{ padding: "8px 14px 12px", display: collapsedPanels.has("progress") ? "none" : "block" }}
            >
              <div className="stitch-ws-progress" style={{ marginTop: 0 }}>
                <div
                  className={`stitch-ws-progress-bar ${progressPercent === 100 ? "complete" : ""}`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          { }
          {isRejected && !disputeResult && (
            <div className="stitch-ws-alert danger">
              <div className="d-flex align-items-start gap-2">
                <i
                  className="ri-error-warning-fill"
                  style={{ fontSize: "1.1rem", marginTop: 2 }}
                ></i>
                <div className="flex-grow-1">
                  <strong className="d-block mb-1">
                    {t("workspace.rejectedAlert")}
                  </strong>
                  <span style={{ opacity: 0.85 }}>
                    {t("workspace.rejectedHint")}
                  </span>
                  {disputeStatus === "Pending" ? (
                    <div
                      className="stitch-ws-alert warning mt-2"
                      style={{ marginBottom: 0 }}
                    >
                      <i className="ri-time-line me-1"></i>
                      <strong>{t("workspace.disputeSent")}</strong>
                    </div>
                  ) : !disputeResult && (
                    <button
                      className="stitch-ws-nav-btn mt-2"
                      style={{ padding: "4px 12px", fontSize: "0.75rem" }}
                      onClick={() => setShowDisputeForm(true)}
                    >
                      <i className="ri-questionnaire-line"></i>{" "}
                      {t("workspace.disputeBtn")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {disputeResult && (
            <div className={`stitch-ws-alert ${disputeResult.status === "Resolved" ? "success" : "warning"}`}>
              <div className="d-flex align-items-start gap-2">
                <i
                  className={disputeResult.status === "Resolved" ? "ri-checkbox-circle-fill" : "ri-close-circle-fill"}
                  style={{ fontSize: "1.1rem", marginTop: 2 }}
                ></i>
                <div className="flex-grow-1">
                  <strong className="d-block mb-1">
                    {disputeResult.status === "Resolved"
                      ? "Dispute Accepted - Manager ruled in your favor"
                      : "Dispute Rejected - Manager upheld the rejection"}
                  </strong>

                  {rejectRounds > 0 && (
                    <div className="mb-2 d-flex gap-2 align-items-center">
                      <small className="text-muted">Reject rounds:</small>
                      <span className="badge bg-warning text-dark">
                        <i className="ri-arrow-go-back-line me-1"></i>
                        {rejectRounds}
                      </span>
                    </div>
                  )}

                  {disputeResult.reviewerFeedbacks && disputeResult.reviewerFeedbacks.length > 0 && (
                    <div className="mb-2 d-flex gap-2 align-items-center">
                      <small className="text-muted">Latest reviewer votes:</small>
                      <span className="badge bg-success">
                        <i className="ri-check-line me-1"></i>
                        {latestApprovedVotes}
                      </span>
                      <span className="badge bg-danger">
                        <i className="ri-close-line me-1"></i>
                        {latestRejectedVotes}
                      </span>
                    </div>
                  )}

                  {disputeResult.resolutionType === "annotator_correct" && (
                    <div className="mt-2 p-2 rounded" style={{ background: "rgba(34, 197, 94, 0.15)" }}>
                      <small className="d-block mb-1">
                        <i className="ri-user-follow-line me-1"></i>
                        <strong>Manager Decision:</strong> Your labeling was correct.
                      </small>
                      <small className="d-block">
                        <i className="ri-notification-3-line me-1"></i>
                        Rejector(s) have been notified to re-review this task.
                      </small>
                      <small className="d-block mt-1 text-success">
                        <i className="ri-check-double-line me-1"></i>
                        Task remains APPROVED.
                      </small>
                    </div>
                  )}

                  {disputeResult.resolutionType === "annotator_wrong" && (
                    <div className="mt-2 p-2 rounded" style={{ background: "rgba(249, 115, 22, 0.15)" }}>
                      <small className="d-block mb-1">
                        <i className="ri-user-follow-line me-1"></i>
                        <strong>Manager Decision:</strong> Your labeling was incorrect.
                      </small>
                      <small className="d-block text-danger">
                        <i className="ri-edit-line me-1"></i>
                        Please review the guidelines carefully and resubmit your work.
                      </small>
                      <small className="d-block text-muted mt-1">
                        <i className="ri-refresh-line me-1"></i>
                        All reviewers will re-review when you resubmit.
                      </small>
                    </div>
                  )}

                  {disputeResult.managerComment && (
                    <div className="mt-2">
                      <small className="text-muted">Manager's comment:</small>
                      <p className="mb-0 small" style={{ fontStyle: "italic" }}>
                        "{disputeResult.managerComment}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          { }
          {currentImage.status === "Rejected" &&
            disputeStatus === "Pending" && (
              <div className="stitch-ws-alert warning">
                <i className="ri-lock-line me-1"></i>
                {t("workspace.disputePending")}
              </div>
            )}
          {isReadOnly && currentImage.status !== "Rejected" && (
            <div className="stitch-ws-alert info">
              <i className="ri-lock-line me-1"></i>
              {t("workspace.readOnly")}
            </div>
          )}
          { }
          {!isReadOnly && annotations.length === 0 && (
            <div className="stitch-ws-alert warning mb-2" style={{ padding: "10px 14px" }}>
              <div className="d-flex align-items-start gap-2">
                <i className="ri-eye-line" style={{ fontSize: "1rem", marginTop: 1, flexShrink: 0 }}></i>
                <div>
                  <strong style={{ fontSize: "0.8rem" }}>{t("workspace.skipVisibleTitle")}</strong>
                  <p style={{ fontSize: "0.72rem", margin: "2px 0 0", opacity: 0.85 }}>
                    {t("workspace.skipVisibleHint")}
                  </p>
                </div>
              </div>
            </div>
          )}
          { }
          {!isReadOnly && (() => {
            const isFlagEnabled = currentDefaultFlags.includes("__flag_enabled");

            const defaultLabels = labels.filter((l) => l.isDefault);
            const flagOptions = defaultLabels.length > 0
              ? defaultLabels.map((l) => ({ id: l.id, label: l.name, color: l.color }))
              : [{ id: "__image_flagged", label: t("workspace.flagImage"), color: "#EF4444" }];

            return (
              <div className={`stitch-ws-card ${!isFlagEnabled ? "collapsed" : ""}`}>
                <div
                  className="stitch-ws-card-header"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (isFlagEnabled) {
                      dispatch(setDefaultFlags({ assignmentId: currentImage.id, flags: [] }));
                    } else {
                      dispatch(setDefaultFlags({ assignmentId: currentImage.id, flags: ["__flag_enabled"] }));
                    }
                  }}
                >
                  <span className="d-flex align-items-center gap-2">
                    <input
                      className="form-check-input flex-shrink-0"
                      type="checkbox"
                      checked={isFlagEnabled}
                      readOnly
                      style={{ cursor: "pointer", margin: 0 }}
                    />
                    <i
                      className={`ri-flag-${isFlagEnabled ? "fill" : "line"}`}
                      style={{ color: isFlagEnabled ? "#EF4444" : "inherit" }}
                    ></i>
                    {t("workspace.flagImage")}
                  </span>
                  <i className={`ri-arrow-${isFlagEnabled ? "up" : "down"}-s-line`} style={{ fontSize: 14, opacity: 0.5 }}></i>
                </div>
                <div style={{ display: isFlagEnabled ? "block" : "none", maxHeight: 180, overflowY: "auto" }}>
                  {flagOptions.map((flag) => {
                    const isSelected = currentDefaultFlags.includes(flag.id);
                    return (
                      <div
                        key={flag.id}
                        className="d-flex align-items-center gap-2 px-3 py-2"
                        style={{
                          cursor: "pointer",
                          background: isSelected ? `${flag.color}12` : "transparent",
                          borderTop: "1px solid rgba(0,0,0,0.04)",
                          transition: "background 0.15s ease",
                        }}
                        onClick={() => {
                          dispatch(toggleDefaultFlag({ assignmentId: currentImage.id, labelId: flag.id }));
                        }}
                      >
                        <input
                          className="form-check-input flex-shrink-0"
                          type="checkbox"
                          checked={isSelected}
                          readOnly
                          style={{ cursor: "pointer", margin: 0 }}
                        />
                        <span
                          style={{
                            width: 10, height: 10, borderRadius: "50%",
                            background: flag.color, flexShrink: 0,
                          }}
                        ></span>
                        <span style={{ fontSize: "0.82rem", fontWeight: isSelected ? 600 : 400 }}>
                          {flag.label}
                        </span>
                        {isSelected && (
                          <i className="ri-check-line ms-auto" style={{ color: flag.color }}></i>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {!isReadOnly && (
            <div className={`stitch-ws-card ${collapsedPanels.has("labels") ? "collapsed" : ""}`}>
              <div
                className="stitch-ws-card-header"
                style={{ cursor: "pointer" }}
                onClick={() => togglePanel("labels")}
              >
                <span>
                  <i className="ri-tools-line me-1"></i>
                  {t("labeling.labelChecklist")}
                </span>
                <span className="d-flex align-items-center gap-2">
                  {(() => {
                    const customLabels = labels.filter((l) => !l.isDefault);

                    let unlocked = 0;
                    customLabels.forEach((label) => {
                      const items = label.checklist || [];
                      if (items.length === 0) { unlocked++; return; }
                      const checked = checklistState[label.id] || [];
                      if (items.every((_, idx) => checked[idx] === true)) unlocked++;
                    });
                    return (
                      <span className="stitch-ws-badge stitch-ws-badge-inprogress" style={{ fontSize: "0.68rem" }}>
                        {unlocked}/{customLabels.length} {t("labeling.unlocked")}
                      </span>
                    );
                  })()}
                  <i className={`ri-arrow-${collapsedPanels.has("labels") ? "down" : "up"}-s-line`} style={{ fontSize: 14, opacity: 0.5 }}></i>
                </span>
              </div>
              <div style={{ display: collapsedPanels.has("labels") ? "none" : "block", maxHeight: 280, overflowY: "auto" }}>
                <LabelToolbox
                  labels={labels}
                  assignmentId={currentImage.id}
                  annotations={annotations}
                />
              </div>
            </div>
          )}

          { }
          <div className={`stitch-ws-card ${collapsedPanels.has("annotations") ? "collapsed" : ""}`}>
            <div
              className="stitch-ws-card-header"
              style={{ cursor: "pointer" }}
              onClick={() => togglePanel("annotations")}
            >
              <span>
                <i className="ri-list-check-2 me-1"></i> {t("workspace.annotations")}
              </span>
              <span className="d-flex align-items-center gap-2">
                <span className="stitch-ws-badge stitch-ws-badge-inprogress">
                  {annotations.length}
                </span>
                <i className={`ri-arrow-${collapsedPanels.has("annotations") ? "down" : "up"}-s-line`} style={{ fontSize: 14, opacity: 0.5 }}></i>
              </span>
            </div>
            <div style={{ maxHeight: "200px", overflowY: "auto", display: collapsedPanels.has("annotations") ? "none" : "block" }}>
              {annotations.length === 0 ? (
                <div
                  className="stitch-ws-card-body text-center"
                  style={{ padding: "20px 14px" }}
                >
                  <i
                    className="ri-shape-line d-block mb-1"
                    style={{ fontSize: "1.5rem", opacity: 0.3 }}
                  ></i>
                  <span className="stitch-ws-text-muted">
                    {t("workspace.noAnnotations")}
                  </span>
                </div>
              ) : (
                annotations.map((a, idx) => (
                  <div
                    key={a.id}
                    className={`stitch-ws-ann-item ${highlightedAnnotationId === a.id ? "highlighted" : ""}`}
                    onMouseEnter={() => setHighlightedAnnotationId(a.id)}
                    onMouseLeave={() => setHighlightedAnnotationId(null)}
                    onClick={() => setHighlightedAnnotationId(a.id)}
                  >
                    <span
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 3,
                        background: a.color || "#6c757d",
                        flexShrink: 0,
                        border:
                          highlightedAnnotationId === a.id
                            ? "2px solid #3B82F6"
                            : "none",
                      }}
                      className="me-2"
                    ></span>
                    <span
                      className="flex-grow-1 text-truncate"
                      style={{ fontWeight: 500 }}
                    >
                      {a.labelName || `Box ${idx + 1}`}
                    </span>
                    <span
                      className="stitch-ws-text-muted me-2"
                      style={{ fontSize: "0.65rem" }}
                    >
                      {a.type === "POLYGON" || a.points
                        ? `${a.points?.length || 0} pts`
                        : `${Math.round(a.width)}×${Math.round(a.height)}`}
                    </span>
                    {!isReadOnly && (
                      <button
                        className="btn btn-link btn-sm p-0"
                        style={{ color: "#F87171", lineHeight: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(
                            removeAnnotation({
                              assignmentId: currentImage.id,
                              id: a.id,
                            }),
                          );
                        }}
                        title={t("workspace.deleteAnnotation")}
                      >
                        <i className="ri-close-line"></i>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          { }
          <div>
            <button
              className={`stitch-ws-nav-btn w-100 ${showBatchPanel ? "" : "primary"}`}
              style={{ justifyContent: "center" }}
              onClick={() => {
                if (
                  !showBatchPanel &&
                  isDirtyRef.current &&
                  currentImage &&
                  currentImage.status !== "Submitted" &&
                  currentImage.status !== "Approved"
                ) {
                  void saveDraft(true);
                }
                setShowBatchPanel((prev) => !prev);
              }}
            >
              <i
                className={`ri-${showBatchPanel ? "close" : "stack"}-line`}
              ></i>
              {showBatchPanel
                ? t("workspace.hideBatch")
                : t("workspace.batchSubmit")}
            </button>
          </div>

          { }
          {showBatchPanel && (
            <div className="stitch-ws-card">
              <div className="stitch-ws-card-header">
                <span>
                  <i className="ri-checkbox-multiple-line me-1"></i>{" "}
                  {t("workspace.selectImages")}
                </span>
                <span className="stitch-ws-badge stitch-ws-badge-inprogress">
                  {selectedBatchIds.length}
                </span>
              </div>
              <div
                className="stitch-ws-card-body p-0"
                style={{ maxHeight: "250px", overflowY: "auto" }}
              >
                <div
                  className="px-3 py-2"
                  style={{ borderBottom: "1px solid rgba(51, 65, 85, 0.2)" }}
                >
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="selectAllEligible"
                      checked={allSelectableSelected}
                      onChange={handleSelectAllEligible}
                      disabled={selectableBatchIds.length === 0}
                    />
                    <label
                      className="form-check-label stitch-ws-text-muted"
                      htmlFor="selectAllEligible"
                      style={{ fontWeight: 600, fontSize: "0.78rem" }}
                    >
                      {t("workspace.selectAll")} ({selectableBatchIds.length})
                    </label>
                  </div>
                </div>
                {batchImageEntries.map(
                  ({ img, idx, config, isEligible, hasData }) => {
                  return (
                    <div
                      key={img.id}
                      className={`stitch-ws-batch-item ${idx === currentImgIndex ? "active" : ""}`}
                      onClick={() => setCurrentImgIndex(idx)}
                    >
                      {isEligible && (
                        <input
                          className="form-check-input me-2 flex-shrink-0"
                          type="checkbox"
                          checked={selectedBatchIdSet.has(img.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(img.id);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          disabled={!hasData}
                        />
                      )}
                      {!isEligible && (
                        <div style={{ width: "22px" }} className="me-2"></div>
                      )}
                      <small className="flex-grow-1 text-truncate">
                        {t("workspace.imageLabel")} {idx + 1}
                      </small>
                      <span className={`${config.cls} ms-1`}>
                        {t(config.labelKey)}
                      </span>
                    </div>
                  );
                  },
                )}
              </div>
              <div className="stitch-ws-card-body py-2 text-center">
                <button
                  className="stitch-ws-nav-btn success w-100"
                  style={{ justifyContent: "center" }}
                  disabled={selectedBatchIds.length === 0 || batchSubmitting}
                  onClick={handleBatchSubmit}
                >
                  {batchSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>{" "}
                      {t("workspace.submitting")}
                    </>
                  ) : (
                    <>
                      <i className="ri-send-plane-fill"></i>{" "}
                      {t("workspace.submitCount", { count: selectedBatchIds.length })}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        { }
        <div className="stitch-ws-center-panel">
          <LabelingWorkspace
            assignmentId={currentImage.id}
            imageUrl={currentImage.dataItemUrl}
            readOnly={isReadOnly}
            highlightedAnnotationId={highlightedAnnotationId}
            onAnnotationClick={(id) => setHighlightedAnnotationId(id)}
            projectType={projectInfo?.allowGeometryTypes}
            onRunAiPreview={handleRunAiPreview}
            aiDetecting={aiDetecting}
            aiExemplarCount={aiExemplars.length}
            aiPreviewEnabled={aiCanRun}
          />

          { }
          <div className="stitch-ws-bottom-bar">
            <button
              className="nav-arrow"
              disabled={currentImgIndex === 0}
              onClick={handlePrev}
              title={t("workspace.prevImage")}
            >
              <i className="ri-arrow-left-s-line"></i>
            </button>

            { }
            <div className="stitch-ws-thumb-strip">
              {images.map((img, idx) => {
                const isCurrent = idx === currentImgIndex;
                const statusKey = img.status || "New";
                const dotColor =
                  statusKey === "Approved"
                    ? "#22C55E"
                    : statusKey === "Submitted"
                      ? "#FACC15"
                      : statusKey === "Rejected"
                        ? "#EF4444"
                        : statusKey === "InProgress"
                          ? "#3B82F6"
                          : null;
                return (
                  <div
                    key={img.id}
                    className={`thumb-item ${isCurrent ? "active" : ""}`}
                    onClick={() => setCurrentImgIndex(idx)}
                    title={`${t("workspace.imageLabel")} ${idx + 1} — ${statusKey}`}
                  >
                    {idx + 1}
                    {dotColor && (
                      <span
                        className="status-dot"
                        style={{ background: dotColor }}
                      ></span>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              className="nav-arrow"
              disabled={currentImgIndex === images.length - 1}
              onClick={handleNext}
              title={t("workspace.nextImage")}
            >
              <i className="ri-arrow-right-s-line"></i>
            </button>

            { }
            <div className="action-group">
              {!isReadOnly && (
                <>
                  <button
                    className="action-btn primary"
                    onClick={() => saveDraft(false)}
                  >
                    <i className="ri-save-line"></i> {t("workspace.saveDraft")}
                  </button>
                  <button
                    className={`action-btn ${needsResubmit || isRejected ? "warning" : "success"}`}
                    onClick={handleSubmit}
                  >
                    <i
                      className={`ri-${needsResubmit || isRejected ? "restart-line" : "check-line"}`}
                    ></i>
                    {needsResubmit
                      ? t("workspace.resubmitAfterDispute")
                      : isRejected
                        ? t("workspace.resubmit")
                        : t("workspace.submitTask")}
                  </button>
                </>
              )}
              {isReadOnly && (
                <>
                  {needsResubmit ? (
                    <span
                      className="stitch-ws-badge stitch-ws-badge-rejected"
                      style={{ fontSize: "0.78rem", padding: "5px 12px" }}
                    >
                      <i className="ri-edit-line me-1"></i>{" "}
                      {t("workspace.waitingForResubmit")}
                    </span>
                  ) : (
                    <span
                      className="stitch-ws-badge stitch-ws-badge-approved"
                      style={{ fontSize: "0.78rem", padding: "5px 12px" }}
                    >
                      <i className="ri-check-double-line me-1"></i>{" "}
                      {t("workspace.submitted")}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        { }
        <div className="stitch-ws-right-panel">
          { }
          <CommentSection
            rejectionReason={currentImage.rejectionReason}
            status={currentImage.status}
          />

          {!isReadOnly && (
            <div
              ref={aiPanelRef}
              className={`stitch-ws-card ${collapsedPanels.has("ai") ? "collapsed" : ""}`}
            >
              <div
                className="stitch-ws-card-header"
                style={{ cursor: "pointer" }}
                onClick={() => togglePanel("ai")}
              >
                <span>
                  <i className="ri-sparkling-line me-1"></i>
                  {t("workspace.aiPanelTitle")}
                </span>
                <span className="d-flex align-items-center gap-2">
                  <span className={aiStatusBadge.className}>
                    {aiStatusBadge.label}
                  </span>
                  {aiPreview && (
                    <span className="stitch-ws-badge stitch-ws-badge-inprogress">
                      {aiReportedCount}
                    </span>
                  )}
                  <i
                    className={`ri-arrow-${collapsedPanels.has("ai") ? "down" : "up"}-s-line`}
                    style={{ fontSize: 14, opacity: 0.5 }}
                  ></i>
                </span>
              </div>
              <div
                className="stitch-ws-card-body"
                style={{ display: collapsedPanels.has("ai") ? "none" : "block" }}
              >
                <p
                  className="stitch-ws-text-muted mb-2"
                  style={{ fontSize: "0.78rem" }}
                >
                  {t("workspace.aiPanelHint")}
                </p>

                <div
                  className="mb-2 px-3 py-2"
                  style={{
                    borderRadius: 10,
                    background: "rgba(15, 23, 42, 0.18)",
                    border: "1px solid rgba(148, 163, 184, 0.18)",
                  }}
                >
                  <div
                    className="d-flex align-items-center justify-content-between gap-2"
                    style={{ marginBottom: aiStatus.note ? 6 : 0 }}
                  >
                    <strong style={{ fontSize: "0.76rem" }}>
                      {t("workspace.aiStatusLabel")}
                    </strong>
                    <button
                      type="button"
                      className="btn btn-link btn-sm p-0"
                      style={{ fontSize: "0.72rem", textDecoration: "none" }}
                      onClick={(event) => {
                        event.stopPropagation();
                        void refreshAiStatus();
                      }}
                    >
                      {t("workspace.aiRefreshStatus")}
                    </button>
                  </div>
                  <div style={{ fontSize: "0.76rem" }}>{aiStatus.message}</div>
                  {aiStatus.note && (
                    <div
                      className="stitch-ws-text-muted mt-1"
                      style={{ fontSize: "0.72rem" }}
                    >
                      {aiStatus.note}
                    </div>
                  )}
                </div>

                <div
                  className="mb-2 px-3 py-2"
                  style={{
                    borderRadius: 10,
                    background: "rgba(34, 211, 238, 0.08)",
                    border: "1px solid rgba(34, 211, 238, 0.16)",
                    fontSize: "0.75rem",
                  }}
                >
                  {aiStatusGuidance}
                </div>

                <div className="d-flex flex-wrap gap-2 mb-2">
                  <span className="stitch-ws-badge stitch-ws-badge-inprogress">
                    {t("workspace.aiExemplarCount", {
                      count: aiExemplars.length,
                      max: MAX_AI_EXEMPLARS,
                    })}
                  </span>
                  <span className="stitch-ws-badge stitch-ws-badge-new">
                    {t("workspace.aiThresholdChip", {
                      threshold: aiThreshold.toFixed(2),
                    })}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                    <label
                      htmlFor="ai-threshold-range"
                      style={{ fontSize: "0.76rem", fontWeight: 600 }}
                    >
                      {t("workspace.aiThresholdLabel")}
                    </label>
                    <input
                      id="ai-threshold-number"
                      type="number"
                      min={MIN_AI_THRESHOLD}
                      max={MAX_AI_THRESHOLD}
                      step={AI_THRESHOLD_STEP}
                      value={aiThreshold.toFixed(2)}
                      disabled={aiDetecting}
                      onChange={(event) => {
                        setAiThreshold(clampAiThreshold(event.target.value));
                      }}
                      style={{
                        width: 78,
                        borderRadius: 8,
                        border: "1px solid rgba(148, 163, 184, 0.24)",
                        background: "rgba(15, 23, 42, 0.28)",
                        color: "inherit",
                        padding: "4px 8px",
                        fontSize: "0.76rem",
                      }}
                    />
                  </div>
                  <input
                    id="ai-threshold-range"
                    type="range"
                    min={MIN_AI_THRESHOLD}
                    max={MAX_AI_THRESHOLD}
                    step={AI_THRESHOLD_STEP}
                    value={aiThreshold}
                    disabled={aiDetecting}
                    onChange={(event) => {
                      setAiThreshold(clampAiThreshold(event.target.value));
                    }}
                    style={{ width: "100%" }}
                  />
                  <div
                    className="d-flex justify-content-between stitch-ws-text-muted mt-1"
                    style={{ fontSize: "0.72rem" }}
                  >
                    <span>{MIN_AI_THRESHOLD.toFixed(2)}</span>
                    <span>{t("workspace.aiThresholdHint")}</span>
                    <span>{MAX_AI_THRESHOLD.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  className="stitch-ws-nav-btn w-100"
                  style={{ justifyContent: "center" }}
                  disabled={!aiCanRun || aiDetecting}
                  onClick={handleRunAiPreview}
                >
                  {aiDetecting ? (
                    <>
                      <span className="spinner-border spinner-border-sm"></span>{" "}
                      {t("workspace.aiDetecting")}
                    </>
                  ) : (
                    <>
                      <i className="ri-sparkling-line"></i>{" "}
                      {t(
                        aiPreview
                          ? "workspace.aiRefreshPreview"
                          : "workspace.aiRunPreview",
                      )}
                    </>
                  )}
                </button>

                {aiPreview && (
                  <div className="mt-3" data-testid="ai-preview-card">
                    <h6 className="mb-2" style={{ fontSize: "0.82rem" }}>
                      {t("workspace.aiResultsTitle")}
                    </h6>

                    <div className="d-flex flex-wrap gap-2 mb-2">
                      <span
                        className="stitch-ws-badge stitch-ws-badge-approved"
                      >
                        {aiPrimaryBadgeLabel}
                      </span>
                      <span className="stitch-ws-badge stitch-ws-badge-inprogress">
                        {t("workspace.aiProcessingTime", {
                          ms: aiPreview.processingTimeMs ?? 0,
                        })}
                      </span>
                      <span className="stitch-ws-badge stitch-ws-badge-new">
                        {t("workspace.aiThresholdChip", {
                          threshold: (
                            aiPreview.thresholdUsed ?? aiThreshold
                          ).toFixed(2),
                        })}
                      </span>
                      {aiPreview.appliedCount > 0 && (
                        <span className="stitch-ws-badge stitch-ws-badge-approved">
                          {t("workspace.aiAppliedBoxes", {
                            count: aiPreview.appliedCount,
                          })}
                        </span>
                      )}
                    </div>

                    {aiPreview.diagnostics && (
                      <div
                        className="mb-2 px-3 py-2"
                        style={{
                          borderRadius: 10,
                          background: "rgba(15, 23, 42, 0.18)",
                          border: "1px solid rgba(148, 163, 184, 0.18)",
                          fontSize: "0.75rem",
                        }}
                      >
                        <div className="fw-semibold mb-1">
                          {t("workspace.aiDiagnosticsTitle")}
                        </div>
                        <div>
                          {t("workspace.aiDiagnosticsProviderComplete", {
                            endpoint:
                              aiPreview.diagnostics.predictEndpoint ||
                              "/gradio_api/call/initial_process",
                            count: aiPreview.diagnostics.outputItemsCount ?? 0,
                          })}
                        </div>
                        {aiPreview.diagnosticsNote && (
                          <div className="stitch-ws-text-muted mt-1">
                            {aiPreview.diagnosticsNote}
                          </div>
                        )}
                      </div>
                    )}

                    {aiPreview.message && (
                      <div
                        className="mb-2 px-3 py-2"
                        style={{
                          borderRadius: 10,
                          background: "rgba(34, 211, 238, 0.08)",
                          border: "1px solid rgba(34, 211, 238, 0.18)",
                          fontSize: "0.76rem",
                        }}
                      >
                        {aiPreview.message}
                      </div>
                    )}

                    {aiPreview.retryNote && (
                      <div
                        className="mb-2 px-3 py-2"
                        style={{
                          borderRadius: 10,
                          background: "rgba(59, 130, 246, 0.08)",
                          border: "1px solid rgba(59, 130, 246, 0.18)",
                          fontSize: "0.76rem",
                        }}
                      >
                        {aiPreview.retryNote}
                      </div>
                    )}

                    {aiPreview.extractionNote && (
                      <div
                        className="mb-2 px-3 py-2"
                        style={{
                          borderRadius: 10,
                          background: "rgba(245, 158, 11, 0.08)",
                          border: "1px solid rgba(245, 158, 11, 0.18)",
                          fontSize: "0.76rem",
                        }}
                      >
                        {aiPreview.extractionNote}
                      </div>
                    )}

                    {aiPreview.coordinateNote && (
                      <div
                        className="mb-2 px-3 py-2"
                        style={{
                          borderRadius: 10,
                          background: "rgba(16, 185, 129, 0.08)",
                          border: "1px solid rgba(16, 185, 129, 0.18)",
                          fontSize: "0.76rem",
                        }}
                      >
                        {aiPreview.coordinateNote}
                      </div>
                    )}

                    {aiPreview.resultImageUrl ? (
                      <img
                        data-testid="ai-preview-image"
                        src={aiPreview.resultImageUrl}
                        alt={t("workspace.aiPreviewAlt")}
                        style={{
                          width: "100%",
                          borderRadius: 12,
                          border: "1px solid rgba(148, 163, 184, 0.18)",
                          objectFit: "cover",
                        }}
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="stitch-ws-text-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {t("workspace.aiNoPreviewImage")}
                      </div>
                    )}

                    <div className="d-flex justify-content-end gap-2 mt-2">
                      {aiPreview.appliedCount > 0 && (
                        <button
                          type="button"
                          className="stitch-back-btn"
                          style={{ padding: "4px 10px", fontSize: "0.72rem" }}
                          onClick={handleClearAiInsertedBoxes}
                        >
                          <i className="ri-delete-bin-line me-1"></i>
                          {t("workspace.aiClearInsertedBoxes")}
                        </button>
                      )}
                      <button
                        type="button"
                        className="stitch-back-btn"
                        style={{ padding: "4px 10px", fontSize: "0.72rem" }}
                        onClick={handleClearAiPreview}
                      >
                        <i className="ri-close-line me-1"></i>
                        {t("workspace.aiClearPreview")}
                      </button>
                    </div>

                    <p
                      className="stitch-ws-text-muted mb-0 mt-2"
                      style={{ fontSize: "0.72rem" }}
                    >
                      {t("workspace.aiPreviewDisclaimer")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          { }
          {showDisputeForm && isRejected && (
            <div
              className="stitch-ws-card"
              style={{ borderColor: "rgba(239, 68, 68, 0.3)" }}
            >
              <div className="stitch-ws-card-header">
                <span style={{ color: "#F87171" }}>
                  <i className="ri-questionnaire-line me-1"></i>{" "}
                  {t("workspace.disputeTitle")}
                </span>
                <button
                  className="stitch-back-btn"
                  style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                  onClick={() => {
                    setShowDisputeForm(false);
                    setDisputeReason("");
                  }}
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
              <div className="stitch-ws-card-body">
                <p
                  className="stitch-ws-text-muted mb-2"
                  style={{ fontSize: "0.78rem" }}
                >
                  {t("workspace.disputeHint")}
                </p>
                <textarea
                  className="form-control mb-2"
                  rows={3}
                  placeholder={t("workspace.disputePlaceholder")}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  disabled={disputeSubmitting}
                />
                <div className="d-flex justify-content-end gap-2">
                  <button
                    className="stitch-ws-nav-btn"
                    onClick={() => {
                      setShowDisputeForm(false);
                      setDisputeReason("");
                    }}
                    disabled={disputeSubmitting}
                  >
                    {t("workspace.disputeCancel")}
                  </button>
                  <button
                    className="stitch-ws-nav-btn"
                    style={{
                      background: "linear-gradient(135deg, #EF4444, #DC2626)",
                      color: "#fff",
                      border: "none",
                    }}
                    onClick={handleCreateDispute}
                    disabled={!disputeReason.trim() || disputeSubmitting}
                  >
                    {disputeSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm"></span>{" "}
                        {t("workspace.disputeSending")}
                      </>
                    ) : (
                      <>
                        <i className="ri-send-plane-fill"></i>{" "}
                        {t("workspace.disputeSendBtn")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkplaceLabelingTaskPage;
