import React, { useEffect, useState } from "react";
import { analyticsService } from "../../services/manager/analytics/analyticsService";
import Chart from "react-apexcharts";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  ProgressBar,
  Badge,
} from "react-bootstrap";
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Users,
  TrendingUp,
  MoreVertical,
} from "lucide-react";

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Gọi API từ analyticsService.js đã upload
    analyticsService.getDashboardStats().then(setStats);
  }, []);

  // Cấu hình biểu đồ Donut cho Tỷ lệ chất lượng
  const donutOptions = {
    chart: { type: "donut", fontFamily: "Inter, sans-serif" },
    labels: ["Hoàn thành", "Chờ duyệt", "Từ chối"],
    colors: ["#0ab39c", "#f7b84b", "#f06548"], // Teal, Orange, Red (Velzon Style)
    legend: { position: "bottom", markers: { radius: 12 } },
    stroke: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: { show: true, total: { show: true, label: "Tổng cộng" } },
        },
      },
    },
    dataLabels: { enabled: false },
  };

  // Cấu hình biểu đồ cột cho Hiệu suất
  const barOptions = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "45%" } },
    dataLabels: { enabled: false },
    colors: ["#405189"], // Blue Indigo
    xaxis: { categories: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] },
  };

  const chartSeries = stats
    ? [stats.completed, stats.pending, stats.rejected]
    : [0, 0, 0];
  const barSeries = [
    { name: "Ảnh đã gán", data: [30, 40, 35, 50, 49, 60, 70] },
  ];

  if (!stats)
    return (
      <div className="p-5 text-center text-muted animate-pulse">
        Đang phân tích dữ liệu dự án...
      </div>
    );

  return (
    <Container fluid className="p-4 bg-light min-vh-100">
      <Row className="mb-4 align-items-center">
        <Col>
          <h4 className="fw-bold text-dark mb-1">Quản lý Dự án & Hiệu suất</h4>
          <p className="text-muted small mb-0">
            Theo dõi tiến độ tổng thể và đánh giá chất lượng gán nhãn.
          </p>
        </Col>
        <Col xs="auto">
          <Badge
            bg="white"
            className="text-primary border p-2 px-3 shadow-sm rounded-3"
          >
            <TrendingUp size={14} className="me-1" /> +12.5% so với tháng trước
          </Badge>
        </Col>
      </Row>

      {/* KPI Cards */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <KpiCard
            icon={<Layers />}
            label="Tổng dự án"
            value={stats.totalProjects}
            color="primary"
          />
        </Col>
        <Col md={3}>
          <KpiCard
            icon={<CheckCircle2 />}
            label="Phê duyệt"
            value={stats.completed}
            color="success"
          />
        </Col>
        <Col md={3}>
          <KpiCard
            icon={<BarChart3 />}
            label="Đã nộp"
            value={stats.submitted}
            color="warning"
          />
        </Col>
        <Col md={3}>
          <KpiCard
            icon={<AlertCircle />}
            label="Bị từ chối"
            value={stats.rejected}
            color="danger"
          />
        </Col>
      </Row>

      <Row className="g-4">
        {/* Biểu đồ Donut */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 h-100 p-3">
            <Card.Body>
              <div className="d-flex justify-content-between mb-4">
                <h6 className="fw-bold mb-0">Tỷ lệ chất lượng ảnh</h6>
                <MoreVertical size={16} className="text-muted cursor-pointer" />
              </div>
              <Chart
                options={donutOptions}
                series={chartSeries}
                type="donut"
                width="100%"
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Biểu đồ Cột & Danh sách dự án */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Header className="bg-white py-3 border-0">
              <h6 className="fw-bold mb-0">Tiến độ dự án đang chạy</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive className="mb-0 align-middle">
                <thead className="bg-light text-muted small uppercase">
                  <tr>
                    <th className="ps-4">Dự án</th>
                    <th>Tiến độ</th>
                    <th>Reviewer</th>
                    <th className="pe-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="small">
                  {[1, 2].map((i) => (
                    <tr key={i}>
                      <td className="ps-4 fw-bold text-slate-700">
                        Dự án Nhận diện Xe cộ #0{i}
                      </td>
                      <td style={{ width: "200px" }}>
                        <div className="d-flex align-items-center gap-2">
                          <ProgressBar
                            now={i === 1 ? 85 : 45}
                            variant="primary"
                            style={{ height: "6px", flex: 1 }}
                          />
                          <span
                            className="fw-bold text-muted"
                            style={{ fontSize: "10px" }}
                          >
                            {i === 1 ? "85%" : "45%"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div
                            className="bg-soft-info p-1 rounded-circle me-2"
                            style={{
                              width: "24px",
                              height: "24px",
                              fontSize: "10px",
                              textAlign: "center",
                            }}
                          >
                            R
                          </div>
                          <span className="text-muted">Reviewer_0{i}</span>
                        </div>
                      </td>
                      <td className="pe-4 text-end">
                        <Badge
                          bg={i === 1 ? "success" : "warning"}
                          className="bg-opacity-10 text-capitalize font-bold p-2"
                          style={{ color: i === 1 ? "#0ab39c" : "#f7b84b" }}
                        >
                          {i === 1 ? "Sắp hoàn thành" : "Đang chạy"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Biểu đồ hiệu suất tuần */}
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body>
              <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <Users size={18} className="text-primary" /> Hiệu suất gán nhãn
                theo tuần
              </h6>
              <Chart
                options={barOptions}
                series={barSeries}
                type="bar"
                height={200}
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

const KpiCard = ({ icon, label, value, color }) => (
  <Card className="border-0 shadow-sm rounded-4 h-100 overflow-hidden position-relative">
    <Card.Body className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div
          className={`p-3 bg-${color} bg-opacity-10 text-${color} rounded-3`}
        >
          {React.cloneElement(icon, { size: 20 })}
        </div>
        <Badge bg="light" className="text-muted fw-normal border">
          Tháng này
        </Badge>
      </div>
      <div>
        <p className="text-muted small fw-bold text-uppercase mb-1 tracking-wider">
          {label}
        </p>
        <h3 className="fw-black mb-0 text-slate-800">
          {value?.toLocaleString() || 0}
        </h3>
      </div>
    </Card.Body>
    {/* Một chút họa tiết nền để giống Velzon */}
    <div
      className={`position-absolute end-0 bottom-0 opacity-10 p-3 text-${color}`}
      style={{ transform: "translate(10%, 10%)" }}
    >
      {React.cloneElement(icon, { size: 80 })}
    </div>
  </Card>
);

export default ManagerDashboard;
