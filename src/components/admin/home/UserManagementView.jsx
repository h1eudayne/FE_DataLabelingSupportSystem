import {
  Row,
  Col,
  Card,
  Button,
  InputGroup,
  Form,
  Table,
  Badge,
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
  UserPlus,
} from "lucide-react";

const UserManagementView = ({
  stats,
  users,
  onSearch,
  onActive,
  onEdit,
  currentRole,
  openCreateModal,
  pagination = { page: 1, pageSize: 10, onPageChange: () => {} },
  totalCount = 0,
}) => {
  const { t } = useTranslation();
  const { page, pageSize, onPageChange } = pagination;

  const totalPages = Math.ceil(totalCount / pageSize);
  const fromEntry = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const toEntry = Math.min(page * pageSize, totalCount);

  const adminUsers = users.filter((user) => user.role === "Admin");
  const regularUsers = users.filter((user) => user.role !== "Admin");

  return (
    <>
      <Row className="mb-4 g-3">
        <StatCard
          icon={<Users size={28} />}
          title={t("userMgmt.totalStaff")}
          value={totalCount}
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

      <div className="mb-5">
        <div className="d-flex align-items-center gap-2 mb-3">
          <ShieldAlert className="text-warning" size={24} />
          <h5 className="fw-bold mb-0">{t("userMgmt.adminBoard")}</h5>
        </div>
        <Row className="g-3">
          {adminUsers.map((admin) => (
            <Col md={4} key={admin.id}>
              <Card
                className="border-0 shadow-sm position-relative overflow-hidden"
                style={{ borderRadius: "12px" }}
              >
                <div
                  className="position-absolute top-0 start-0 h-100 bg-warning"
                  style={{ width: "4px" }}
                ></div>
                <Card.Body className="d-flex align-items-center p-3">
                  <div
                    className="bg-warning bg-opacity-10 text-warning rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{
                      width: "45px",
                      height: "45px",
                      fontWeight: "bold",
                    }}
                  >
                    {admin.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-grow-1">
                    <div className="fw-bold small text-truncate">
                      {admin.email}
                    </div>
                    <div
                      className="text-muted fst-italic"
                      style={{ fontSize: "10px" }}
                    >
                      {t("userMgmt.systemAdmin")}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <Card className="border-0 shadow-sm" style={{ borderRadius: "15px" }}>
        <Card.Header className="bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold mb-0 text-primary">
              {t("userMgmt.staffList")}
            </h5>
            <small className="text-muted">{t("userMgmt.staffListDesc")}</small>
          </div>
          <Button
            variant="primary"
            className="d-flex align-items-center gap-2 shadow-sm px-3 py-2"
            style={{ borderRadius: "10px" }}
            onClick={() => openCreateModal(true)}
          >
            <UserPlus size={18} />
            <span className="fw-semibold">{t("userMgmt.addStaff")}</span>
          </Button>
        </Card.Header>

        <Card.Body className="px-4 pb-4">
          <InputGroup className="mb-3 border rounded-3 overflow-hidden">
            <InputGroup.Text className="bg-white border-0">
              <Search size={18} className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              placeholder={t("userMgmt.searchPlaceholder")}
              className="border-0 shadow-none"
              onChange={(e) => onSearch(e.target.value)}
            />
          </InputGroup>

          <Table responsive hover className="align-middle mb-0">
            <thead className="table-light">
              <tr className="text-muted small text-uppercase fw-bold">
                <th>{t("userMgmt.user")}</th>
                <th>{t("userMgmt.role")}</th>
                <th className="text-center">{t("userMgmt.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {regularUsers.length > 0 ? (
                regularUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div
                          className="bg-light text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "40px", height: "40px" }}
                        >
                          {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="fw-bold mb-0">{user.email}</div>
                          <div
                            className="text-muted"
                            style={{ fontSize: "11px" }}
                          >
                            {user.fullName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge
                        bg={user.role === "Admin" ? "danger" : "info"}
                        className="text-uppercase px-2 py-1"
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="text-center">
                      {user.role !== currentRole && (
                        <div className="d-flex justify-content-center align-items-center">
                          <Button
                            variant="link"
                            className="text-muted p-1 me-2"
                            onClick={() => onEdit(user)}
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            variant="link"
                            className={`p-1 shadow-none border-0 ${user.isActive ? "text-success" : "text-danger"}`}
                            onClick={() => onActive(user.id, !user.isActive)}
                          >
                            <div
                              className={`d-flex align-items-center px-2 py-1 rounded ${user.isActive ? "bg-success bg-opacity-10" : "bg-danger bg-opacity-10"}`}
                              style={{
                                minWidth: "95px",
                                justifyContent: "center",
                              }}
                            >
                              {user.isActive ? (
                                <>
                                  <CheckCircle size={14} className="me-1" />
                                  <span style={{ fontSize: "12px" }}>
                                    {t("userMgmt.active")}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Power size={14} className="me-1" />
                                  <span style={{ fontSize: "12px" }}>
                                    {t("userMgmt.inactive")}
                                  </span>
                                </>
                              )}
                            </div>
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-muted">
                    {t("userMgmt.noStaffFound")}
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-3 px-3">
              <div className="text-muted small">
                {t("userMgmt.showingRange", {
                  from: fromEntry,
                  to: toEntry,
                  total: totalCount,
                })}
              </div>
              <Pagination className="mb-0">
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
        </Card.Body>
      </Card>
    </>
  );
};

const StatCard = ({ icon, title, value, colorClass }) => (
  <Col md={4}>
    <Card
      className="border-0 shadow-sm text-center p-3"
      style={{ borderRadius: "15px" }}
    >
      <div className={`${colorClass} mb-2`}>{icon}</div>
      <div
        className="text-muted small fw-bold text-uppercase"
        style={{ fontSize: "10px" }}
      >
        {title}
      </div>
      <h2 className="fw-bold m-0">{value}</h2>
    </Card>
  </Col>
);

export default UserManagementView;
