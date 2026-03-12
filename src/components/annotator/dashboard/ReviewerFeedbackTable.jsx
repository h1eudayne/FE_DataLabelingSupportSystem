import React from "react";

export default function ReviewerFeedbackTable({ data = [], loading = false }) {
  return (
    <div className="row mt-4">
      <div className="col-12">
        <div className="card stitch-card">
          <div className="stitch-card-header">
            <h5>
              <i className="ri-feedback-line me-2 text-warning"></i>
              Phản hồi từ Reviewer
            </h5>
            {data.length > 0 && (
              <span className="badge bg-warning bg-opacity-10 text-warning stitch-badge">
                {data.length} phản hồi
              </span>
            )}
          </div>

          <div className="card-body p-0">
            {loading ? (
              <div className="text-center py-4">
                <div
                  className="spinner-border spinner-border-sm text-primary me-2"
                  role="status"
                ></div>
                <span>Đang tải phản hồi...</span>
              </div>
            ) : data.length === 0 ? (
              <div className="stitch-empty-state">
                <i className="ri-chat-check-line"></i>
                <p>Chưa có phản hồi từ Reviewer</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover stitch-table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Loại lỗi</th>
                      <th>Nhận xét</th>
                      <th style={{ width: 130 }}>Ngày trả về</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((r, idx) => (
                      <tr key={idx}>
                        <td className="fw-semibold">
                          <i className="ri-file-list-line me-1 text-primary"></i>
                          {r.taskName || "—"}
                        </td>
                        <td>
                          {r.errorType ? (
                            <span className="badge bg-danger bg-opacity-10 text-danger stitch-badge">
                              {r.errorType}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>{r.comment || "—"}</td>
                        <td>
                          {r.returnedDate
                            ? new Date(r.returnedDate).toLocaleDateString(
                                "vi-VN",
                              )
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
