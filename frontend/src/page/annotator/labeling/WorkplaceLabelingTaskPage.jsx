import React, { useEffect } from "react";
import TimeTrackingCard from "../../../components/tasks/TimeTrackingCard";
import LabelingWorkspace from "../../../components/annotator/labeling/LabelingWorkspace";
import TaskInfoTable from "../../../components/tasks/TaskInfoTable";
import CommentSection from "../../../components/tasks/CommentSection";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import taskService from "../../../services/annotator/labeling/taskService";
import { toast } from "react-toastify";
import { useTimer } from "../../../hooks/annotator/labeling/useTimer";
import LabelPicker from "../../../components/annotator/labeling/LabelPicker";
import AttachmentList from "../../../components/tasks/AttachmentList";
import { fetchTaskById } from "../../../store/annotator/labelling/taskSlice";

const WorkplaceLabelingTaskPage = () => {
  const { assignmentId } = useParams();
  const { annotations } = useSelector((state) => state.labeling);
  const { timeString } = useTimer();
  const { currentTask } = useSelector((state) => state.task);
  const dispatch = useDispatch();

  useEffect(() => {
    if (assignmentId) {
      dispatch(fetchTaskById(assignmentId));
    }
  }, [assignmentId, dispatch]);
  const handleSubmitWork = async () => {
    try {
      if (annotations.length === 0) {
        toast.warning("Bạn chưa gán nhãn đối tượng nào!");
        return;
      }

      await taskService.submitTask(assignmentId, annotations);
      toast.success("Đã gửi kết quả kiểm duyệt thành công!");
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
        console.log("Auto-saved to server");
      } catch {
        console.error("Auto-save failed");
      }
    }, 5000);

    return () => clearTimeout(delayDebounceFn);
  }, [annotations, assignmentId]);

  return (
    <div className="row">
      <div className="col-xxl-3">
        <TimeTrackingCard time={timeString} />
        <TaskInfoTable
          taskId={currentTask?.id}
          status={currentTask?.status}
          priority={currentTask?.priority}
          dueDate={currentTask?.dueDate}
        />{" "}
        <LabelPicker />
        <AttachmentList attachments={currentTask?.attachments} />
      </div>

      <div className="col-xxl-9">
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Labeling Workspace</h5>
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSubmitWork}
            >
              Submit Work
            </button>
          </div>
          <div className="card-body">
            <LabelingWorkspace
              imageUrl={
                currentTask?.imageUrl || "https://picsum.photos/800/600"
              }
            />{" "}
          </div>
        </div>

        <CommentSection />
      </div>
    </div>
  );
};

export default WorkplaceLabelingTaskPage;
