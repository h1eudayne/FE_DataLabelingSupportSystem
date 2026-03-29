import React from "react";
import { useTranslation } from "react-i18next";

export default function ReviewerFeedbackTable({ data = [] }) {
  const { t, i18n } = useTranslation();
  return (
    <table className="table table-hover align-middle mb-0">
      <thead className="table-light">
        <tr>
          <th>{t("annotatorDashboardComp.colTask")}</th>
          <th>{t("annotatorDashboardComp.colErrorType")}</th>
          <th>{t("annotatorDashboardComp.colComment")}</th>
          <th>{t("annotatorDashboardComp.colReturnDate")}</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan="4" className="text-center text-muted py-4">
              <i className="ri-chat-check-line d-block fs-3 mb-2 text-muted opacity-50"></i>
              {t("annotatorDashboardComp.noFeedback")}
            </td>
          </tr>
        ) : (
          data.map((r, idx) => (
            <tr key={idx}>
              <td>{r.taskName || "-"}</td>
              <td>{r.errorType || "-"}</td>
              <td>{r.comment || "-"}</td>
              <td>
                {r.returnedDate
                  ? new Date(r.returnedDate).toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US")
                  : "-"}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
