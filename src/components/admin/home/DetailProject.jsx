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
  ListGroup,
  Spinner,
} from "react-bootstrap";
import { ArrowLeft, Calendar, User, Users, Info } from "lucide-react";

const DetailProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectProject, setSelectProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await projectApi.getProjectById(id);
      if (res.data) setSelectProject(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (!selectProject)
    return <div className="p-5 text-center">{t("admin.project.noResult")}</div>;

  return (
    <Container fluid className="p-4 bg-light min-vh-100">
      {/* Header */}
      <div className="d-flex align-items-center mb-4">
        <Button
          variant="outline-secondary"
          onClick={() => navigate(-1)}
          className="me-3 shadow-sm bg-white d-flex align-items-center justify-content-center"
          style={{ width: "40px", height: "40px", border: "1px solid #dee2e6" }}
        >
          <ArrowLeft size={20} color="#333" />
        </Button>
        <div>
          <h3 className="mb-0 fw-bold text-dark">{selectProject.name}</h3>
          <div className="d-flex gap-2 mt-1">
            <Badge bg="info" className="fw-normal text-dark">
              {t("admin.projectDetail.type")}:{" "}
              {selectProject.allowGeometryTypes}
            </Badge>
          </div>
        </div>
      </div>

      <Row>
        <Col lg={8}>
          {/* Project Description */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <h6 className="fw-bold mb-3 text-primary d-flex align-items-center">
                <Info size={18} className="me-2" />{" "}
                {t("admin.projectDetail.description")}
              </h6>
              <div
                className="p-3 bg-light rounded-3 text-secondary"
                style={{ fontSize: "14px" }}
              >
                {selectProject.description ||
                  t("admin.projectDetail.noDescription")}
              </div>
            </Card.Body>
          </Card>

          {/* Member Performance Table */}
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <h6 className="fw-bold mb-3 text-primary d-flex align-items-center">
                <Users size={18} className="me-2" />{" "}
                {t("admin.projectDetail.memberPerformance")}
              </h6>
              <Table responsive hover className="align-middle border-top">
                <thead>
                  <tr className="text-muted small">
                    <th className="border-0">
                      {t("admin.projectDetail.tableMember")}
                    </th>
                    <th className="border-0 text-center">
                      {t("admin.projectDetail.tableRole")}
                    </th>
                    <th className="border-0 text-center">
                      {t("admin.projectDetail.tableTasks")}
                    </th>
                    <th className="border-0">
                      {t("admin.projectDetail.tableProgress")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectProject.members?.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <div className="fw-bold text-dark">
                          {member.fullName}
                        </div>
                        <div
                          className="text-muted"
                          style={{ fontSize: "12px" }}
                        >
                          {member.email}
                        </div>
                      </td>
                      <td className="text-center">
                        <Badge
                          bg={member.role === "Reviewer" ? "info" : "light"}
                          className="text-dark border"
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
                        <div className="d-flex align-items-center gap-2">
                          <ProgressBar
                            now={member.progress}
                            className="flex-grow-1"
                            style={{ height: "6px" }}
                          />
                          <small className="fw-bold">{member.progress}%</small>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Sidebar Info */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h6 className="small fw-bold text-muted text-uppercase mb-3">
                {t("admin.projectDetail.totalProgress")}
              </h6>

              <div className="d-flex align-items-end gap-2 mb-2">
                <h1
                  className={`display-5 fw-bold mb-0 ${selectProject.progress === 100 ? "text-success" : "text-primary"}`}
                >
                  {selectProject.progress}%
                </h1>
              </div>

              <ProgressBar
                now={selectProject.progress}
                variant={selectProject.progress === 100 ? "success" : "primary"}
                className="bg-light"
                style={{ height: "10px", borderRadius: "5px" }}
              />

              <Row className="mt-4 g-0 border-top pt-3 text-center">
                <Col>
                  <div className="small text-muted">
                    {t("admin.projectDetail.items")}
                  </div>
                  <div className="fw-bold fs-5 text-dark">
                    {selectProject.totalDataItems}
                  </div>
                </Col>
                <Col className="border-start">
                  <div className="small text-muted">
                    {t("admin.projectDetail.processed")}
                  </div>
                  <div
                    className={`fw-bold fs-5 ${selectProject.progress === 100 ? "text-success" : "text-dark"}`}
                  >
                    {selectProject.processedItems}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <ListGroup variant="flush">
              <ListGroup.Item className="p-3">
                <div
                  className="text-muted small mb-1 uppercase fw-bold"
                  style={{ fontSize: "11px" }}
                >
                  <Calendar size={12} className="me-1" />{" "}
                  {t("admin.projectDetail.deadline")}
                </div>
                <div className="fw-bold">
                  {new Date(selectProject.deadline).toLocaleDateString("vi-VN")}
                </div>
              </ListGroup.Item>
              <ListGroup.Item className="p-3">
                <div
                  className="text-muted small mb-1 uppercase fw-bold"
                  style={{ fontSize: "11px" }}
                >
                  <User size={12} className="me-1" />{" "}
                  {t("admin.projectDetail.manager")}
                </div>
                <div className="fw-bold text-primary">
                  {selectProject.managerName}
                </div>
                <div className="small text-muted text-truncate">
                  {selectProject.managerEmail}
                </div>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DetailProject;
