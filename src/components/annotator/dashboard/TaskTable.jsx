import React from "react";
import { useNavigate } from "react-router-dom";

export default function TaskTable({ data, loading }) {
  const navigate = useNavigate();

  if (loading) return <p>Loading tasks...</p>;
  console.log("TaskTable data", data);

  const handleOpenTask = (assignmentId) => {
    navigate(`/workplace-labeling-task/${assignmentId}`);
  };

  return (
    <table className="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Data</th>
          <th>Status</th>
          <th>Deadline</th>
          <th>Tool</th>
        </tr>
      </thead>
      <tbody>
        {data?.map((task) => (
          <tr key={task.assignmentId}>
            <td>{task.assignmentId}</td>

            <td>
              {task.storageUrl
                ? task.storageUrl.split("/").pop()
                : `Item #${task.dataItemId}`}
            </td>

            <td>
              <span
                className={`badge ${
                  task.status === "Returned"
                    ? "bg-danger"
                    : task.status === "Submitted"
                      ? "bg-success"
                      : "bg-primary"
                }`}
              >
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
                onClick={() => handleOpenTask(task.assignmentId)}
              >
                Open
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
