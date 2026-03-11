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
} from "react-bootstrap";
import projectService from "../../../services/reviewer/project.service";
import { useDispatch } from "react-redux";
import { setAnnotations } from "../../../store/annotator/labelling/labelingSlice";
import LabelingWorkspace from "../../annotator/labeling/LabelingWorkspace";
import { AlertTriangle, ArrowLeft, Clock } from "lucide-react";

const ReviewWorkspace = () => {
  const { assignmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [data, setData] = useState(location.state?.workspaceData || null);
  const [loading, setLoading] = useState(!data);
  const [rejectComment, setRejectComment] = useState("");
  const [errorCategory, setErrorCategory] = useState("");
  const [checkedItems, setCheckedItems] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!data) fetchWorkspaceData();
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
      const res = await projectService.getReviewWorkspace(assignmentId);
      setData(res.data[0]);
    } catch (error) {
      console.error("Lỗi lấy dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckChange = (labelId, idx) => {
    const key = `${labelId}-${idx}`;
    setCheckedItems((prev) => ({ ...prev, [key]: !prev[key] }));
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

      alert(
        isApproved
          ? "Phán quyết: DUYỆT thành công!"
          : "Phán quyết: TỪ CHỐI bài làm.",
      );
      navigate("/reviewer/tasks");
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
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={14} /> Quay lại
            </Button>
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

            <div className="p-3 flex-grow-1 overflow-auto bg-white">
              <h6
                className="text-uppercase text-muted fw-bold mb-3"
                style={{ fontSize: "11px" }}
              >
                Đối chiếu Quy định
              </h6>
              {data.labels?.map((label) => {
                const isLabelUsed = data.existingAnnotations[0]?.__checklist?.[
                  label.id
                ]?.some((val) => val === true);
                if (!isLabelUsed) return null;

                return (
                  <div
                    key={label.id}
                    className="mb-3 p-3 rounded-3 border shadow-sm"
                    style={{ borderLeft: `4px solid ${label.color}` }}
                  >
                    <div
                      className="fw-bold mb-1"
                      style={{ color: label.color }}
                    >
                      {label.name}
                    </div>
                    <div className="text-muted mb-2 small">
                      {label.guideLine}
                    </div>
                    {label.checklist?.length > 0 && (
                      <div className="mt-2 pt-2 border-top">
                        {label.checklist.map((item, idx) => (
                          <Form.Check
                            key={idx}
                            type="checkbox"
                            id={`check-${label.id}-${idx}`}
                            className="small mb-1"
                            checked={!!checkedItems[`${label.id}-${idx}`]}
                            onChange={() => handleCheckChange(label.id, idx)}
                            label={
                              <span style={{ fontSize: "11px" }}>{item}</span>
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
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
