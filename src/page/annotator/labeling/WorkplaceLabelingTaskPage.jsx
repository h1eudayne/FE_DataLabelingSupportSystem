import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import LabelingWorkspace from "../../../components/annotator/labeling/LabelingWorkspace";
import LabelPicker from "../../../components/annotator/labeling/LabelPicker";
import GuidelineChecklistPanel from "../../../components/annotator/labeling/GuidelineChecklistPanel";
import TaskInfoTable from "../../../components/annotator/labeling/tasks/TaskInfoTable";
import CommentSection from "../../../components/annotator/labeling/tasks/CommentSection";

import {
  setAnnotations,
  setSelectedLabel,
  setChecklistState,
  resetChecklist,
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

  const currentImage = images[currentImgIndex];

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
    return images.filter(
      (img) =>
        img.status !== "Submitted" &&
        img.status !== "Approved" &&
        hasValidAnnotations(img.annotationData),
    );
  }, [images, hasValidAnnotations]);

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

        if (!silent) toast.success("Đã lưu bản nháp");
        return true;
      } catch (err) {
        console.error(err);
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
      const confirmed = window.confirm(
        `⚠️ Các nhãn đã mở khóa nhưng chưa được dùng: ${names}.\n\nTheo quy định BR-ANN-10, Annotator không được bỏ sót các đối tượng hợp lệ.\nBạn có chắc muốn nộp bài không?`,
      );
      if (!confirmed) return;
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
      `Bạn sắp nộp ${selectedIds.size} ảnh cùng lúc.\n\n⚠️ Các ảnh chưa có dữ liệu gán nhãn sẽ bị từ chối bởi hệ thống.\nBạn có chắc chắn muốn nộp?`,
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
    currentImage.status === "Submitted" || currentImage.status === "Approved";

  const isRejected = currentImage.status === "Rejected";

  const doneCount = images.filter(
    (img) => img.status === "Submitted" || img.status === "Approved",
  ).length;
  const progressPercent =
    images.length > 0 ? Math.round((doneCount / images.length) * 100) : 0;

  return (
    <div className="row g-3">
      {/* Left sidebar */}
      <div className="col-lg-3">
        <TaskInfoTable
          taskId={currentImage.id}
          status={currentImage.status}
          dueDate={currentImage.deadline}
        />

        {/* Progress bar */}
        <div className="mt-3">
          <div className="d-flex justify-content-between small mb-1">
            <span className="fw-bold">
              Ảnh {currentImgIndex + 1} / {images.length}
            </span>
            <span className="fw-bold text-primary">
              {doneCount}/{images.length} đã nộp ({progressPercent}%)
            </span>
          </div>
          <div className="progress" style={{ height: 8 }}>
            <div
              className={`progress-bar bg-${progressPercent === 100 ? "success" : "primary"}`}
              role="progressbar"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <hr />

        {/* BR-ANN-09: Rejected banner */}
        {isRejected && (
          <div className="alert alert-danger small py-2 mb-3">
            <div className="d-flex align-items-start">
              <i className="ri-error-warning-fill me-2 fs-5 text-danger"></i>
              <div>
                <strong className="d-block mb-1">
                  Ảnh bị từ chối bởi Reviewer
                </strong>
                <span>
                  Vui lòng đọc comment bên dưới và sửa lại bản vẽ. Nếu ảnh
                  mờ/thiếu thông tin, hãy làm theo Guideline.
                </span>
              </div>
            </div>
          </div>
        )}

        {isReadOnly ? (
          <div className="alert alert-info small py-2">
            <i className="ri-lock-line me-1"></i>
            Ảnh này đã được nộp. Chỉ xem, không chỉnh sửa.
          </div>
        ) : (
          <>
            <GuidelineChecklistPanel
              labels={labels}
              assignmentId={currentImage.id}
            />
            <LabelPicker labels={labels} unlockedLabelIds={unlockedLabelIds} />
          </>
        )}

        {/* BR-ANN-07: Batch Submit Panel Toggle */}
        <div className="mt-3">
          <button
            className={`btn btn-sm w-100 ${showBatchPanel ? "btn-outline-secondary" : "btn-outline-primary"}`}
            onClick={() => setShowBatchPanel(!showBatchPanel)}
          >
            <i
              className={`ri-${showBatchPanel ? "close" : "stack"}-line me-1`}
            ></i>
            {showBatchPanel ? "Ẩn danh sách ảnh" : "Nộp hàng loạt"}
          </button>
        </div>

        {/* BR-ANN-07: Batch Submit Panel */}
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
              {/* Select all / deselect all */}
              <div className="px-3 py-2 border-bottom bg-light">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="selectAllEligible"
                    checked={
                      eligibleForSubmit.length > 0 &&
                      eligibleForSubmit.every((img) => selectedIds.has(img.id))
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

              {/* Image list */}
              {images.map((img, idx) => {
                const config = STATUS_CONFIG[img.status] || STATUS_CONFIG.New;
                const isEligible =
                  img.status !== "Submitted" && img.status !== "Approved";
                const hasData = hasValidAnnotations(img.annotationData);

                return (
                  <div
                    key={img.id}
                    className={`d-flex align-items-center px-3 py-2 border-bottom ${
                      idx === currentImgIndex ? "bg-primary bg-opacity-10" : ""
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

            {/* Batch submit button */}
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

      {/* Main content area */}
      <div className="col-lg-9">
        <LabelingWorkspace
          assignmentId={currentImage.id}
          imageUrl={currentImage.dataItemUrl}
          readOnly={isReadOnly}
        />

        {/* Navigation + action buttons */}
        <div className="d-flex justify-content-between align-items-center mt-3 p-3 bg-light rounded shadow-sm">
          <button
            className="btn btn-secondary"
            disabled={currentImgIndex === 0}
            onClick={handlePrev}
          >
            <i className="bx bx-chevron-left"></i> Trước
          </button>

          <div className="d-flex gap-2">
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

        {/* BR-ANN-09: Show comment section for Rejected images + Approved */}
        {(currentImage.status === "Approved" ||
          currentImage.status === "Rejected") && (
          <div className="mt-4">
            <CommentSection projectId={assignmentId} taskId={currentImage.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkplaceLabelingTaskPage;
