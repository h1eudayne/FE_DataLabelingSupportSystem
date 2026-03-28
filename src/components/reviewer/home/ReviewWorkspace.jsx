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
import { useTranslation } from "react-i18next";

const ReviewWorkspace = () => {
  const { assignmentId, projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [taskList, setTaskList] = useState(location.state?.taskList || []);
  const [data, setData] = useState(location.state?.workspaceData || null);
  const [loading, setLoading] = useState(!data);
  const [rejectComment, setRejectComment] = useState("");
  const [errorCategories, setErrorCategories] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [checkedCriteria, setCheckedCriteria] = useState({});
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showChecklistModal, setShowChecklistModal] = useState(false);

  const CHECKLIST_IDS = [
    "CL-01",
    "CL-02",
    "CL-03",
    "CL-04",
    "CL-05",
    "CL-06",
    "CL-07",
    "CL-08",
    "CL-09",
    "CL-10",
  ];

  const ERROR_CATEGORIES = CHECKLIST_IDS.map((id) => ({
    id,
    title: `${id}: ${t(`review.modalReject.items.${id}.title`)}`,
    desc: t(`review.modalReject.items.${id}.desc`),
  }));

  const handleSelectAllCriteria = () => {
    const isAllChecked = CHECKLIST_IDS.every(
      (id) => checkedCriteria[`shared-${id}`],
    );

    const newCheckedState = { ...checkedCriteria };
    CHECKLIST_IDS.forEach((id) => {
      newCheckedState[`shared-${id}`] = !isAllChecked;
    });

    setCheckedCriteria(newCheckedState);
  };

  const isAllCriteriaSelected = CHECKLIST_IDS.every(
    (id) => checkedCriteria[`shared-${id}`],
  );

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
      setErrorCategories([]);
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

  const handleToggleError = (errorTitle) => {
    setErrorCategories((prev) =>
      prev.includes(errorTitle)
        ? prev.filter((title) => title !== errorTitle)
        : [...prev, errorTitle],
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
        return alert(t("review.messages.rejectRuleCategory"));
      if (!rejectComment.trim())
        return alert(t("review.messages.rejectRuleComment"));
    }

    setSubmitting(true);
    try {
      const payload = {
        assignmentId: parseInt(assignmentId),
        isApproved,
        comment: rejectComment,
        errorCategory: isApproved ? null : JSON.stringify(errorCategories),
      };

      console.log(payload);

      await projectService.submitReview(payload);
      console.log("Submit Payload:", payload);

      const isLastTask = currentIndex === taskList.length - 1;

      if (isLastTask) {
        alert(t("review.messages.congrats"));
        navigate("/");
      } else {
        const nextTask = taskList[currentIndex + 1];

        setCheckedCriteria({});
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
      alert(t("review.messages.systemError"));
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
      <div className="text-center py-5 text-white">{t("review.nav.back")}</div>
    );

  const isOverdue = new Date(data.deadline) < new Date();

  const totalCLItemsToTick = CHECKLIST_IDS?.length || 10;

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
              <ArrowLeft size={14} /> {t("review.nav.project")}
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
                {t("review.info.title")}
              </h6>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">{t("review.info.assignee")}</span>
                <span className="fw-semibold">{data.reviewerName}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">{t("review.info.deadline")}</span>
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
                {t("review.info.labelList")}
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
                        <strong>{t("review.info.guide")}</strong>{" "}
                        {label.guideLine}
                      </div>
                      {label.checklist?.length > 0 && (
                        <div className="p-2 rounded bg-light border-start border-2 border-info">
                          <div
                            className="text-uppercase fw-bold text-info mb-1"
                            style={{ fontSize: "9px" }}
                          >
                            {t("review.info.workChecklist")}
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

            <div
              className="p-3 bg-white border-top shadow-lg"
              style={{ zIndex: 5 }}
            >
              <h6
                className="text-uppercase text-muted fw-bold mb-3 d-flex align-items-center gap-2"
                style={{ fontSize: "11px" }}
              >
                <CheckCircle size={14} className="text-success" />{" "}
                {t("review.status.title")}
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
                    {t("review.status.criteriaMet")}
                  </div>
                  <Button
                    variant={isChecklistComplete ? "success" : "primary"}
                    size="sm"
                    className="w-100 fw-bold shadow-sm"
                    onClick={() => setShowChecklistModal(true)}
                  >
                    {isChecklistComplete
                      ? t("review.status.btnReviewAgain")
                      : t("review.status.btnReview")}
                  </Button>
                </Card.Body>
              </Card>
            </div>

            <div className="mt-3">
              <p
                className="text-muted mb-2 italic"
                style={{ fontSize: "11px" }}
              >
                {t("review.status.hintReject")}
              </p>
              <Button
                variant="danger"
                className="w-100 fw-bold d-flex align-items-center justify-content-center gap-2 shadow-sm"
                style={{ fontSize: "12px", padding: "10px" }}
                onClick={() => setShowRejectModal(true)}
              >
                <AlertCircle size={16} /> {t("review.status.btnSetReject")}
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
            <CheckCircle size={24} /> {t("review.modalChecklist.title")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light">
          <div className="alert alert-info py-2" style={{ fontSize: "12px" }}>
            <AlertCircle size={16} className="me-2" />
            {t("review.modalChecklist.alertInfo")}
          </div>
          <div
            className="mb-3 px-1 d-flex align-items-center gap-1 animate-pulse"
            style={{ fontSize: "11px", color: "#dc3545", fontWeight: "600" }}
          >
            <AlertTriangle size={14} />
            <span>{t("review.modalChecklist.alertNote")}</span>
          </div>

          <div className="mb-3 d-flex flex-wrap gap-2">
            <span className="small fw-bold text-muted">
              {t("review.modalChecklist.labeling")}
            </span>
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

          <div
            className={`p-2 mb-3 rounded border d-flex align-items-center gap-2 transition-all ${
              isAllCriteriaSelected
                ? "bg-primary text-white border-primary"
                : "bg-white border-secondary-subtle"
            }`}
            style={{ cursor: "pointer", fontSize: "13px" }}
            onClick={handleSelectAllCriteria}
          >
            <Form.Check
              type="checkbox"
              id="select-all-checklist"
              checked={isAllCriteriaSelected}
            />
            <span
              className={`fw-bold mb-0 ${isAllCriteriaSelected ? "text-white" : "text-primary"}`}
              style={{ userSelect: "none" }}
            >
              {isAllCriteriaSelected
                ? t("review.modalChecklist.deselectAll")
                : t("review.modalChecklist.selectAll")}
            </span>
          </div>

          <Row xs={1} md={2} className="g-2">
            {CHECKLIST_IDS.map((id) => {
              const isChecked = !!checkedCriteria[`shared-${id}`];

              const title = t(`review.modalChecklist.items.${id}.title`);
              const desc = t(`review.modalChecklist.items.${id}.desc`);

              return (
                <Col key={id}>
                  <div
                    className={`p-2 rounded border d-flex align-items-start gap-2 h-100 transition-all ${
                      isChecked
                        ? "bg-success-subtle border-success"
                        : "bg-white border-light-subtle"
                    }`}
                    style={{ cursor: "pointer", fontSize: "12px" }}
                    onClick={() => handleCriteriaCheck(id)}
                  >
                    <Form.Check type="checkbox" checked={isChecked} readOnly />
                    <div>
                      <div
                        className={`fw-bold ${isChecked ? "text-success" : ""}`}
                      >
                        {id}: {title}
                      </div>
                      <div className="text-muted" style={{ fontSize: "10px" }}>
                        {desc}
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
            {t("review.modalChecklist.footer", {
              count: checkedCLCount,
              total: totalCLItemsToTick,
            })}
          </div>
          <Button
            variant="primary"
            onClick={() => setShowChecklistModal(false)}
          >
            {t("review.modalChecklist.saveAndClose")}
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
            <AlertTriangle size={24} /> {t("review.modalReject.title")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light">
          <Form.Group className="mb-4">
            <Form.Label className="fw-bold text-secondary small mb-3">
              {t("review.modalReject.step1")}
            </Form.Label>
            <Row xs={1} md={2} className="g-2">
              {ERROR_CATEGORIES.map((err) => (
                <Col key={err.id}>
                  <div
                    className={`d-flex align-items-start p-3 rounded-3 border h-100 transition-all ${
                      errorCategories.includes(err.title)
                        ? "border-danger bg-danger-subtle shadow-sm"
                        : "border-secondary-subtle bg-white shadow-sm-hover"
                    }`}
                    style={{ cursor: "pointer", borderWidth: "1.5px" }}
                    onClick={() => handleToggleError(err.title)}
                  >
                    <Form.Check
                      type="checkbox"
                      checked={errorCategories.includes(err.title)}
                      onChange={() => {}}
                      className="me-3 mt-1"
                    />
                    <div className="flex-grow-1">
                      <div
                        className="fw-bolder mb-1"
                        style={{ fontSize: "14px" }}
                      >
                        {err.title}
                      </div>
                      <div className="text-muted" style={{ fontSize: "11px" }}>
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
              {t("review.modalReject.step2")}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder={t("review.modalReject.placeholder")}
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
            {t("review.modalReject.btnCancel")}
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
            {t("review.modalReject.btnConfirm")}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReviewWorkspace;
