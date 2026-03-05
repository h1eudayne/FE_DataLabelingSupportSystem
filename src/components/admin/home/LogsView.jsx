import React, { useEffect, useState } from "react";
import { Card, Badge, InputGroup, Form, Button } from "react-bootstrap";
import { History, Activity, Search, User, Filter } from "lucide-react";
import { getSysLogs } from "../../../services/admin/managementSystem/systemLog.api";
import SysLogsModal from "../managementSystem/SysLogsModal";

const LogsView = () => {
  const [logData, setLogData] = useState(null);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectUserLogs, setSelectUserLogs] = useState(null);

  useEffect(() => {
    fetchLog();
  }, []);

  const fetchLog = async () => {
    try {
      const res = await getSysLogs();
      if (res.data) {
        const groupedData = res.data.reduce((acc, currentLog) => {
          const userId = currentLog.userId;

          if (!acc[userId]) {
            acc[userId] = {
              id: userId,
              email: currentLog.user.email,
              userInfo: currentLog.user,
              logs: [],
            };
          }

          acc[userId].logs.push({
            id: currentLog.id,
            actionType: currentLog.actionType,
            timestamp: currentLog.timestamp,
            ipAddress: currentLog.ipAddress,
          });

          return acc;
        }, {});

        setLogData(Object.values(groupedData));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onCloseModal = () => {
    setSelectUserLogs(null);
    setIsOpenModal(false);
  };

  return (
    <>
      <Card
        className="border-0 shadow-sm overflow-hidden"
        style={{ borderRadius: "15px" }}
      >
        <Card.Header className="bg-white border-bottom py-4 px-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold mb-0">
                <History className="me-2 text-primary" /> Nhật ký hệ thống
                (System Logs)
              </h5>
              <small className="text-muted">
                Theo dõi mọi hoạt động của người dùng
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
          {logData?.map((log) => (
            <div
              key={log.id}
              className="list-group-item p-3 d-flex justify-content-between align-items-center border-0 border-bottom bg-transparent main-log-item"
              style={{ transition: "all 0.3s ease" }}
            >
              <div className="d-flex align-items-center gap-3">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold shadow-sm"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "linear-gradient(45deg, #007bff, #6610f2)",
                    fontSize: "14px",
                  }}
                >
                  {log.email?.charAt(0).toUpperCase() || "U"}
                </div>

                <div className="d-flex flex-column">
                  <span
                    className="fw-bold text-dark mb-0"
                    style={{ fontSize: "15px", letterSpacing: "-0.3px" }}
                  >
                    {log.email || "No Email"}
                  </span>
                  <div className="d-flex align-items-center gap-2">
                    <Badge
                      bg="light"
                      className="text-muted border-0 fw-normal p-0"
                      style={{ fontSize: "11px" }}
                    >
                      <Activity size={10} className="me-1" />
                      {log.logs?.length} hoạt động ghi nhận
                    </Badge>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                size="sm"
                style={{
                  borderRadius: "8px",
                  fontSize: "12px",
                  padding: "5px 15px",
                }}
                onClick={() => {
                  setIsOpenModal(true);
                  setSelectUserLogs(log);
                }}
              >
                Chi tiết
              </Button>
            </div>
          ))}
        </div>
      </Card>
      <SysLogsModal
        isOpen={isOpenModal}
        onClose={onCloseModal}
        selectUserLogs={selectUserLogs}
      />
    </>
  );
};

export default LogsView;
