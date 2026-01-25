import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import LabelingWorkspace from "../../../components/annotator/labeling/LabelingWorkspace";
import LabelPicker from "../../../components/annotator/labeling/LabelPicker";
import TaskInfoTable from "../../../components/annotator/labeling/tasks/TaskInfoTable";
import CommentSection from "../../../components/annotator/labeling/tasks/CommentSection";

import { setAnnotationsForAssignment } from "../../../store/annotator/labelling/labelingSlice";

import taskService from "../../../services/annotator/labeling/taskService";
import projectService from "../../../services/annotator/labeling/projectService";

const WorkplaceLabelingTaskPage = () => {
  const { assignmentId: projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [labels, setLabels] = useState([]);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const currentImageData = images[currentImgIndex];

  const annotations = useSelector(
    (state) =>
      state.labeling.annotationsByAssignment[currentImageData?.id] || [],
  );

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const projectRes = await projectService.getById(projectId);
        setLabels(projectRes.data.labels || []);

        const imgRes = await taskService.getProjectImages(projectId);
        setImages(imgRes.data || []);
      } catch {
        toast.error("Không tải được dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [projectId]);

  useEffect(() => {
    if (!currentImageData) return;
    if (currentImageData.annotationData) {
      dispatch(
        setAnnotationsForAssignment({
          assignmentId: currentImageData.id,
          annotations: JSON.parse(currentImageData.annotationData),
        }),
      );
    }
  }, [currentImageData, dispatch]);

  const saveDraft = async () => {
    if (!annotations.length) return;
    await taskService.saveDraft({
      assignmentId: currentImageData.id,
      dataJSON: JSON.stringify(annotations),
    });
  };

  const next = async () => {
    await saveDraft();
    setCurrentImgIndex((i) => i + 1);
  };

  const submit = async () => {
    await taskService.submitTask({
      assignmentId: currentImageData.id,
      dataJSON: JSON.stringify(annotations),
    });
    toast.success("Đã submit ảnh");

    if (currentImgIndex === images.length - 1) {
      navigate("/annotator-my-tasks");
    } else {
      await next();
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!currentImageData) return <div>Không có ảnh</div>;

  return (
    <div className="row g-3">
      <div className="col-lg-3">
        <TaskInfoTable taskId={currentImageData.id} />
        <LabelPicker labels={labels} />
      </div>

      <div className="col-lg-9">
        <LabelingWorkspace
          assignmentId={currentImageData.id}
          imageUrl={currentImageData.dataItemUrl}
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

        <CommentSection projectId={projectId} taskId={currentImageData.id} />
      </div>
    </div>
  );
};

export default WorkplaceLabelingTaskPage;
