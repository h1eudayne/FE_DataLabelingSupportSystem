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
  Search,
} from "lucide-react";

const ProjectUserManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isSearching, setIsSearching] = useState(false);
  const { t } = useTranslation();

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

  const today = new Date();
  const pendingProjectsCount = projects.filter(
    (p) => p.progress < 100 && new Date(p.deadline) >= today,
  ).length;
  const completedProjectsCount = projects.filter(
    (p) => p.progress >= 100,
  ).length;
  const overdueProjectsCount = projects.filter(
    (p) => p.progress < 100 && new Date(p.deadline) < today,
  ).length;

  const statsConfig = [
    {
      label: t("admin.stats.totalProjects"),
      value: projects.length,
      icon: <Briefcase size={22} />,
      color: "primary",
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
            <Col key={index} xs={12} sm={6} lg={3}>
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
          <h5 className="mb-0 fw-bold text-dark">Danh sách dự án</h5>
          <InputGroup style={{ maxWidth: "300px" }} className="shadow-sm">
            <InputGroup.Text className="bg-white border-end-0">
              <Search size={18} className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              placeholder="Tìm tên dự án..."
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
                      <span className="text-muted">Đang tìm kiếm...</span>
                    </td>
                  </tr>
                ) : currentProjects.length > 0 ? (
                  currentProjects.map((project) => (
                    <tr key={project.id}>
                      <td className="ps-4 fw-bold">{project.name}</td>
                      <td>
                        <Badge
                          bg={
                            project.status === "Active"
                              ? "success"
                              : "secondary"
                          }
                        >
                          {project.status}
                        </Badge>
                      </td>
                      <td>
                        <div
                          className="d-flex align-items-center gap-2"
                          style={{ minWidth: "120px" }}
                        >
                          <div
                            className="progress flex-grow-1"
                            style={{ height: "6px" }}
                          >
                            <div
                              className="progress-bar bg-primary"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <small className="fw-medium">
                            {project.progress}%
                          </small>
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
                        >
                          <Eye size={18} />
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-info p-0 shadow-none"
                        >
                          <BarChart2 size={18} />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      Không tìm thấy dự án nào phù hợp với "{searchTerm}"
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>

          {totalPages > 1 && (
            <Card.Footer className="bg-white border-0 py-3 d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                Hiển thị {currentProjects.length} trên {filteredProjects.length}{" "}
                kết quả
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
