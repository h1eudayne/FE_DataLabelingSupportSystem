import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Spinner,
  Container,
  Row,
  Col,
  Button,
  Badge,
  Form,
  Card,
} from "react-bootstrap";
import projectService from "../../../services/reviewer/project.service";
import { useDispatch } from "react-redux";
import { setAnnotations } from "../../../store/annotator/labelling/labelingSlice";
import LabelingWorkspace from "../../annotator/labeling/LabelingWorkspace";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";

const ReviewWorkspace = () => {
  const { assignmentId, projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [taskList, setTaskList] = useState(location.state?.taskList || []);
  const [data, setData] = useState(location.state?.workspaceData || null);
  const [loading, setLoading] = useState(!data);
  const [rejectComment, setRejectComment] = useState("");
  const [errorCategory, setErrorCategory] = useState("");
  const [checkedItems, setCheckedItems] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const currentIndex = taskList.findIndex(
    (t) => t.assignmentId.toString() === assignmentId,
  );

  useEffect(() => {
    setData(null);
    fetchWorkspaceData();
  }, [assignmentId]);

  useEffect(() => {
    if (data?.existingAnnotations) {
      const annotations = data.existingAnnotations[0]?.annotations || [];
      dispatch(
        setAnnotations({ assignmentId: data.assignmentId, annotations }),
      );

      const initialChecks = {};
      data.labels?.forEach((label) => {
        const annotatorChecks =
          data.existingAnnotations[0]?.__checklist?.[label.id] || [];
        annotatorChecks.forEach((val, idx) => {
          if (val) initialChecks[`${label.id}-${idx}`] = true;
        });
      });
      setCheckedItems(initialChecks);
    }
  }, [data, dispatch]);

  const fetchWorkspaceData = async () => {
    setLoading(true);
    try {
      const res = await projectService.getReviewWorkspace(projectId);
      const tasks = res.data || [];

      const currentTaskData = tasks.find(
        (t) => t.assignmentId.toString() === assignmentId.toString(),
      );

      if (currentTaskData) {
        setData(currentTaskData);
        setTaskList(tasks);
      }
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
      setRejectComment("");
      setErrorCategory("");
      setCheckedItems({});
    }
  };

  const handleNavigateTask = (direction) => {
    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= 0 && newIndex < taskList.length) {
      const nextId = taskList[newIndex].assignmentId;

      navigate(`/reviewer/review-workspace/${projectId}/${nextId}`, {
        state: { taskList },
      });
    }
  };

  const submitReview = async (isApproved) => {
    if (!isApproved) {
      if (!errorCategory)
        return alert("Quy định: Phải chọn Phân loại lỗi khi Reject!");
      if (!rejectComment.trim())
        return alert("Quy định: Phải ghi rõ lý do để Annotator sửa bài!");
    }

    if (isApproved) {
      const totalChecklistItems = data.labels?.reduce((acc, label) => {
        const isLabelUsed = data.existingAnnotations[0]?.__checklist?.[
          label.id
        ]?.some((v) => v === true);
        return isLabelUsed ? acc + (label.checklist?.length || 0) : acc;
      }, 0);
      const checkedCount = Object.values(checkedItems).filter(Boolean).length;

      if (checkedCount < totalChecklistItems) {
        if (
          !window.confirm(
            "Bạn chưa đối chiếu hết Guideline (Checklist). Vẫn muốn Approve?",
          )
        )
          return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        assignmentId: parseInt(assignmentId),
        isApproved,
        comment: rejectComment,
        errorCategory: isApproved ? "" : errorCategory,
      };

      await projectService.submitReview(payload);
      console.log("Submit Payload:", payload);

      const isLastTask = currentIndex === taskList.length - 1;

      if (isLastTask) {
        alert("Chúc mừng! Bạn đã hoàn thành mục kiểm duyệt cuối cùng.");
        navigate("/reviewer/tasks");
      } else {
        const nextTask = taskList[currentIndex + 1];

        console.log(
          isApproved
            ? "Đã duyệt, chuyển ảnh tiếp theo..."
            : "Đã từ chối, chuyển ảnh tiếp theo...",
        );

        navigate(
          `/reviewer/review-workspace/${projectId}/${nextTask.assignmentId}`,
          {
            state: {
              taskList,
              workspaceData: nextTask,
              projectId,
            },
          },
        );
      }
    } catch (error) {
      alert("Lỗi hệ thống, không thể lưu phán quyết.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-5 text-white">
        <Spinner animation="border" />
      </div>
    );
  if (!data)
    return (
      <div className="text-center py-5 text-white">
        Không tìm thấy dữ liệu nhiệm vụ.
      </div>
    );

  const isOverdue = new Date(data.deadline) < new Date();

  return (
    <div
      className="workspace-layout min-vh-100"
      style={{ backgroundColor: "#f8f9fa", fontSize: "13px", color: "#212529" }}
    >
      <Container fluid className="p-0 d-flex flex-column vh-100">
        <div
          className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom bg-white shadow-sm"
          style={{ zIndex: 10 }}
        >
          <div className="d-flex align-items-center gap-2">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => navigate("/reviewer/tasks")}
            >
              <ArrowLeft size={14} /> Quay lại
            </Button>
            <div className="d-flex align-items-center bg-light rounded-pill px-2 py-1 border">
              <Button
                variant="link"
                className={`p-1 ${currentIndex <= 0 ? "text-muted" : "text-primary"}`}
                disabled={currentIndex <= 0}
                onClick={() => handleNavigateTask("prev")}
              >
                <ChevronLeft size={20} />
              </Button>
              <span
                className="px-2 fw-bold border-start border-end mx-1"
                style={{ minWidth: "60px", textAlign: "center" }}
              >
                {currentIndex + 1} / {taskList.length}
              </span>
              <Button
                variant="link"
                className={`p-1 ${currentIndex >= taskList.length - 1 ? "text-muted" : "text-primary"}`}
                disabled={currentIndex >= taskList.length - 1}
                onClick={() => handleNavigateTask("next")}
              >
                <ChevronRight size={20} />
              </Button>
            </div>
            <div className="ms-2 border-start ps-3">
              <span
                className="text-muted small d-block"
                style={{ fontSize: "10px" }}
              >
                PROJECT
              </span>
              <span className="fw-bold">{data.projectName}</span>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="danger"
              size="sm"
              className="px-4 fw-bold shadow-sm"
              disabled={submitting}
              onClick={() => submitReview(false)}
            >
              Reject
            </Button>
            <Button
              variant="success"
              size="sm"
              className="px-4 fw-bold shadow-sm"
              disabled={submitting}
              onClick={() => submitReview(true)}
            >
              Approve
            </Button>
          </div>
        </div>

        <Row className="g-0 flex-grow-1 overflow-hidden">
          <Col
            lg={9}
            className="position-relative d-flex flex-column bg-secondary bg-opacity-10"
          >
            <LabelingWorkspace
              imageUrl={data.storageUrl}
              assignmentId={data.assignmentId}
              readOnly={true}
            />
          </Col>

          <Col
            lg={3}
            className="border-start d-flex flex-column bg-white shadow-sm"
            style={{ height: "calc(100vh - 57px)" }}
          >
            <div className="p-3 border-bottom bg-light bg-opacity-50">
              <h6
                className="text-uppercase text-muted fw-bold mb-3"
                style={{ fontSize: "11px" }}
              >
                Thông tin nhiệm vụ
              </h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Người gán:</span>
                <span className="fw-semibold">{data.reviewerName}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Hạn chót:</span>
                <Badge
                  bg={isOverdue ? "danger" : "light"}
                  className={`border ${isOverdue ? "text-white" : "text-primary"} fw-bold px-2`}
                >
                  <Clock size={12} className="me-1" />{" "}
                  {new Date(data.deadline).toLocaleDateString("vi-VN")}
                </Badge>
              </div>
            </div>

            <div
              className="p-3 flex-grow-1 overflow-auto"
              style={{ backgroundColor: "#f8f9fa" }}
            >
              <h6
                className="text-uppercase fw-bold mb-3 text-secondary"
                style={{ fontSize: "11px", letterSpacing: "0.5px" }}
              >
                Đối chiếu Quy định
              </h6>

              {data.labels?.map((label) => {
                const isLabelUsed = data.existingAnnotations[0]?.__checklist?.[
                  label.id
                ]?.some((val) => val === true);
                if (!isLabelUsed) return null;

                return (
                  <Card
                    key={label.id}
                    className="border-0 shadow-sm mb-3 rounded-3 overflow-hidden"
                  >
                    <div
                      className="px-3 py-2 fw-bold d-flex align-items-center justify-content-between"
                      style={{
                        backgroundColor: `${label.color}15`,
                        borderLeft: `4px solid ${label.color}`,
                        color: label.color,
                        fontSize: "13px",
                      }}
                    >
                      <span>{label.name}</span>
                      <Badge
                        pill
                        style={{
                          backgroundColor: label.color,
                          fontSize: "10px",
                        }}
                      >
                        Active
                      </Badge>
                    </div>

                    <Card.Body className="p-3 bg-white">
                      <div
                        className="text-dark mb-2 fw-medium"
                        style={{ fontSize: "12px", lineHeight: "1.4" }}
                      >
                        {label.guideLine}
                      </div>

                      {label.checklist?.length > 0 && (
                        <div className="mt-2 pt-2 border-top">
                          <div
                            className="text-uppercase text-muted fw-bold mb-2"
                            style={{ fontSize: "10px", letterSpacing: "0.5px" }}
                          >
                            Checklist kiểm duyệt
                          </div>
                          {label.checklist.map((item, idx) => (
                            <div
                              key={idx}
                              className="d-flex align-items-start gap-2 mb-2 text-dark"
                              style={{ fontSize: "12px" }}
                            >
                              <div
                                className="mt-1"
                                style={{
                                  minWidth: "6px",
                                  height: "6px",
                                  borderRadius: "50%",
                                  backgroundColor: label.color,
                                }}
                              ></div>
                              <span className="opacity-85">{item}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                );
              })}
            </div>

            <div className="p-3 border-top bg-light shadow-lg">
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-danger">
                  <AlertTriangle size={14} /> PHÂN LOẠI LỖI
                </Form.Label>
                <Form.Select
                  size="sm"
                  className="border-2 shadow-sm"
                  value={errorCategory}
                  onChange={(e) => setErrorCategory(e.target.value)}
                >
                  <option value="">-- Chọn loại lỗi --</option>
                  <option value="missing">Vẽ thiếu nhãn (Missing)</option>
                  <option value="extra">Vẽ thừa nhãn (Extra)</option>
                  <option value="wrong_label">
                    Sai loại nhãn (Wrong Label)
                  </option>
                  <option value="poor_quality">Vẽ lệch/Xấu (Poor Box)</option>
                  <option value="guideline_violation">Vi phạm Guideline</option>
                </Form.Select>
              </Form.Group>

              <Form.Group>
                <Form.Label className="small fw-bold text-muted">
                  LÝ DO CHI TIẾT
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Mô tả lỗi cụ thể..."
                  className="border-2 shadow-sm small"
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                  style={{ resize: "none" }}
                />
              </Form.Group>

              <div className="mt-3 d-grid gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  className="fw-bold"
                  disabled={submitting}
                  onClick={() => submitReview(false)}
                >
                  Xác nhận Reject
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ReviewWorkspace;
