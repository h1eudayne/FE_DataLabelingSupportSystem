import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import projectApi from "../../../services/admin/managementUsers/project.api";
import { useTranslation } from "react-i18next";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Table,
  ProgressBar,
  Button,
  Spinner,
} from "react-bootstrap";
import { ArrowLeft, Calendar, User, Users, Info } from "lucide-react";

const DetailProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [selectProject, setSelectProject] = useState(null);
  const [loading, setLoading] = useState(true);

  const localeTag = i18n.language === "vi" ? "vi-VN" : "en-US";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await projectApi.getProjectById(id);
        if (res.data) setSelectProject(res.data);
      } catch (error) {
        console.error(error);
        setSelectProject(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Container fluid className="admin-shell">
        <div className="admin-shell__inner">
          <div className="admin-loading-state">
            <Spinner animation="border" variant="primary" />
          </div>
        </div>
      </Container>
    );
  }

  if (!selectProject) {
    return (
      <Container fluid className="admin-shell">
        <div className="admin-shell__inner">
          <div className="admin-mobile-card text-center">
            {t("common.noData")}
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="admin-shell">
      <div className="admin-shell__inner">
        <section className="admin-page-header">
          <div className="admin-page-header__content">
            <div className="d-flex align-items-center gap-3 flex-wrap">
              <Button
                variant="light"
                onClick={() => navigate(-1)}
                className="admin-icon-button"
              >
                <ArrowLeft size={18} />
              </Button>
              <div>
                <div className="admin-page-header__eyebrow">
                  {t("admin.project.listTitle")}
                </div>
                <h1 className="admin-page-header__title">{selectProject.name}</h1>
              </div>
            </div>
            <p className="admin-page-header__subtitle">
              {t("admin.projectDetail.detailSubtitle")}
            </p>
          </div>

          <div className="admin-page-header__meta">
            <div className="admin-page-header__chip">
              <Info size={18} />
              <span>
                {t("admin.projectDetail.type")}: {selectProject.allowGeometryTypes}
              </span>
            </div>
          </div>
        </section>

        <Row className="g-4 admin-detail-grid">
          <Col lg={8}>
            <Card className="admin-detail-surface mb-4">
              <Card.Body className="p-4">
                <h2 className="admin-section-card__title d-flex align-items-center gap-2 mb-3">
                  <Info size={18} className="text-primary" />
                  {t("admin.projectDetail.description")}
                </h2>
                <div className="admin-detail-description">
                  {selectProject.description || t("admin.projectDetail.noDescription")}
                </div>
              </Card.Body>
            </Card>

            <Card className="admin-detail-surface">
              <Card.Body className="p-4">
                <h2 className="admin-section-card__title d-flex align-items-center gap-2 mb-3">
                  <Users size={18} className="text-primary" />
                  {t("admin.projectDetail.memberPerformance")}
                </h2>
                <div className="admin-table-shell">
                  <div className="admin-table-scroll admin-table">
                    <Table responsive hover className="align-middle mb-0">
                      <thead>
                        <tr>
                          <th>{t("admin.projectDetail.tableMember")}</th>
                          <th className="text-center">
                            {t("admin.projectDetail.tableRole")}
                          </th>
                          <th className="text-center">
                            {t("admin.projectDetail.tableTasks")}
                          </th>
                          <th>{t("admin.projectDetail.tableProgress")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectProject.members?.map((member) => (
                          <tr key={member.id}>
                            <td>
                              <div className="admin-table-user">
                                <div className="admin-table-user__avatar">
                                  {member.fullName?.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <div className="admin-table-user__title text-break">
                                    {member.fullName}
                                  </div>
                                  <div className="admin-table-user__subtitle text-break">
                                    {member.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              <Badge
                                bg={member.role === "Reviewer" ? "info" : "secondary"}
                                className="text-uppercase"
                              >
                                {member.role}
                              </Badge>
                            </td>
                            <td className="text-center fw-medium">
                              {member.tasksAssigned} /{" "}
                              <span className="text-success">
                                {member.tasksCompleted}
                              </span>
                            </td>
                            <td>
                              <div className="admin-progress">
                                <div className="admin-progress__track">
                                  <div
                                    className="admin-progress__fill"
                                    style={{ width: `${member.progress}%` }}
                                  ></div>
                                </div>
                                <span className="admin-progress__text">
                                  {member.progress}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="admin-detail-surface mb-4">
              <Card.Body className="admin-detail-progress-card">
                <div className="admin-detail-progress-card__label">
                  {t("admin.projectDetail.totalProgress")}
                </div>
                <div className="admin-detail-progress-card__value">
                  {selectProject.progress}%
                </div>

                <ProgressBar
                  now={selectProject.progress}
                  variant={selectProject.progress === 100 ? "success" : "primary"}
                  style={{ height: "10px", borderRadius: "999px" }}
                />

                <div className="admin-detail-split">
                  <div className="admin-detail-split__item">
                    <div className="admin-detail-split__label">
                      {t("admin.projectDetail.items")}
                    </div>
                    <div className="admin-detail-split__value">
                      {selectProject.totalDataItems}
                    </div>
                  </div>
                  <div className="admin-detail-split__item">
                    <div className="admin-detail-split__label">
                      {t("admin.projectDetail.processed")}
                    </div>
                    <div className="admin-detail-split__value">
                      {selectProject.processedItems}
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="admin-detail-surface">
              <ul className="admin-info-list">
                <li className="admin-info-list__item">
                  <div className="admin-info-list__label">
                    <Calendar size={12} />
                    {t("admin.projectDetail.deadline")}
                  </div>
                  <div className="admin-info-list__value">
                    {new Date(selectProject.deadline).toLocaleDateString(localeTag)}
                  </div>
                </li>
                <li className="admin-info-list__item">
                  <div className="admin-info-list__label">
                    <User size={12} />
                    {t("admin.projectDetail.manager")}
                  </div>
                  <div className="admin-info-list__value">
                    {selectProject.managerName}
                  </div>
                  <div className="admin-info-list__subvalue">
                    {selectProject.managerEmail}
                  </div>
                </li>
              </ul>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default DetailProject;
