import React, { useEffect, useState } from "react";
import commentService from "../../../../services/annotator/labeling/commentService";
import { toast } from "react-toastify";

const CommentSection = ({ taskId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (taskId) {
      loadComments();
    }
  }, [taskId]);

  const loadComments = async () => {
    try {
      const res = await commentService.getComments(taskId);
      setComments(res.data?.data || res.data || []);
    } catch {
      console.error("Không thể tải bình luận");
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      await commentService.postComment(taskId, newComment);
      setNewComment("");
      loadComments();
      toast.success("Đã gửi phản hồi");
    } catch {
      toast.error("Gửi phản hồi thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card mt-4 shadow-sm border-0">
      <div className="card-header align-items-center d-flex bg-white py-3">
        <h4 className="card-title mb-0 flex-grow-1 fw-bold">
          <i className="ri-discuss-line me-2 text-success"></i>
          Thảo luận & Phản hồi
        </h4>
      </div>

      <div className="card-body">
        <div
          className="px-3 mb-3"
          style={{
            height: "300px",
            overflowY: "auto",
            borderBottom: "1px solid #eee",
          }}
        >
          {comments.length === 0 ? (
            <div className="text-center mt-5 text-muted">
              <i className="ri-chat-history-line fs-24"></i>
              <p>Chưa có thảo luận nào cho nhiệm vụ này.</p>
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
                    {item.userName || "User"}
                    <small className="text-muted ms-2">
                      {new Date(item.createdAt).toLocaleString()}
                    </small>
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

        <div className="mt-3">
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-medium text-muted">
                Gửi phản hồi cho Reviewer / Manager
              </label>
              <textarea
                className="form-control bg-light border-light"
                rows="3"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Nhập nội dung thắc mắc hoặc giải trình về các nhãn đã sửa..."
              ></textarea>
            </div>
            <div className="col-12 text-end">
              <button
                type="button"
                className="btn btn-success px-4"
                onClick={handlePostComment}
                disabled={loading || !newComment.trim()}
              >
                {loading ? "Đang gửi..." : "Gửi bình luận"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
