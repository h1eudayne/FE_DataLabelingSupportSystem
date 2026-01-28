import React, { useEffect, useState } from "react";
import { Container, Row, Col, Spinner, Button } from "react-bootstrap";
import { TrendingUp, Plus } from "lucide-react";
import KpiCard from "../components/manager/home/KpiCard";
import ProjectTable from "../components/manager/home/ProjectTable";
import QualityDonutChart from "../components/manager/home/QualityDonutChart";
import PerformanceBarChart from "../components/manager/home/PerformanceBarChart";
import { analyticsService } from "../services/manager/analytics/analyticsService";

const ManagerContainer = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    analyticsService.getDashboardStats().then(setData);
  }, []);

  if (!data)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted fw-bold">Đang tải dữ liệu...</p>
        </div>
      </div>
    );

  return (
    <Container fluid className="p-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-1">Báo cáo Quản lý</h4>
          <p className="text-muted small mb-0">
            Tăng trưởng{" "}
            <span className="text-success fw-bold">
              <TrendingUp size={14} /> {data.growth || 0}%
            </span>{" "}
            so với tháng trước
          </p>
        </div>
        <Button
          variant="primary"
          className="rounded-3 shadow-sm px-4 d-flex align-items-center gap-2"
        >
          <Plus size={18} /> Tạo dự án mới
        </Button>
      </div>

      <Row className="g-3 mb-4">
        <Col md={3}>
          <KpiCard
            label="Tổng dự án"
            value={data.total}
            color="primary"
            iconName="Layers"
          />
        </Col>
        <Col md={3}>
          <KpiCard
            label="Phê duyệt"
            value={data.completed}
            color="success"
            iconName="CheckCircle2"
          />
        </Col>
        <Col md={3}>
          <KpiCard
            label="Đã nộp"
            value={data.submitted}
            color="warning"
            iconName="BarChart3"
          />
        </Col>
        <Col md={3}>
          <KpiCard
            label="Bị từ chối"
            value={data.rejected}
            color="danger"
            iconName="AlertCircle"
          />
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={4}>
          <QualityDonutChart
            data={[data.completed, data.pending, data.rejected]}
          />
        </Col>
        <Col lg={8}>
          <div className="d-flex flex-column gap-4">
            <ProjectTable projects={data.activeProjects || []} />
            <PerformanceBarChart weeklyData={data.weeklyPerformance} />
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ManagerContainer;
