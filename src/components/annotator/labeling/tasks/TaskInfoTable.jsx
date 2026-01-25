import React from "react";
import moment from "moment"; // Cài đặt: npm install moment

const TaskInfoTable = ({ taskId, status, priority, dueDate }) => {
  return (
    <div className="card">
      <div className="card-body">
        <div className="table-responsive table-card">
          <table className="table table-borderless align-middle mb-0">
            <tbody>
              <tr>
                <td className="fw-medium">Mã nhiệm vụ</td>
                <td>{taskId ? `#${taskId}` : "---"}</td>
              </tr>
              <tr>
                <td className="fw-medium">Độ ưu tiên</td>
                <td>
                  <span
                    className={`badge ${
                      priority === "High" ? "bg-danger" : "bg-info"
                    } text-uppercase`}
                  >
                    {priority || "Normal"}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="fw-medium">Trạng thái</td>
                <td>
                  <span className="badge bg-secondary-subtle text-secondary text-uppercase">
                    {status || "N/A"}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="fw-medium">Hạn chót</td>
                <td>
                  {dueDate
                    ? moment(dueDate).format("DD MMM, YYYY")
                    : "Không có hạn"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TaskInfoTable;
