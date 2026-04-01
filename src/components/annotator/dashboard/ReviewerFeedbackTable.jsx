import React from "react";
import { useTranslation } from "react-i18next";

const getRoleBadgeClass = (role) => {
  if (role === "Manager") {
    return "bg-danger-subtle text-danger border border-danger-subtle";
  }

  return "bg-warning-subtle text-warning-emphasis border border-warning-subtle";
};

export default function ReviewerFeedbackTable({
  data = [],
  loading = false,
  onOpenTask,
}) {
  const { t, i18n } = useTranslation();

  const formatFeedbackDate = (value) => {
    if (!value) {
      return "-";
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleString(i18n.language === "vi" ? "vi-VN" : "en-US");
  };

  return (
    <table className="table table-hover align-middle mb-0">
      <thead className="table-light">
        <tr>
          <th>{t("annotatorDashboardComp.colTask")}</th>
          <th>{t("annotatorDashboardComp.colReturnedBy")}</th>
          <th>{t("annotatorDashboardComp.colErrorType")}</th>
          <th>{t("annotatorDashboardComp.colComment")}</th>
          <th>{t("annotatorDashboardComp.colReturnDate")}</th>
          <th className="text-end">{t("annotatorDashboardComp.colAction")}</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan="6" className="text-center text-muted py-4">
              <div
                className="spinner-border spinner-border-sm text-warning me-2"
                role="status"
                aria-hidden="true"
              ></div>
              {t("annotatorDashboardComp.loadingFeedback")}
            </td>
          </tr>
        ) : data.length === 0 ? (
          <tr>
            <td colSpan="6" className="text-center text-muted py-4">
              <i className="ri-chat-check-line d-block fs-3 mb-2 text-muted opacity-50"></i>
              {t("annotatorDashboardComp.noFeedback")}
            </td>
          </tr>
        ) : (
          data.map((r, idx) => {
            const roleLabel =
              r.sourceRole === "Manager"
                ? t("annotatorDashboardComp.roleManager")
                : t("annotatorDashboardComp.roleReviewer");
            const rowKey =
              r.feedbackId ??
              r.reviewLogId ??
              `${r.assignmentId ?? "task"}-${r.sourceRole ?? "role"}-${idx}`;

            return (
              <tr key={rowKey}>
                <td>
                  <div className="fw-semibold">{r.taskName || "-"}</div>
                  <div className="small text-muted">
                    {r.projectName || t("annotatorDashboardComp.unknownProject")}
                    {r.assignmentId ? ` · Task #${r.assignmentId}` : ""}
                  </div>
                </td>
                <td>
                  <div className="d-flex flex-column gap-1">
                    <span className={`badge rounded-pill ${getRoleBadgeClass(r.sourceRole)}`}>
                      {roleLabel}
                    </span>
                    {r.sourceName && (
                      <span className="small text-muted">{r.sourceName}</span>
                    )}
                  </div>
                </td>
                <td>
                  {r.errorType || (
                    r.sourceRole === "Manager"
                      ? t("annotatorDashboardComp.managerDecision")
                      : "-"
                  )}
                </td>
                <td>
                  <div className="text-wrap" style={{ minWidth: "260px" }}>
                    {r.comment || "-"}
                  </div>
                </td>
                <td>{formatFeedbackDate(r.returnedDate)}</td>
                <td className="text-end">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => onOpenTask?.(r)}
                    disabled={!r.projectId || !r.assignmentId}
                  >
                    <i className="ri-external-link-line me-1"></i>
                    {t("annotatorDashboardComp.open")}
                  </button>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}
