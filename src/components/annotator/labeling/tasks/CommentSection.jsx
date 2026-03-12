import React from "react";

const CommentSection = ({ rejectionReason, status }) => {
  if (!rejectionReason || !rejectionReason.trim()) {
    return (
      <div className="card mt-4 shadow-sm border-0">
        <div className="card-header align-items-center d-flex bg-white py-3">
          <h4 className="card-title mb-0 flex-grow-1 fw-bold">
            <i className="ri-discuss-line me-2 text-success"></i>
            Phản hồi từ Reviewer
          </h4>
        </div>
        <div className="card-body">
          <div className="text-center py-4 text-muted">
            <i className="ri-chat-history-line fs-24"></i>
            <p>Chưa có phản hồi nào cho ảnh này.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card mt-4 shadow-sm border-0">
      <div className="card-header align-items-center d-flex bg-white py-3">
        <h4 className="card-title mb-0 flex-grow-1 fw-bold">
          <i className="ri-discuss-line me-2 text-success"></i>
          Phản hồi từ Reviewer
        </h4>
      </div>

      <div className="card-body">
        <div className="px-3">
          <div className="d-flex mb-4">
            <div className="flex-shrink-0">
              <div className="avatar-xs">
                <span className="avatar-title rounded-circle bg-soft-primary text-primary">
                  R
                </span>
              </div>
            </div>
            <div className="flex-grow-1 ms-3">
              <h5 className="fs-13 mb-1">
                Reviewer
                {status && (
                  <span
                    className={`badge ms-2 ${
                      status === "Approved"
                        ? "bg-success-subtle text-success"
                        : "bg-danger-subtle text-danger"
                    }`}
                  >
                    {status === "Approved" ? "Approved" : "Rejected"}
                  </span>
                )}
              </h5>
              <p className="text-muted bg-light p-2 rounded mb-0">
                {rejectionReason}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
