import React from "react";

const AttachmentList = ({ attachments }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h6 className="card-title mb-0">Tài liệu đính kèm</h6>
      </div>
      <div className="card-body">
        <div className="vstack gap-3">
          {attachments?.map((file, idx) => (
            <div
              key={idx}
              className="d-flex align-items-center border border-dashed p-2 rounded"
            >
              <div className="flex-shrink-0 avatar-xs">
                <div className="avatar-title bg-light text-secondary rounded fs-16">
                  <i className="ri-file-zip-line"></i>
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <h6 className="mb-1 fs-13">
                  <a href={file.url}>{file.fileName}</a>
                </h6>
                <small className="text-muted">{file.size}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttachmentList;
