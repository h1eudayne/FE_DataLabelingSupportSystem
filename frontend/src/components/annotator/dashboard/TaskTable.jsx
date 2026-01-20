import React from "react";

export default function TaskTable({ data, loading }) {
  if (loading) return <p>Loading tasks...</p>;

  return (
    <table className="table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Data</th>
          <th>Status</th>
          <th>Deadline</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {data?.map((task) => (
          <tr key={task.assignmentId}>
            <td>{task.assignmentId}</td>
            <td>{task.dataName}</td>
            <td>{task.status}</td>
            <td>{task.deadline}</td>
            <td>
              <button className="btn btn-primary btn-sm">Open</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
