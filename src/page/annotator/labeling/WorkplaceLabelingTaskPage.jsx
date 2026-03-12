import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
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
} from "../../../store/annotator/labelling/labelingSlice";

import { setCurrentTask } from "../../../store/annotator/labelling/taskSlice";

import taskService from "../../../services/annotator/labeling/taskService";
import projectService from "../../../services/annotator/labeling/projectService";

const STATUS_CONFIG = {
  New: { cls: "stitch-ws-badge stitch-ws-badge-new", label: "Mới" },
  InProgress: { cls: "stitch-ws-badge stitch-ws-badge-inprogress", label: "Đang làm" },
  Rejected: { cls: "stitch-ws-badge stitch-ws-badge-rejected", label: "Từ chối" },
  Submitted: { cls: "stitch-ws-badge stitch-ws-badge-submitted", label: "Đã nộp" },
  Approved: { cls: "stitch-ws-badge stitch-ws-badge-approved", label: "Duyệt" },
};

const WorkplaceLabelingTaskPage = () => {
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
  const [saveStatus, setSaveStatus] = useState("saved");
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const isDirtyRef = React.useRef(false);

  const currentImage = images[currentImgIndex];

  const allAnnotations = useSelector(
    (state) => state.labeling.annotationsByAssignment || {},
  );

  const annotations = useSelector(
    (state) => state.labeling.annotationsByAssignment[currentImage?.id] || [],
  );

  const checklistState = useSelector(
    (state) => state.labeling.checklistByAssignment[currentImage?.id] || {},
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
      return false;
    });
  }, [images, hasValidAnnotations, allAnnotations]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [projectRes, imgRes] = await Promise.all([
          projectService.getById(assignmentId),
          taskService.getProjectImages(assignmentId),
        ]);

        const projectData = projectRes.data || projectRes;
        setProjectInfo(projectData);
        setLabels(projectData?.labels || []);

        const allImages = imgRes.data || imgRes || [];

        const packStart = parseInt(searchParams.get("packStart"), 10);
        const packEnd = parseInt(searchParams.get("packEnd"), 10);
        const sliced =
          !isNaN(packStart) && !isNaN(packEnd)
            ? allImages.slice(packStart, packEnd)
            : allImages;

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
        toast.error("Không tải được dữ liệu dự án");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assignmentId]);

  useEffect(() => {
    if (!currentImage) return;

    dispatch(setCurrentTask(currentImage));

    let parsedAnnotations = [];
    let parsedChecklist = {};
    try {
      if (currentImage.annotationData) {
        const parsed = JSON.parse(currentImage.annotationData);
        if (parsed && parsed.__checklist) {
          parsedAnnotations = parsed.annotations || [];
          parsedChecklist = parsed.__checklist || {};
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
  }, [currentImage, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(setSelectedLabel(null));
    };
  }, [dispatch]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!e.shiftKey) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentImgIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentImgIndex((prev) =>
          Math.min(images.length - 1, prev + 1)
        );
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
  }, [annotations, checklistState]);

  const buildDataJSON = useCallback(() => {
    return JSON.stringify({
      annotations: annotations,
      __checklist: checklistState,
    });
  }, [annotations, checklistState]);

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
        if (!silent) toast.success("Đã lưu bản nháp");
        return true;
      } catch (err) {
        console.error(err);
        setSaveStatus("unsaved");
        toast.error("Lưu nháp thất bại");
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

    if (annotations.length === 0) {
      toast.warning(
        "Bạn chưa gán nhãn nào cho ảnh này. Vui lòng gán ít nhất 1 nhãn trước khi nộp.",
      );
      return;
    }

    const usedLabelIds = new Set(annotations.map((a) => a.labelId));
    const unusedLabels = labels.filter(
      (l) => unlockedLabelIds.has(l.id) && !usedLabelIds.has(l.id),
    );

    if (unusedLabels.length > 0) {
      const names = unusedLabels.map((l) => l.name).join(", ");
      toast.error(
        `Chưa gán đủ nhãn! Các nhãn bắt buộc chưa dùng: ${names}. Bạn phải gán nhãn cho TẤT CẢ đối tượng yêu cầu trong ảnh.`,
        { autoClose: 8000 },
      );
      return;
    }

    try {
      const draftSaved = await saveDraft(true);
      if (!draftSaved) {
        toast.error("Lưu bản nháp thất bại. Vui lòng thử lại trước khi nộp.");
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
      toast.success(isResubmit ? "Nộp lại thành công!" : "Nộp bài thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Gửi bài thất bại");
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
      const allImages = imgRes.data || imgRes || [];

      const packStart = parseInt(searchParams.get("packStart"), 10);
      const packEnd = parseInt(searchParams.get("packEnd"), 10);
      const sliced =
        !isNaN(packStart) && !isNaN(packEnd)
          ? allImages.slice(packStart, packEnd)
          : allImages;

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
      toast.warning("Chưa chọn ảnh nào để nộp.");
      return;
    }

    const confirmed = window.confirm(
      `Bạn sắp nộp ${selectedIds.size} ảnh cùng lúc.\n\n Các ảnh chưa có dữ liệu gán nhãn sẽ bị từ chối bởi hệ thống.\nBạn có chắc chắn muốn nộp?`,
    );
    if (!confirmed) return;

    setBatchSubmitting(true);
    try {
      const res = await taskService.submitMultiple({
        assignmentIds: [...selectedIds],
      });

      const result = res.data || res;

      if (result.successCount > 0 && result.failureCount === 0) {
        toast.success(`Đã nộp thành công ${result.successCount} ảnh!`);
      } else if (result.successCount > 0 && result.failureCount > 0) {
        toast.warning(
          `Nộp thành công ${result.successCount}/${selectedIds.size} ảnh. ${result.failureCount} ảnh thất bại.`,
        );
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((errMsg) =>
            toast.error(errMsg, { autoClose: 5000 }),
          );
        }
      } else {
        toast.error("Nộp bài thất bại. Vui lòng kiểm tra lại dữ liệu.");
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
      toast.error("Lỗi khi nộp hàng loạt. Vui lòng thử lại.");
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
      toast.warning("Vui lòng nhập lý do khiếu nại.");
      return;
    }

    setDisputeSubmitting(true);
    try {
      await taskService.createDispute({
        assignmentId: currentImage.id,
        reason: disputeReason.trim(),
      });
      toast.success("Khiếu nại đã được gửi thành công! Manager sẽ xem xét.");
      setDisputeStatus("Pending");
      setShowDisputeForm(false);
      setDisputeReason("");
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data ||
        "Gửi khiếu nại thất bại.";
      toast.error(typeof msg === "string" ? msg : "Gửi khiếu nại thất bại.");
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
    return <div className="text-center mt-5">Đang tải dữ liệu...</div>;

  if (!guidelineRead && labels.length > 0) {
    return (
      <div className="container-fluid">
        <div className="row justify-content-center mt-4">
          <div className="col-lg-8">
            <div className="card shadow border-0">
              <div className="card-header bg-warning bg-opacity-10 py-3">
                <h5 className="card-title mb-0 text-warning fw-bold">
                  <i className="ri-book-read-line me-2"></i>
                  HƯỚNG DẪN GÁN NHÃN — BẮT BUỘC ĐỌC
                </h5>
              </div>
              <div className="card-body">
                {projectInfo?.annotationGuide && (
                  <div className="alert alert-info mb-4">
                    <h6 className="fw-bold mb-2">
                      <i className="ri-file-text-line me-1"></i>Hướng dẫn tổng
                      quan
                    </h6>
                    <p className="mb-0">{projectInfo.annotationGuide}</p>
                  </div>
                )}

                <h6 className="fw-bold mb-3">
                  <i className="ri-price-tag-3-line me-1"></i>Danh sách nhãn &
                  Tiêu chí
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
                      {label.checklist && label.checklist.length > 0 && (
                        <div className="mt-1">
                          <small className="fw-bold text-dark">
                            Tiêu chí (phải tick hết mới dùng được nhãn này):
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
                  Tôi đã đọc hướng dẫn — Bắt đầu gán nhãn
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentImage)
    return <div className="text-center mt-5">Dự án này chưa có ảnh nào.</div>;

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
      {/* ── Workspace Header Bar ── */}
      <div className="stitch-ws-header-bar">
        <button
          className="back-btn"
          onClick={handleGoBack}
          disabled={goingBack}
        >
          {goingBack ? (
            <><span className="spinner-border spinner-border-sm" /> Đang lưu...</>
          ) : (
            <><i className="ri-arrow-left-line"></i> Quay về</>
          )}
        </button>

        <span className="stitch-ws-header-title">
          <i className="ri-image-edit-line me-1"></i>
          {projectInfo?.name || "Workspace"} — Ảnh {currentImgIndex + 1}/{images.length}
        </span>

        <span className={(STATUS_CONFIG[currentImage.status] || STATUS_CONFIG.New).cls}>
          {(STATUS_CONFIG[currentImage.status] || STATUS_CONFIG.New).label}
        </span>

        {!isReadOnly && (
          <span className={`stitch-ws-save-badge ${saveStatus}`}>
            {saveStatus === "saved" && (
              <><i className="ri-check-line"></i> Saved {lastSavedTime && lastSavedTime.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</>
            )}
            {saveStatus === "saving" && (
              <><span className="spinner-border spinner-border-sm" style={{ width: 10, height: 10 }}></span> Saving...</>
            )}
            {saveStatus === "unsaved" && (
              <><i className="ri-circle-fill" style={{ fontSize: 6 }}></i> Unsaved</>
            )}
          </span>
        )}

        <button
          className="back-btn"
          onClick={() => setShowShortcuts(!showShortcuts)}
          title="Phím tắt"
        >
          <i className="ri-keyboard-line"></i>
        </button>
      </div>

      {/* Shortcuts dropdown (below header) */}
      {showShortcuts && (
        <div className="stitch-ws-card mb-2">
          <div className="stitch-ws-card-body" style={{ padding: "8px 14px" }}>
            <div className="d-flex flex-wrap gap-3">
              <div className="stitch-ws-shortcut"><span>Undo</span><span className="stitch-ws-kbd">Ctrl+Z</span></div>
              <div className="stitch-ws-shortcut"><span>Xóa box cuối</span><span className="stitch-ws-kbd">Delete</span></div>
              <div className="stitch-ws-shortcut"><span>Xóa 1 box</span><span className="stitch-ws-text-muted">Double-click</span></div>
              <div className="stitch-ws-shortcut"><span>Zoom</span><span className="stitch-ws-kbd">Ctrl+Scroll</span></div>
              <div className="stitch-ws-shortcut"><span>Di chuyển</span><span className="stitch-ws-kbd">Arrow keys</span></div>
              <div className="stitch-ws-shortcut"><span>Ảnh trước/sau</span><span><span className="stitch-ws-kbd me-1">Shift+←</span><span className="stitch-ws-kbd">Shift+→</span></span></div>
            </div>
          </div>
        </div>
      )}

      {/* ── 3-Panel Layout ── */}
      <div className="stitch-ws-layout">

        {/* ──── LEFT PANEL ──── */}
        <div className="stitch-ws-left-panel">
          {/* Progress */}
          <div className="stitch-ws-card">
            <div className="stitch-ws-card-body" style={{ padding: "10px 14px" }}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="stitch-ws-text-muted" style={{ fontWeight: 600, fontSize: "0.78rem" }}>
                  Tiến độ
                </span>
                <span className="stitch-ws-text-primary" style={{ fontSize: "0.78rem" }}>
                  {doneCount}/{images.length} ({progressPercent}%)
                </span>
              </div>
              <div className="stitch-ws-progress">
                <div
                  className={`stitch-ws-progress-bar ${progressPercent === 100 ? "complete" : ""}`}
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Rejected Alert */}
          {isRejected && (
            <div className="stitch-ws-alert danger">
              <div className="d-flex align-items-start gap-2">
                <i className="ri-error-warning-fill" style={{ fontSize: "1.1rem", marginTop: 2 }}></i>
                <div className="flex-grow-1">
                  <strong className="d-block mb-1">Ảnh bị từ chối</strong>
                  <span style={{ opacity: 0.85 }}>Vui lòng đọc comment bên phải và sửa lại.</span>
                  {disputeStatus === "Pending" ? (
                    <div className="stitch-ws-alert warning mt-2" style={{ marginBottom: 0 }}>
                      <i className="ri-time-line me-1"></i>
                      <strong>Đã gửi khiếu nại — đang chờ xử lý</strong>
                    </div>
                  ) : (
                    <button
                      className="stitch-ws-nav-btn mt-2"
                      style={{ padding: "4px 12px", fontSize: "0.75rem" }}
                      onClick={() => setShowDisputeForm(true)}
                    >
                      <i className="ri-questionnaire-line"></i> Khiếu nại
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Read-only / Dispute lock notices */}
          {currentImage.status === "Rejected" && disputeStatus === "Pending" && (
            <div className="stitch-ws-alert warning">
              <i className="ri-lock-line me-1"></i>
              Đang chờ xử lý khiếu nại.
            </div>
          )}
          {isReadOnly && currentImage.status !== "Rejected" && (
            <div className="stitch-ws-alert info">
              <i className="ri-lock-line me-1"></i>
              Chỉ xem, không chỉnh sửa.
            </div>
          )}

          {/* Label Toolbox */}
          {!isReadOnly && (
            <LabelToolbox labels={labels} assignmentId={currentImage.id} annotations={annotations} />
          )}

          {/* Annotations List */}
          <div className="stitch-ws-card">
            <div className="stitch-ws-card-header">
              <span><i className="ri-list-check-2 me-1"></i> Annotations</span>
              <span className="stitch-ws-badge stitch-ws-badge-inprogress">{annotations.length}</span>
            </div>
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {annotations.length === 0 ? (
                <div className="stitch-ws-card-body text-center" style={{ padding: "20px 14px" }}>
                  <i className="ri-shape-line d-block mb-1" style={{ fontSize: "1.5rem", opacity: 0.3 }}></i>
                  <span className="stitch-ws-text-muted">Chưa có annotation</span>
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
                        width: 12, height: 12, borderRadius: 3,
                        background: a.color || "#6c757d", flexShrink: 0,
                        border: highlightedAnnotationId === a.id ? "2px solid #3B82F6" : "none",
                      }}
                      className="me-2"
                    ></span>
                    <span className="flex-grow-1 text-truncate" style={{ fontWeight: 500 }}>
                      {a.labelName || `Box ${idx + 1}`}
                    </span>
                    <span className="stitch-ws-text-muted me-2" style={{ fontSize: "0.65rem" }}>
                      {Math.round(a.width)}×{Math.round(a.height)}
                    </span>
                    {!isReadOnly && (
                      <button
                        className="btn btn-link btn-sm p-0"
                        style={{ color: "#F87171", lineHeight: 1 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(removeAnnotation({ assignmentId: currentImage.id, id: a.id }));
                        }}
                        title="Xóa annotation này"
                      >
                        <i className="ri-close-line"></i>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Batch Submit Toggle */}
          <div>
            <button
              className={`stitch-ws-nav-btn w-100 ${showBatchPanel ? "" : "primary"}`}
              style={{ justifyContent: "center" }}
              onClick={async () => {
                if (!showBatchPanel) await saveDraft(true);
                setShowBatchPanel(!showBatchPanel);
              }}
            >
              <i className={`ri-${showBatchPanel ? "close" : "stack"}-line`}></i>
              {showBatchPanel ? "Ẩn batch" : "Nộp hàng loạt"}
            </button>
          </div>

          {/* Batch Panel */}
          {showBatchPanel && (
            <div className="stitch-ws-card">
              <div className="stitch-ws-card-header">
                <span><i className="ri-checkbox-multiple-line me-1"></i> Chọn ảnh</span>
                <span className="stitch-ws-badge stitch-ws-badge-inprogress">{selectedIds.size}</span>
              </div>
              <div className="stitch-ws-card-body p-0" style={{ maxHeight: "250px", overflowY: "auto" }}>
                <div className="px-3 py-2" style={{ borderBottom: "1px solid rgba(51, 65, 85, 0.2)" }}>
                  <div className="form-check">
                    <input
                      className="form-check-input" type="checkbox" id="selectAllEligible"
                      checked={eligibleForSubmit.length > 0 && eligibleForSubmit.every((img) => selectedIds.has(img.id))}
                      onChange={handleSelectAllEligible}
                      disabled={eligibleForSubmit.length === 0}
                    />
                    <label className="form-check-label stitch-ws-text-muted" htmlFor="selectAllEligible" style={{ fontWeight: 600, fontSize: "0.78rem" }}>
                      Chọn tất cả ({eligibleForSubmit.length})
                    </label>
                  </div>
                </div>
                {images.map((img, idx) => {
                  const config = STATUS_CONFIG[img.status] || STATUS_CONFIG.New;
                  const isEligible = img.status !== "Submitted" && img.status !== "Approved";
                  const reduxAnns = allAnnotations[img.id];
                  const hasData = hasValidAnnotations(img.annotationData) || (reduxAnns && reduxAnns.length > 0);
                  return (
                    <div key={img.id} className={`stitch-ws-batch-item ${idx === currentImgIndex ? "active" : ""}`} onClick={() => setCurrentImgIndex(idx)}>
                      {isEligible && (
                        <input className="form-check-input me-2 flex-shrink-0" type="checkbox"
                          checked={selectedIds.has(img.id)}
                          onChange={(e) => { e.stopPropagation(); handleToggleSelect(img.id); }}
                          onClick={(e) => e.stopPropagation()}
                          disabled={!hasData}
                        />
                      )}
                      {!isEligible && <div style={{ width: "22px" }} className="me-2"></div>}
                      <small className="flex-grow-1 text-truncate">Ảnh {idx + 1}</small>
                      <span className={`${config.cls} ms-1`}>{config.label}</span>
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
                    <><span className="spinner-border spinner-border-sm"></span> Đang nộp...</>
                  ) : (
                    <><i className="ri-send-plane-fill"></i> Nộp {selectedIds.size} ảnh</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ──── CENTER PANEL ──── */}
        <div className="stitch-ws-center-panel">
          <LabelingWorkspace
            assignmentId={currentImage.id}
            imageUrl={currentImage.dataItemUrl}
            readOnly={isReadOnly}
            highlightedAnnotationId={highlightedAnnotationId}
            onAnnotationClick={(id) => setHighlightedAnnotationId(id)}
          />

          {/* ── Bottom Navigation Bar ── */}
          <div className="stitch-ws-bottom-bar">
            <button
              className="nav-arrow"
              disabled={currentImgIndex === 0}
              onClick={handlePrev}
              title="Ảnh trước (Shift+←)"
            >
              <i className="ri-arrow-left-s-line"></i>
            </button>

            {/* Thumbnail strip */}
            <div className="stitch-ws-thumb-strip">
              {images.map((img, idx) => {
                const isCurrent = idx === currentImgIndex;
                const statusKey = img.status || "New";
                const dotColor =
                  statusKey === "Approved" ? "#22C55E" :
                  statusKey === "Submitted" ? "#FACC15" :
                  statusKey === "Rejected" ? "#EF4444" :
                  statusKey === "InProgress" ? "#3B82F6" : null;
                return (
                  <div
                    key={img.id}
                    className={`thumb-item ${isCurrent ? "active" : ""}`}
                    onClick={() => setCurrentImgIndex(idx)}
                    title={`Ảnh ${idx + 1} — ${(STATUS_CONFIG[statusKey] || STATUS_CONFIG.New).label}`}
                  >
                    {idx + 1}
                    {dotColor && (
                      <span className="status-dot" style={{ background: dotColor }}></span>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              className="nav-arrow"
              disabled={currentImgIndex === images.length - 1}
              onClick={handleNext}
              title="Ảnh tiếp (Shift+→)"
            >
              <i className="ri-arrow-right-s-line"></i>
            </button>

            {/* Action buttons */}
            <div className="action-group">
              {!isReadOnly && (
                <>
                  <button className="action-btn primary" onClick={() => saveDraft(false)}>
                    <i className="ri-save-line"></i> Lưu nháp
                  </button>
                  <button
                    className={`action-btn ${isRejected ? "warning" : "success"}`}
                    onClick={handleSubmit}
                  >
                    <i className={`ri-${isRejected ? "restart-line" : "check-line"}`}></i>
                    {isRejected ? "Nộp lại" : "Nộp bài"}
                  </button>
                </>
              )}
              {isReadOnly && (
                <span className="stitch-ws-badge stitch-ws-badge-approved" style={{ fontSize: "0.78rem", padding: "5px 12px" }}>
                  <i className="ri-check-double-line me-1"></i> Đã nộp
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ──── RIGHT PANEL ──── */}
        <div className="stitch-ws-right-panel">
          {/* Comments */}
          <CommentSection rejectionReason={currentImage.rejectionReason} status={currentImage.status} />

          {/* Dispute Form */}
          {showDisputeForm && isRejected && (
            <div className="stitch-ws-card" style={{ borderColor: "rgba(239, 68, 68, 0.3)" }}>
              <div className="stitch-ws-card-header">
                <span style={{ color: "#F87171" }}>
                  <i className="ri-questionnaire-line me-1"></i> Khiếu nại
                </span>
                <button
                  className="stitch-back-btn"
                  style={{ padding: "4px 8px", fontSize: "0.72rem" }}
                  onClick={() => { setShowDisputeForm(false); setDisputeReason(""); }}
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
              <div className="stitch-ws-card-body">
                <p className="stitch-ws-text-muted mb-2" style={{ fontSize: "0.78rem" }}>
                  Nhập lý do nếu bạn cho rằng Reviewer chấm sai.
                </p>
                <textarea
                  className="form-control mb-2"
                  rows={3}
                  placeholder="Nhập lý do khiếu nại..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  disabled={disputeSubmitting}
                />
                <div className="d-flex justify-content-end gap-2">
                  <button className="stitch-ws-nav-btn" onClick={() => { setShowDisputeForm(false); setDisputeReason(""); }} disabled={disputeSubmitting}>
                    Hủy
                  </button>
                  <button
                    className="stitch-ws-nav-btn"
                    style={{ background: "linear-gradient(135deg, #EF4444, #DC2626)", color: "#fff", border: "none" }}
                    onClick={handleCreateDispute}
                    disabled={!disputeReason.trim() || disputeSubmitting}
                  >
                    {disputeSubmitting ? (<><span className="spinner-border spinner-border-sm"></span> Đang gửi...</>) : (<><i className="ri-send-plane-fill"></i> Gửi</>)}
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
