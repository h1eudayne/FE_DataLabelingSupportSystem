import {
  Alert,
  Row,
  Card,
  Button,
  InputGroup,
  Form,
  Table,
  Pagination,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  Users,
  ShieldAlert,
  Award,
  Search,
  Edit2,
  CheckCircle,
  Power,
  Clock3,
  UserPlus,
} from "lucide-react";
import StatCard from "./StatCard";

const UserManagementView = ({
  stats,
  users,
  onSearch,
  onActive,
  onEdit,
  admins,
  openCreateModal,
  notice,
  onDismissNotice,
  pagination = { page: 1, pageSize: 10, onPageChange: () => {} },
  totalCount = 0,
}) => {
  const { t } = useTranslation();
  const { page, pageSize, onPageChange } = pagination;

  const getStatusConfig = (user) => {
    if (user.isActive && user.hasPendingGlobalBanRequest) {
      return {
        buttonClass: "admin-row-action-btn--warning",
        icon: <Clock3 size={14} />,
        label: t("userTableComp.pendingApproval"),
        title: t("userTableComp.pendingApproval"),
      };
    }

    return user.isActive
      ? {
        buttonClass: "admin-row-action-btn--success",
        icon: <CheckCircle size={14} />,
        label: t("userMgmt.active"),
        title: t("userTableComp.deactivate"),
      }
      : {
        buttonClass: "admin-row-action-btn--danger",
        icon: <Power size={14} />,
        label: t("userMgmt.inactive"),
        title: t("userTableComp.activate"),
      };
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const fromEntry = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const toEntry = Math.min(page * pageSize, totalCount);

  const regularUsers = users.filter((user) => user.role !== "Admin");

  return (
    <>
      <Row className="mb-4 g-3">
        <StatCard
          icon={<Users size={28} />}
          title={t("userMgmt.totalStaff")}
          value={(stats?.admins || 0) + (stats?.workers || 0)}
          colorClass="text-primary"
        />
        <StatCard
          icon={<ShieldAlert size={28} />}
          title={t("userMgmt.admins")}
          value={stats?.admins || 0}
          colorClass="text-warning"
        />
        <StatCard
          icon={<Award size={28} />}
          title={t("userMgmt.workers")}
          value={stats?.workers || 0}
          colorClass="text-success"
        />
      </Row>

      <section className="admin-section-card">
        <div className="admin-section-card__header">
          <div className="d-flex align-items-center gap-2">
            <ShieldAlert className="text-warning" size={22} />
            <h2 className="admin-section-card__title">
              {t("userMgmt.adminBoard")}
            </h2>
          </div>
          <p className="admin-section-card__description">
            {t("userMgmt.systemAdmin")}
          </p>
        </div>

        <div className="admin-section-card__body">
          <div className="admin-admins-grid">
            {admins.map((admin) => (
              <article className="admin-admin-card" key={admin.id}>
                <div className="admin-admin-card__content">
                  <div className="admin-admin-card__avatar">
                    {admin.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="admin-admin-card__name admin-table-user__subtitle--email">
                      {admin.email}
                    </div>
                    <div className="admin-admin-card__role">
                      {t("userMgmt.systemAdmin")}
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {admins.length === 0 && (
              <div className="admin-mobile-card">
                <div className="admin-mobile-card__value text-center">
                  {t("common.noData")}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="admin-section-card">
        <div className="admin-section-card__header">
          <div className="admin-toolbar">
            <div className="admin-toolbar__group">
              <h2 className="admin-section-card__title">
                {t("userMgmt.staffList")}
              </h2>
              <p className="admin-section-card__description">
                {t("userMgmt.staffListDesc")}
              </p>
            </div>

            <div className="admin-toolbar__actions">
              <Button
                variant="primary"
                className="admin-primary-btn"
                onClick={() => openCreateModal(true)}
              >
                <UserPlus size={18} />
                <span>{t("userMgmt.addStaff")}</span>
              </Button>
            </div>
          </div>
        </div>

        <div className="admin-section-card__body">
          {notice && (
            <Alert
              variant={notice.variant || "info"}
              dismissible={Boolean(onDismissNotice)}
              onClose={onDismissNotice}
              className="mb-4"
            >
              {notice.title && <div className="fw-semibold mb-1">{notice.title}</div>}
              <div>{notice.message}</div>
              {notice.detail && <div className="small mt-2">{notice.detail}</div>}
            </Alert>
          )}

          <InputGroup className="admin-search-group admin-search-group--full mb-4">
            <InputGroup.Text>
              <Search size={18} />
            </InputGroup.Text>
            <Form.Control
              placeholder={t("userMgmt.searchPlaceholder")}
              onChange={(e) => onSearch(e.target.value)}
            />
          </InputGroup>

          <div className="admin-table-shell d-none d-lg-block">
            <div className="admin-table-scroll admin-table">
              <Table responsive hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>{t("userMgmt.user")}</th>
                    <th>{t("userMgmt.role")}</th>
                    <th className="text-center">
                      {t("userMgmt.totalProjects")}
                    </th>
                    <th className="text-end">{t("userMgmt.actions")}</th>
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
                              <>
                                <small className="text-muted">
                                  {t("userTableComp.unfinishedProjects", {
                                    count: user.unfinishedProjectCount,
                                  })}
                                </small>
                                {user.managerName && (
                                  <small className="text-muted">
                                    {t("userTableComp.managedBy", {
                                      managerName: user.managerName,
                                    })}
                                  </small>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                        <td className="text-end">
                          <div className="admin-row-actions">
                            <Button
                              variant="light"
                              className={`admin-row-action-btn admin-row-action-btn--state ${statusConfig.buttonClass}`}
                              onClick={() => onActive(user, !user.isActive)}
                              title={statusConfig.title}
                            >
                              <>
                                {statusConfig.icon}
                                <span>{statusConfig.label}</span>
                              </>
                            </Button>

                            <Button
                              variant="light"
                              className="admin-row-action-btn admin-row-action-btn--neutral"
                              onClick={() => onEdit(user)}
                              title={t("common.edit")}
                            >
                              <Edit2 size={16} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-5 text-muted">
                        {t("userMgmt.noStaffFound")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
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
                        {t("userMgmt.totalProjects")}
                      </div>
                      <div className="admin-mobile-card__value">
                        {user.totalProjects || 0}
                      </div>
                      {user.unfinishedProjectCount > 0 && (
                        <>
                          <small className="text-muted d-block">
                            {t("userTableComp.unfinishedProjects", {
                              count: user.unfinishedProjectCount,
                            })}
                          </small>
                          {user.managerName && (
                            <small className="text-muted d-block">
                              {t("userTableComp.managedBy", {
                                managerName: user.managerName,
                              })}
                            </small>
                          )}
                        </>
                      )}
                    </div>
                    <div>
                      <div className="admin-mobile-card__label">
                        {t("userMgmt.actions")}
                      </div>
                      <div className="admin-mobile-card__value">
                        {statusConfig.label}
                      </div>
                    </div>
                  </div>

                  <div className="admin-mobile-card__actions">
                    <Button
                      variant="light"
                      className={`admin-row-action-btn admin-row-action-btn--state ${statusConfig.buttonClass}`}
                      onClick={() => onActive(user, !user.isActive)}
                    >
                      <>
                        {statusConfig.icon}
                        <span>{statusConfig.label}</span>
                      </>
                    </Button>

                    <Button
                      variant="light"
                      className="admin-row-action-btn admin-row-action-btn--neutral"
                      onClick={() => onEdit(user)}
                    >
                      <Edit2 size={16} />
                      <span>{t("common.edit")}</span>
                    </Button>
                  </div>
                </article>
                );
              })
            ) : (
              <div className="admin-mobile-card text-center text-muted">
                {t("userMgmt.noStaffFound")}
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination-wrap">
              <div className="admin-pagination-summary">
                {t("userMgmt.showingRange", {
                  from: fromEntry,
                  to: toEntry,
                  total: stats.workers,
                })}
              </div>
              <Pagination className="admin-pagination mb-0">
                <Pagination.Prev
                  disabled={page === 1}
                  onClick={() => onPageChange(page - 1)}
                />
                {[...Array(totalPages)].map((_, idx) => (
                  <Pagination.Item
                    key={idx + 1}
                    active={idx + 1 === page}
                    onClick={() => onPageChange(idx + 1)}
                  >
                    {idx + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={page === totalPages}
                  onClick={() => onPageChange(page + 1)}
                />
              </Pagination>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default UserManagementView;
