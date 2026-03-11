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
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
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
  const [checkedCriteria, setCheckedCriteria] = useState({});
  const ERROR_CATEGORIES = [
    {
      id: "CL-01",
      label: "CL-01: Xác định đúng đối tượng",
      desc: "Đối tượng gán nhãn không đúng thực tế",
    },
    {
      id: "CL-02",
      label: "CL-02: Đúng loại nhãn (Label Class)",
      desc: "Chọn sai danh mục nhãn",
    },
    {
      id: "CL-03",
      label: "CL-03: Bounding Box chính xác",
      desc: "Khung bao không ôm sát, quá rộng/hẹp",
    },
    {
      id: "CL-04",
      label: "CL-04: Không bỏ sót đối tượng",
      desc: "Chưa gán nhãn hết các đối tượng trong ảnh",
    },
    {
      id: "CL-05",
      label: "CL-05: Không gán nhãn sai",
      desc: "Gán nhãn cho đối tượng không liên quan",
    },
    {
      id: "CL-06",
      label: "CL-06: Tuân thủ guideline",
      desc: "Sai quy định đặc thù của dự án",
    },
    {
      id: "CL-07",
      label: "CL-07: Tính nhất quán",
      desc: "Gán nhãn không đồng nhất với các ảnh khác",
    },
    {
      id: "CL-08",
      label: "CL-08: Đúng loại công cụ",
      desc: "Dùng sai công cụ (VD: dùng Box thay vì Polygon)",
    },
    {
      id: "CL-09",
      label: "CL-09: Bao phủ đầy đủ",
      desc: "Phần hiển thị của đối tượng bị cắt mất",
    },
    {
      id: "CL-10",
      label: "CL-10: Chất lượng dữ liệu",
      desc: "Ảnh quá mờ/lỗi không thể gán nhãn",
    },
  ];

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

  const handleCriteriaCheck = (labelId, criteriaId) => {
    const key = `${labelId}-${criteriaId}`;
    setCheckedCriteria((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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
        navigate("/");
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
              onClick={() => navigate("/")}
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

            <div className="p-3 flex-grow-1 overflow-auto bg-light">
              <h6
                className="text-uppercase text-muted fw-bold mb-3 d-flex align-items-center gap-2"
                style={{ fontSize: "11px" }}
              >
                <CheckCircle size={14} /> Đối chiếu Quy định Kiểm duyệt
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
                        Đang kiểm tra
                      </Badge>
                    </div>

                    <Card.Body className="p-3 bg-white">
                      <div
                        className="text-muted mb-3 small italic"
                        style={{ fontSize: "11px" }}
                      >
                        Mô tả: {label.guideLine}
                      </div>

                      <div className="mt-2 pt-2 border-top">
                        <div
                          className="text-uppercase text-muted fw-bold mb-2"
                          style={{ fontSize: "10px", letterSpacing: "0.5px" }}
                        >
                          TIÊU CHÍ CHẤT LƯỢNG (CL)
                        </div>

                        <div className="d-flex flex-column gap-2">
                          {[
                            {
                              id: "CL-01",
                              title: "Xác định đúng đối tượng",
                              desc: "Đối tượng được gán nhãn đúng với đối tượng thực tế trong ảnh/dữ liệu.",
                            },
                            {
                              id: "CL-02",
                              title: "Đúng loại nhãn (Label Class)",
                              desc: "Nhãn được chọn đúng với danh mục nhãn đã định nghĩa trong dự án.",
                            },
                            {
                              id: "CL-03",
                              title: "Bounding Box chính xác",
                              desc: "Khung bao (bounding box) ôm sát đối tượng, không quá lớn hoặc quá nhỏ.",
                            },
                            {
                              id: "CL-04",
                              title: "Không bỏ sót đối tượng",
                              desc: "Tất cả các đối tượng cần gán nhãn trong ảnh đều được đánh dấu.",
                            },
                            {
                              id: "CL-05",
                              title: "Không gán nhãn sai",
                              desc: "Không có nhãn được gán cho đối tượng không liên quan.",
                            },
                            {
                              id: "CL-06",
                              title: "Tuân thủ guideline",
                              desc: "Annotation tuân theo hướng dẫn gán nhãn của dự án.",
                            },
                            {
                              id: "CL-07",
                              title: "Tính nhất quán",
                              desc: "Cách gán nhãn giống với các dữ liệu khác trong cùng dự án.",
                            },
                            {
                              id: "CL-08",
                              title: "Đúng loại công cụ annotation",
                              desc: "Sử dụng đúng loại công cụ (Bounding Box, Polygon, v.v.).",
                            },
                            {
                              id: "CL-09",
                              title: "Đối tượng được bao phủ đầy đủ",
                              desc: "Phần đối tượng hiển thị được bao phủ đầy đủ trong annotation.",
                            },
                            {
                              id: "CL-10",
                              title: "Chất lượng dữ liệu đủ tốt",
                              desc: "Hình ảnh/dữ liệu đủ rõ để gán nhãn chính xác.",
                            },
                          ].map((item) => {
                            const isChecked =
                              !!checkedCriteria[`${label.id}-${item.id}`];
                            return (
                              <div
                                key={item.id}
                                className={`p-2 rounded-2 border-start border-3 transition-all ${
                                  isChecked
                                    ? "border-success bg-success-subtle"
                                    : "border-light-subtle bg-body-tertiary"
                                }`}
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  handleCriteriaCheck(label.id, item.id)
                                }
                              >
                                <div className="d-flex align-items-start gap-2">
                                  <div className="mt-1">
                                    <Form.Check
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {}}
                                      style={{ cursor: "pointer" }}
                                    />
                                  </div>

                                  <div className="flex-grow-1">
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                      <span
                                        className={`badge ${isChecked ? "bg-success" : "bg-secondary"}`}
                                        style={{ fontSize: "9px" }}
                                      >
                                        {item.id}
                                      </span>
                                      <span
                                        className={`fw-bold ${isChecked ? "text-success" : "text-dark"}`}
                                        style={{ fontSize: "11px" }}
                                      >
                                        {item.title}
                                      </span>
                                    </div>
                                    <div
                                      className="text-muted"
                                      style={{
                                        fontSize: "10px",
                                        lineHeight: "1.2",
                                      }}
                                    >
                                      {item.desc}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>

            <div className="mt-3 p-3 border rounded-3 bg-white shadow-sm">
              <h6
                className="text-danger fw-bold mb-3 d-flex align-items-center gap-2"
                style={{ fontSize: "12px" }}
              >
                <AlertCircle size={16} /> THÔNG TIN TỪ CHỐI
              </h6>

              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-secondary">
                  Phân loại lỗi theo tiêu chí CL:
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={errorCategory}
                  onChange={(e) => setErrorCategory(e.target.value)}
                  className="border-danger-subtle shadow-none"
                >
                  <option value="">-- Chọn mã lỗi đối chiếu --</option>
                  {ERROR_CATEGORIES.map((err) => (
                    <option key={err.id} value={err.id}>
                      {err.label}
                    </option>
                  ))}
                </Form.Select>
                {errorCategory && (
                  <div
                    className="mt-2 p-2 bg-danger-subtle rounded text-danger"
                    style={{ fontSize: "10px" }}
                  >
                    <strong>Mô tả:</strong>{" "}
                    {ERROR_CATEGORIES.find((e) => e.id === errorCategory)?.desc}
                  </div>
                )}
              </Form.Group>

              <Form.Group>
                <Form.Label className="small fw-bold text-secondary">
                  Ghi chú chi tiết cho Annotator:
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Giải thích cụ thể vị trí lỗi hoặc cách sửa..."
                  style={{ fontSize: "12px" }}
                  value={rejectComment}
                  onChange={(e) => setRejectComment(e.target.value)}
                />
              </Form.Group>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ReviewWorkspace;
