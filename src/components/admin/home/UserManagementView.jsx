import {
  Row,
  Col,
  Card,
  Button,
  InputGroup,
  Form,
  Table,
  Spinner,
  Badge,
} from "react-bootstrap";
import {
  Users,
  ShieldAlert,
  Award,
  UserCheck,
  UserPlus,
  Search,
  Edit2,
  Trash2,
} from "lucide-react";

const UserManagementView = ({
  stats,
  users,
  loading,
  onSearch,
  onAddClick,
  onDelete,
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
        <Button
          variant="primary"
          className="fw-bold px-4 py-2"
          onClick={onAddClick}
        >
          <UserPlus size={18} className="me-2" /> Thêm thành viên
        </Button>
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
              <th className="text-end">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                </td>
              </tr>
            ) : (
              users.map((user, idx) => (
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
                        <small className="text-muted font-monospace">
                          UID: {user.id?.slice(-8)}
                        </small>
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
                  <td className="text-end">
                    <Button variant="link" className="text-muted p-1 me-2">
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="link"
                      className="text-danger p-1"
                      onClick={() => onDelete(user.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </td>
                </tr>
              ))
            )}
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
