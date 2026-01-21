import React from "react";

const TaskInfoTable = ({ taskId, status, priority, dueDate }) => {
  return (
    <div className="card">
      <div className="card-body">
        <div className="table-responsive table-card">
          <table className="table table-borderless align-middle mb-0">
            <tbody>
              <tr>
                <td className="fw-medium">Mã nhiệm vụ</td>
                <td>{taskId || "#VLZ456"}</td>
              </tr>
              <tr>
                <td className="fw-medium">Độ ưu tiên</td>
                <td>
                  <span
                    className={`badge ${priority === "High" ? "bg-danger text-uppercase" : "bg-info text-uppercase"}`}
                  >
                    {priority || "High"}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="fw-medium">Trạng thái</td>
                <td>
                  <span className="badge bg-secondary-subtle text-secondary text-uppercase">
                    {status || "Inprogress"}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="fw-medium">Hạn chót</td>
                <td>{dueDate || "29 Dec, 2024"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskInfoTable;
