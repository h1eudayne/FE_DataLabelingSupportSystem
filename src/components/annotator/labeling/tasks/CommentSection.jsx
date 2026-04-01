import React from "react";
import { useTranslation } from "react-i18next";

const STATUS_LABEL_KEYS = {
  Approved: "workspace.statusApproved",
  Rejected: "workspace.statusRejected",
};

const getStatusBadgeClass = (status) => {
  if (status === "Approved") {
    return "stitch-ws-badge-approved";
  }

  if (status === "Rejected") {
    return "stitch-ws-badge-rejected";
  }

  return "";
};

const getStatusLabel = (status, t) => {
  const key = STATUS_LABEL_KEYS[status];
  return key ? t(key) : status;
};

const formatFeedbackDate = (value, language) => {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return null;
  }

  return parsedDate.toLocaleString(language === "vi" ? "vi-VN" : "en-US");
};

const FeedbackBlock = ({
  avatar,
  author,
  comment,
  status,
  sourceName,
  errorType,
  returnedDate,
  t,
  language,
}) => {
  if (!comment) {
    return null;
  }

  const formattedDate = formatFeedbackDate(returnedDate, language);

  return (
    <div className="d-flex gap-3">
      <div className="stitch-ws-comment-avatar">{avatar}</div>
      <div className="flex-grow-1">
        <div
          style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}
        >
          {author}
          {status && (
            <span
              className={`stitch-ws-badge ms-2 ${getStatusBadgeClass(status)}`}
            >
              {getStatusLabel(status, t)}
            </span>
          )}
        </div>
        {(sourceName || errorType || formattedDate) && (
          <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
            {sourceName && (
              <span className="small text-muted fw-semibold">{sourceName}</span>
            )}
            {errorType && (
              <span className="stitch-ws-badge stitch-ws-badge-new">
                {errorType}
              </span>
            )}
            {formattedDate && (
              <span className="small text-muted">
                <i className="ri-time-line me-1"></i>
                {formattedDate}
              </span>
            )}
          </div>
        )}
        <div className="stitch-ws-comment-body">{comment}</div>
      </div>
    </div>
  );
};

const CommentSection = ({
  rejectionReason,
  status,
  reviewerFeedbacks = [],
  managerComment,
  managerStatus,
}) => {
  const { t, i18n } = useTranslation();
  const reviewerComment =
    typeof rejectionReason === "string" ? rejectionReason.trim() : "";
  const finalManagerComment =
    typeof managerComment === "string" ? managerComment.trim() : "";
  const normalizedReviewerFeedbacks = Array.isArray(reviewerFeedbacks)
    ? reviewerFeedbacks
        .map((feedback, index) => ({
          id:
            feedback?.reviewLogId ??
            feedback?.feedbackId ??
            `reviewer-feedback-${index}`,
          sourceName:
            typeof feedback?.sourceName === "string" && feedback.sourceName.trim()
              ? feedback.sourceName.trim()
              : null,
          errorType:
            typeof feedback?.errorType === "string" && feedback.errorType.trim()
              ? feedback.errorType.trim()
              : null,
          comment:
            typeof feedback?.comment === "string" && feedback.comment.trim()
              ? feedback.comment.trim()
              : "",
          status:
            typeof feedback?.status === "string" && feedback.status.trim()
              ? feedback.status.trim()
              : status,
          returnedDate: feedback?.returnedDate ?? null,
        }))
        .filter((feedback) => feedback.comment)
    : [];
  const fallbackReviewerFeedbacks =
    normalizedReviewerFeedbacks.length > 0
      ? normalizedReviewerFeedbacks
      : reviewerComment
        ? [
            {
              id: "reviewer-feedback-legacy",
              sourceName: null,
              errorType: null,
              comment: reviewerComment,
              status,
              returnedDate: null,
            },
          ]
        : [];

  if (fallbackReviewerFeedbacks.length === 0 && !finalManagerComment) {
    return (
      <div className="stitch-ws-card" style={{ marginTop: 0 }}>
        <div className="stitch-ws-card-header">
          <span>
            <i
              className="ri-discuss-line me-2"
              style={{ color: "#22D3EE" }}
            ></i>
            {t("commentSection.feedbackTitle")}
          </span>
        </div>
        <div
          className="stitch-ws-card-body text-center"
          style={{ padding: "20px 14px" }}
        >
          <i
            className="ri-chat-history-line d-block"
            style={{ fontSize: 24, opacity: 0.3, marginBottom: 8 }}
          ></i>
          <span className="stitch-ws-text-muted">
            {t("commentSection.noComment")}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="stitch-ws-card" style={{ marginTop: 0 }}>
      <div className="stitch-ws-card-header">
        <span>
          <i className="ri-discuss-line me-2" style={{ color: "#22D3EE" }}></i>
          {t("commentSection.feedbackTitle")}
        </span>
      </div>

      <div className="stitch-ws-card-body d-flex flex-column gap-3">
        {fallbackReviewerFeedbacks.map((feedback) => (
          <FeedbackBlock
            key={feedback.id}
            avatar="R"
            author={t("commentSection.reviewerFeedback")}
            comment={feedback.comment}
            status={feedback.status}
            sourceName={feedback.sourceName}
            errorType={feedback.errorType}
            returnedDate={feedback.returnedDate}
            t={t}
            language={i18n.language}
          />
        ))}
        <FeedbackBlock
          avatar="M"
          author={t("commentSection.managerFeedback")}
          comment={finalManagerComment}
          status={managerStatus}
          t={t}
          language={i18n.language}
        />
      </div>
    </div>
  );
};

export default CommentSection;
