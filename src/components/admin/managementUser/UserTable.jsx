import { Pagination } from "react-bootstrap";

const UserTable = (props) => {
  const { users, onEdit, currentRole, onActive, pagination, totalCount } =
    props;
  const { page, pageSize, onPageChange } = pagination;

  const totalPages = Math.ceil(totalCount / pageSize);

  const fromEntry = (page - 1) * pageSize + 1;
  const toEntry = Math.min(page * pageSize, totalCount);
  const regularUsers = users.filter((user) => user.role !== "Admin");

  return (
    <>
      <div className="table-responsive">
        <table className="table align-middle table-nowrap mb-0">
          <thead className="table-light">
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {regularUsers.length > 0 ? (
              regularUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge bg-info`}>{user.role}</span>
                  </td>

                  <td>
                    {user.role !== currentRole && (
                      <>
                        <button
                          className="btn btn-sm btn-soft-primary me-2"
                          onClick={() => onEdit(user)}
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          className={`btn btn-sm btn-icon-label ${
                            user.isActive
                              ? "btn-soft-success"
                              : "btn-soft-danger"
                          }`}
                          onClick={() => onActive(user.id, !user.isActive)}
                        >
                          <i
                            className={
                              user.isActive
                                ? "ri-checkbox-circle-line"
                                : "ri-error-warning-line"
                            }
                          ></i>{" "}
                          {user.isActive ? "Active" : "Inactive"}
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-4">
                  Không có dữ liệu hiển thị
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3 px-3">
          <div className="text-muted small">
            Hiển thị <b>{fromEntry}</b> đến <b>{toEntry}</b> trên{" "}
            <b>{totalCount}</b> người dùng
          </div>

          <Pagination className="mb-0">
            <Pagination.Prev
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
            />

            {[...Array(totalPages)].map((_, idx) => {
              const pageNum = idx + 1;
              return (
                <Pagination.Item
                  key={pageNum}
                  active={pageNum === page}
                  onClick={() => onPageChange(pageNum)}
                >
                  {pageNum}
                </Pagination.Item>
              );
            })}

            <Pagination.Next
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
            />
          </Pagination>
        </div>
      )}
    </>
  );
};

export default UserTable;
