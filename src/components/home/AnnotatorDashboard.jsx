import React, { useEffect, useState } from "react";
import * as annotatorApi from "../../services/annotator/dashboard/annotator.api";
import {
  Layout,
  CheckCircle,
  Clock,
  MessageSquare,
  PlayCircle,
  AlertTriangle,
  Zap,
  User,
} from "lucide-react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
} from "react-bootstrap";

const AnnotatorDashboard = () => {
  const [stats, setStats] = useState({
    totalAssigned: 0,
    submitted: 0,
    inProgress: 0,
  });
  const [feedbacks, setFeedbacks] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [statsData, feedbackData, profileData] = await Promise.all([
          annotatorApi.getDashboardStats(),
          annotatorApi.getAllReviewerFeedback(),
          annotatorApi.getProfile(),
        ]);
        setStats(statsData);
        setFeedbacks(feedbackData);
        setProfile(profileData);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="bg-dashboard py-4">
      <style>{`
        .bg-dashboard { background-color: #f3f3f9; min-height: 100vh; }
        .text-slate-800 { color: #212529; }
        .fw-black { font-weight: 800; }
        .rounded-2rem { border-radius: 1rem !important; }
        .card-custom { border: none; box-shadow: 0 1px 2px rgba(56, 65, 74, 0.15); transition: all 0.3s; }
        .card-custom:hover { box-shadow: 0 5px 15px rgba(56, 65, 74, 0.1); }
        .btn-workstation {
            background: linear-gradient(135deg, #405189 0%, #293552 100%);
            border: none;
            transition: all 0.3s;
        }
        .btn-workstation:hover { transform: translateY(-3px); opacity: 0.95; }
        .badge-annotator { background-color: #eef2ff; color: #4f46e5; border: 1px solid #e0e7ff; }
        .feedback-empty-state { opacity: 0.8; }
        .icon-soft-bg { width: 45px; height: 45px; display: flex; align-items: center; justify-content: center; }
      `}</style>

      <Container fluid className="px-4">
        {/* Header Section */}
        <div className="mb-4 d-flex justify-content-between align-items-end">
          <div>
            <h4 className="fw-black text-slate-800 mb-1">
              Welcome back, {profile?.email?.split("@")[0] || "Staff1"}
            </h4>
            <p className="text-muted mb-0 small">
              Bạn đang đăng nhập với quyền <b>Annotator</b>. Kiểm tra các phản
              hồi mới nhất bên dưới.
            </p>
          </div>
          <div className="d-none d-sm-block">
            <Badge
              style={{
                backgroundColor: "#405189",
                color: "#fff",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                display: "inline-flex",
                fontWeight: "600",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <User size={14} className="me-2" />
              Vai trò: Annotator
            </Badge>
          </div>
        </div>

        {/* Stats Row */}
        <Row className="g-3 mb-4">
          <StatCard
            icon={<Layout size={20} />}
            label="TỔNG ẢNH ĐƯỢC GIAO"
            value={stats.totalAssigned}
            color="#405189"
            bgColor="rgba(64, 81, 137, 0.1)"
          />
          <StatCard
            icon={<CheckCircle size={20} />}
            label="ĐÃ HOÀN THÀNH"
            value={stats.submitted}
            color="#0ab39c"
            bgColor="rgba(10, 179, 156, 0.1)"
          />
          <StatCard
            icon={<Clock size={20} />}
            label="ĐANG THỰC HIỆN"
            value={stats.inProgress}
            color="#f7b84b"
            bgColor="rgba(247, 184, 75, 0.1)"
          />
        </Row>

        <Row className="g-4">
          {/* Feedback Section */}
          <Col lg={8}>
            <Card className="card-custom rounded-2rem h-100 overflow-hidden">
              <Card.Header className="bg-white border-bottom py-3 px-4 d-flex align-items-center gap-2">
                <MessageSquare size={18} className="text-danger" />
                <h6 className="mb-0 fw-bold text-slate-800">
                  Phản hồi & Chỉnh sửa
                </h6>
              </Card.Header>
              <Card.Body className="p-4 d-flex flex-column justify-content-center align-items-center bg-white min-vh-50">
                {feedbacks.length > 0 ? (
                  <div className="w-100">{/* Map feedbacks here */}</div>
                ) : (
                  <div className="text-center feedback-empty-state py-5">
                    <div className="bg-light rounded-circle p-4 d-inline-block mb-3">
                      <CheckCircle
                        size={48}
                        className="text-success opacity-50"
                      />
                    </div>
                    <h5 className="fw-bold text-dark">Tuyệt vời!</h5>
                    <p
                      className="text-muted mx-auto"
                      style={{ maxWidth: "300px" }}
                    >
                      Chưa có phản hồi nào cần xử lý từ người kiểm duyệt. Hãy
                      tiếp tục gán nhãn nhé!
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Action Section */}
          <Col lg={4}>
            {/* Workstation Card */}
            <Card className="card-custom border-0 shadow-lg mb-4 text-white btn-workstation rounded-2rem">
              <Card.Body className="p-4 position-relative overflow-hidden">
                <Zap
                  className="position-absolute"
                  size={120}
                  style={{
                    right: "-20px",
                    top: "-20px",
                    opacity: 0.1,
                    transform: "rotate(15deg)",
                  }}
                />
                <div className="z-index-1 position-relative">
                  <h4 className="fw-black mb-2">Workstation</h4>
                  <p className="small mb-4 opacity-75">
                    Tiếp tục thực hiện gán nhãn các bản ghi còn thiếu để đảm bảo
                    tiến độ dự án đúng thời hạn.
                  </p>
                  <Button
                    variant="light"
                    className="w-100 fw-bold text-primary rounded-3 py-2 shadow-sm d-flex align-items-center justify-content-center gap-2 border-0"
                  >
                    <PlayCircle size={18} /> MỞ WORKSTATION
                  </Button>
                </div>
              </Card.Body>
            </Card>

            {/* Guide Card */}
            <Card className="card-custom rounded-2rem border-0">
              <Card.Body className="p-4">
                <h6 className="fw-bold text-muted mb-4 small tracking-wider text-uppercase border-bottom pb-2">
                  Hướng dẫn nhanh
                </h6>
                <div className="d-grid gap-3">
                  <GuideItem text="Vẽ khung sát vật thể (Bbox)" />
                  <GuideItem text="Chọn đúng nhãn loại xe tương ứng" />
                  <GuideItem text="Đảm bảo độ sáng ảnh khi gán" />
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, bgColor }) => (
  <Col md={4}>
    <Card className="card-custom rounded-2rem">
      <Card.Body className="p-4 d-flex align-items-center">
        <div
          className="icon-soft-bg rounded-3 me-3"
          style={{ backgroundColor: bgColor, color: color }}
        >
          {icon}
        </div>
        <div>
          <p
            className="mb-1 text-muted fw-semibold"
            style={{ fontSize: "0.75rem", letterSpacing: "0.02em" }}
          >
            {label}
          </p>
          <h3 className="mb-0 fw-black text-slate-800">{value}</h3>
        </div>
      </Card.Body>
    </Card>
  </Col>
);

const GuideItem = ({ text }) => (
  <div className="d-flex align-items-start gap-3">
    <div className="mt-1 p-1 bg-warning bg-opacity-10 rounded text-warning">
      <AlertTriangle size={14} />
    </div>
    <span className="small fw-semibold text-secondary">{text}</span>
  </div>
);

export default AnnotatorDashboard;
