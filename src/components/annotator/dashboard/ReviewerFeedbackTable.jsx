import React from "react";

export default function ReviewerFeedbackTable({ data = [] }) {
  return (
    <table className="table table-hover align-middle mb-0">
      <thead className="table-light">
        <tr>
          <th>Task</th>
          <th>Error Type</th>
          <th>Comment</th>
          <th>Returned Date</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan="4" className="text-center text-muted py-4">
              <i className="ri-chat-check-line d-block fs-3 mb-2 text-muted opacity-50"></i>
              Chưa có phản hồi từ Reviewer
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
                  ? new Date(r.returnedDate).toLocaleDateString("vi-VN")
                  : "-"}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
