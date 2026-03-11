import React, { useEffect, useState, useCallback } from "react";
import commentService from "../../../../services/annotator/labeling/commentService";

const CommentSection = ({ projectId, taskId }) => {
  const [comments, setComments] = useState([]);

  const loadComments = useCallback(async () => {
    if (!projectId) return;
    try {
      const res = await commentService.getCommentsByProject(projectId);
      const allComments = res.data || [];
      const taskComments = allComments.filter(
        (item) => item.assignmentId === taskId,
      );
      setComments(taskComments);
    } catch (error) {
      console.error("Lỗi tải bình luận:", error);
    }
  }, [projectId, taskId]);

  useEffect(() => {
    if (taskId) {
      loadComments();
    }
  }, [taskId, loadComments]);

  return (
    <div className="card mt-4 shadow-sm border-0">
      <div className="card-header align-items-center d-flex bg-white py-3">
        <h4 className="card-title mb-0 flex-grow-1 fw-bold">
          <i className="ri-discuss-line me-2 text-success"></i>
          Phản hồi từ Reviewer
        </h4>
      </div>

      <div className="card-body">
        <div
          className="px-3"
          style={{
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {comments.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="ri-chat-history-line fs-24"></i>
              <p>Chưa có phản hồi nào cho ảnh này.</p>
            </div>
          ) : (
            comments.map((item, index) => (
              <div className="d-flex mb-4" key={item.id || index}>
                <div className="flex-shrink-0">
                  <div className="avatar-xs">
                    <span className="avatar-title rounded-circle bg-soft-primary text-primary">
                      {item.userName?.charAt(0) || "U"}
                    </span>
                  </div>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h5 className="fs-13 mb-1">
                    {item.userName || "Reviewer"}
                    <small className="text-muted ms-2">
                      {new Date(item.createdAt).toLocaleString()}
                    </small>
                    {item.isApproved !== undefined && (
                      <span
                        className={`badge ms-2 ${item.isApproved ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}
                      >
                        {item.isApproved ? "Approved" : "Rejected"}
                      </span>
                    )}
                    {item.errorCategory && item.errorCategory !== "General" && (
                      <span className="badge bg-danger-subtle text-danger ms-2">
                        Lỗi: {item.errorCategory}
                      </span>
                    )}
                  </h5>
                  <p className="text-muted bg-light p-2 rounded mb-0">
                    {item.comment}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
