import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import TimeTrackingCard from "../../../components/annotator/labeling/tasks/TimeTrackingCard";
import LabelingWorkspace from "../../../components/annotator/labeling/LabelingWorkspace";
import TaskInfoTable from "../../../components/annotator/labeling/tasks/TaskInfoTable";
import CommentSection from "../../../components/annotator/labeling/tasks/CommentSection";
import LabelPicker from "../../../components/annotator/labeling/LabelPicker";
import AttachmentList from "../../../components/annotator/labeling/tasks/AttachmentList";

import {
  fetchTaskById,
  startTimer,
  stopTimer,
} from "../../../store/annotator/labelling/taskSlice";
import {
  setAnnotations,
  resetWorkspace,
  removeAnnotation,
} from "../../../store/annotator/labelling/labelingSlice";
import { useTimer } from "../../../hooks/annotator/labeling/useTimer";
import taskService from "../../../services/annotator/labeling/taskService";

const WorkplaceLabelingTaskPage = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { annotations } = useSelector((state) => state.labeling);
  const { status } = useSelector((state) => state.task);
  const { timeString } = useTimer();
  const currentTask = useSelector((state) => state.task.currentTask);

  useEffect(() => {
    if (assignmentId) {
      dispatch(fetchTaskById(assignmentId))
        .unwrap()
        .then((response) => {
          const data = response?.data || response;
          if (data?.annotations) {
            dispatch(setAnnotations(data.annotations));
          }
          dispatch(startTimer());
        })
        .catch(() => {
          toast.error("Không thể tải thông tin nhiệm vụ.");
        });
    }

    return () => {
      dispatch(resetWorkspace());
      dispatch(stopTimer());
    };
  }, [assignmentId, dispatch]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (annotations.length > 0) {
          const lastId = annotations[annotations.length - 1].id;
          dispatch(removeAnnotation(lastId));
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [annotations, dispatch]);

  const handleSubmitWork = async () => {
    try {
      if (annotations.length === 0) {
        toast.warning("Bạn chưa gán nhãn đối tượng nào!");
        return;
      }

      await taskService.submitTask(assignmentId, annotations);
      toast.success("Đã gửi kết quả kiểm duyệt thành công!");

      setTimeout(() => navigate("/annotator/my-tasks"), 1500);
    } catch (error) {
      console.error("Lỗi nộp bài:", error);
      toast.error("Không thể nộp bài, vui lòng thử lại.");
    }
  };

  useEffect(() => {
    if (annotations.length === 0 || !assignmentId) return;

    const delayDebounceFn = setTimeout(async () => {
      try {
        await taskService.submitTask(assignmentId, annotations, "Draft");
        console.log("Auto-saved...");
      } catch {
        console.warn("Auto-save failed");
      }
    }, 5000);

    return () => clearTimeout(delayDebounceFn);
  }, [annotations, assignmentId]);

  if (status === "loading") {
    return <div className="p-5 text-center">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="row">
      <div className="col-xxl-3 col-lg-4">
        <TimeTrackingCard time={timeString} taskTitle={currentTask?.title} />

        <TaskInfoTable
          taskId={currentTask?.id}
          status={currentTask?.status}
          priority={currentTask?.priority}
          dueDate={currentTask?.dueDate}
        />

        <LabelPicker />

        <div className="mt-3">
          <AttachmentList attachments={currentTask?.attachments} />
        </div>
      </div>

      <div className="col-xxl-9 col-lg-8">
        <div className="card shadow-sm border-0">
          <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
            <h5 className="card-title mb-0 fw-bold text-uppercase">
              <i className="ri-markup-line me-2 text-primary"></i>
              Labeling Workspace
            </h5>
            <div className="hstack gap-2">
              <button
                className="btn btn-soft-secondary btn-sm"
                onClick={() => navigate(-1)}
              >
                Quay lại
              </button>
              <button
                className="btn btn-success btn-label right"
                onClick={handleSubmitWork}
              >
                <i className="ri-send-plane-fill label-icon align-middle fs-16 ms-2"></i>
                Submit Work
              </button>
            </div>
          </div>

          <div className="card-body bg-light-subtle">
            <LabelingWorkspace imageUrl={currentTask?.storageUrl} />
            <div className="mt-2 d-flex justify-content-between">
              <small className="text-muted">
                <i className="ri-information-line me-1"></i>
                Tip: Click đúp vào khung để xóa nhãn vẽ sai.
              </small>
              <small className="text-primary fw-medium">
                Tổng số đối tượng: {annotations.length}
              </small>
            </div>
          </div>
        </div>

        <CommentSection taskId={assignmentId} />
      </div>
    </div>
  );
};

export default WorkplaceLabelingTaskPage;
