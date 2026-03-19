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
  Modal,
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
  Lock,
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
  const [errorCategories, setErrorCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [checkedCriteria, setCheckedCriteria] = useState({});
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);
  const ERROR_CATEGORIES = [
    {
      id: "CL-01",
      label: "CL-01: Xác định sai đối tượng",
      desc: "Đối tượng gán nhãn không đúng thực tế",
    },
    {
      id: "CL-02",
      label: "CL-02: Sai loại nhãn (Label Class)",
      desc: "Chọn sai danh mục nhãn",
    },
    {
      id: "CL-03",
      label: "CL-03: Bounding Box chưa chính xác",
      desc: "Khung bao không ôm sát, quá rộng/hẹp",
    },
    {
      id: "CL-04",
      label: "CL-04: Còn bỏ sót đối tượng",
      desc: "Chưa gán nhãn hết các đối tượng trong ảnh",
    },
    {
      id: "CL-05",
      label: "CL-05: Gán nhãn sai",
      desc: "Gán nhãn cho đối tượng không liên quan",
    },
    {
      id: "CL-06",
      label: "CL-06: Không tuân thủ guideline",
      desc: "Sai quy định đặc thù của dự án",
    },
    {
      id: "CL-07",
      label: "CL-07: Chưa có tính nhất quán",
      desc: "Gán nhãn không đồng nhất với các ảnh khác",
    },
    {
      id: "CL-08",
      label: "CL-08: Dùng sai loại công cụ",
      desc: "Dùng sai công cụ (VD: dùng Box thay vì Polygon)",
    },
    {
      id: "CL-09",
      label: "CL-09: Chưa bao phủ đầy đủ",
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
        setErrorCategories([]);
      }
    };

    setData(null);
    fetchWorkspaceData();
  }, [assignmentId, projectId]);

  useEffect(() => {
    if (data?.existingAnnotations) {
      const annotations = data.existingAnnotations[0]?.annotations || [];
      dispatch(
        setAnnotations({ assignmentId: data.assignmentId, annotations }),
      );

      // Initial checks removed because checkedItems is not used
    }
  }, [data, dispatch]);

  const handleNavigateTask = (direction) => {
    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= 0 && newIndex < taskList.length) {
      const nextId = taskList[newIndex].assignmentId;

      navigate(`/reviewer/review-workspace/${projectId}/${nextId}`, {
        state: { taskList },
      });
    }
  };

  const handleToggleError = (errorId) => {
    setErrorCategories((prev) =>
      prev.includes(errorId)
        ? prev.filter((id) => id !== errorId)
        : [...prev, errorId],
    );
  };

  const handleCriteriaCheck = (criteriaId) => {
    const key = `shared-${criteriaId}`;
    setCheckedCriteria((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const submitReview = async (isApproved) => {
    if (!isApproved) {
      if (errorCategories.length === 0)
        return alert(
          "Quy định: Phải chọn ít nhất một Phân loại lỗi khi Reject!",
        );
      if (!rejectComment.trim())
        return alert("Quy định: Phải ghi rõ lý do để Annotator sửa bài!");
    }

    setSubmitting(true);
    try {
      const payload = {
        assignmentId: parseInt(assignmentId),
        isApproved,
        comment: rejectComment,
        errorCategories: isApproved ? [] : errorCategories,
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
    } catch {
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

  const hasAnyLabel = data.labels?.some((label) =>
    data.existingAnnotations[0]?.__checklist?.[label.id]?.some(
      (val) => val === true,
    ),
  );

  const totalCLItemsToTick = hasAnyLabel ? 10 : 0;

  const checkedCLCount = Object.values(checkedCriteria).filter(Boolean).length;

  const isChecklistComplete =
    totalCLItemsToTick > 0 && checkedCLCount >= totalCLItemsToTick;

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
              onClick={() => setShowRejectModal(true)}
            >
              Reject
            </Button>
            <Button
              variant="success"
              size="sm"
              className="px-4 fw-bold shadow-sm"
              disabled={submitting || !isChecklistComplete}
              onClick={() => submitReview(true)}
            >
              {!isChecklistComplete && <Lock size={14} />} Approve
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

            <div className="p-3 flex-grow-1 overflow-auto bg-light border-bottom">
              <h6
                className="text-uppercase text-muted fw-bold mb-3"
                style={{ fontSize: "11px" }}
              >
                Danh sách nhãn trong ảnh
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
                      className="px-3 py-2 fw-bold"
                      style={{
                        backgroundColor: `${label.color}15`,
                        borderLeft: `4px solid ${label.color}`,
                        color: label.color,
                        fontSize: "13px",
                      }}
                    >
                      {label.name}
                    </div>
                    <Card.Body className="p-3 bg-white">
                      <div
                        className="text-muted mb-2 small italic"
                        style={{ fontSize: "11px" }}
                      >
                        <strong>Mô tả:</strong> {label.guideLine}
                      </div>
                      {label.checklist?.length > 0 && (
                        <div className="p-2 rounded bg-light border-start border-2 border-info">
                          <div
                            className="text-uppercase fw-bold text-info mb-1"
                            style={{ fontSize: "9px" }}
                          >
                            Checklist công việc:
                          </div>
                          <ul className="list-unstyled mb-0 d-flex flex-column gap-1">
                            {label.checklist.map((item, index) => (
                              <li
                                key={index}
                                className="d-flex align-items-start gap-2"
                                style={{ fontSize: "11px" }}
                              >
                                <div
                                  className="mt-1"
                                  style={{
                                    width: "4px",
                                    height: "4px",
                                    borderRadius: "50%",
                                    backgroundColor: "#0dcaf0",
                                  }}
                                ></div>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                );
              })}
            </div>

            {/* SECTION 3: CỤM CHECKLIST CHUNG (LUÔN CỐ ĐỊNH Ở DƯỚI) */}
            <div
              className="p-3 bg-white border-top shadow-lg"
              style={{ zIndex: 5 }}
            >
              <h6
                className="text-uppercase text-muted fw-bold mb-3 d-flex align-items-center gap-2"
                style={{ fontSize: "11px" }}
              >
                <CheckCircle size={14} className="text-success" /> TRẠNG THÁI
                KIỂM DUYỆT CHUNG
              </h6>

              <Card
                className={`border-0 shadow-sm mb-2 rounded-3 ${isChecklistComplete ? "bg-success-subtle" : "bg-light"}`}
              >
                <Card.Body className="p-3 text-center">
                  <div
                    className={`display-6 fw-bold mb-0 ${isChecklistComplete ? "text-success" : "text-primary"}`}
                  >
                    {checkedCLCount}/{totalCLItemsToTick}
                  </div>
                  <div className="fw-bold small mb-2 text-muted">
                    Tiêu chí đã đạt
                  </div>
                  <Button
                    variant={isChecklistComplete ? "success" : "primary"}
                    size="sm"
                    className="w-100 fw-bold shadow-sm"
                    onClick={() => setShowChecklistModal(true)}
                  >
                    {isChecklistComplete
                      ? "Xem lại Checklist"
                      : "Bắt đầu Kiểm duyệt"}
                  </Button>
                </Card.Body>
              </Card>
            </div>

            <div className="mt-3">
              <p
                className="text-muted mb-2 italic"
                style={{ fontSize: "11px" }}
              >
                * Nếu có lỗi, hãy nhấn vào nút bên dưới để chọn mã lỗi.
              </p>
              <Button
                variant="danger"
                className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                style={{ fontSize: "12px", padding: "10px" }}
                onClick={() => setShowRejectModal(true)}
              >
                <AlertCircle size={16} /> THIẾT LẬP LỖI REJECT
              </Button>
            </div>
          </Col>
        </Row>
      </Container>

      <Modal
        show={showChecklistModal}
        onHide={() => setShowChecklistModal(false)}
        centered
        size="lg"
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-primary d-flex align-items-center gap-2">
            <CheckCircle size={24} /> Kiểm duyệt Tiêu chí Chất lượng
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light">
          <div className="alert alert-info py-2" style={{ fontSize: "12px" }}>
            <AlertCircle size={16} className="me-2" />
            Xác nhận các tiêu chí chất lượng cho <strong>tất cả</strong> nhãn có
            trong ảnh.
          </div>

          <div className="mb-3 d-flex flex-wrap gap-2">
            <span className="small fw-bold text-muted">Đang kiểm duyệt:</span>
            {data.labels?.map((label) => {
              const isLabelUsed = data.existingAnnotations[0]?.__checklist?.[
                label.id
              ]?.some((v) => v === true);
              return isLabelUsed ? (
                <Badge key={label.id} style={{ backgroundColor: label.color }}>
                  {label.name}
                </Badge>
              ) : null;
            })}
          </div>

          <hr />

          <Row xs={1} md={2} className="g-2">
            {[
              {
                id: "CL-01",
                title: "Xác định đúng đối tượng",
                desc: "Đối tượng gán đúng với thực tế",
              },
              {
                id: "CL-02",
                title: "Đúng loại nhãn",
                desc: "Chọn đúng category",
              },
              {
                id: "CL-03",
                title: "Bounding Box chính xác",
                desc: "Khung bao ôm sát đối tượng",
              },
              {
                id: "CL-04",
                title: "Không bỏ sót",
                desc: "Gán hết đối tượng trong ảnh",
              },
              {
                id: "CL-05",
                title: "Không gán nhãn sai",
                desc: "Không gán vào vật thể lạ",
              },
              {
                id: "CL-06",
                title: "Tuân thủ guideline",
                desc: "Theo đúng quy định dự án",
              },
              {
                id: "CL-07",
                title: "Tính nhất quán",
                desc: "Giống các ảnh đã gán trước đó",
              },
              {
                id: "CL-08",
                title: "Đúng công cụ",
                desc: "Dùng đúng Box/Polygon",
              },
              {
                id: "CL-09",
                title: "Bao phủ đầy đủ",
                desc: "Không bị cắt mất phần hiển thị",
              },
              {
                id: "CL-10",
                title: "Dữ liệu đạt chuẩn",
                desc: "Ảnh đủ rõ để định danh",
              },
            ].map((item) => {
              // Sử dụng key "shared"
              const isChecked = !!checkedCriteria[`shared-${item.id}`];
              return (
                <Col key={item.id}>
                  <div
                    className={`p-2 rounded border d-flex align-items-start gap-2 h-100 transition-all ${
                      isChecked
                        ? "bg-success-subtle border-success"
                        : "bg-white border-light-subtle"
                    }`}
                    style={{ cursor: "pointer", fontSize: "12px" }}
                    onClick={() => handleCriteriaCheck(item.id)}
                  >
                    <Form.Check type="checkbox" checked={isChecked} readOnly />
                    <div>
                      <div
                        className={`fw-bold ${isChecked ? "text-success" : ""}`}
                      >
                        {item.id}: {item.title}
                      </div>
                      <div className="text-muted" style={{ fontSize: "10px" }}>
                        {item.desc}
                      </div>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <div className="me-auto small text-muted">
            Đã hoàn thành: <strong>{checkedCLCount}</strong> /{" "}
            <strong>{totalCLItemsToTick}</strong> tiêu chí
          </div>
          <Button
            variant="primary"
            onClick={() => setShowChecklistModal(false)}
          >
            Lưu & Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showRejectModal}
        onHide={() => setShowRejectModal(false)}
        centered
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title
            className="fw-bold d-flex align-items-center gap-2"
            style={{ color: "#d93025" }}
          >
            <AlertTriangle size={24} /> Xác nhận lỗi vi phạm
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light">
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold text-secondary small mb-3">
              1. Phân loại các tiêu chí vi phạm (Chọn nhiều):
            </Form.Label>
            <Row xs={1} md={2} className="g-2">
              {ERROR_CATEGORIES.map((err) => (
                <Col key={err.id}>
                  <div
                    className={`d-flex align-items-start p-3 rounded-3 border h-100 transition-all ${
                      errorCategories.includes(err.id)
                        ? "border-danger bg-danger-subtle shadow-sm"
                        : "border-secondary-subtle bg-white shadow-sm-hover"
                    }`}
                    style={{
                      cursor: "pointer",
                      borderWidth: "1.5px",
                      transition: "all 0.2s ease",
                      minHeight: "80px",
                    }}
                    onClick={() => handleToggleError(err.id)}
                  >
                    <Form.Check
                      type="checkbox"
                      checked={errorCategories.includes(err.id)}
                      onChange={() => {}}
                      className="me-3 mt-1 flex-shrink-0"
                      style={{ transform: "scale(1.2)" }}
                    />
                    <div className="flex-grow-1">
                      <div
                        className="fw-bolder mb-1"
                        style={{
                          fontSize: "14px",
                          color: errorCategories.includes(err.id)
                            ? "#d93025"
                            : "#1a1a1a",
                          letterSpacing: "-0.2px",
                          lineHeight: "1.2",
                        }}
                      >
                        {err.label}
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "11px", lineHeight: "1.4" }}
                      >
                        {err.desc}
                      </div>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Form.Group>

          <Form.Group>
            <Form.Label className="fw-bold text-secondary small mb-2">
              2. Ghi chú cụ thể cho Annotator:
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Mô tả chi tiết vị trí lỗi..."
              style={{ fontSize: "13px" }}
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowRejectModal(false)}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="px-4 fw-bold"
            onClick={() => {
              submitReview(false);
              setShowRejectModal(false);
            }}
          >
            Xác nhận Reject
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReviewWorkspace;
