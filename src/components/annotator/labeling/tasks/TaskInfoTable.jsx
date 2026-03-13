import React from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";

const TaskInfoTable = ({ taskId, status, priority, dueDate }) => {
  const { t } = useTranslation();
  return (
    <div className="card">
      <div className="card-body">
        <div className="table-responsive table-card">
          <table className="table table-borderless align-middle mb-0">
            <tbody>
              <tr>
                <td className="fw-medium">{t('labeling.taskCode')}</td>
                <td>{taskId ? `#${taskId}` : "---"}</td>
              </tr>
              <tr>
                <td className="fw-medium">{t('labeling.priority')}</td>
                <td>
                  <span
                    className={`badge ${
                      priority === "High" ? "bg-danger" : "bg-info"
                    } text-uppercase`}
                  >
                    {priority || "Normal"}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="fw-medium">{t('labeling.statusLabel')}</td>
                <td>
                  <span className="badge bg-secondary-subtle text-secondary text-uppercase">
                    {status || "N/A"}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="fw-medium">{t('labeling.deadline')}</td>
                <td>
                  {dueDate
                    ? moment(dueDate).format("DD MMM, YYYY")
                    : t('labeling.noDeadline')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskInfoTable;
