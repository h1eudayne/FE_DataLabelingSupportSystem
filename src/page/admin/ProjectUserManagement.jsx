import { useEffect, useMemo, useState } from "react";
import projectApi from "../../services/admin/managementUsers/project.api";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  Container,
  Form,
  InputGroup,
  Pagination,
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
    }

    setIsSearching(false);
    return undefined;
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
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) =>
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [projects, searchTerm],
  );

  const pendingProjectsCount = projects.filter(
    (project) => project.status === "In Process",
  ).length;
  const completedProjectsCount = projects.filter(
    (project) => project.status === "Completed",
  ).length;
  const overdueProjectsCount = projects.filter(
    (project) => project.status === "Expired",
  ).length;
  const newProjectsCount = projects.filter(
    (project) => project.status === "New",
  ).length;

  const statsConfig = [
    {
      label: t("admin.stats.totalProjects"),
      value: projects.length,
      icon: <Briefcase size={22} />,
      tone: "primary",
    },
    {
      label: t("admin.stats.new"),
      value: newProjectsCount,
      icon: <PlusCircle size={22} />,
      tone: "warning",
    },
    {
      label: t("admin.stats.pending"),
      value: pendingProjectsCount,
      icon: <Clock size={22} />,
      tone: "info",
    },
    {
      label: t("admin.stats.completed"),
      value: completedProjectsCount,
      icon: <CheckCircle size={22} />,
      tone: "success",
    },
    {
      label: t("admin.stats.overdue"),
      value: overdueProjectsCount,
      icon: <AlertCircle size={22} />,
      tone: "danger",
    },
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case "New":
        return "new";
      case "Completed":
        return "completed";
      case "Expired":
        return "expired";
      case "In Process":
        return "process";
      default:
        return "default";
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProjects = filteredProjects.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleViewDetail = (id) => {
    navigate(`/view-detail-project/${id}`);
  };

  if (loading) {
    return (
      <Container fluid className="admin-shell">
        <div className="admin-shell__inner">
          <div className="admin-loading-state">
            <div className="text-center">
              <Spinner animation="border" variant="primary" role="status" />
              <p className="mt-2 text-muted fw-medium">
                {t("adminSettings.loading")}
              </p>
            </div>
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
            <div className="admin-page-header__eyebrow">
              {t("navbar.projects-overview")}
            </div>
            <h1 className="admin-page-header__title">
              {t("admin.project.listTitle")}
            </h1>
            <p className="admin-page-header__subtitle">
              {t("admin.project.overviewSubtitle")}
            </p>
          </div>
          <div className="admin-page-header__meta admin-page-header__meta--compact">
            <div className="admin-page-header__chip admin-page-header__chip--compact">
              <Briefcase size={18} />
              <span>{projects.length}</span>
            </div>
            <div className="admin-page-header__chip admin-page-header__chip--compact">
              <CheckCircle size={18} />
              <span>{completedProjectsCount}</span>
            </div>
          </div>
        </section>

        <section className="admin-overview-stats">
          {statsConfig.map((stat) => (
            <Card className="admin-overview-stat" key={stat.label}>
              <Card.Body className="p-0">
                <div className="admin-overview-stat__top">
                  <div
                    className={`admin-overview-stat__icon admin-tone admin-tone--${stat.tone}`}
                  >
                    {stat.icon}
                  </div>
                  <div className="admin-overview-stat__content">
                    <div className="admin-overview-stat__label">{stat.label}</div>
                    <div className="admin-overview-stat__value">{stat.value}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </section>

        <section className="admin-section-card">
          <div className="admin-section-card__header">
            <div className="admin-toolbar">
              <div className="admin-toolbar__group">
                <h2 className="admin-section-card__title">
                  {t("admin.project.listTitle")}
                </h2>
                <p className="admin-section-card__description">
                  {t("admin.project.paginationInfo", {
                    current: currentProjects.length,
                    total: filteredProjects.length,
                  })}
                </p>
              </div>
              <div className="admin-toolbar__actions">
                <InputGroup className="admin-search-group">
                  <InputGroup.Text>
                    <Search size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder={t("admin.project.searchPlaceholder")}
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </InputGroup>
              </div>
            </div>
          </div>

          <div className="admin-section-card__body">
            <div className="admin-table-shell d-none d-lg-block">
              <div className="admin-table-scroll admin-table">
                <Table responsive hover className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th>{t("admin.project.name")}</th>
                      <th>{t("admin.project.status")}</th>
                      <th>{t("admin.project.progress")}</th>
                      <th>{t("admin.project.members")}</th>
                      <th className="text-end">{t("admin.project.actions")}</th>
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
                        <td colSpan="5" className="text-center py-5 text-muted">
                          <Spinner
                            animation="border"
                            variant="primary"
                            size="sm"
                            className="me-2"
                          />
                          {t("admin.project.searching")}
                        </td>
                      </tr>
                    ) : currentProjects.length > 0 ? (
                      currentProjects.map((project) => (
                        <tr key={project.id}>
                          <td>
                            <div className="admin-table-user">
                              <div className="admin-table-user__avatar">
                                {project.name?.charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="admin-table-user__title text-break">
                                  {project.name}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`admin-status-pill admin-status-pill--${getStatusBadge(project.status)}`}
                            >
                              {project.status}
                            </span>
                          </td>
                          <td>
                            <div className="admin-progress">
                              <div className="admin-progress__track">
                                <div
                                  className="admin-progress__fill"
                                  style={{ width: `${project.progress}%` }}
                                ></div>
                              </div>
                              <span className="admin-progress__text">
                                {project.progress}%
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className="admin-badge admin-badge--neutral">
                              {project.totalMembers} {t("admin.project.members")}
                            </span>
                          </td>
                          <td className="text-end">
                            <div className="admin-row-actions">
                              <Button
                                variant="light"
                                size="sm"
                                className="admin-row-action-btn admin-row-action-btn--primary"
                                onClick={() => handleViewDetail(project.id)}
                                title={t("admin.project.viewDetail")}
                              >
                                <Eye size={16} />
                              </Button>
                              <Button
                                variant="light"
                                size="sm"
                                className="admin-row-action-btn admin-row-action-btn--info"
                                onClick={() =>
                                  navigate(
                                    `/view-detail-project/${project.id}?tab=statistics`,
                                  )
                                }
                                title={t("admin.project.statistics")}
                              >
                                <BarChart2 size={16} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center py-5 text-muted">
                          {searchTerm
                            ? t("admin.project.noResult", { searchTerm })
                            : t("common.noData")}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </div>

            <div className="admin-mobile-list d-lg-none">
              {isSearching ? (
                <div className="admin-mobile-card text-center text-muted">
                  <Spinner
                    animation="border"
                    variant="primary"
                    size="sm"
                    className="me-2"
                  />
                  {t("admin.project.searching")}
                </div>
              ) : currentProjects.length > 0 ? (
                currentProjects.map((project) => (
                  <article className="admin-mobile-card" key={project.id}>
                    <div className="admin-mobile-card__top">
                      <div className="admin-table-user">
                        <div className="admin-table-user__avatar">
                          {project.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="admin-table-user__title text-break">
                            {project.name}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`admin-status-pill admin-status-pill--${getStatusBadge(project.status)}`}
                      >
                        {project.status}
                      </span>
                    </div>

                    <div className="admin-mobile-card__meta">
                      <div>
                        <div className="admin-mobile-card__label">
                          {t("admin.project.progress")}
                        </div>
                        <div className="admin-progress mt-2">
                          <div className="admin-progress__track">
                            <div
                              className="admin-progress__fill"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                          <span className="admin-progress__text">
                            {project.progress}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="admin-mobile-card__label">
                          {t("admin.project.members")}
                        </div>
                        <div className="admin-mobile-card__value">
                          {project.totalMembers}
                        </div>
                      </div>
                    </div>

                    <div className="admin-mobile-card__actions">
                      <Button
                        variant="light"
                        className="admin-row-action-btn admin-row-action-btn--primary"
                        onClick={() => handleViewDetail(project.id)}
                      >
                        <Eye size={16} />
                        <span>{t("admin.project.viewDetail")}</span>
                      </Button>
                      <Button
                        variant="light"
                        className="admin-row-action-btn admin-row-action-btn--info"
                        onClick={() =>
                          navigate(`/view-detail-project/${project.id}?tab=statistics`)
                        }
                      >
                        <BarChart2 size={16} />
                        <span>{t("admin.project.statistics")}</span>
                      </Button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="admin-mobile-card text-center text-muted">
                  {searchTerm
                    ? t("admin.project.noResult", { searchTerm })
                    : t("common.noData")}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="admin-pagination-wrap">
                <div className="admin-pagination-summary">
                  {t("admin.project.paginationInfo", {
                    current: currentProjects.length,
                    total: filteredProjects.length,
                  })}
                </div>
                <Pagination className="admin-pagination mb-0">
                  <Pagination.Prev
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  />
                  {[...Array(totalPages)].map((_, index) => (
                    <Pagination.Item
                      key={index + 1}
                      active={index + 1 === currentPage}
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  />
                </Pagination>
              </div>
            )}
          </div>
        </section>
      </div>
    </Container>
  );
};

export default ProjectUserManagement;
