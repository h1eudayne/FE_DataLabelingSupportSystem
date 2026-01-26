import React from "react";
import { useNavigate } from "react-router-dom";

const getStatusBadge = (status) => {
  switch (status) {
    case "Assigned":
      return "bg-secondary";

    case "InProgress":
      return "bg-primary";

    case "Submitted":
      return "bg-info";

    case "Approved":
      return "bg-success";

    case "Rejected":
      return "bg-danger";

    default:
      return "bg-dark";
  }
};

export default function TaskTable({ data, loading }) {
  const navigate = useNavigate();

  if (loading) return <p>Loading tasks...</p>;
  if (!Array.isArray(data) || data.length === 0)
    return <p className="text-muted">No tasks found</p>;

  const handleOpenTask = (assignmentId) => {
    if (!assignmentId) return;
    navigate(`/workplace-labeling-task/${assignmentId}`);
  };

  return (
    <table className="table table-bordered align-middle">
      <thead className="table-light">
        <tr>
          <th style={{ width: 80 }}>ID</th>
          <th>Data</th>
          <th style={{ width: 130 }}>Status</th>
          <th style={{ width: 120 }}>Deadline</th>
          <th style={{ width: 100 }}>Tool</th>
        </tr>
      </thead>

      <tbody>
        {data.map((task) => {
          const rowKey = `${task.id}-${task.dataItemId ?? "img"}`;

          return (
            <tr key={rowKey}>
              <td>{task.id}</td>

              <td>
                {task.dataItemUrl
                  ? task.dataItemUrl.split("/").pop()
                  : `Item #${task.dataItemId}`}
              </td>

              <td>
                <span className={`badge ${getStatusBadge(task.status)}`}>
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
                  className="btn btn-primary btn-sm"
                  onClick={() => handleOpenTask(task.id)}
                >
                  Open
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
