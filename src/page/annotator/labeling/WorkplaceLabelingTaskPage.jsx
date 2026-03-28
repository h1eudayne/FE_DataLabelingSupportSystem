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

  const [highlightedAnnotationId, setHighlightedAnnotationId] = useState(null);
  const [collapsedPanels, setCollapsedPanels] = useState(new Set());

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

  const currentImage = images[currentImgIndex];

  const allAnnotations = useSelector(
    (state) => state.labeling.annotationsByAssignment || {},
  );

  const allDefaultFlags = useSelector(
    (state) => state.labeling.defaultFlagsByAssignment || {},
  );

  const annotations = useSelector(
    (state) => state.labeling.annotationsByAssignment[currentImage?.id] || [],
  );

  const checklistState = useSelector(
    (state) => state.labeling.checklistByAssignment[currentImage?.id] || {},
  );

  const currentDefaultFlags = useSelector(
    (state) => state.labeling.defaultFlagsByAssignment[currentImage?.id] || [],
  );

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

  const eligibleForSubmit = useMemo(() => {
    return images.filter((img) => {
      if (img.status === "Submitted" || img.status === "Approved") return false;
      if (hasValidAnnotations(img.annotationData)) return true;
      const reduxAnns = allAnnotations[img.id];
      if (reduxAnns && reduxAnns.length > 0) return true;
      const reduxFlags = allDefaultFlags[img.id];
      if (reduxFlags && reduxFlags.length > 0) return true;
      return false;
    });
  }, [images, hasValidAnnotations, allAnnotations, allDefaultFlags]);

  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [assignmentId]);

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
    return JSON.stringify({
      annotations: annotations,
      __checklist: checklistState,
      __defaultFlags: currentDefaultFlags,
    });
  }, [annotations, checklistState, currentDefaultFlags]);

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
    const allEligibleIds = eligibleForSubmit.map((img) => img.id);
    const allSelected = allEligibleIds.every((id) => selectedIds.has(id));

    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allEligibleIds));
    }
  };

  const refetchImages = useCallback(async () => {
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
    } catch (err) {
      console.error("Refetch images failed:", err);
    }
  }, [assignmentId, searchParams]);

  const handleBatchSubmit = async () => {
    if (selectedIds.size === 0) {
      toast.warning(t("workspace.batchNoSelection"));
      return;
    }

    const confirmed = window.confirm(
      t("workspace.batchConfirm", { count: selectedIds.size }),
    );
    if (!confirmed) return;

    setBatchSubmitting(true);
    try {
      const res = await taskService.submitMultiple({
        assignmentIds: [...selectedIds],
      });

      const result = res.data || res;

      if (result.successCount > 0 && result.failureCount === 0) {
        toast.success(
          t("workspace.batchSuccess", { count: result.successCount }),
        );
      } else if (result.successCount > 0 && result.failureCount > 0) {
        toast.warning(
          t("workspace.batchPartial", {
            success: result.successCount,
            total: selectedIds.size,
            fail: result.failureCount,
          }),
        );
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((errMsg) =>
            toast.error(errMsg, { autoClose: 5000 }),
          );
        }
      } else {
        toast.error(t("workspace.batchFailed"));
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((errMsg) =>
            toast.error(errMsg, { autoClose: 5000 }),
          );
        }
      }

      await refetchImages();
      setSelectedIds(new Set());
      setShowBatchPanel(false);
    } catch (err) {
      console.error(err);
      toast.error(t("workspace.batchError"));
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
    if (!currentImage || currentImage.status !== "Rejected") {
      setDisputeStatus(null);
      setShowDisputeForm(false);
      return;
    }
    const checkDispute = async () => {
      try {
        const res = await taskService.getMyDisputes(assignmentId);
        const disputes = res.data || res || [];
        const existing = disputes.find(
          (d) => d.assignmentId === currentImage.id && d.status === "Pending",
        );
        setDisputeStatus(existing ? "Pending" : null);
      } catch {
        setDisputeStatus(null);
      }
    };
    checkDispute();
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
    (currentImage.status === "Rejected" && disputeStatus === "Pending");

  const isRejected = currentImage.status === "Rejected";

  const doneCount = images.filter(
    (img) => img.status === "Submitted" || img.status === "Approved",
  ).length;
  const progressPercent =
    images.length > 0 ? Math.round((doneCount / images.length) * 100) : 0;

  return (
    <div>
      {}
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

      {}
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

      {}
      <div className="stitch-ws-layout">
        {}
        <div className="stitch-ws-left-panel">
          {}
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

          {}
          {isRejected && (
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
                  ) : (
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

          {}
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
          {}
          {!isReadOnly && annotations.length === 0 && (
            <div className="stitch-ws-alert warning mb-2" style={{ padding: "10px 14px" }}>
              <div className="d-flex align-items-start gap-2">
                <i className="ri-eye-line" style={{ fontSize: "1rem", marginTop: 1, flexShrink: 0 }}></i>
                <div>
                  <strong style={{ fontSize: "0.8rem" }}>Do not skip visible objects</strong>
                  <p style={{ fontSize: "0.72rem", margin: "2px 0 0", opacity: 0.85 }}>
                    If you see any valid objects in the image, please label them before submitting. Skipping visible objects may affect your quality score.
                  </p>
                </div>
              </div>
            </div>
          )}
          {}
          {!isReadOnly && (() => {
            const isFlagEnabled = currentDefaultFlags.includes("__flag_enabled");
            
            const defaultLabels = labels.filter((l) => l.isDefault);
            const flagOptions = defaultLabels.length > 0
              ? defaultLabels.map((l) => ({ id: l.id, label: l.name, color: l.color }))
              : [{ id: "__image_flagged", label: t("workspace.flagImage") || "Ảnh bị lỗi", color: "#EF4444" }];

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
                    {t("workspace.flagImage") || "Đánh dấu ảnh lỗi"}
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

          {}
          <div className={`stitch-ws-card ${collapsedPanels.has("annotations") ? "collapsed" : ""}`}>
            <div
              className="stitch-ws-card-header"
              style={{ cursor: "pointer" }}
              onClick={() => togglePanel("annotations")}
            >
              <span>
                <i className="ri-list-check-2 me-1"></i> Annotations
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

          {}
          <div>
            <button
              className={`stitch-ws-nav-btn w-100 ${showBatchPanel ? "" : "primary"}`}
              style={{ justifyContent: "center" }}
              onClick={async () => {
                if (!showBatchPanel) await saveDraft(true);
                setShowBatchPanel(!showBatchPanel);
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

          {}
          {showBatchPanel && (
            <div className="stitch-ws-card">
              <div className="stitch-ws-card-header">
                <span>
                  <i className="ri-checkbox-multiple-line me-1"></i>{" "}
                  {t("workspace.selectImages")}
                </span>
                <span className="stitch-ws-badge stitch-ws-badge-inprogress">
                  {selectedIds.size}
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
                      checked={
                        eligibleForSubmit.length > 0 &&
                        eligibleForSubmit.every((img) =>
                          selectedIds.has(img.id),
                        )
                      }
                      onChange={handleSelectAllEligible}
                      disabled={eligibleForSubmit.length === 0}
                    />
                    <label
                      className="form-check-label stitch-ws-text-muted"
                      htmlFor="selectAllEligible"
                      style={{ fontWeight: 600, fontSize: "0.78rem" }}
                    >
                      {t("workspace.selectAll")} ({eligibleForSubmit.length})
                    </label>
                  </div>
                </div>
                {images.map((img, idx) => {
                  const config = STATUS_CONFIG[img.status] || STATUS_CONFIG.New;
                  const isEligible =
                    img.status !== "Submitted" && img.status !== "Approved";
                  const reduxAnns = allAnnotations[img.id];
                  const reduxFlags = allDefaultFlags[img.id];
                  const hasData =
                    hasValidAnnotations(img.annotationData) ||
                    (reduxAnns && reduxAnns.length > 0) ||
                    (reduxFlags && reduxFlags.length > 0);
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
                          checked={selectedIds.has(img.id)}
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
                        {config.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="stitch-ws-card-body py-2 text-center">
                <button
                  className="stitch-ws-nav-btn success w-100"
                  style={{ justifyContent: "center" }}
                  disabled={selectedIds.size === 0 || batchSubmitting}
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
                      {t("workspace.submitCount", { count: selectedIds.size })}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {}
        <div className="stitch-ws-center-panel">
          <LabelingWorkspace
            assignmentId={currentImage.id}
            imageUrl={currentImage.dataItemUrl}
            readOnly={isReadOnly}
            highlightedAnnotationId={highlightedAnnotationId}
            onAnnotationClick={(id) => setHighlightedAnnotationId(id)}
            projectType={projectInfo?.allowGeometryTypes}
          />

          {}
          <div className="stitch-ws-bottom-bar">
            <button
              className="nav-arrow"
              disabled={currentImgIndex === 0}
              onClick={handlePrev}
              title={t("workspace.prevImage")}
            >
              <i className="ri-arrow-left-s-line"></i>
            </button>

            {}
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

            {}
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
                    className={`action-btn ${isRejected ? "warning" : "success"}`}
                    onClick={handleSubmit}
                  >
                    <i
                      className={`ri-${isRejected ? "restart-line" : "check-line"}`}
                    ></i>
                    {isRejected
                      ? t("workspace.resubmit")
                      : t("workspace.submitTask")}
                  </button>
                </>
              )}
              {isReadOnly && (
                <span
                  className="stitch-ws-badge stitch-ws-badge-approved"
                  style={{ fontSize: "0.78rem", padding: "5px 12px" }}
                >
                  <i className="ri-check-double-line me-1"></i>{" "}
                  {t("workspace.submitted")}
                </span>
              )}
            </div>
          </div>
        </div>

        {}
        <div className="stitch-ws-right-panel">
          {}
          <CommentSection
            rejectionReason={currentImage.rejectionReason}
            status={currentImage.status}
          />

          {}
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
