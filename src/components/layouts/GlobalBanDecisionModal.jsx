import React from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Badge,
  Button,
  Form,
  Modal,
  Spinner,
} from "react-bootstrap";

const getProjectStatusVariant = (status) => {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus === "completed" || normalizedStatus === "approved") {
    return "success";
  }

  if (normalizedStatus === "active" || normalizedStatus === "inprogress") {
    return "primary";
  }

  if (normalizedStatus === "submitted" || normalizedStatus === "assigned") {
    return "warning";
  }

  if (normalizedStatus === "rejected" || normalizedStatus === "archived") {
    return "secondary";
  }

  return "light";
};

const formatDecisionDate = (value, locale) => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toLocaleString(locale);
};

const GlobalBanDecisionModal = ({
  show,
  onHide,
  onSubmit,
  loading,
  notification,
  decision,
  onDecisionChange,
  decisionNote,
  onDecisionNoteChange,
}) => {
  const { t, i18n } = useTranslation();
  const metadata = notification?.metadata || {};
  const locale = i18n.language === "vi" ? "vi-VN" : "en-US";
  const unfinishedProjects = Array.isArray(metadata.unfinishedProjects)
    ? metadata.unfinishedProjects
    : [];
  const requestedAt = formatDecisionDate(metadata.requestedAt, locale);
  const resolvedAt = formatDecisionDate(metadata.resolvedAt, locale);
  const isApproveDecision = decision === "approve";

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton={!loading}>
        <Modal.Title>
          {t("header.globalBanReviewRequest")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex flex-column gap-3">
          <Alert variant="warning" className="mb-0">
            <div className="fw-semibold">
              {t("header.globalBanDecisionRequired")}
            </div>
            <div className="small mt-1">
              {t("header.globalBanDecisionRequiredNote")}
            </div>
          </Alert>

          <div className="row g-3">
            <div className="col-12 col-lg-6">
              <div className="border rounded-3 p-3 h-100 bg-light-subtle">
                <div className="text-muted text-uppercase fw-semibold small mb-2">
                  {t("header.globalBanTargetUser")}
                </div>
                <div className="fw-semibold">
                  {metadata.targetUserName || t("header.defaultUser")}
                </div>
                <div className="small text-muted">
                  {metadata.targetUserEmail || t("header.noEmail")}
                </div>
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {metadata.targetUserRole && (
                    <Badge bg="info-subtle" text="info">
                      {metadata.targetUserRole}
                    </Badge>
                  )}
                  {metadata.requestStatus && (
                    <Badge
                      bg={
                        metadata.requestStatus === "Pending"
                          ? "warning"
                          : metadata.requestStatus === "Approved"
                            ? "success"
                            : "secondary"
                      }
                      text={metadata.requestStatus === "Pending" ? "dark" : undefined}
                    >
                      {metadata.requestStatus}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div className="border rounded-3 p-3 h-100">
                <div className="text-muted text-uppercase fw-semibold small mb-2">
                  {t("header.globalBanRequestDetails")}
                </div>
                <div className="small">
                  <div className="fw-semibold">
                    {t("header.globalBanRequestedBy")}
                  </div>
                  <div>{metadata.requestedByAdminName || t("header.defaultUser")}</div>
                  {metadata.requestedByAdminEmail && (
                    <div className="text-muted">{metadata.requestedByAdminEmail}</div>
                  )}
                </div>
                <div className="small mt-3">
                  <div className="fw-semibold">
                    {t("header.globalBanResponsibleManager")}
                  </div>
                  <div>{metadata.managerName || t("userMgmt.noManager")}</div>
                  {metadata.managerEmail && (
                    <div className="text-muted">{metadata.managerEmail}</div>
                  )}
                </div>
                {requestedAt && (
                  <div className="small mt-3">
                    <div className="fw-semibold">
                      {t("header.globalBanRequestedAt")}
                    </div>
                    <div>{requestedAt}</div>
                  </div>
                )}
                {resolvedAt && (
                  <div className="small mt-3">
                    <div className="fw-semibold">
                      {t("header.globalBanResolvedAt")}
                    </div>
                    <div>{resolvedAt}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border rounded-3 p-3">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <div className="fw-semibold">
                {t("header.globalBanProjects")}
              </div>
              <Badge bg="light" text="dark" pill>
                {t("header.globalBanProjectCount", {
                  count: unfinishedProjects.length,
                })}
              </Badge>
            </div>

            {unfinishedProjects.length > 0 ? (
              <div className="d-flex flex-column gap-2">
                {unfinishedProjects.map((project) => (
                  <div
                    key={`${metadata.banRequestId || "ban"}-${project.id}-${project.name}`}
                    className="d-flex flex-wrap justify-content-between align-items-center gap-2 rounded-3 border p-2"
                  >
                    <div>
                      <div className="fw-semibold">{project.name}</div>
                      <div className="small text-muted">
                        #{project.id}
                      </div>
                    </div>
                    <Badge bg={getProjectStatusVariant(project.status)}>
                      {project.status || t("header.globalBanUnknownStatus")}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="small text-muted">
                {t("header.globalBanNoProjects")}
              </div>
            )}
          </div>

          <div className="border rounded-3 p-3">
            <div className="fw-semibold mb-3">
              {t("header.globalBanDecision")}
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Button
                variant={isApproveDecision ? "danger" : "outline-danger"}
                onClick={() => onDecisionChange("approve")}
                disabled={loading}
              >
                {t("header.globalBanApproveConfirm")}
              </Button>
              <Button
                variant={!isApproveDecision ? "secondary" : "outline-secondary"}
                onClick={() => onDecisionChange("reject")}
                disabled={loading}
              >
                {t("header.globalBanRejectConfirm")}
              </Button>
            </div>
            <Alert
              variant={isApproveDecision ? "danger" : "secondary"}
              className="mt-3 mb-0"
            >
              {isApproveDecision
                ? t("header.globalBanApproveImpact")
                : t("header.globalBanRejectImpact")}
            </Alert>
          </div>

          <Form.Group>
            <Form.Label className="fw-semibold">
              {t("header.globalBanDecisionNote")}
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={decisionNote}
              disabled={loading}
              onChange={(event) => onDecisionNoteChange(event.target.value)}
              placeholder={
                isApproveDecision
                  ? t("header.globalBanApproveNotePlaceholder")
                  : t("header.globalBanRejectNotePlaceholder")
              }
            />
            <Form.Text muted>
              {isApproveDecision
                ? t("header.globalBanApproveNoteHint")
                : t("header.globalBanRejectNoteHint")}
            </Form.Text>
          </Form.Group>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onHide} disabled={loading}>
          {t("common.cancel")}
        </Button>
        <Button
          variant={isApproveDecision ? "danger" : "secondary"}
          onClick={onSubmit}
          disabled={loading}
        >
          {loading && <Spinner size="sm" className="me-2" />}
          {isApproveDecision
            ? t("header.globalBanApproveConfirm")
            : t("header.globalBanRejectConfirm")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GlobalBanDecisionModal;
