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

        const sortedImages = (imgRes.data || imgRes || []).sort((a, b) => {
          const priority = {
            New: 1,
            InProgress: 2,
            Rejected: 3,
            Submitted: 4,
            Approved: 5,
          };
          return (priority[a.status] || 99) - (priority[b.status] || 99);
        });

        const packStart = parseInt(searchParams.get("packStart"), 10);
        const packEnd = parseInt(searchParams.get("packEnd"), 10);
        const sliced =
          !isNaN(packStart) && !isNaN(packEnd)
            ? sortedImages.slice(packStart, packEnd)
            : sortedImages;

        setImages(sliced);

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
              ? { ...img, annotationData: dataJSON, status: "InProgress" }
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

  const handlePrev = async () => {
    if (currentImgIndex > 0) {
      await saveDraft(true);
      setCurrentImgIndex((prev) => prev - 1);
    }
  };

  const handleNext = async () => {
    const success = await saveDraft(true);
    if (success && currentImgIndex < images.length - 1) {
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
        `Các nhãn đã mở khóa nhưng chưa dùng: ${names}.\nBạn có chắc muốn nộp bài không?`,
      );
      if (!confirmed) return;
    }

    const success = await saveDraft(true);
    if (!success) return;

    try {
      const dataJSON = buildDataJSON();

      await taskService.submitTask({
        assignmentId: currentImage.id,
        dataJSON,
      });

      toast.success("Nộp bài thành công!");

      setImages((prev) =>
        prev.map((img) =>
          img.id === currentImage.id ? { ...img, status: "Submitted" } : img,
        ),
      );

      if (currentImgIndex === images.length - 1) {
        navigate(`/annotator-project-packs/${assignmentId}`);
      } else {
        setCurrentImgIndex((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gửi bài thất bại");
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

  const isLastImage = currentImgIndex === images.length - 1;

  return (
    <div className="row g-3">
      <div className="col-lg-3">
        <TaskInfoTable
          taskId={currentImage.id}
          status={currentImage.status}
          dueDate={currentImage.deadline}
        />
        <div className="mt-3">
          <h6 className="fw-bold">
            Tiến độ: {currentImgIndex + 1} / {images.length}
          </h6>
          <div className="progress" style={{ height: "5px" }}>
            <div
              className="progress-bar bg-primary"
              role="progressbar"
              style={{
                width: `${((currentImgIndex + 1) / images.length) * 100}%`,
              }}
            ></div>
          </div>
        </div>
        <hr />
        <GuidelineChecklistPanel
          labels={labels}
          assignmentId={currentImage.id}
        />
        <LabelPicker labels={labels} unlockedLabelIds={unlockedLabelIds} />
      </div>

      <div className="col-lg-9">
        <LabelingWorkspace
          assignmentId={currentImage.id}
          imageUrl={currentImage.dataItemUrl}
        />

        <div className="d-flex justify-content-between mt-3 p-3 bg-light rounded shadow-sm">
          <button
            className="btn btn-secondary"
            disabled={currentImgIndex === 0}
            onClick={handlePrev}
          >
            <i className="bx bx-chevron-left"></i> Trước
          </button>

          <div>
            <button
              className="btn btn-outline-primary me-2"
              onClick={() => saveDraft(false)}
            >
              <i className="bx bx-save"></i> Lưu nháp
            </button>

            {isLastImage ? (
              <button className="btn btn-success" onClick={handleSubmit}>
                <i className="bx bx-check-circle"></i> Nộp bài & Hoàn tất
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleNext}>
                Lưu & Tiếp <i className="bx bx-chevron-right"></i>
              </button>
            )}
          </div>
        </div>

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
