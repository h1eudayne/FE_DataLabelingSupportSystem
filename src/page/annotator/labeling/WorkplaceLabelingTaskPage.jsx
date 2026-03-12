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
  New: { bg: "bg-secondary-subtle", text: "text-secondary", label: "Mới" },
  InProgress: { bg: "bg-info-subtle", text: "text-info", label: "Đang làm" },
  Rejected: { bg: "bg-danger-subtle", text: "text-danger", label: "Từ chối" },
  Submitted: { bg: "bg-warning-subtle", text: "text-warning", label: "Đã nộp" },
  Approved: { bg: "bg-success-subtle", text: "text-success", label: "Duyệt" },
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
      <div className="mb-3">
        <button
          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
          onClick={handleGoBack}
          disabled={goingBack}
        >
          {goingBack ? (
            <>
              <span className="spinner-border spinner-border-sm" />
              Đang lưu...
            </>
          ) : (
            <>
              <i className="ri-arrow-left-line"></i>
              Quay lại danh sách Pack
            </>
          )}
        </button>
      </div>

      <div className="row g-3">
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-body py-2 px-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <div className="d-flex align-items-center gap-2">
                  <span
                    className={`badge ${(STATUS_CONFIG[currentImage.status] || STATUS_CONFIG.New).bg} ${(STATUS_CONFIG[currentImage.status] || STATUS_CONFIG.New).text}`}
                  >
                    {
                      (STATUS_CONFIG[currentImage.status] || STATUS_CONFIG.New)
                        .label
                    }
                  </span>
                  <span className="small fw-bold text-muted">
                    Ảnh {currentImgIndex + 1} / {images.length}
                  </span>
                </div>
                <span className="small fw-bold text-primary">
                  {doneCount}/{images.length} ({progressPercent}%)
                </span>
              </div>
              <div className="progress" style={{ height: 6 }}>
                <div
                  className={`progress-bar bg-${progressPercent === 100 ? "success" : "primary"}`}
                  role="progressbar"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>

          {isRejected && (
            <div className="alert alert-danger small py-2 mb-3">
              <div className="d-flex align-items-start">
                <i className="ri-error-warning-fill me-2 fs-5 text-danger"></i>
                <div className="flex-grow-1">
                  <strong className="d-block mb-1">
                    Ảnh bị từ chối bởi Reviewer
                  </strong>
                  <span>
                    Vui lòng đọc comment bên dưới và sửa lại bản vẽ. Nếu ảnh
                    mờ/thiếu thông tin, hãy làm theo Guideline.
                  </span>
                  <br />

                  {disputeStatus === "Pending" ? (
                    <div className="mt-2 p-2 bg-warning bg-opacity-10 rounded border border-warning">
                      <i className="ri-time-line me-1 text-warning"></i>
                      <span className="text-warning fw-bold">
                        Đã gửi khiếu nại — đang chờ Manager xử lý
                      </span>
                    </div>
                  ) : (
                    <button
                      className="btn btn-outline-danger btn-sm mt-2"
                      onClick={() => setShowDisputeForm(true)}
                    >
                      <i className="ri-questionnaire-line me-1"></i>
                      Khiếu nại (Dispute)
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentImage.status === "Rejected" &&
            disputeStatus === "Pending" && (
              <div className="alert alert-warning small py-2">
                <i className="ri-lock-line me-1"></i>
                Đang chờ xử lý khiếu nại. Bạn không thể chỉnh sửa cho đến khi
                Manager phân xử.
              </div>
            )}

          {isReadOnly && currentImage.status !== "Rejected" && (
            <div className="alert alert-info small py-2 mb-3">
              <i className="ri-lock-line me-1"></i>
              Ảnh này đã được nộp. Chỉ xem, không chỉnh sửa.
            </div>
          )}

          {!isReadOnly && (
            <LabelToolbox
              labels={labels}
              assignmentId={currentImage.id}
              annotations={annotations}
            />
          )}

          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white py-2 border-bottom d-flex justify-content-between align-items-center">
              <small className="fw-bold text-muted">
                <i className="ri-list-check-2 me-1"></i>
                Annotations
              </small>
              <span className="badge bg-primary-subtle text-primary">
                {annotations.length}
              </span>
            </div>
            <div
              className="card-body p-0"
              style={{ maxHeight: "200px", overflowY: "auto" }}
            >
              {annotations.length === 0 ? (
                <div className="text-center text-muted small py-3">
                  <i className="ri-shape-line d-block fs-4 mb-1 opacity-50"></i>
                  Chưa có annotation nào
                </div>
              ) : (
                annotations.map((a, idx) => (
                  <div
                    key={a.id}
                    className={`d-flex align-items-center px-3 py-2 border-bottom ${highlightedAnnotationId === a.id ? "bg-warning bg-opacity-10" : ""}`}
                    style={{
                      fontSize: 12,
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
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
                            ? "2px solid #0d6efd"
                            : "none",
                      }}
                      className="me-2"
                    ></span>
                    <span className="flex-grow-1 text-truncate fw-medium">
                      {a.labelName || `Box ${idx + 1}`}
                    </span>
                    <span className="text-muted me-2" style={{ fontSize: 10 }}>
                      {Math.round(a.width)}×{Math.round(a.height)}
                    </span>
                    {!isReadOnly && (
                      <button
                        className="btn btn-link btn-sm text-danger p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(
                            removeAnnotation({
                              assignmentId: currentImage.id,
                              id: a.id,
                            }),
                          );
                        }}
                        title="Xóa annotation này"
                        style={{ lineHeight: 1 }}
                      >
                        <i className="ri-close-line"></i>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white py-2 border-bottom">
              <small className="fw-bold text-muted">
                <i className="ri-gallery-line me-1"></i>
                Danh sách ảnh
              </small>
            </div>
            <div
              className="d-flex gap-1 p-2 flex-wrap"
              style={{ maxHeight: "140px", overflowY: "auto" }}
            >
              {images.map((img, idx) => {
                const cfg = STATUS_CONFIG[img.status] || STATUS_CONFIG.New;
                const isCurrent = idx === currentImgIndex;
                const borderColor =
                  img.status === "Approved"
                    ? "#198754"
                    : img.status === "Submitted"
                      ? "#ffc107"
                      : img.status === "Rejected"
                        ? "#dc3545"
                        : img.status === "InProgress"
                          ? "#0dcaf0"
                          : "#adb5bd";
                const imgAnns = allAnnotations[img.id] || [];
                return (
                  <div
                    key={img.id}
                    onClick={() => setCurrentImgIndex(idx)}
                    title={`Ảnh ${idx + 1} — ${cfg.label} — ${imgAnns.length} box`}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 6,
                      border: isCurrent
                        ? `3px solid #0d6efd`
                        : `2px solid ${borderColor}`,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: isCurrent ? 700 : 500,
                      background: isCurrent
                        ? "rgba(13,110,253,0.1)"
                        : "#f8f9fa",
                      color: isCurrent ? "#0d6efd" : "#495057",
                      transition: "all 0.15s",
                      flexShrink: 0,
                      position: "relative",
                    }}
                  >
                    {idx + 1}
                    {imgAnns.length > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: -4,
                          right: -4,
                          fontSize: 8,
                          background: "#0d6efd",
                          color: "#fff",
                          borderRadius: "50%",
                          width: 14,
                          height: 14,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                        }}
                      >
                        {imgAnns.length}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-3">
            <button
              className="btn btn-sm btn-outline-secondary w-100 d-flex align-items-center justify-content-between"
              onClick={() => setShowShortcuts(!showShortcuts)}
            >
              <span>
                <i className="ri-keyboard-line me-1"></i>
                Phím tắt
              </span>
              <i
                className={`ri-arrow-${showShortcuts ? "up" : "down"}-s-line`}
              ></i>
            </button>
            {showShortcuts && (
              <div className="card border-0 shadow-sm mt-1">
                <div className="card-body py-2 px-3 small">
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-muted">Undo</span>
                    <kbd style={{ fontSize: 10 }}>Ctrl+Z</kbd>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-muted">Xóa box cuối</span>
                    <kbd style={{ fontSize: 10 }}>Delete</kbd>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-muted">Xóa 1 box</span>
                    <span className="text-muted" style={{ fontSize: 10 }}>
                      Double-click
                    </span>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-muted">Zoom</span>
                    <kbd style={{ fontSize: 10 }}>Ctrl+Scroll</kbd>
                  </div>
                  <div className="d-flex justify-content-between py-1 border-bottom">
                    <span className="text-muted">Di chuyển canvas</span>
                    <kbd style={{ fontSize: 10 }}>Arrow keys</kbd>
                  </div>
                  <div className="d-flex justify-content-between py-1">
                    <span className="text-muted">Ảnh trước/sau</span>
                    <span>
                      <kbd style={{ fontSize: 10 }}>Shift+←</kbd>{" "}
                      <kbd style={{ fontSize: 10 }}>Shift+→</kbd>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-3">
            <button
              className={`btn btn-sm w-100 ${showBatchPanel ? "btn-outline-secondary" : "btn-outline-primary"}`}
              onClick={async () => {
                if (!showBatchPanel) {
                  await saveDraft(true);
                }
                setShowBatchPanel(!showBatchPanel);
              }}
            >
              <i
                className={`ri-${showBatchPanel ? "close" : "stack"}-line me-1`}
              ></i>
              {showBatchPanel ? "Ẩn danh sách ảnh" : "Nộp hàng loạt"}
            </button>
          </div>

          {showBatchPanel && (
            <div className="card mt-2 border shadow-sm">
              <div className="card-header bg-primary bg-opacity-10 py-2 d-flex justify-content-between align-items-center">
                <small className="fw-bold text-primary">
                  <i className="ri-checkbox-multiple-line me-1"></i>
                  Chọn ảnh để nộp
                </small>
                <span className="badge bg-primary">
                  {selectedIds.size} đã chọn
                </span>
              </div>
              <div
                className="card-body p-0"
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
                <div className="px-3 py-2 border-bottom bg-light">
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
                      className="form-check-label small fw-bold"
                      htmlFor="selectAllEligible"
                    >
                      Chọn tất cả chưa nộp ({eligibleForSubmit.length} ảnh)
                    </label>
                  </div>
                </div>

                {images.map((img, idx) => {
                  const config = STATUS_CONFIG[img.status] || STATUS_CONFIG.New;
                  const isEligible =
                    img.status !== "Submitted" && img.status !== "Approved";
                  const reduxAnns = allAnnotations[img.id];
                  const hasData =
                    hasValidAnnotations(img.annotationData) ||
                    (reduxAnns && reduxAnns.length > 0);

                  return (
                    <div
                      key={img.id}
                      className={`d-flex align-items-center px-3 py-2 border-bottom ${
                        idx === currentImgIndex
                          ? "bg-primary bg-opacity-10"
                          : ""
                      }`}
                      style={{ cursor: "pointer" }}
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
                          title={!hasData ? "Ảnh chưa có dữ liệu gán nhãn" : ""}
                        />
                      )}
                      {!isEligible && (
                        <div style={{ width: "22px" }} className="me-2"></div>
                      )}
                      <small className="flex-grow-1 text-truncate">
                        Ảnh {idx + 1}
                      </small>
                      <span
                        className={`badge ${config.bg} ${config.text} ms-1`}
                        style={{ fontSize: "10px" }}
                      >
                        {config.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="card-footer bg-white py-2 text-center">
                <button
                  className="btn btn-success btn-sm w-100"
                  disabled={selectedIds.size === 0 || batchSubmitting}
                  onClick={handleBatchSubmit}
                >
                  {batchSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      Đang nộp...
                    </>
                  ) : (
                    <>
                      <i className="ri-send-plane-fill me-1"></i>
                      Nộp {selectedIds.size} ảnh đã chọn
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="col-lg-9">
          <LabelingWorkspace
            assignmentId={currentImage.id}
            imageUrl={currentImage.dataItemUrl}
            readOnly={isReadOnly}
            highlightedAnnotationId={highlightedAnnotationId}
            onAnnotationClick={(id) => setHighlightedAnnotationId(id)}
          />

          <div className="d-flex justify-content-between align-items-center mt-3 p-3 bg-light rounded shadow-sm">
            <button
              className="btn btn-secondary"
              disabled={currentImgIndex === 0}
              onClick={handlePrev}
            >
              <i className="bx bx-chevron-left"></i> Trước
            </button>

            <div className="d-flex align-items-center gap-2">
              {/* Save indicator */}
              {!isReadOnly && (
                <span
                  className={`small d-flex align-items-center gap-1 me-2 ${
                    saveStatus === "saved"
                      ? "text-success"
                      : saveStatus === "saving"
                        ? "text-warning"
                        : "text-danger"
                  }`}
                  style={{ fontSize: 11, minWidth: 80 }}
                >
                  {saveStatus === "saved" && (
                    <>
                      <i className="ri-check-line"></i>
                      Đã lưu{" "}
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
                      ></span>
                      Đang lưu...
                    </>
                  )}
                  {saveStatus === "unsaved" && (
                    <>
                      <i className="ri-circle-fill" style={{ fontSize: 8 }}></i>
                      Chưa lưu
                    </>
                  )}
                </span>
              )}

              {!isReadOnly && (
                <>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => saveDraft(false)}
                  >
                    <i className="bx bx-save me-1"></i> Lưu nháp
                  </button>
                  <button
                    className={`btn ${isRejected ? "btn-warning" : "btn-success"}`}
                    onClick={handleSubmit}
                  >
                    <i
                      className={`bx ${isRejected ? "bx-revision" : "bx-check-circle"} me-1`}
                    ></i>
                    {isRejected ? "Nộp lại" : "Nộp bài"}
                  </button>
                </>
              )}

              {isReadOnly && (
                <span className="badge bg-success-subtle text-success fs-6 d-flex align-items-center">
                  <i className="ri-check-double-line me-1"></i> Đã nộp
                </span>
              )}
            </div>

            <button
              className="btn btn-secondary"
              disabled={currentImgIndex === images.length - 1}
              onClick={handleNext}
            >
              Tiếp <i className="bx bx-chevron-right"></i>
            </button>
          </div>

          {(currentImage.status === "Approved" ||
            currentImage.status === "Rejected" ||
            currentImage.status === "Submitted") && (
            <div className="mt-4">
              <CommentSection
                rejectionReason={currentImage.rejectionReason}
                status={currentImage.status}
              />
            </div>
          )}

          {showDisputeForm && isRejected && (
            <div className="mt-3">
              <div className="card border-danger shadow-sm">
                <div className="card-header bg-danger bg-opacity-10 d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 text-danger fw-bold">
                    <i className="ri-questionnaire-line me-1"></i>
                    Tạo khiếu nại (Dispute)
                  </h6>
                  <button
                    className="btn-close btn-close-sm"
                    onClick={() => {
                      setShowDisputeForm(false);
                      setDisputeReason("");
                    }}
                  ></button>
                </div>
                <div className="card-body">
                  <p className="text-muted small mb-2">
                    Nếu bạn cho rằng Reviewer đã chấm sai bài của mình, hãy nhập
                    lý do bên dưới. Manager sẽ xem xét và phân xử.
                  </p>
                  <textarea
                    className="form-control mb-3"
                    rows={3}
                    placeholder="Nhập lý do khiếu nại... (ví dụ: Annotation đã đúng theo guideline, Reviewer nhầm lẫn...)"
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    disabled={disputeSubmitting}
                  />
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => {
                        setShowDisputeForm(false);
                        setDisputeReason("");
                      }}
                      disabled={disputeSubmitting}
                    >
                      Hủy
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={handleCreateDispute}
                      disabled={!disputeReason.trim() || disputeSubmitting}
                    >
                      {disputeSubmitting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1"></span>
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <i className="ri-send-plane-fill me-1"></i>Gửi khiếu
                          nại
                        </>
                      )}
                    </button>
                  </div>
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
