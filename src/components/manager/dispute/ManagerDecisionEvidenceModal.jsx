import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
  Table,
} from "reactstrap";
import { useTranslation } from "react-i18next";
import EvidenceCanvasViewer from "./EvidenceCanvasViewer";
import {
  parseErrorCategories,
  parseStoredAnnotationData,
  summarizeEvidence,
} from "./disputeEvidence.utils";

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("vi-VN");
};

const getStatusBadgeColor = (status) => {
  switch (String(status || "").toLowerCase()) {
    case "resolved":
    case "approved":
      return "success";
    case "rejected":
      return "danger";
    case "pending":
    case "escalated":
      return "warning";
    default:
      return "secondary";
  }
};

const getVerdictBadgeColor = (verdict) => {
  const normalized = String(verdict || "").toLowerCase();
  if (normalized === "approved" || normalized === "approve") {
    return "success";
  }

  if (normalized === "rejected" || normalized === "reject") {
    return "danger";
  }

  return "secondary";
};

const getDecisionNoteKey = (mode, decision) => {
  if (mode === "dispute") {
    return decision === "accept"
      ? "dispute.acceptDisputeHelp"
      : "dispute.rejectDisputeHelp";
  }

  return decision === "approve"
    ? "dispute.approveEscalationHelp"
    : "dispute.rejectEscalationHelp";
};

const buildGuidelineSet = (labels = [], labelSummaries = []) => {
  if (labelSummaries.length === 0) {
    return labels;
  }

  const relevantIds = new Set(
    labelSummaries
      .map((labelSummary) => labelSummary.id)
      .filter((value) => value !== null && value !== undefined)
      .map((value) => String(value)),
  );

  const relevantNames = new Set(
    labelSummaries
      .map((labelSummary) => String(labelSummary.name || "").toLowerCase())
      .filter(Boolean),
  );

  const matched = labels.filter(
    (label) =>
      relevantIds.has(String(label?.id)) ||
      relevantNames.has(String(label?.name || "").toLowerCase()),
  );

  return matched.length > 0 ? matched : labels;
};

const ManagerDecisionEvidenceModal = ({
  isOpen,
  toggle,
  caseItem,
  projectDetail,
  mode = "dispute",
  submitting = false,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const [decision, setDecision] = useState(
    mode === "dispute" ? "accept" : "approve",
  );
  const [comment, setComment] = useState("");
  const [highlightedAnnotationId, setHighlightedAnnotationId] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDecision(mode === "dispute" ? "accept" : "approve");
    setComment("");
    setHighlightedAnnotationId(null);
  }, [caseItem?.id, caseItem?.assignmentId, isOpen, mode]);

  const labels = useMemo(
    () => projectDetail?.labels || projectDetail?.labelClasses || [],
    [projectDetail],
  );

  const parsedEvidence = useMemo(
    () => parseStoredAnnotationData(caseItem?.annotationData),
    [caseItem?.annotationData],
  );

  const evidence = useMemo(
    () =>
      summarizeEvidence({
        annotations: parsedEvidence.annotations,
        checklist: parsedEvidence.checklist,
        defaultFlags: parsedEvidence.defaultFlags,
        labels,
        reviewerFeedbacks: caseItem?.reviewerFeedbacks || [],
      }),
    [
      caseItem?.reviewerFeedbacks,
      labels,
      parsedEvidence.annotations,
      parsedEvidence.checklist,
      parsedEvidence.defaultFlags,
    ],
  );

  const isPending = mode === "dispute" ? caseItem?.status === "Pending" : true;
  const guidelineSet = useMemo(
    () => buildGuidelineSet(labels, evidence.labelSummaries),
    [evidence.labelSummaries, labels],
  );

  const handleConfirm = () => {
    if (!isPending || !onConfirm) {
      return;
    }

    onConfirm({
      decision,
      comment: comment.trim(),
    });
  };

  if (!caseItem) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="xl" centered scrollable>
      <ModalHeader toggle={toggle}>
        <div className="d-flex flex-column gap-1">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="fw-semibold">
              {mode === "dispute"
                ? isPending
                  ? t("dispute.modalTitle")
                  : t("dispute.viewModalTitle")
                : t("dispute.escalationDeskTitle")}
            </span>
            <Badge color={getStatusBadgeColor(caseItem.status)}>
              {caseItem.status || t("dispute.statusPending")}
            </Badge>
            {mode === "escalation" && caseItem.escalationType && (
              <Badge color="warning">{caseItem.escalationType}</Badge>
            )}
          </div>
          <small className="text-muted">
            #{caseItem.assignmentId} · {caseItem.projectName || t("dispute.unknownProject")}
          </small>
        </div>
      </ModalHeader>

      <ModalBody>
        <div className="d-flex flex-column gap-3">
          <Row className="g-3">
            <Col lg={8}>
              <Card className="border-0 shadow-sm h-100">
                <CardBody className="d-flex flex-column gap-3">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                      <h6 className="mb-1">{t("dispute.annotationEvidenceTitle")}</h6>
                      <small className="text-muted">
                        {t("dispute.annotationEvidenceHint")}
                      </small>
                    </div>
                    <div className="d-flex gap-2 flex-wrap">
                      <Badge color="info">
                        {t("dispute.annotationCountBadge", {
                          count: evidence.annotationCount,
                        })}
                      </Badge>
                      <Badge color="secondary">
                        {t("dispute.checklistCountBadge", {
                          count: evidence.labelSummaries.reduce(
                            (total, labelSummary) =>
                              total + labelSummary.checkedItems.length,
                            0,
                          ),
                        })}
                      </Badge>
                    </div>
                  </div>

                  <EvidenceCanvasViewer
                    imageUrl={caseItem.dataItemUrl}
                    annotations={evidence.annotations}
                    highlightedAnnotationId={highlightedAnnotationId}
                    onAnnotationSelect={setHighlightedAnnotationId}
                    emptyState={t("dispute.noImageEvidence")}
                  />

                  <div className="table-responsive">
                    <Table size="sm" className="align-middle mb-0">
                      <thead>
                        <tr>
                          <th>{t("dispute.annotationTableLabel")}</th>
                          <th>{t("dispute.annotationTableShape")}</th>
                          <th>{t("dispute.annotationTableCoordinates")}</th>
                          <th className="text-end">{t("dispute.annotationTableAction")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evidence.annotations.length > 0 ? (
                          evidence.annotations.map((annotation) => (
                            <tr key={annotation.id}>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <span
                                    className="rounded-circle"
                                    style={{
                                      width: 10,
                                      height: 10,
                                      backgroundColor: annotation.color,
                                      display: "inline-block",
                                    }}
                                  ></span>
                                  <span className="fw-semibold">
                                    {annotation.labelName}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <Badge color="light" className="text-dark border">
                                  {annotation.type}
                                </Badge>
                              </td>
                              <td className="small text-muted">
                                {annotation.type === "POLYGON"
                                  ? `(${Math.round(annotation.x)}, ${Math.round(
                                      annotation.y,
                                    )}) · ${annotation.points.length} pts`
                                  : `x=${Math.round(annotation.x)}, y=${Math.round(
                                      annotation.y,
                                    )}, w=${Math.round(annotation.width)}, h=${Math.round(
                                      annotation.height,
                                    )}`}
                              </td>
                              <td className="text-end">
                                <Button
                                  size="sm"
                                  color={
                                    highlightedAnnotationId === annotation.id
                                      ? "primary"
                                      : "light"
                                  }
                                  className="border"
                                  onClick={() =>
                                    setHighlightedAnnotationId(
                                      highlightedAnnotationId === annotation.id
                                        ? null
                                        : annotation.id,
                                    )
                                  }
                                >
                                  {highlightedAnnotationId === annotation.id
                                    ? t("dispute.annotationHide")
                                    : t("dispute.annotationFocus")}
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="4" className="text-center text-muted py-3">
                              {t("dispute.noAnnotations")}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col lg={4}>
              <div className="d-flex flex-column gap-3">
                <Card className="border-0 shadow-sm">
                  <CardBody className="d-flex flex-column gap-2">
                    <h6 className="mb-0">{t("dispute.caseSummaryTitle")}</h6>
                    <div className="small d-flex justify-content-between">
                      <span className="text-muted">{t("dispute.summaryAnnotator")}</span>
                      <strong>{caseItem.annotatorName || caseItem.annotatorId || "—"}</strong>
                    </div>
                    <div className="small d-flex justify-content-between">
                      <span className="text-muted">{t("dispute.summaryImage")}</span>
                      <strong>#{caseItem.dataItemId || caseItem.assignmentId}</strong>
                    </div>
                    <div className="small d-flex justify-content-between">
                      <span className="text-muted">{t("dispute.summarySubmitted")}</span>
                      <strong>{formatDateTime(caseItem.submittedAt)}</strong>
                    </div>
                    <div className="small d-flex justify-content-between">
                      <span className="text-muted">{t("dispute.summaryOpened")}</span>
                      <strong>{formatDateTime(caseItem.createdAt)}</strong>
                    </div>
                    <div className="small d-flex justify-content-between">
                      <span className="text-muted">{t("dispute.summaryGuidelineVersion")}</span>
                      <strong>
                        {caseItem.guidelineVersion
                          ? `v${caseItem.guidelineVersion}`
                          : "—"}
                      </strong>
                    </div>
                    <div className="small d-flex justify-content-between">
                      <span className="text-muted">{t("dispute.summaryGeometry")}</span>
                      <strong>{caseItem.projectType || "BBOX"}</strong>
                    </div>
                  </CardBody>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardBody className="d-flex flex-column gap-2">
                    <h6 className="mb-0">
                      {mode === "dispute"
                        ? t("dispute.annotatorClaim")
                        : t("dispute.escalationContext")}
                    </h6>
                    <div className="small text-muted">
                      {mode === "dispute"
                        ? caseItem.reason || t("dispute.noReasonProvided")
                        : t("dispute.escalationContextHint", {
                            type: caseItem.escalationType || "Escalation",
                          })}
                    </div>

                    <div className="d-flex flex-wrap gap-2 mt-2">
                      {evidence.labelSummaries.map((labelSummary) => (
                        <Badge
                          key={`${labelSummary.id}-${labelSummary.name}`}
                          pill
                          style={{
                            backgroundColor: labelSummary.color || "#0ea5e9",
                            color: "#fff",
                          }}
                        >
                          {labelSummary.name} · {labelSummary.annotationCount}
                        </Badge>
                      ))}
                      {evidence.labelSummaries.length === 0 && (
                        <span className="small text-muted">
                          {t("dispute.noLabelsUsed")}
                        </span>
                      )}
                    </div>

                    {evidence.flaggedLabels.length > 0 && (
                      <div className="mt-2">
                        <div className="small text-muted mb-1">
                          {t("dispute.defaultFlagsTitle")}
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                          {evidence.flaggedLabels.map((label) => (
                            <Badge
                              key={`flag-${label.id}-${label.name}`}
                              color="warning"
                              pill
                            >
                              {label.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>

                <Alert
                  color={evidence.feedbackSummary.isConflict ? "warning" : "info"}
                  className="mb-0"
                >
                  <div className="d-flex flex-column gap-1">
                    <strong>{t("dispute.voteSummaryTitle")}</strong>
                    <div className="small">
                      {t("dispute.voteSummaryBody", {
                        approve: evidence.feedbackSummary.approvedCount,
                        reject: evidence.feedbackSummary.rejectedCount,
                        neutral: evidence.feedbackSummary.neutralCount,
                      })}
                    </div>
                    <div className="small">
                      {evidence.feedbackSummary.isConflict
                        ? t("dispute.voteConflictHint")
                        : evidence.feedbackSummary.majorityVerdict === "approved"
                          ? t("dispute.voteMajorityApprove")
                          : evidence.feedbackSummary.majorityVerdict === "rejected"
                            ? t("dispute.voteMajorityReject")
                            : t("dispute.voteNoMajority")}
                    </div>
                  </div>
                </Alert>
              </div>
            </Col>
          </Row>

          <Row className="g-3">
            <Col lg={5}>
              <Card className="border-0 shadow-sm h-100">
                <CardBody>
                  <h6 className="mb-3">{t("dispute.checklistEvidenceTitle")}</h6>
                  {evidence.labelSummaries.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      {evidence.labelSummaries.map((labelSummary) => (
                        <div key={`check-${labelSummary.id}-${labelSummary.name}`}>
                          <div className="d-flex align-items-center justify-content-between gap-2">
                            <div className="d-flex align-items-center gap-2">
                              <span
                                className="rounded-circle"
                                style={{
                                  width: 10,
                                  height: 10,
                                  backgroundColor: labelSummary.color || "#0ea5e9",
                                  display: "inline-block",
                                }}
                              ></span>
                              <strong>{labelSummary.name}</strong>
                            </div>
                            <Badge color="light" className="text-dark border">
                              {t("dispute.labelSummaryBadge", {
                                annotations: labelSummary.annotationCount,
                                checked: labelSummary.checkedItems.length,
                              })}
                            </Badge>
                          </div>
                          {labelSummary.checkedItems.length > 0 ? (
                            <div className="mt-2 d-flex flex-wrap gap-2">
                              {labelSummary.checkedItems.map((item) => (
                                <Badge
                                  key={`${labelSummary.name}-${item}`}
                                  color="info"
                                  pill
                                >
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <div className="small text-muted mt-2">
                              {t("dispute.noChecklistSelected")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted small">
                      {t("dispute.noChecklistEvidence")}
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>

            <Col lg={7}>
              <Card className="border-0 shadow-sm h-100">
                <CardBody>
                  <h6 className="mb-3">{t("dispute.reviewerTimelineTitle")}</h6>
                  {Array.isArray(caseItem.reviewerFeedbacks) &&
                  caseItem.reviewerFeedbacks.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      {caseItem.reviewerFeedbacks.map((feedback, index) => {
                        const errorCategories = parseErrorCategories(
                          feedback.errorCategories,
                        );

                        return (
                          <div
                            key={`feedback-${feedback.reviewLogId || index}`}
                            className="p-3 rounded border"
                            style={{
                              borderColor:
                                getVerdictBadgeColor(feedback.verdict) === "success"
                                  ? "rgba(22, 163, 74, 0.3)"
                                  : getVerdictBadgeColor(feedback.verdict) === "danger"
                                    ? "rgba(220, 38, 38, 0.3)"
                                    : "rgba(148, 163, 184, 0.3)",
                              background:
                                getVerdictBadgeColor(feedback.verdict) === "success"
                                  ? "rgba(22, 163, 74, 0.06)"
                                  : getVerdictBadgeColor(feedback.verdict) === "danger"
                                    ? "rgba(220, 38, 38, 0.06)"
                                    : "#fff",
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                              <div>
                                <div className="fw-semibold">
                                  {feedback.reviewerName || feedback.reviewerId}
                                </div>
                                <div className="small text-muted">
                                  {formatDateTime(feedback.reviewedAt)}
                                </div>
                              </div>
                              <div className="d-flex gap-2 flex-wrap">
                                <Badge color={getVerdictBadgeColor(feedback.verdict)}>
                                  {feedback.verdict || t("dispute.noVerdict")}
                                </Badge>
                                {feedback.scorePenalty > 0 && (
                                  <Badge color="warning">
                                    {t("dispute.penaltyBadge", {
                                      score: feedback.scorePenalty,
                                    })}
                                  </Badge>
                                )}
                                {feedback.isAudited && (
                                  <Badge color="secondary">
                                    {feedback.auditResult || t("dispute.auditBadge")}
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {feedback.comment && (
                              <div className="mt-2 small">
                                <strong>{t("dispute.reviewerCommentTitle")}:</strong>{" "}
                                {feedback.comment}
                              </div>
                            )}

                            {errorCategories.length > 0 && (
                              <div className="mt-2 d-flex flex-wrap gap-2">
                                {errorCategories.map((category) => (
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
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-muted small">
                      {t("dispute.noReviewerEvidence")}
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>

          <Card className="border-0 shadow-sm">
            <CardBody>
              <h6 className="mb-3">{t("dispute.guidelineRef")}</h6>
              {guidelineSet.length > 0 ? (
                <div className="table-responsive">
                  <Table size="sm" className="align-middle mb-0">
                    <thead>
                      <tr>
                        <th>{t("dispute.labelCol")}</th>
                        <th>{t("dispute.colorCol")}</th>
                        <th>{t("dispute.guideCol")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {guidelineSet.map((label) => (
                        <tr key={`guide-${label.id}`}>
                          <td className="fw-semibold">{label.name}</td>
                          <td>
                            <span
                              className="badge px-2 py-1"
                              style={{ backgroundColor: label.color || "#0ea5e9" }}
                            >
                              {label.color || "#0ea5e9"}
                            </span>
                          </td>
                          <td className="small text-muted">
                            {label.guideLine || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-muted small">
                  {t("dispute.noGuidelineReference")}
                </div>
              )}
            </CardBody>
          </Card>

          {isPending ? (
            <Card className="border-0 shadow-sm">
              <CardBody className="d-flex flex-column gap-3">
                <div>
                  <h6 className="mb-1">{t("dispute.decisionDeskTitle")}</h6>
                  <small className="text-muted">
                    {mode === "dispute"
                      ? t("dispute.decisionDeskHint")
                      : t("dispute.escalationDecisionHint")}
                  </small>
                </div>

                <Row className="g-3">
                  <Col md={6}>
                    <button
                      type="button"
                      className={`btn w-100 text-start p-3 border ${
                        decision === (mode === "dispute" ? "accept" : "approve")
                          ? "btn-success"
                          : "btn-light"
                      }`}
                      onClick={() =>
                        setDecision(mode === "dispute" ? "accept" : "approve")
                      }
                    >
                      <div className="fw-semibold">
                        {mode === "dispute"
                          ? t("dispute.acceptComplaint")
                          : t("dispute.approveEscalation")}
                      </div>
                      <div className="small mt-1">
                        {t(
                          mode === "dispute"
                            ? "dispute.acceptDisputeShort"
                            : "dispute.approveEscalationShort",
                        )}
                      </div>
                    </button>
                  </Col>
                  <Col md={6}>
                    <button
                      type="button"
                      className={`btn w-100 text-start p-3 border ${
                        decision === "reject" ? "btn-danger" : "btn-light"
                      }`}
                      onClick={() => setDecision("reject")}
                    >
                      <div className="fw-semibold">
                        {mode === "dispute"
                          ? t("dispute.rejectComplaint")
                          : t("dispute.rejectEscalation")}
                      </div>
                      <div className="small mt-1">
                        {t(
                          mode === "dispute"
                            ? "dispute.rejectDisputeShort"
                            : "dispute.rejectEscalationShort",
                        )}
                      </div>
                    </button>
                  </Col>
                </Row>

                <Alert color={decision === "reject" ? "danger" : "success"} className="mb-0">
                  {t(getDecisionNoteKey(mode, decision))}
                </Alert>

                <div>
                  <Label className="fw-semibold">
                    {t("dispute.managerComment")}
                  </Label>
                  <Input
                    type="textarea"
                    rows="4"
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder={t("dispute.commentPlaceholder")}
                  />
                  {!comment.trim() && (
                    <small className="text-danger">
                      {t("dispute.commentRequired")}
                    </small>
                  )}
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardBody className="d-flex flex-column gap-2">
                <h6 className="mb-0">{t("dispute.resolutionSummaryTitle")}</h6>
                <div className="d-flex gap-2 flex-wrap">
                  <Badge color={getStatusBadgeColor(caseItem.status)}>
                    {caseItem.status}
                  </Badge>
                  {caseItem.resolutionType && (
                    <Badge color="info">{caseItem.resolutionType}</Badge>
                  )}
                </div>
                <div className="small text-muted">
                  {t("dispute.resolvedByManager", {
                    manager: caseItem.managerName || t("dispute.unknownManager"),
                    resolvedAt: formatDateTime(caseItem.resolvedAt),
                  })}
                </div>
                {caseItem.managerComment && (
                  <Alert color="light" className="mb-0 border">
                    <strong>{t("dispute.managerComment")}:</strong>{" "}
                    {caseItem.managerComment}
                  </Alert>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <Button color="light" onClick={toggle}>
          {isPending ? t("dispute.cancel") : t("dispute.close")}
        </Button>
        {isPending && (
          <Button
            color="primary"
            onClick={handleConfirm}
            disabled={submitting || !comment.trim()}
          >
            {submitting ? (
              <Spinner size="sm" className="me-1" />
            ) : (
              <i className="ri-check-double-line me-1"></i>
            )}
            {t("dispute.confirmArbitrate")}
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default ManagerDecisionEvidenceModal;
