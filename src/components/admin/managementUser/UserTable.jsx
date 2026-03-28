import { useTranslation } from "react-i18next";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";

const UserTable = (props) => {
  const { users, onEdit, currentRole, onActive, onResetPassword, pagination, totalCount } =
    props;
  const { page, pageSize, onPageChange } = pagination || {
    page: 1,
    pageSize: 10,
  };
  const { t } = useTranslation();

  const totalPages = Math.ceil(totalCount / pageSize);
  const fromEntry = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const toEntry = Math.min(page * pageSize, totalCount);

  const regularUsers = users.filter((user) => user.role !== "Admin");

  return (
    <div className="table-responsive">
      <table className="table align-middle table-nowrap mb-0">
        <thead className="table-light text-muted small text-uppercase fw-bold">
          <tr>
            <th style={{ width: "45%" }}>{t("userTableComp.user")}</th>
            <th style={{ width: "25%" }}>{t("userTableComp.role")}</th>
            <th className="text-center" style={{ width: "20%" }}>
              {t("userTableComp.totalProjects")}
            </th>
            <th className="text-end" style={{ width: "30%" }}>
              {t("userTableComp.action")}
            </th>
          </tr>
        </thead>
        <tbody>
          {regularUsers.length > 0 ? (
            regularUsers.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="bg-soft-primary text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "38px",
                        height: "38px",
                        fontSize: "14px",
                        flexShrink: 0,
                      }}
                    >
                      {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-truncate">
                      <h6 className="mb-0 fw-bold text-truncate">
                        {user.fullName}
                      </h6>
                      <p className="text-muted mb-0 small text-truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <span
                    className="badge bg-info-subtle text-info px-2 py-1 text-uppercase"
                    style={{ fontSize: "11px" }}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="text-center">
                  <div
                    className="fw-bold text-primary bg-light rounded-pill d-inline-block px-3 py-1"
                    style={{ fontSize: "13px", minWidth: "40px" }}
                  >
                    {user.totalProjects || 0}
                  </div>
                </td>
                <td className="text-end">
                  <div className="d-flex justify-content-end align-items-center gap-2">
                    <button
                      className={`btn btn-sm ${
                        user.isActive ? "btn-soft-success" : "btn-soft-danger"
                      } d-inline-flex align-items-center gap-1 border-0`}
                      style={{
                        minWidth: "85px",
                        justifyContent: "center",
                        padding: "0.4rem 0.6rem",
                      }}
                      onClick={() => onActive(user.id, !user.isActive)}
                      title={
                        user.isActive
                          ? t("userTableComp.deactivate")
                          : t("userTableComp.activate")
                      }
                    >
                      <i
                        className={
                          user.isActive
                            ? "ri-checkbox-circle-fill"
                            : "ri-close-circle-fill"
                        }
                      ></i>
                      <span className="fw-medium">
                        {user.isActive
                          ? t("userTableComp.active")
                          : t("userTableComp.inactive")}
                      </span>
                    </button>

                    {user.role !== currentRole && (
                      <button
                        className="btn btn-sm btn-soft-primary border-0 shadow-none"
                        style={{ padding: "0.4rem 0.6rem" }}
                        onClick={() => onEdit(user)}
                        title={t("userTableComp.edit")}
                      >
                        <i className="ri-edit-2-line"></i>
                      </button>
                    )}

                    <button
                      className="btn btn-sm btn-soft-warning border-0 shadow-none"
                      style={{ padding: "0.4rem 0.6rem" }}
                      onClick={() => onResetPassword(user)}
                      title={t("userTableComp.resetPassword")}
                    >
                      <i className="ri-lock-password-line"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center py-5">
                <div className="text-muted opacity-50">
                  <i className="ri-user-search-line display-4"></i>
                  <p className="mt-2">{t("common.noData")}</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {totalCount > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-3 px-3">
          <div className="text-muted small">
            {t("userTableComp.showingRange", {
              from: fromEntry,
              to: toEntry,
              total: totalCount,
            })}
          </div>

          <Pagination className="pagination-rounded mb-0">
            <PaginationItem disabled={page === 1}>
              <PaginationLink
                previous
                onClick={() => onPageChange(page - 1)}
                href="#"
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, idx) => (
              <PaginationItem key={idx + 1} active={idx + 1 === page}>
                <PaginationLink onClick={() => onPageChange(idx + 1)} href="#">
                  {idx + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem disabled={page === totalPages}>
              <PaginationLink
                next
                onClick={() => onPageChange(page + 1)}
                href="#"
              />
            </PaginationItem>
          </Pagination>
        </div>
      )}
    </div>
  );
};

export default UserTable;
