const UserTable = (props) => {
  const { users, onEdit, onDelete, currentRole } = props;

  return (
    <>
      <div className="table-responsive">
        <table className="table align-middle table-nowrap">
          <thead className="table-light">
            <tr>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Activity</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>
                  <span
                    className={`badge ${user.role === "Admin" ? "bg-danger" : "bg-info"}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td>
                  {user.role === "Manager"
                    ? `${user.managedProjects?.length || 0} dự án`
                    : `${user.assignments?.length || 0} nhiệm vụ`}
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
                        className="btn btn-sm btn-soft-danger"
                        onClick={() => onDelete(user.id)}
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                      {/* <button
                                                className={`btn btn-sm btn-icon-label ${user.isActive ? 'btn-soft-success' : 'btn-soft-danger'}`}
                                                onClick={() => handleToggleActive(user.id, !user.isActive)}
                                            >
                                                <i className={user.isActive ? 'ri-checkbox-circle-line' : 'ri-error-warning-line'}></i>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </button> */}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UserTable;
