import React from "react";

export default function ReviewerFeedbackTable({ data = [] }) {
  return (
    <div className="card mt-4">
      <div className="card-header">
        <h5 className="mb-0">Reviewer Feedback</h5>
      </div>

      <div className="card-body">
        <table className="table">
          <thead>
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
                <td colSpan="4" className="text-center text-muted">
                  No reviewer feedback available
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
      </div>
    </div>
  );
}
