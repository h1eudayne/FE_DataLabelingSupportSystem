import { useTranslation } from "react-i18next";
import { Pagination, PaginationItem, PaginationLink } from "reactstrap";

const UserTable = ({
  users,
  onEdit,
  currentRole,
  onActive,
  onResetPassword,
  pagination,
  totalCount,
}) => {
  const { page, pageSize, onPageChange } = pagination || {
    page: 1,
    pageSize: 10,
  };
  const { t } = useTranslation();

  const getStatusConfig = (user) => {
    if (user.isActive && user.hasPendingGlobalBanRequest) {
      return {
        buttonClass: "admin-row-action-btn--warning",
        icon: "ri-time-line",
        label: t("userTableComp.pendingApproval"),
        title: t("userTableComp.pendingApproval"),
      };
    }

    return user.isActive
      ? {
        buttonClass: "admin-row-action-btn--success",
        icon: "ri-checkbox-circle-fill",
        label: t("userTableComp.active"),
        title: t("userTableComp.deactivate"),
      }
      : {
        buttonClass: "admin-row-action-btn--danger",
        icon: "ri-close-circle-fill",
        label: t("userTableComp.inactive"),
        title: t("userTableComp.activate"),
      };
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const fromEntry = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const toEntry = Math.min(page * pageSize, totalCount);
  const regularUsers = users.filter((user) => user.role !== "Admin");

  const handlePaginationClick = (event, nextPage) => {
    event.preventDefault();
    if (nextPage < 1 || nextPage > totalPages || nextPage === page) return;
    onPageChange(nextPage);
  };

  return (
    <>
      <div className="admin-table-shell d-none d-lg-block">
        <div className="admin-table-scroll admin-table">
          <table className="table align-middle mb-0">
            <thead>
              <tr>
                <th>{t("userTableComp.user")}</th>
                <th>{t("userTableComp.role")}</th>
                <th className="text-center">{t("userTableComp.totalProjects")}</th>
                <th className="text-end">{t("userTableComp.action")}</th>
              </tr>
            </thead>
            <tbody>
              {regularUsers.length > 0 ? (
                regularUsers.map((user) => {
                  const statusConfig = getStatusConfig(user);

                  return (
                  <tr key={user.id}>
                    <td>
                      <div className="admin-table-user">
                        <div className="admin-table-user__avatar">
                          {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="admin-table-user__title text-break">
                            {user.fullName}
                          </div>
                          <div className="admin-table-user__subtitle admin-table-user__subtitle--email">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-badge admin-badge--info">
                        {user.role}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="d-flex flex-column align-items-center gap-1">
                        <span className="admin-badge admin-badge--neutral admin-pill-count">
                          {user.totalProjects || 0}
                        </span>
                        {user.unfinishedProjectCount > 0 && (
                          <small className="text-muted">
                            {t("userTableComp.unfinishedProjects", {
                              count: user.unfinishedProjectCount,
                            })}
                          </small>
                        )}
                      </div>
                    </td>
                    <td className="text-end">
                      <div className="admin-row-actions">
                        <button
                          className={`btn admin-row-action-btn admin-row-action-btn--state ${statusConfig.buttonClass}`}
                          onClick={() => onActive(user, !user.isActive)}
                          title={statusConfig.title}
                        >
                          <i className={statusConfig.icon}></i>
                          <span>
                            {statusConfig.label}
                          </span>
                        </button>

                        {user.role !== currentRole && (
                          <button
                            className="btn admin-row-action-btn admin-row-action-btn--primary"
                            onClick={() => onEdit(user)}
                            title={t("userTableComp.edit")}
                          >
                            <i className="ri-edit-2-line"></i>
                          </button>
                        )}

                        <button
                          className="btn admin-row-action-btn admin-row-action-btn--warning"
                          onClick={() => onResetPassword(user)}
                          title={t("userTableComp.resetPassword")}
                        >
                          <i className="ri-lock-password-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-5 text-muted">
                    {t("common.noData")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-mobile-list d-lg-none">
        {regularUsers.length > 0 ? (
          regularUsers.map((user) => {
            const statusConfig = getStatusConfig(user);

            return (
            <article className="admin-mobile-card" key={user.id}>
              <div className="admin-mobile-card__top">
                <div className="admin-table-user">
                  <div className="admin-table-user__avatar">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="admin-table-user__title text-break">
                      {user.fullName}
                    </div>
                    <div className="admin-table-user__subtitle admin-table-user__subtitle--email">
                      {user.email}
                    </div>
                    <div className="admin-table-user__role">
                      <span className="admin-badge admin-badge--info">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="admin-mobile-card__meta">
                <div>
                  <div className="admin-mobile-card__label">
                    {t("userTableComp.totalProjects")}
                  </div>
                  <div className="admin-mobile-card__value">
                    {user.totalProjects || 0}
                  </div>
                  {user.unfinishedProjectCount > 0 && (
                    <small className="text-muted">
                      {t("userTableComp.unfinishedProjects", {
                        count: user.unfinishedProjectCount,
                      })}
                    </small>
                  )}
                </div>
                <div>
                  <div className="admin-mobile-card__label">
                    {t("userTableComp.action")}
                  </div>
                  <div className="admin-mobile-card__value">
                    {statusConfig.label}
                  </div>
                </div>
              </div>

              <div className="admin-mobile-card__actions">
                <button
                  className={`btn admin-row-action-btn admin-row-action-btn--state ${statusConfig.buttonClass}`}
                  onClick={() => onActive(user, !user.isActive)}
                >
                  <i className={statusConfig.icon}></i>
                  <span>
                    {statusConfig.label}
                  </span>
                </button>

                {user.role !== currentRole && (
                  <button
                    className="btn admin-row-action-btn admin-row-action-btn--primary"
                    onClick={() => onEdit(user)}
                  >
                    <i className="ri-edit-2-line"></i>
                    <span>{t("userTableComp.edit")}</span>
                  </button>
                )}

                <button
                  className="btn admin-row-action-btn admin-row-action-btn--warning"
                  onClick={() => onResetPassword(user)}
                >
                  <i className="ri-lock-password-line"></i>
                  <span>{t("userTableComp.resetPassword")}</span>
                </button>
              </div>
            </article>
            );
          })
        ) : (
          <div className="admin-mobile-card text-center text-muted">
            {t("common.noData")}
          </div>
        )}
      </div>

      {totalCount > 0 && (
        <div className="admin-pagination-wrap">
          <div className="admin-pagination-summary">
            {t("userTableComp.showingRange", {
              from: fromEntry,
              to: toEntry,
              total: totalCount,
            })}
          </div>

          <Pagination className="admin-table-pagination mb-0">
            <PaginationItem disabled={page === 1}>
              <PaginationLink
                previous
                href="#"
                onClick={(event) => handlePaginationClick(event, page - 1)}
              />
            </PaginationItem>

            {[...Array(totalPages)].map((_, idx) => (
              <PaginationItem key={idx + 1} active={idx + 1 === page}>
                <PaginationLink
                  href="#"
                  onClick={(event) => handlePaginationClick(event, idx + 1)}
                >
                  {idx + 1}
                </PaginationLink>
              </PaginationItem>
            ))}

            <PaginationItem disabled={page === totalPages}>
              <PaginationLink
                next
                href="#"
                onClick={(event) => handlePaginationClick(event, page + 1)}
              />
            </PaginationItem>
          </Pagination>
        </div>
      )}
    </>
  );
};

export default UserTable;
