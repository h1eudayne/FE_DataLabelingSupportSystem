import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import LabelingWorkspace from "../../../components/annotator/labeling/LabelingWorkspace";
import LabelPicker from "../../../components/annotator/labeling/LabelPicker";
import TaskInfoTable from "../../../components/annotator/labeling/tasks/TaskInfoTable";
import CommentSection from "../../../components/annotator/labeling/tasks/CommentSection";

import {
  setAnnotations,
  setSelectedLabel,
} from "../../../store/annotator/labelling/labelingSlice";

import { setCurrentTask } from "../../../store/annotator/labelling/taskSlice";

import taskService from "../../../services/annotator/labeling/taskService";
import projectService from "../../../services/annotator/labeling/projectService";

const WorkplaceLabelingTaskPage = () => {
  const { assignmentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [labels, setLabels] = useState([]);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentImage = images[currentImgIndex];

  const annotations = useSelector(
    (state) => state.labeling.annotationsByAssignment[currentImage?.id] || [],
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [projectRes, imgRes] = await Promise.all([
          projectService.getById(assignmentId),
          taskService.getProjectImages(assignmentId),
        ]);

        setLabels(projectRes.data?.labels || []);

        const sortedImages = (imgRes.data || []).sort((a, b) => {
          const priority = {
            New: 1,
            InProgress: 2,
            Rejected: 3,
            Submitted: 4,
            Approved: 5,
          };
          return (priority[a.status] || 99) - (priority[b.status] || 99);
        });

        setImages(sortedImages);
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
    try {
      if (currentImage.annotationData) {
        parsedAnnotations = JSON.parse(currentImage.annotationData);
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
  }, [currentImage, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(setSelectedLabel(null));
    };
  }, [dispatch]);

  const saveDraft = async (silent = false) => {
    if (!currentImage) return;

    try {
      const dataJSON = JSON.stringify(annotations);

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
  };

  const handleNext = async () => {
    const success = await saveDraft(true);
    if (success && currentImgIndex < images.length - 1) {
      setCurrentImgIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    if (!currentImage) return;

    const success = await saveDraft(true);
    if (!success) return;

    try {
      const dataJSON = JSON.stringify(annotations);

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
        navigate("/annotator-my-tasks");
      } else {
        setCurrentImgIndex((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Gửi bài thất bại");
    }
  };

  if (loading)
    return <div className="text-center mt-5">Đang tải dữ liệu...</div>;
  if (!currentImage)
    return <div className="text-center mt-5">Dự án này chưa có ảnh nào.</div>;

  const isLastImage = currentImgIndex === images.length - 1;

  return (
    <div className="row g-3">
      <div className="col-lg-3">
        <TaskInfoTable taskId={currentImage.id} />
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
        <LabelPicker labels={labels} />
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
            onClick={() => setCurrentImgIndex((i) => i - 1)}
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
