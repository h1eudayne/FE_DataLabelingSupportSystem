import { useEffect, useMemo, useState } from "react";
import projectApi from "../../services/admin/managementUsers/project.api";
import { useTranslation } from "react-i18next";
import {
  Badge,
  Button,
  Card,
  Col,
  Form,
  InputGroup,
  Pagination,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import {
  AlertCircle,
  BarChart2,
  Briefcase,
  CheckCircle,
  Clock,
  Eye,
  PlusCircle,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProjectUserManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isSearching, setIsSearching] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setIsSearching(true);
      const handler = setTimeout(() => {
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(handler);
    } else {
      setIsSearching(false);
    }
  }, [searchTerm]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await projectApi.getAllProjectsUser();
      if (res.data) {
        setProjects(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = useMemo(() => {
    return projects.filter((p) =>
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [projects, searchTerm]);

  const pendingProjectsCount = projects.filter(
    (p) => p.status === "In Process",
  ).length;
  const completedProjectsCount = projects.filter(
    (p) => p.status === "Completed",
  ).length;
  const overdueProjectsCount = projects.filter(
    (p) => p.status === "Expired",
  ).length;
  const newProjectsCount = projects.filter((p) => p.status === "New").length;

  const statsConfig = [
    {
      label: t("admin.stats.totalProjects"),
      value: projects.length,
      icon: <Briefcase size={22} />,
      color: "primary",
    },
    {
      label: t("admin.stats.new"),
      value: newProjectsCount,
      icon: <PlusCircle size={22} />,
      color: "warning",
    },
    {
      label: t("admin.stats.pending"),
      value: pendingProjectsCount,
      icon: <Clock size={22} />,
      color: "info",
    },
    {
      label: t("admin.stats.completed"),
      value: completedProjectsCount,
      icon: <CheckCircle size={22} />,
      color: "success",
    },
    {
      label: t("admin.stats.overdue"),
      value: overdueProjectsCount,
      icon: <AlertCircle size={22} />,
      color: "danger",
    },
  ];

  const getProgressVariant = (progress) => {
    if (progress >= 100) return "success";
    if (progress >= 50) return "primary";
    if (progress >= 20) return "warning";
    return "danger";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "New":
        return { bg: "primary", label: "New" };
      case "Completed":
        return { bg: "success", label: "Completed" };
      case "Expired":
        return { bg: "danger", label: "Expired" };
      case "In Process":
        return { bg: "warning", label: "In Process" };
      default:
        return { bg: "secondary", label: status };
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = filteredProjects.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleViewDetail = (id) => {
    navigate(`/view-detail-project/${id}`);
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" role="status" />
          <p className="mt-2 text-muted fw-medium">
            {t("adminSettings.loading")}
          </p>
        </div>
      </div>
    );
  }
  return (
    <>
      <div className="p-3">
        <Row className="mb-4 g-3">
          {statsConfig.map((stat, index) => (
            <Col
              key={index}
              xs={12}
              sm={6}
              md={4}
              className="col-lg-custom"
              style={{ flex: "0 0 auto", width: "20%" }}
            >
              <Card
                className="border-0 shadow-sm"
                style={{ borderRadius: "12px" }}
              >
                <Card.Body className="d-flex align-items-center p-3">
                  <div
                    className={`rounded-circle p-3 bg-${stat.color} bg-opacity-10 text-${stat.color} me-3 d-flex align-items-center justify-content-center`}
                    style={{ width: "50px", height: "50px" }}
                  >
                    {stat.icon}
                  </div>
                  <div>
                    <h6
                      className="text-muted mb-1 small uppercase fw-bold"
                      style={{ letterSpacing: "0.5px" }}
                    >
                      {stat.label}
                    </h6>
                    <h4 className="mb-0 fw-bold">{stat.value}</h4>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <h5 className="mb-0 fw-bold text-dark">
            {t("admin.project.listTitle")}
          </h5>
          <InputGroup style={{ maxWidth: "300px" }} className="shadow-sm">
            <InputGroup.Text className="bg-white border-end-0">
              <Search size={18} className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              placeholder={t("admin.project.searchPlaceholder")}
              className="border-start-0 ps-0"
              value={searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>
        </div>

        <Card className="border-0 shadow-sm" style={{ borderRadius: "15px" }}>
          <Card.Body className="p-0">
            <Table responsive hover className="align-middle mb-0">
              <thead className="bg-light text-muted">
                <tr>
                  <th className="ps-4 py-3">{t("admin.project.name")}</th>
                  <th>{t("admin.project.status")}</th>
                  <th>{t("admin.project.progress")}</th>
                  <th>{t("admin.project.members")}</th>
                  <th className="text-center">{t("admin.project.actions")}</th>
                </tr>
              </thead>
              <tbody
                style={{
                  opacity: isSearching ? 0.5 : 1,
                  transition: "opacity 0.2s",
                }}
              >
                {isSearching ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <Spinner
                        animation="border"
                        variant="primary"
                        size="sm"
                        className="me-2"
                      />
                      <span className="text-muted">
                        {t("admin.project.searching")}
                      </span>
                    </td>
                  </tr>
                ) : currentProjects.length > 0 ? (
                  currentProjects.map((project) => {
                    const statusInfo = getStatusBadge(project.status);
                    return (
                      <tr key={project.id}>
                        <td className="ps-4 fw-bold">{project.name}</td>
                        <td>
                          <Badge
                            bg={statusInfo.bg}
                            className={
                              statusInfo.bg === "warning" ? "text-dark" : ""
                            }
                            style={{ padding: "6px 12px", borderRadius: "6px" }}
                          >
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td>
                          <div style={{ minWidth: "160px" }}>
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <small
                                className={`fw-bold text-${getProgressVariant(project.progress)}`}
                              >
                                {typeof project.progress === "number"
                                  ? project.progress.toFixed(1)
                                  : parseFloat(project.progress || 0).toFixed(
                                      1,
                                    )}
                                %
                              </small>
                            </div>

                            <div
                              className="progress"
                              style={{ height: "8px", borderRadius: "10px" }}
                            >
                              <div
                                className={`progress-bar bg-${getProgressVariant(project.progress)}`}
                                role="progressbar"
                                style={{ width: `${project.progress}%` }}
                                aria-valuenow={project.progress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {project.totalMembers} {t("admin.project.members")}
                        </td>
                        <td className="text-center">
                          <Button
                            variant="link"
                            size="sm"
                            className="text-primary p-0 me-2 shadow-none"
                            onClick={() => handleViewDetail(project.id)}
                          >
                            <Eye size={18} />
                          </Button>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-info p-0 shadow-none"
                            onClick={() =>
                              navigate(
                                `/view-detail-project/${project.id}?tab=statistics`,
                              )
                            }
                            title={t("admin.project.statistics", {
                              defaultValue: "View Statistics",
                            })}
                          >
                            <BarChart2 size={18} />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      {t("admin.project.noResult", { searchTerm: searchTerm })}
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>

          {totalPages > 1 && (
            <Card.Footer className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                {t("admin.project.paginationInfo", {
                  current: currentProjects.length,
                  total: filteredProjects.length,
                })}
              </div>
              <Pagination className="mb-0">
                <Pagination.Prev
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                />
                {[...Array(totalPages)].map((_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                />
              </Pagination>
            </Card.Footer>
          )}
        </Card>
      </div>
    </>
  );
};

export default ProjectUserManagement;
