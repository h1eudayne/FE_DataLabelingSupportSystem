import { Card, Nav } from "react-bootstrap";
import { Users, Settings, History } from "lucide-react";

const NavigationTabs = ({ activeTab, setActiveTab }) => (
  <Card className="mb-4 border-0 shadow-sm" style={{ borderRadius: "15px" }}>
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
);
export default NavigationTabs;
