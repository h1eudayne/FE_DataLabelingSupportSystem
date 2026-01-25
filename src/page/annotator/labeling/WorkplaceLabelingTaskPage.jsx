import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import LabelingWorkspace from "../../../components/annotator/labeling/LabelingWorkspace";
import TaskInfoTable from "../../../components/annotator/labeling/tasks/TaskInfoTable";
import CommentSection from "../../../components/annotator/labeling/tasks/CommentSection";
import LabelPicker from "../../../components/annotator/labeling/LabelPicker";

import {
  setAnnotationsForAssignment,
  clearAllAnnotations,
} from "../../../store/annotator/labelling/labelingSlice";

import taskService from "../../../services/annotator/labeling/taskService";
import projectService from "../../../services/annotator/labeling/projectService";

const WorkplaceLabelingTaskPage = () => {
  const { assignmentId: projectId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);

  const annotationsByAssignment = useSelector(
    (state) => state.labeling.annotationsByAssignment,
  );

  const currentImage = images[currentIndex];

  // Load project + images
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const project = await projectService.getById(projectId);
        const imgs = await taskService.getProjectImages(projectId);

        setLabels(project.data.labels || []);
        setImages(imgs.data || []);
      } catch {
        toast.error("Không tải được dữ liệu");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  // Load draft của ảnh hiện tại
  useEffect(() => {
    if (!currentImage) return;
    if (currentImage.annotationData) {
      dispatch(
        setAnnotationsForAssignment({
          assignmentId: currentImage.id,
          annotations: JSON.parse(currentImage.annotationData),
        }),
      );
    }
  }, [currentImage, dispatch]);

  const saveDraft = async () => {
    const anns = annotationsByAssignment[currentImage.id];
    if (!anns || anns.length === 0) return;

    await taskService.saveDraft({
      assignmentId: currentImage.id,
      dataJSON: JSON.stringify(anns),
    });
  };

  const submitAll = async () => {
    try {
      // submit tất cả ảnh có draft
      const entries = Object.entries(annotationsByAssignment);

      if (entries.length === 0) {
        toast.warning("Chưa có ảnh nào được gán nhãn");
        return;
      }

      for (const [assignmentId, annotations] of entries) {
        if (!annotations || annotations.length === 0) continue;

        await taskService.submitTask({
          assignmentId: Number(assignmentId),
          dataJSON: JSON.stringify(annotations),
        });
      }

      toast.success("Nộp task thành công 🎉");
      navigate("/annotator-my-tasks");
    } catch (err) {
      console.error(err);
      toast.error("Nộp task thất bại");
    }
  };

  if (loading) return <div className="spinner-border m-5" />;

  return (
    <div className="row g-3">
      <div className="col-lg-3">
        <TaskInfoTable taskId={currentImage?.id} />
        <LabelPicker labels={labels} />
      </div>

      <div className="col-lg-9">
        <LabelingWorkspace
          imageUrl={currentImage.dataItemUrl}
          assignmentId={currentImage.id}
        />

        <div className="d-flex justify-content-between mt-3">
          <button
            className="btn btn-outline-secondary"
            disabled={currentIndex === 0}
            onClick={async () => {
              await saveDraft();
              setCurrentIndex((i) => i - 1);
            }}
          >
            Trước
          </button>

          <button className="btn btn-success" onClick={submitAll}>
            Hoàn thành Task
          </button>

          <button
            className="btn btn-outline-secondary"
            disabled={currentIndex === images.length - 1}
            onClick={async () => {
              await saveDraft();
              setCurrentIndex((i) => i + 1);
            }}
          >
            Tiếp
          </button>
        </div>

        <CommentSection projectId={projectId} taskId={currentImage.id} />
      </div>
    </div>
  );
};

export default WorkplaceLabelingTaskPage;
