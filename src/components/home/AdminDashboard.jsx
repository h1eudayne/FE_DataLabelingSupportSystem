import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Nav,
  Table,
  Button,
  Form,
  InputGroup,
  Modal,
  Badge,
  Spinner,
} from "react-bootstrap";
import {
  UserPlus,
  Search,
  ShieldCheck,
  Trash2,
  Edit2,
  Users,
  ShieldAlert,
  Activity,
  Settings,
  Save,
  Database,
  History,
  UserCheck,
  Award,
} from "lucide-react";
import { userService } from "../../services/manager/project/userService";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch dữ liệu
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error("Lỗi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
  }, [activeTab]);

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "Admin").length,
    workers: users.filter(
      (u) => u.role === "Annotator" || u.role === "Reviewer",
    ).length,
  };

  return (
    <Container
      fluid
      className="p-4"
      style={{ backgroundColor: "#f3f3f9", minHeight: "100vh" }}
    >
      {/* 1. Header Chào mừng (Theo style ảnh image_dc6cbc.png) */}
      <div className="mb-4">
        <h3 className="fw-bold">Welcome back, Admin@gmail.com</h3>
      </div>

      {/* 2. Navigation Tab bằng Bootstrap Nav */}
      <Card
        className="mb-4 border-0 shadow-sm"
        style={{ borderRadius: "15px" }}
      >
        <Card.Body className="p-2">
          <Nav
            variant="pills"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
          >
            <Nav.Item>
              <Nav.Link
                eventKey="users"
                className="d-flex align-items-center gap-2 px-4 py-2 fw-bold"
              >
                <Users size={18} /> Quản lý người dùng
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="settings"
                className="d-flex align-items-center gap-2 px-4 py-2 fw-bold"
              >
                <Settings size={18} /> Cấu hình hệ thống
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link
                eventKey="logs"
                className="d-flex align-items-center gap-2 px-4 py-2 fw-bold"
              >
                <History size={18} /> Nhật ký hoạt động
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Body>
      </Card>

      {/* 3. Nội dung các Tab */}
      {activeTab === "users" && (
        <>
          {/* Stats Section */}
          <Row className="mb-4 g-3">
            <Col md={4}>
              <Card
                className="border-0 shadow-sm text-center p-3"
                style={{ borderRadius: "15px" }}
              >
                <div className="text-primary mb-2">
                  <Users size={28} />
                </div>
                <div className="text-muted small fw-bold text-uppercase">
                  Tổng nhân sự
                </div>
                <h2 className="fw-black m-0">{stats.total}</h2>
              </Card>
            </Col>
            <Col md={4}>
              <Card
                className="border-0 shadow-sm text-center p-3"
                style={{ borderRadius: "15px" }}
              >
                <div className="text-warning mb-2">
                  <ShieldAlert size={28} />
                </div>
                <div className="text-muted small fw-bold text-uppercase">
                  Quản trị viên
                </div>
                <h2 className="fw-black m-0">{stats.admins}</h2>
              </Card>
            </Col>
            <Col md={4}>
              <Card
                className="border-0 shadow-sm text-center p-3"
                style={{ borderRadius: "15px" }}
              >
                <div className="text-success mb-2">
                  <Award size={28} />
                </div>
                <div className="text-muted small fw-bold text-uppercase">
                  Lao động
                </div>
                <h2 className="fw-black m-0">{stats.workers}</h2>
              </Card>
            </Col>
          </Row>

          {/* User Management Table */}
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
                onClick={() => setIsModalOpen(true)}
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
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                    users
                      .filter((u) => u.email.includes(searchTerm))
                      .map((user, idx) => (
                        <tr key={idx}>
                          <td>
                            <div className="d-flex align-items-center gap-3">
                              <div
                                className="bg-light text-primary fw-bold rounded-circle d-flex align-items-center justify-center"
                                style={{
                                  width: "40px",
                                  height: "40px",
                                  display: "flex",
                                  justifyContent: "center",
                                }}
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
                            <Button
                              variant="link"
                              className="text-muted p-1 me-2"
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button variant="link" className="text-danger p-1">
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
      )}

      {/* Tab Cấu hình & Nhật ký (Viết tương tự bằng Card của Bootstrap) */}
      {activeTab === "settings" && <SettingsView />}
      {activeTab === "logs" && <LogsView />}
    </Container>
  );
};

const SettingsView = () => (
  <Card className="border-0 shadow-sm p-4" style={{ borderRadius: "15px" }}>
    <h5 className="fw-bold mb-4">
      <Settings className="me-2" /> Cấu hình hệ thống
    </h5>
    <Row className="g-4">
      <Col md={6}>
        <div className="p-3 border rounded-3 mb-3">
          <h6 className="fw-bold text-primary small uppercase">
            <Database size={16} className="me-2" /> Lưu trữ
          </h6>
          <Form.Group className="mt-3">
            <Form.Label className="small fw-bold">Giới hạn tải lên</Form.Label>
            <Form.Control defaultValue="500MB" />
          </Form.Group>
        </div>
      </Col>
      <Col md={6}>
        <div className="p-3 border rounded-3">
          <h6 className="fw-bold text-success small uppercase">
            <ShieldAlert size={16} className="me-2" /> Bảo mật
          </h6>
          <Form.Check
            type="switch"
            label="Yêu cầu OTP"
            className="mt-3 fw-bold"
          />
        </div>
      </Col>
    </Row>
    <Button variant="dark" className="mt-4 fw-bold w-auto px-5">
      <Save size={18} className="me-2" /> Lưu cấu hình
    </Button>
  </Card>
);

const LogsView = () => (
  <Card
    className="border-0 shadow-sm overflow-hidden"
    style={{ borderRadius: "15px" }}
  >
    <div className="p-4 border-bottom bg-white">
      <h5 className="fw-bold mb-0">
        <History className="me-2" /> Nhật ký hệ thống
      </h5>
    </div>
    <div className="list-group list-group-flush">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="list-group-item p-3 d-flex gap-3 align-items-start border-0 border-bottom"
        >
          <div className="p-2 bg-light rounded text-primary">
            <Activity size={20} />
          </div>
          <div>
            <p className="mb-1 fw-bold small">
              Admin đã cập nhật quyền cho user_0{i}
            </p>
            <small className="text-muted font-monospace">
              2024-05-20 14:00 | IP: 192.168.1.1
            </small>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

export default AdminDashboard;
