import React, { useState, useEffect } from "react";
import { Container, Row, Col, Spinner } from "reactstrap";
import ProjectOverviewChart from "../../../components/manager/status/ProjectOverviewChart";
import ProjectStatusSidebar from "../../../components/manager/status/ProjectStatusSidebar";
import StatCards from "../../../components/manager/status/StatCards";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import analyticsService from "../../../services/manager/analytics/analyticsService";

const DashboardProjectStatus = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useSelector((state) => state.auth);
  const managerId = user?.id;

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [resStats, resProjects] = await Promise.all([
          analyticsService.getDashboardStats(managerId),
          analyticsService.getMyProjects(managerId),
        ]);

        setStats(resStats.data || resStats);
        setProjects(resProjects.data || resProjects);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [managerId]);

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner color="primary" />
        <p className="mt-2 text-muted">{t('managerStatus.syncing')}</p>
      </div>
    );
  }

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0 text-uppercase fw-bold text-primary">
              {t('managerStatus.pageTitle')}
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
    </>
  );
};

export default DashboardProjectStatus;
