import React, { useEffect, useState } from "react";
import {
  ClipboardCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Info,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  ProgressBar,
  Badge,
  Spinner,
} from "react-bootstrap";

const ReviewerDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setTimeout(() => {
        setProjects([
          {
            id: "#12849",
            name: "NLP Sentiment Analysis",
            progress: 75,
            status: "IN PROGRESS",
            count: 120,
          },
          {
            id: "#12852",
            name: "Object Detection V4",
            progress: 12,
            status: "PENDING",
            count: 45,
          },
          {
            id: "#12860",
            name: "Lidar Point Cloud",
            progress: 45,
            status: "IN PROGRESS",
            count: 89,
          },
        ]);
        setLoading(false);
      }, 500);
    };
    loadData();
  }, []);

  return (
    <div className="dashboard-wrapper">
      <style>{`
        .dashboard-wrapper { 
          background-color: #f3f3f9; 
          min-height: 100vh; 
          padding: 25px; /* Khoảng cách với mép trình duyệt */
          font-family: 'Inter', sans-serif; 
        }
        
        /* Loại bỏ max-width để tràn màn hình */
        .container-fluid {
          max-width: 100% !important;
          padding-left: 0;
          padding-right: 0;
        }

        .text-primary-velzon { color: #405189 !important; }
        .bg-primary-velzon { background-color: #405189 !important; }
        
        .search-box { 
          background: #fff; 
          border-radius: 8px; 
          border: 1px solid #e9ebec; 
          display: flex; 
          align-items: center; 
          padding: 5px 15px; 
        }
        .search-box input { border: none; padding: 8px; width: 100%; outline: none; font-size: 0.9rem; }

        .project-card { 
          border: none !important; 
          border-radius: 12px !important; 
          box-shadow: 0 1px 2px rgba(56,65,74,0.15);
          margin-bottom: 1.5rem;
        }

        .icon-box { background: #f3f3f9; color: #405189; padding: 15px; border-radius: 10px; }
        
        .custom-progress { height: 8px; border-radius: 10px; background-color: #eff2f7; }
        .custom-progress .progress-bar { background-color: #405189; }

        .key-cap { 
          background: #f3f3f9; border: 1px solid #e2e8f0; border-radius: 6px; 
          width: 30px; height: 30px; display: flex; align-items: center; 
          justify-content: center; font-weight: 700; color: #405189;
        }

        /* Responsive cho các cột trong Card */
        @media (max-width: 992px) {
          .project-info { margin-bottom: 15px; }
        }
      `}</style>

      {/* Sử dụng Container-fluid để trải dài 100% */}
      <Container fluid>
        {/* Header */}
        <Row className="mb-4">
          <Col md={8}>
            <div className="text-muted small mb-1">
              Dashboard /{" "}
              <span className="text-primary-velzon fw-bold">Reviewer</span>
            </div>
            <h3 className="fw-bold">Trung tâm Kiểm duyệt</h3>
            <p className="text-muted">
              Quản lý và phê duyệt chất lượng dữ liệu từ Annotators.
            </p>
          </Col>
          <Col
            md={4}
            className="text-md-end d-flex align-items-center justify-content-md-end"
          >
            <Button className="bg-primary-velzon border-0 px-4 py-2 shadow-sm d-flex align-items-center gap-2">
              <LayoutGrid size={18} /> Xem báo cáo tổng
            </Button>
          </Col>
        </Row>

        {/* Toolbar */}
        <Row className="mb-4">
          <Col lg={10} md={9} className="mb-2 mb-md-0">
            <div className="search-box">
              <Search size={18} className="text-muted" />
              <input type="text" placeholder="Tìm kiếm dự án hoặc ID..." />
            </div>
          </Col>
          <Col lg={2} md={3}>
            <Button
              variant="white"
              className="w-100 border bg-white d-flex align-items-center justify-content-center gap-2"
            >
              <Filter size={18} /> Bộ lọc
            </Button>
          </Col>
        </Row>

        {/* Main Body Area */}
        <Row>
          {/* List Projects */}
          <Col xl={9} lg={8}>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" className="text-primary-velzon" />
              </div>
            ) : (
              projects.map((item, idx) => (
                <Card key={idx} className="project-card p-4">
                  <Row className="align-items-center">
                    <Col lg={5} md={12} className="project-info">
                      <div className="d-flex align-items-center gap-4">
                        <div className="icon-box d-none d-sm-block">
                          <ClipboardCheck size={28} />
                        </div>
                        <div>
                          <h5 className="fw-bold mb-1">{item.name}</h5>
                          <div className="d-flex align-items-center gap-3 text-muted small">
                            <span>
                              ID:{" "}
                              <b className="text-primary-velzon">{item.id}</b>
                            </span>
                            <span>•</span>
                            <span>{item.count} tasks</span>
                          </div>
                        </div>
                      </div>
                    </Col>

                    <Col lg={4} md={8} className="mb-3 mb-lg-0">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="small fw-bold">Tiến độ</span>
                        <span className="small fw-bold text-primary-velzon">
                          {item.progress}%
                        </span>
                      </div>
                      <ProgressBar
                        now={item.progress}
                        className="custom-progress"
                      />
                    </Col>

                    <Col lg={3} md={4} className="text-lg-end">
                      <Badge
                        bg={item.status === "PENDING" ? "info" : "warning"}
                        className="bg-opacity-10 text-uppercase px-3 py-2 mb-2 d-inline-block"
                        style={{
                          color:
                            item.status === "PENDING" ? "#0dcaf0" : "#f7b84b",
                          fontSize: "0.65rem",
                        }}
                      >
                        {item.status}
                      </Badge>
                      <div>
                        <Button
                          variant="link"
                          className="p-0 text-primary-velzon fw-bold text-decoration-none d-inline-flex align-items-center gap-1"
                        >
                          Review <ChevronRight size={18} />
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))
            )}
          </Col>

          {/* Sidebar */}
          <Col xl={3} lg={4}>
            <Card className="border-0 shadow-sm p-4 h-100">
              <div className="d-flex align-items-center gap-2 mb-4">
                <div className="p-2 bg-warning bg-opacity-10 text-warning rounded">
                  <Info size={20} />
                </div>
                <h6 className="fw-bold mb-0">Hướng dẫn nhanh</h6>
              </div>
              <p className="text-muted small">
                Reviewer có thể sử dụng bàn phím để tăng tốc độ xử lý dữ liệu
                lên đến 40%.
              </p>

              <div className="d-grid gap-3 mt-4">
                <div className="d-flex align-items-center justify-content-between p-3 bg-light border border-dashed rounded-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="key-cap shadow-sm">A</div>
                    <span className="small fw-bold">Approve dự án</span>
                  </div>
                  <CheckCircle2 size={20} className="text-success" />
                </div>

                <div className="d-flex align-items-center justify-content-between p-3 bg-light border border-dashed rounded-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="key-cap shadow-sm">R</div>
                    <span className="small fw-bold">Reject dự án</span>
                  </div>
                  <XCircle size={20} className="text-danger" />
                </div>
              </div>

              <div
                className="mt-5 p-4 rounded-3 text-white text-center shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #405189 0%, #2a375e 100%)",
                }}
              >
                <p className="small mb-3 opacity-75">Sẵn sàng làm việc?</p>
                <Button
                  variant="light"
                  className="w-100 fw-bold border-0 text-primary-velzon py-2"
                >
                  Bắt đầu ngay
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ReviewerDashboard;
