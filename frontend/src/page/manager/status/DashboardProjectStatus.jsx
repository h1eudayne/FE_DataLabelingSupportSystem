import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner } from "reactstrap";
import ProjectOverviewChart from "../../../components/manager/status/ProjectOverviewChart";
import ProjectStatusSidebar from "../../../components/manager/status/ProjectStatusSidebar";
import StatCards from "../../../components/manager/status/StatCards";
import { analyticsService } from "../../../services/manager/analytics/analyticsService";

const DashboardProjectStatus = () => {
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resStats, resProjects] = await Promise.all([
        analyticsService.getDashboardStats(),
        analyticsService.getMyProjects(),
      ]);

      setStats(resStats.data || resStats);
      setProjects(resProjects.data || resProjects);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="page-content text-center p-5">
        <Spinner color="primary" />
        <p className="mt-2 text-muted">Đang đồng bộ dữ liệu hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      <Container fluid>
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0 text-uppercase fw-bold text-primary">
                Project Analytics
              </h4>
            </div>
          </div>
        </div>

        <Row className="project-wrapper">
          <Col xxl={8}>
            <StatCards stats={stats} />

            <ProjectOverviewChart projects={projects} />
          </Col>

          <Col xxl={4}>
            <ProjectStatusSidebar projects={projects} />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DashboardProjectStatus;
