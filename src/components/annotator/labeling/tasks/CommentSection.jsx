import React from "react";

const CommentSection = ({ rejectionReason, status }) => {
  if (!rejectionReason || !rejectionReason.trim()) {
    return (
      <div className="stitch-ws-card" style={{ marginTop: 16 }}>
        <div className="stitch-ws-card-header">
          <span>
            <i
              className="ri-discuss-line me-2"
              style={{ color: "#22D3EE" }}
            ></i>
            Phản hồi từ Reviewer
          </span>
        </div>
        <div
          className="stitch-ws-card-body text-center"
          style={{ padding: "20px 14px" }}
        >
          <i
            className="ri-chat-history-line d-block"
            style={{ fontSize: 24, opacity: 0.3, marginBottom: 8 }}
          ></i>
          <span className="stitch-ws-text-muted">
            Chưa có phản hồi nào cho ảnh này.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="stitch-ws-card" style={{ marginTop: 16 }}>
      <div className="stitch-ws-card-header">
        <span>
          <i className="ri-discuss-line me-2" style={{ color: "#22D3EE" }}></i>
          Phản hồi từ Reviewer
        </span>
      </div>

      <div className="stitch-ws-card-body">
        <div className="d-flex gap-3">
          <div className="stitch-ws-comment-avatar">R</div>
          <div className="flex-grow-1">
            <div
              style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: 6 }}
            >
              Reviewer
              {status && (
                <span
                  className={`stitch-ws-badge ms-2 ${
                    status === "Approved"
                      ? "stitch-ws-badge-approved"
                      : "stitch-ws-badge-rejected"
                  }`}
                >
                  {status === "Approved" ? "Approved" : "Rejected"}
                </span>
              )}
            </div>
            <div className="stitch-ws-comment-body">{rejectionReason}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
