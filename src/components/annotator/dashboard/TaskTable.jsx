import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const getStatusBadge = (status) => {
  switch (status) {
    case "Assigned":
      return { bg: "bg-secondary", icon: "ri-time-line" };
    case "InProgress":
      return { bg: "bg-primary", icon: "ri-loader-4-line" };
    case "Submitted":
      return { bg: "bg-info", icon: "ri-send-plane-line" };
    case "Approved":
      return { bg: "bg-success", icon: "ri-checkbox-circle-line" };
    case "Rejected":
      return { bg: "bg-danger", icon: "ri-close-circle-line" };
    default:
      return { bg: "bg-dark", icon: "ri-question-line" };
  }
};

export default function TaskTable({ data, loading }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="text-center py-4">
        <div
          className="spinner-border spinner-border-sm text-primary me-2"
          role="status"
        ></div>
        <span>{t('annotatorDashboardComp.loadingImages')}</span>
      </div>
    );
  }

  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="stitch-empty-state">
        <i className="ri-image-line"></i>
        <p>{t('annotatorDashboardComp.noImages')}</p>
      </div>
    );
  }

  const handleOpenTask = (assignmentId) => {
    if (!assignmentId) return;
    navigate(`/workplace-labeling-task/${assignmentId}`);
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover stitch-table align-middle">
        <thead>
          <tr>
            <th style={{ width: 70 }}>{t('annotatorDashboardComp.colId')}</th>
            <th>{t('annotatorDashboardComp.colData')}</th>
            <th style={{ width: 130 }}>{t('annotatorDashboardComp.colStatus')}</th>
            <th style={{ width: 120 }}>{t('annotatorDashboardComp.colDeadline')}</th>
            <th style={{ width: 90 }}>{t('annotatorDashboardComp.colAction')}</th>
          </tr>
        </thead>

        <tbody>
          {data.map((task) => {
            const rowKey = `${task.id}-${task.dataItemId ?? "img"}`;
            const badge = getStatusBadge(task.status);

            return (
              <tr key={rowKey}>
                <td className="fw-semibold">{task.id}</td>

                <td>
                  <span className="d-flex align-items-center gap-2">
                    <i className="ri-file-image-line text-info"></i>
                    {task.dataItemUrl
                      ? task.dataItemUrl.split("/").pop()
                      : `Item #${task.dataItemId}`}
                  </span>
                </td>

                <td>
                  <span className={`badge stitch-badge ${badge.bg}`}>
                    <i className={`${badge.icon} me-1`}></i>
                    {task.status}
                  </span>
                </td>

                <td>
                  {task.deadline
                    ? new Date(task.deadline).toLocaleDateString("vi-VN")
                    : "N/A"}
                </td>

                <td>
                  <button
                    className="btn stitch-btn-open"
                    onClick={() => handleOpenTask(task.id)}
                  >
                    <i className="ri-external-link-line me-1"></i>
                    {t('annotatorDashboardComp.open')}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
