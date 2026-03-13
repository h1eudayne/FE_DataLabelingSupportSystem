import { useTranslation } from "react-i18next";

const UserTable = (props) => {
  const { users, onEdit, currentRole, onActive, pagination, totalCount } =
    props;
  const { page, pageSize, onPageChange } = pagination;

  const totalPages = Math.ceil(totalCount / pageSize);

  const fromEntry = (page - 1) * pageSize + 1;
  const toEntry = Math.min(page * pageSize, totalCount);
  const regularUsers = users.filter((user) => user.role !== "Admin");
  const { t } = useTranslation();

  return (
    <div className="table-responsive">
      <table className="table align-middle table-nowrap">
        <thead className="table-light">
          <tr>
            <th>{t("userTableComp.fullName")}</th>
            <th>{t("userTableComp.email")}</th>
            <th>{t("userTableComp.role")}</th>
            <th className="text-center">{t("userTableComp.activity")}</th>{" "}
            <th className="text-center">{t("userTableComp.action")}</th>{" "}
          </tr>
        </thead>
        <tbody>
          {regularUsers.length > 0 ? (
            regularUsers.map((user) => (
              <tr key={user.id}>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>
                  <span className="badge bg-info-subtle text-info px-2 py-1">
                    {user.role}
                  </span>
                </td>

                <td className="text-center">
                  <button
                    className={`btn btn-sm ${user.isActive ? "btn-soft-success" : "btn-soft-danger"} d-inline-flex align-items-center gap-1`}
                    onClick={() => onActive(user.id, !user.isActive)}
                  >
                    <i
                      className={
                        user.isActive
                          ? "ri-checkbox-circle-line"
                          : "ri-error-warning-line"
                      }
                    ></i>
                    {user.isActive
                      ? t("userTableComp.active")
                      : t("userTableComp.inactive")}
                  </button>
                </td>

                <td className="text-center">
                  {user.role !== currentRole && (
                    <button
                      className="btn btn-sm btn-soft-primary"
                      onClick={() => onEdit(user)}
                    >
                      <i className="ri-edit-line"></i> Chỉnh sửa
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center py-4 text-muted">
                {t("common.noData")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
