import React, { useState } from "react";

const CommentSection = () => {
  const [activeTab, setActiveTab] = useState("comments");

  return (
    <div className="card mt-4">
      <div className="card-header align-items-center d-flex">
        <h4 className="card-title mb-0 flex-grow-1">Thảo luận & Phản hồi</h4>
      </div>

      <div className="card-body">
        <ul
          className="nav nav-tabs nav-tabs-custom nav-success mb-3"
          role="tablist"
        >
          <li className="nav-item">
            <a
              className={`nav-link ${activeTab === "comments" ? "active" : ""}`}
              onClick={() => setActiveTab("comments")}
              href="#!"
            >
              Bình luận (02)
            </a>
          </li>
        </ul>

        <div className="tab-content text-muted">
          {activeTab === "comments" && (
            <div className="tab-pane active">
              <div
                data-simplebar
                style={{ height: "300px" }}
                className="px-3 mx-n3 mb-2"
              >
                <div className="d-flex mb-4">
                  <div className="flex-shrink-0">
                    <img
                      src="https://themesbrand.com/velzon/html/master/assets/images/users/avatar-8.jpg"
                      alt=""
                      className="avatar-xs rounded-circle"
                    />
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h5 className="fs-13">
                      Nancy Martino{" "}
                      <small className="text-muted">Hôm qua - 09:15 AM</small>
                    </h5>
                    <p className="text-muted">
                      Vui lòng kiểm tra lại nhãn số #04, khung vẽ đang bị lệch
                      so với đối tượng xe.
                    </p>
                  </div>
                </div>

                <div className="d-flex mb-4">
                  <div className="flex-shrink-0">
                    <img
                      src="https://themesbrand.com/velzon/html/master/assets/images/users/avatar-10.jpg"
                      alt=""
                      className="avatar-xs rounded-circle"
                    />
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h5 className="fs-13">
                      Admin <small className="text-muted">05 phút trước</small>
                    </h5>
                    <p className="text-muted">Đã nhận được yêu cầu sửa đổi.</p>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="row g-3">
                  <div className="col-12">
                    <label
                      htmlFor="exampleFormControlTextarea1"
                      className="form-label text-body"
                    >
                      Gửi phản hồi cho Reviewer
                    </label>
                    <textarea
                      className="form-control bg-light border-light"
                      id="exampleFormControlTextarea1"
                      rows="3"
                      placeholder="Nhập nội dung..."
                    ></textarea>
                  </div>
                  <div className="col-12 text-end">
                    <button type="button" className="btn btn-success">
                      Gửi bình luận
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommentSection;
