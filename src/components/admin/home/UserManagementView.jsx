import {
  Row,
  Col,
  Card,
  Button,
  InputGroup,
  Form,
  Table,
  Badge,
} from "react-bootstrap";
import {
  Users,
  ShieldAlert,
  Award,
  UserCheck,
  Search,
  Edit2,
  CheckCircle,
  Power,
} from "lucide-react";

const UserManagementView = ({
  stats,
  users,
  onSearch,
  onActive,
  onEdit,
  currentRole,
}) => (
  <>
    <Row className="mb-4 g-3">
      <StatCard
        icon={<Users size={28} />}
        title="Tổng nhân sự"
        value={stats.total}
        colorClass="text-primary"
      />
      <StatCard
        icon={<ShieldAlert size={28} />}
        title="Quản trị viên"
        value={stats.admins}
        colorClass="text-warning"
      />
      <StatCard
        icon={<Award size={28} />}
        title="Lao động"
        value={stats.workers}
        colorClass="text-success"
      />
    </Row>

    <Card className="border-0 shadow-sm" style={{ borderRadius: "15px" }}>
      <Card.Header className="bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
        <div>
          <h5 className="fw-bold mb-0">
            <UserCheck className="me-2 text-primary" /> Quản lý nhân sự
          </h5>
          <small className="text-muted">
            Quản lý tài khoản và phân quyền hệ thống.
          </small>
        </div>
      </Card.Header>
      <Card.Body className="px-4 pb-4">
        <InputGroup className="mb-3 border rounded-3 overflow-hidden">
          <InputGroup.Text className="bg-white border-0">
            <Search size={18} className="text-muted" />
          </InputGroup.Text>
          <Form.Control
            placeholder="Tìm kiếm theo email, vai trò..."
            className="border-0 shadow-none"
            onChange={(e) => onSearch(e.target.value)}
          />
        </InputGroup>

        <Table responsive hover className="align-middle">
          <thead className="table-light">
            <tr className="text-muted small text-uppercase fw-bold">
              <th>Người dùng</th>
              <th>Vai trò</th>
              <th className="text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={idx}>
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
                    <>
                      <Button
                        variant="link"
                        className="text-muted p-1 me-2"
                        onClick={() => onEdit(user)}
                      >
                        <Edit2 size={16} />
                      </Button>
                      <Button
                        variant="link"
                        className={`p-1 shadow-none ${user.isActive ? "text-success" : "text-danger"}`}
                        onClick={() => onActive(user.id, !user.isActive)}
                        title={
                          user.isActive
                            ? "Click để khóa tài khoản"
                            : "Click để kích hoạt"
                        }
                      >
                        <div
                          className={`d-flex align-items-center px-2 py-1 rounded ${user.isActive ? "bg-light-success" : "bg-light-danger"}`}
                          style={{ minWidth: "90px", justifyContent: "center" }}
                        >
                          {user.isActive ? (
                            <>
                              <CheckCircle size={16} className="me-1" />
                              <span
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "500",
                                  width: "55px",
                                  textAlign: "left",
                                }}
                              >
                                Active
                              </span>
                            </>
                          ) : (
                            <>
                              <Power size={16} className="me-1" />
                              <span
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "500",
                                  width: "55px",
                                  textAlign: "left",
                                }}
                              >
                                Inactive
                              </span>
                            </>
                          )}
                        </div>
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  </>
);

const StatCard = ({ icon, title, value, colorClass }) => (
  <Col md={4}>
    <Card
      className="border-0 shadow-sm text-center p-3"
      style={{ borderRadius: "15px" }}
    >
      <div className={`${colorClass} mb-2`}>{icon}</div>
      <div className="text-muted small fw-bold text-uppercase">{title}</div>
      <h2 className="fw-black m-0">{value}</h2>
    </Card>
  </Col>
);

export default UserManagementView;
