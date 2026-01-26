import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import LabelingWorkspace from "../../../components/annotator/labeling/LabelingWorkspace";
import LabelPicker from "../../../components/annotator/labeling/LabelPicker";
import TaskInfoTable from "../../../components/annotator/labeling/tasks/TaskInfoTable";
import CommentSection from "../../../components/annotator/labeling/tasks/CommentSection";

import { setAnnotations } from "../../../store/annotator/labelling/labelingSlice";
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

        const projectRes = await projectService.getById(assignmentId);
        setLabels(projectRes.data?.labels || []);

        const imgRes = await taskService.getProjectImages(assignmentId);
        setImages(imgRes.data || []);
      } catch (err) {
        toast.error("Không tải được dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assignmentId]);

  useEffect(() => {
    if (!currentImage) return;

    if (currentImage.annotationData && annotations.length === 0) {
      dispatch(
        setAnnotations({
          assignmentId: currentImage.id,
          annotations: JSON.parse(currentImage.annotationData),
        }),
      );
    }
  }, [currentImage, annotations.length, dispatch]);

  const saveDraft = async () => {
    if (!currentImage) return;

    await taskService.saveDraft({
      assignmentId: currentImage.id,
      dataJSON: JSON.stringify(annotations),
    });
  };

  const next = async () => {
    await saveDraft();
    setCurrentImgIndex((i) => i + 1);
  };

  const submit = async () => {
    await saveDraft();
    toast.success("Đã submit ảnh");

    if (currentImgIndex === images.length - 1) {
      navigate("/annotator-my-tasks");
    } else {
      next();
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!currentImage) return <div>Không có ảnh</div>;

  return (
    <div className="row g-3">
      <div className="col-lg-3">
        <TaskInfoTable taskId={currentImage.id} />
        <LabelPicker labels={labels} />
      </div>

      <div className="col-lg-9">
        <LabelingWorkspace
          assignmentId={currentImage.id}
          imageUrl={currentImage.dataItemUrl}
        />

        <div className="d-flex justify-content-between mt-3">
          <button
            className="btn btn-secondary"
            disabled={currentImgIndex === 0}
            onClick={() => setCurrentImgIndex((i) => i - 1)}
          >
            Trước
          </button>

          <button className="btn btn-success" onClick={submit}>
            {currentImgIndex === images.length - 1
              ? "Hoàn thành"
              : "Lưu & Tiếp"}
          </button>
        </div>

        {(currentImage.status === "Approved" ||
          currentImage.status === "Rejected") && (
          <CommentSection projectId={assignmentId} taskId={currentImage.id} />
        )}
      </div>
    </div>
  );
};

export default WorkplaceLabelingTaskPage;
