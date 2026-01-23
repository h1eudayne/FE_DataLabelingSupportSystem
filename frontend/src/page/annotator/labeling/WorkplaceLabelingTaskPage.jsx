import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import LabelingWorkspace from "../../../components/annotator/labeling/LabelingWorkspace";
import TaskInfoTable from "../../../components/annotator/labeling/tasks/TaskInfoTable";
import CommentSection from "../../../components/annotator/labeling/tasks/CommentSection";
import LabelPicker from "../../../components/annotator/labeling/LabelPicker";

import { fetchTaskById } from "../../../store/annotator/labelling/taskSlice";
import { resetWorkspace } from "../../../store/annotator/labelling/labelingSlice";
import taskService from "../../../services/annotator/labeling/taskService";

const WorkplaceLabelingTaskPage = () => {
  const { assignmentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  const { annotations } = useSelector((state) => state.labeling);
  const { currentTask, status } = useSelector((state) => state.task);

  useEffect(() => {
    if (assignmentId && assignmentId !== "undefined") {
      dispatch(fetchTaskById(assignmentId));
    }
  }, [assignmentId, dispatch]);

  /**
   * CHỖ CẦN LƯU Ý:
   * Đảm bảo biến 'images' lấy đúng danh sách các mục dữ liệu (data items)
   */
  const images = useMemo(() => {
    if (!currentTask) return [];

    // Nếu API trả về một Object Task lớn có mảng con dataItems (thường là vậy)
    if (currentTask.dataItems && Array.isArray(currentTask.dataItems)) {
      return currentTask.dataItems;
    }

    // Nếu currentTask trả về chính là một mảng các ảnh
    if (Array.isArray(currentTask)) {
      return currentTask;
    }

    // Trường hợp cuối: Chỉ có 1 ảnh đơn lẻ
    return [currentTask];
  }, [currentTask]);

  const currentImageData = images[currentImgIndex];

  const handlePrevImage = () => {
    if (currentImgIndex > 0) {
      setCurrentImgIndex((prev) => prev - 1);
      dispatch(resetWorkspace()); // Reset để xóa nhãn ảnh cũ
    }
  };

  const handleNextImage = () => {
    if (currentImgIndex < images.length - 1) {
      setCurrentImgIndex((prev) => prev + 1);
      dispatch(resetWorkspace()); // Reset để xóa nhãn ảnh cũ
    }
  };

  const handleSubmitWork = async () => {
    try {
      if (annotations.length === 0) {
        toast.warning("Vui lòng gán nhãn trước khi lưu!");
        return;
      }

      // Cấu trúc chuẩn theo Swagger của bạn
      const payload = {
        assignmentId: parseInt(assignmentId), // Lấy từ URL
        annotations: annotations.map((ann) => ({
          labelClassId: ann.labelId,
          valueJson: JSON.stringify({
            x: ann.x,
            y: ann.y,
            width: ann.width,
            height: ann.height,
          }),
        })),
      };

      await taskService.submitTask(payload);
      toast.success("Nộp bài thành công!");

      // Sau khi nộp thành công 1 assignmentId, quay lại danh sách
      navigate("/annotator-my-tasks");
    } catch (error) {
      toast.error("Lỗi khi nộp bài");
    }
  };

  if (status === "loading" || !currentTask) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (images.length === 0 || !currentImageData) {
    return <div className="alert alert-warning m-5">Không có dữ liệu ảnh.</div>;
  }

  return (
    <div className="row g-3">
      <div className="col-xxl-3 col-lg-4">
        <TaskInfoTable
          taskId={assignmentId}
          status={currentImageData.status}
          priority={currentImageData.priority || "Normal"}
          dueDate={currentImageData.deadline}
        />
        <LabelPicker />
      </div>

      <div className="col-xxl-9 col-lg-8">
        <div className="card shadow-none border">
          <div className="card-body">
            {/* Thanh điều hướng nhanh giữa các ảnh ssf... */}
            <div className="d-flex justify-content-between align-items-center mb-3 bg-light p-2 rounded">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={currentImgIndex === 0}
                onClick={handlePrevImage}
              >
                <i className="ri-arrow-left-s-line"></i> Trước
              </button>

              <div className="text-center">
                <h6 className="mb-0">{currentImageData.projectName}</h6>
                <small className="text-muted">
                  Ảnh {currentImgIndex + 1} trên tổng số {images.length}
                </small>
              </div>

              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={currentImgIndex === images.length - 1}
                onClick={handleNextImage}
              >
                Tiếp <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>

            <LabelingWorkspace
              key={currentImageData.dataItemId || currentImageData.id}
              imageUrl={`${import.meta.env.VITE_BACKEND_URL}${currentImageData.storageUrl}`}
            />

            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="text-muted small">
                ID: {currentImageData.dataItemId}
              </div>
              <button
                className="btn btn-success px-5"
                onClick={handleSubmitWork}
              >
                {currentImgIndex === images.length - 1
                  ? "Hoàn thành Task"
                  : "Lưu & Tiếp theo"}
              </button>
            </div>
          </div>
        </div>
        <CommentSection
          projectId={currentImageData.projectId}
          taskId={assignmentId}
        />
      </div>
    </div>
  );
};

export default WorkplaceLabelingTaskPage;
