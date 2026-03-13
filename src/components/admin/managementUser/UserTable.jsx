import { useTranslation } from "react-i18next";

const UserTable = (props) => {
  const { t } = useTranslation();
  const { users, onEdit, currentRole, onActive } = props;

  return (
    <>
      <div className="table-responsive">
        <table className="table align-middle table-nowrap">
          <thead className="table-light">
            <tr>
              <th>{t('userTableComp.fullName')}</th>
              <th>{t('userTableComp.email')}</th>
              <th>{t('userTableComp.role')}</th>
              <th>{t('userTableComp.activity')}</th>
              <th>{t('userTableComp.action')}</th>
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
                  {user.role !== "Admin" &&
                    (user.role === "Manager"
                      ? t('adminUserTable.projects', { count: user.managedProjects?.length || 0 })
                      : t('adminUserTable.tasks', { count: user.assignments?.length || 0 }))}
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
                        className={`btn btn-sm btn-icon-label ${user.isActive ? "btn-soft-success" : "btn-soft-danger"}`}
                        onClick={() => onActive(user.id, !user.isActive)}
                      >
                        <i
                          className={
                            user.isActive
                              ? "ri-checkbox-circle-line"
                              : "ri-error-warning-line"
                          }
                        ></i>
                        {user.isActive ? t('userTableComp.active') : t('userTableComp.inactive')}
                      </button>
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
