import React from "react";
import { Card, Badge, InputGroup, Form } from "react-bootstrap";
import { History, Activity, Search, User, Filter } from "lucide-react";

const LogsView = () => {
  const logData = [
    {
      id: 1,
      action: "Cập nhật nhãn",
      user: "admin@gmail.com",
      time: "2024-05-20 14:00",
      type: "update",
      ip: "192.168.1.1",
    },
    {
      id: 2,
      action: "Xóa dự án ID: 12",
      user: "manager_01",
      time: "2024-05-20 13:45",
      type: "delete",
      ip: "113.161.5.2",
    },
    {
      id: 3,
      action: "Đăng nhập hệ thống",
      user: "annotator_05",
      time: "2024-05-20 12:30",
      type: "auth",
      ip: "172.16.0.45",
    },
  ];

  const getBadgeType = (type) => {
    switch (type) {
      case "update":
        return "primary";
      case "delete":
        return "danger";
      case "auth":
        return "success";
      default:
        return "secondary";
    }
  };

  return (
    <Card
      className="border-0 shadow-sm overflow-hidden"
      style={{ borderRadius: "15px" }}
    >
      <Card.Header className="bg-white border-bottom py-4 px-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold mb-0">
              <History className="me-2 text-primary" /> Nhật ký hệ thống (System
              Logs)
            </h5>
            <small className="text-muted">
              Theo dõi mọi thay đổi từ API và người dùng.
            </small>
          </div>
          <Badge bg="light" className="text-dark border p-2">
            <Filter size={14} className="me-1" /> Lọc dữ liệu
          </Badge>
        </div>
      </Card.Header>

      <div className="p-4 bg-light bg-opacity-50">
        <InputGroup className="border rounded-3 overflow-hidden bg-white">
          <InputGroup.Text className="bg-white border-0">
            <Search size={18} className="text-muted" />
          </InputGroup.Text>
          <Form.Control
            placeholder="Tìm kiếm log theo email hoặc hành động..."
            className="border-0 shadow-none"
          />
        </InputGroup>
      </div>

      <div className="list-group list-group-flush">
        {logData.map((log) => (
          <div
            key={log.id}
            className="list-group-item p-3 d-flex gap-3 align-items-start border-0 border-bottom"
          >
            <div
              className={`p-2 rounded bg-opacity-10 bg-${getBadgeType(log.type)} text-${getBadgeType(log.type)}`}
            >
              <Activity size={20} />
            </div>
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between">
                <p className="mb-1 fw-bold small text-slate-800">
                  {log.action}
                </p>
                <Badge
                  bg={getBadgeType(log.type)}
                  className="text-uppercase"
                  style={{ fontSize: "10px" }}
                >
                  {log.type}
                </Badge>
              </div>
              <div
                className="d-flex align-items-center gap-3 text-muted"
                style={{ fontSize: "12px" }}
              >
                <span className="d-flex align-items-center gap-1">
                  <User size={12} /> {log.user}
                </span>
                <span className="font-monospace">| Time: {log.time}</span>
                <span className="font-monospace">| IP: {log.ip}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Card.Footer className="bg-white text-center py-3">
        <Button
          variant="link"
          className="text-primary fw-bold text-decoration-none small"
        >
          Xem tất cả lịch sử hoạt động
        </Button>
      </Card.Footer>
    </Card>
  );
};

export default LogsView;
