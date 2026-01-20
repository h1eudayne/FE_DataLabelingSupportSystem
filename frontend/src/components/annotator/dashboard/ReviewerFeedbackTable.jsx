import React from "react";

const ReviewerFeedbackTable = ({ data = [], loading }) => {
  return (
    <div className="row mt-4">
      <div className="col-12">
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Reviewer Feedback</h5>
          </div>

          <div className="card-body table-responsive">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Task</th>
                  <th>Error Type</th>
                  <th>Comment</th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="3" className="text-center text-muted">
                      Loading reviewer feedback...
                    </td>
                  </tr>
                )}

                {!loading && data.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center text-muted">
                      No reviewer feedback available
                    </td>
                  </tr>
                )}

                {!loading &&
                  data.map((task) => (
                    <tr key={task.assignmentId}>
                      <td>#TASK-{task.assignmentId}</td>
                      <td>{task.errorType || "—"}</td>
                      <td>{task.reviewComment || "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewerFeedbackTable;
