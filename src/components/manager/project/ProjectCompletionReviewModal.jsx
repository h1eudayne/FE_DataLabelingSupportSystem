import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
  Table,
} from "reactstrap";
import { useTranslation } from "react-i18next";
import { resolveBackendAssetUrl } from "../../../config/runtime";
import {
  parseStoredAnnotationData,
  parseErrorCategories,
  summarizeEvidence,
} from "../dispute/disputeEvidence.utils";
import EvidenceCanvasViewer from "../dispute/EvidenceCanvasViewer";
import {
  getProjectStatusBadgeClass,
  getProjectStatusLabel,
} from "../../../utils/projectWorkflowStatus";

const formatDateTime = (value, localeTag) => {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : parsed.toLocaleString(localeTag);
};

const randomSample = (items, sampleSize = 5) => {
  const pool = [...items];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[randomIndex]] = [pool[randomIndex], pool[index]];
  }

  return pool.slice(0, Math.min(sampleSize, pool.length));
};

const getVerdictBadgeClass = (verdict) => {
  const normalized = String(verdict || "").toLowerCase();
  if (normalized === "approved" || normalized === "approve") {
    return "bg-success-subtle text-success";
  }

  if (normalized === "rejected" || normalized === "reject") {
    return "bg-danger-subtle text-danger";
  }

  return "bg-secondary-subtle text-secondary";
};

const ProjectCompletionReviewModal = ({
  isOpen,
  toggle,
  project,
  reviewData,
  loading = false,
  submitting = false,
  onConfirmCompletion,
  onReturnItem,
}) => {
  const { t, i18n } = useTranslation();
  const localeTag = i18n.language?.startsWith("vi") ? "vi-VN" : "en-US";
  const [searchTerm, setSearchTerm] = useState("");
  const [sampledAssignmentIds, setSampledAssignmentIds] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [returnComment, setReturnComment] = useState("");
  const [highlightedAnnotationId, setHighlightedAnnotationId] = useState(null);

  const items = reviewData?.items || [];

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSearchTerm("");
    setSampledAssignmentIds([]);
    setReturnComment("");
    setHighlightedAnnotationId(null);
    setSelectedAssignmentId(items[0]?.assignmentId ?? null);
  }, [isOpen, items]);

  const visibleItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return items.filter((item) => {
      if (
        sampledAssignmentIds.length > 0 &&
        !sampledAssignmentIds.includes(item.assignmentId)
      ) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        item.annotatorName,
        item.dataItemId,
        item.assignmentId,
        item.managerComment,
      ]
        .filter((value) => value !== null && value !== undefined)
        .some((value) =>
          String(value).toLowerCase().includes(normalizedSearch),
        );
    });
  }, [items, sampledAssignmentIds, searchTerm]);

  useEffect(() => {
    if (!visibleItems.length) {
      setSelectedAssignmentId(null);
      return;
    }

    if (!visibleItems.some((item) => item.assignmentId === selectedAssignmentId)) {
      setSelectedAssignmentId(visibleItems[0].assignmentId);
    }
  }, [selectedAssignmentId, visibleItems]);

  const selectedItem = useMemo(
    () =>
      visibleItems.find((item) => item.assignmentId === selectedAssignmentId) ||
      visibleItems[0] ||
      null,
    [selectedAssignmentId, visibleItems],
  );

  useEffect(() => {
    setReturnComment(selectedItem?.managerComment || "");
    setHighlightedAnnotationId(null);
  }, [selectedItem?.assignmentId, selectedItem?.managerComment]);

  const parsedEvidence = useMemo(
    () => parseStoredAnnotationData(selectedItem?.annotationData),
    [selectedItem?.annotationData],
  );

  const evidence = useMemo(
    () =>
      summarizeEvidence({
        annotations: parsedEvidence.annotations,
        checklist: parsedEvidence.checklist,
        defaultFlags: parsedEvidence.defaultFlags,
        labels: project?.labels || [],
        reviewerFeedbacks: selectedItem?.reviewerFeedbacks || [],
      }),
    [
      parsedEvidence.annotations,
      parsedEvidence.checklist,
      parsedEvidence.defaultFlags,
      project?.labels,
      selectedItem?.reviewerFeedbacks,
    ],
  );

  const totalReturnedCount = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.rejectCount || 0), 0),
    [items],
  );

  const handleRandomSample = () => {
    const sampledItems = randomSample(items);
    setSampledAssignmentIds(sampledItems.map((item) => item.assignmentId));
    setSelectedAssignmentId(sampledItems[0]?.assignmentId ?? null);
  };

  const handleShowAll = () => {
    setSampledAssignmentIds([]);
    setSelectedAssignmentId(items[0]?.assignmentId ?? null);
  };

  const handleReturnItem = () => {
    if (!selectedItem || !returnComment.trim() || !onReturnItem) {
      return;
    }

    onReturnItem(selectedItem.assignmentId, returnComment.trim());
  };

  const isCompletedProject = String(reviewData?.status || "").toLowerCase() === "completed";

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" centered scrollable>
      <ModalHeader toggle={toggle}>
        <div className="d-flex flex-column gap-1">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="fw-semibold">
              {t("datasets.completionReviewTitle")}
            </span>
            {reviewData?.status && (
              <span
                className={`badge ${getProjectStatusBadgeClass(reviewData.status)}`}
              >
                {getProjectStatusLabel(reviewData.status, t)}
              </span>
            )}
            <Badge color="light" className="text-dark border">
              {t("datasets.completionReviewItemCount", {
                count: items.length,
              })}
            </Badge>
          </div>
          <small className="text-muted">
            {project?.name || reviewData?.projectName}
          </small>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="d-flex flex-column gap-3">
          <Alert
            color={isCompletedProject ? "info" : "warning"}
            className="mb-0"
          >
            <div className="d-flex flex-column gap-1">
              <strong>
                {isCompletedProject
                  ? t("datasets.completionReviewClosedProjectTitle")
                  : t("datasets.completionReviewReadyTitle")}
              </strong>
              <span>
                {isCompletedProject
                  ? t("datasets.completionReviewClosedProjectHint")
                  : t("datasets.completionReviewReadyHint")}
              </span>
            </div>
          </Alert>

          <Row className="g-3">
            <Col lg={4}>
              <Card className="border-0 shadow-sm h-100">
                <CardBody className="d-flex flex-column gap-3">
                  <div className="row g-2">
                    <div className="col-sm-4">
                      <div className="rounded border bg-light-subtle p-3 h-100">
                        <div className="text-muted small mb-1">
                          {t("datasets.totalData")}
                        </div>
                        <div className="fw-bold fs-5">
                          {reviewData?.totalDataItems ?? items.length}
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="rounded border bg-light-subtle p-3 h-100">
                        <div className="text-muted small mb-1">
                          {t("datasets.approved")}
                        </div>
                        <div className="fw-bold fs-5 text-success">
                          {reviewData?.approvedItems ?? items.length}
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="rounded border bg-light-subtle p-3 h-100">
                        <div className="text-muted small mb-1">
                          {t("datasets.completionReviewTimesReturned")}
                        </div>
                        <div className="fw-bold fs-5 text-warning">
                          {totalReturnedCount}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2 flex-wrap">
                    <Button
                      color="primary"
                      outline={sampledAssignmentIds.length > 0}
                      size="sm"
                      onClick={handleRandomSample}
                      disabled={items.length === 0}
                    >
                      <i className="ri-shuffle-line me-1"></i>
                      {t("datasets.completionReviewRandomSample")}
                    </Button>
                    <Button
                      color="secondary"
                      outline
                      size="sm"
                      onClick={handleShowAll}
                      disabled={items.length === 0}
                    >
                      {t("datasets.completionReviewShowAll")}
                    </Button>
                  </div>

                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder={t("datasets.completionReviewSearchPlaceholder")}
                  />

                  <div
                    className="d-flex flex-column gap-2"
                    style={{ maxHeight: 520, overflowY: "auto" }}
                  >
                    {loading ? (
                      <div className="text-center py-5">
                        <Spinner color="primary" />
                      </div>
                    ) : visibleItems.length > 0 ? (
                      visibleItems.map((item) => {
                        const isActive =
                          item.assignmentId === selectedItem?.assignmentId;

                        return (
                          <button
                            key={item.assignmentId}
                            type="button"
                            className={`btn text-start border rounded-3 p-2 ${isActive ? "border-primary bg-primary-subtle" : "bg-white"}`}
                            onClick={() => {
                              setSelectedAssignmentId(item.assignmentId);
                              setReturnComment(item.managerComment || "");
                            }}
                          >
                            <div className="d-flex gap-2 align-items-start">
                              <img
                                src={resolveBackendAssetUrl(item.dataItemUrl)}
                                alt={t("datasets.completionReviewImagePreviewAlt", {
                                  id: item.dataItemId,
                                })}
                                style={{
                                  width: 72,
                                  height: 56,
                                  objectFit: "cover",
                                  borderRadius: 10,
                                  flexShrink: 0,
                                  border: "1px solid rgba(148, 163, 184, 0.28)",
                                }}
                              />
                              <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                <div className="d-flex justify-content-between gap-2">
                                  <div className="fw-semibold text-truncate">
                                    {t("datasets.completionReviewImageCode", {
                                      id: item.dataItemId,
                                    })}
                                  </div>
                                  <Badge
                                    color="light"
                                    className="text-dark border flex-shrink-0"
                                  >
                                    {t("datasets.completionReviewReturnBadge", {
                                      count: item.rejectCount || 0,
                                    })}
                                  </Badge>
                                </div>
                                <div className="small text-muted text-truncate">
                                  {item.annotatorName}
                                </div>
                                <div className="small text-muted mt-1">
                                  {t("datasets.completionReviewReviewEventBadge", {
                                    count: item.reviewEventCount || 0,
                                  })}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="text-center text-muted py-5">
                        {t("datasets.completionReviewNoItems")}
                      </div>
                    )}
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={8}>
              <Card className="border-0 shadow-sm h-100">
                <CardBody className="d-flex flex-column gap-3">
                  {selectedItem ? (
                    <>
                      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div>
                          <h5 className="mb-1">
                            {t("datasets.completionReviewSelectedImageTitle", {
                              id: selectedItem.dataItemId,
                            })}
                          </h5>
                          <div className="text-muted small">
                            {t("datasets.completionReviewSelectedImageSubtitle", {
                              annotator: selectedItem.annotatorName,
                              submittedAt: formatDateTime(
                                selectedItem.submittedAt,
                                localeTag,
                              ),
                            })}
                          </div>
                        </div>
                        <div className="d-flex gap-2 flex-wrap">
                          <Badge color="light" className="text-dark border">
                            {t("datasets.completionReviewAnnotationCountBadge", {
                              count: evidence.annotationCount,
                            })}
                          </Badge>
                          <Badge color="light" className="text-dark border">
                            {t("datasets.completionReviewReviewerCountBadge", {
                              count: selectedItem.reviewerCount || 0,
                            })}
                          </Badge>
                          <Badge color="light" className="text-dark border">
                            {t("datasets.completionReviewReviewEventBadge", {
                              count: selectedItem.reviewEventCount || 0,
                            })}
                          </Badge>
                        </div>
                      </div>

                      <Row className="g-2">
                        <Col sm={4}>
                          <div className="rounded border bg-light-subtle p-3 h-100">
                            <div className="text-muted small mb-1">
                              {t("datasets.completionReviewTimesReturned")}
                            </div>
                            <div className="fw-bold fs-5">
                              {selectedItem.rejectCount || 0}
                            </div>
                          </div>
                        </Col>
                        <Col sm={4}>
                          <div className="rounded border bg-light-subtle p-3 h-100">
                            <div className="text-muted small mb-1">
                              {t("datasets.completionReviewLatestReviewerFeedback")}
                            </div>
                            <div className="fw-bold fs-5">
                              {selectedItem.reviewerFeedbacks?.length || 0}
                            </div>
                          </div>
                        </Col>
                        <Col sm={4}>
                          <div className="rounded border bg-light-subtle p-3 h-100">
                            <div className="text-muted small mb-1">
                              {t("datasets.completionReviewStatus")}
                            </div>
                            <div className="fw-bold fs-6">
                              {selectedItem.status || "—"}
                            </div>
                          </div>
                        </Col>
                      </Row>

                      <EvidenceCanvasViewer
                        imageUrl={selectedItem.dataItemUrl}
                        annotations={evidence.annotations}
                        highlightedAnnotationId={highlightedAnnotationId}
                        onAnnotationSelect={setHighlightedAnnotationId}
                        emptyState={t("datasets.completionReviewNoImageEvidence")}
                        height={420}
                      />

                      <Row className="g-3">
                        <Col xl={6}>
                          <Card className="border shadow-none h-100">
                            <CardBody>
                              <h6 className="mb-3">
                                {t("datasets.completionReviewAnnotationSummary")}
                              </h6>
                              {evidence.labelSummaries.length > 0 ? (
                                <div className="d-flex flex-column gap-2">
                                  {evidence.labelSummaries.map((label) => (
                                    <div
                                      key={`${label.id}-${label.name}`}
                                      className="d-flex align-items-center justify-content-between gap-2"
                                    >
                                      <div className="d-flex align-items-center gap-2">
                                        <span
                                          className="rounded-circle"
                                          style={{
                                            width: 10,
                                            height: 10,
                                            backgroundColor: label.color || "#14b8a6",
                                            display: "inline-block",
                                          }}
                                        ></span>
                                        <span className="fw-semibold">
                                          {label.name}
                                        </span>
                                      </div>
                                      <Badge
                                        color="light"
                                        className="text-dark border"
                                      >
                                        {t("datasets.completionReviewAnnotationCountBadge", {
                                          count: label.annotationCount || 0,
                                        })}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-muted small">
                                  {t("datasets.completionReviewNoAnnotations")}
                                </div>
                              )}
                            </CardBody>
                          </Card>
                        </Col>
                        <Col xl={6}>
                          <Card className="border shadow-none h-100">
                            <CardBody>
                              <h6 className="mb-3">
                                {t("datasets.completionReviewLatestReviewerFeedback")}
                              </h6>
                              {selectedItem.reviewerFeedbacks?.length ? (
                                <div className="d-flex flex-column gap-2">
                                  {selectedItem.reviewerFeedbacks.map((feedback) => (
                                    <div
                                      key={`latest-${feedback.reviewLogId}`}
                                      className="rounded border p-2"
                                    >
                                      <div className="d-flex justify-content-between gap-2 flex-wrap">
                                        <div className="fw-semibold">
                                          {feedback.reviewerName || feedback.reviewerId}
                                        </div>
                                        <span
                                          className={`badge ${getVerdictBadgeClass(feedback.verdict)}`}
                                        >
                                          {feedback.verdict || "—"}
                                        </span>
                                      </div>
                                      <div className="small text-muted mt-1">
                                        {formatDateTime(feedback.reviewedAt, localeTag)}
                                      </div>
                                      {feedback.comment && (
                                        <div className="small mt-2">{feedback.comment}</div>
                                      )}
                                      {parseErrorCategories(feedback.errorCategories).length >
                                        0 && (
                                        <div className="d-flex gap-2 flex-wrap mt-2">
                                          {parseErrorCategories(
                                            feedback.errorCategories,
                                          ).map((category) => (
                                            <Badge
                                              key={`${feedback.reviewLogId}-${category}`}
                                              color="warning"
                                              pill
                                            >
                                              {category}
                                            </Badge>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-muted small">
                                  {t("datasets.completionReviewNoFeedback")}
                                </div>
                              )}
                            </CardBody>
                          </Card>
                        </Col>
                      </Row>

                      <Card className="border shadow-none">
                        <CardBody>
                          <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3">
                            <h6 className="mb-0">
                              {t("datasets.completionReviewAllReviewerHistory")}
                            </h6>
                            <Badge color="light" className="text-dark border">
                              {t("datasets.completionReviewReviewEventBadge", {
                                count: selectedItem.reviewHistory?.length || 0,
                              })}
                            </Badge>
                          </div>

                          {selectedItem.reviewHistory?.length ? (
                            <div className="table-responsive">
                              <Table size="sm" className="align-middle mb-0">
                                <thead>
                                  <tr>
                                    <th>{t("datasets.completionReviewReviewerCol")}</th>
                                    <th>{t("datasets.completionReviewVerdictCol")}</th>
                                    <th>{t("datasets.completionReviewReviewedAtCol")}</th>
                                    <th>{t("datasets.completionReviewCommentCol")}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {selectedItem.reviewHistory.map((feedback, index) => (
                                    <tr
                                      key={`history-${feedback.reviewLogId || index}`}
                                    >
                                      <td className="fw-semibold">
                                        {feedback.reviewerName || feedback.reviewerId}
                                      </td>
                                      <td>
                                        <span
                                          className={`badge ${getVerdictBadgeClass(feedback.verdict)}`}
                                        >
                                          {feedback.verdict || "—"}
                                        </span>
                                      </td>
                                      <td className="small text-muted">
                                        {formatDateTime(feedback.reviewedAt, localeTag)}
                                      </td>
                                      <td className="small">
                                        {feedback.comment || "—"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          ) : (
                            <div className="text-muted small">
                              {t("datasets.completionReviewNoHistory")}
                            </div>
                          )}
                        </CardBody>
                      </Card>

                      <Card className="border shadow-none">
                        <CardBody className="d-flex flex-column gap-3">
                          <div>
                            <h6 className="mb-1">
                              {t("datasets.completionReviewReturnTitle")}
                            </h6>
                            <small className="text-muted">
                              {t("datasets.completionReviewReturnHint")}
                            </small>
                          </div>

                          {selectedItem.managerComment && (
                            <Alert color="light" className="border mb-0">
                              <strong>
                                {t("datasets.completionReviewPreviousManagerComment")}:
                              </strong>{" "}
                              {selectedItem.managerComment}
                            </Alert>
                          )}

                          <Input
                            type="textarea"
                            rows="4"
                            value={returnComment}
                            onChange={(event) => setReturnComment(event.target.value)}
                            placeholder={t("datasets.completionReviewReturnPlaceholder")}
                          />
                          <div className="d-flex justify-content-end">
                            <Button
                              color="danger"
                              onClick={handleReturnItem}
                              disabled={submitting || !returnComment.trim()}
                            >
                              {submitting ? (
                                <Spinner size="sm" className="me-2" />
                              ) : (
                                <i className="ri-arrow-go-back-line me-1"></i>
                              )}
                              {t("datasets.completionReviewReturnAction")}
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    </>
                  ) : (
                    <div className="text-center text-muted py-5">
                      {t("datasets.completionReviewSelectImage")}
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button color="light" onClick={toggle}>
          {t("common.cancel")}
        </Button>
        {reviewData?.canManagerConfirmCompletion && (
          <Button
            color="success"
            onClick={onConfirmCompletion}
            disabled={submitting}
          >
            {submitting ? (
              <Spinner size="sm" className="me-2" />
            ) : (
              <i className="ri-checkbox-circle-line me-1"></i>
            )}
            {t("datasets.completeProjectAction")}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default ProjectCompletionReviewModal;
