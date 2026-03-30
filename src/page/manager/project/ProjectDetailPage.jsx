import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Spinner,
  Badge,
} from "reactstrap";
import { toast } from "react-toastify";
import projectService from "../../../services/manager/project/projectService";
import ProjectsDatasetsPage from "../datasets/ProjectsDatasetsPage";
import ProjectAssignTask from "./ProjectAssignTask";
import DisputeTab from "./tabs/DisputeTab";
import ReviewAuditTab from "./tabs/ReviewAuditTab";
import "../../../assets/css/project-detail.css";

const ProjectDetailPage = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useSelector((state) => state.auth);
  const isAdminView = user?.role === "Admin";
  const [activeTab, setActiveTab] = useState("datasets");
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const localeTag = i18n.language?.startsWith("vi") ? "vi-VN" : "en-US";

  useEffect(() => {
    if (isAdminView) setActiveTab("datasets");
  }, [isAdminView, id]);

  useEffect(() => {
    const requestedTab = searchParams.get("tab");
    if (!requestedTab || isAdminView) {
      return;
    }

    if (["datasets", "assign", "disputes", "review"].includes(requestedTab)) {
      setActiveTab(requestedTab);
    }
  }, [isAdminView, searchParams]);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await projectService.getProjectById(id);
        setProject(res.data || null);
      } catch {
        toast.error(t("projectDetail.loadError"));
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, t]);

  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.set("tab", tab);
        return nextParams;
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner color="primary" />
        <p className="mt-2" style={{ color: "var(--pd-text-secondary)" }}>
          {t("projectDetail.loading")}
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center p-5" style={{ color: "var(--pd-text-muted)" }}>
        <i className="ri-folder-warning-line display-1 opacity-25"></i>
        <h5 className="mt-3">{t("projectDetail.notFound")}</h5>
        <button
          className="btn btn-primary mt-2"
          onClick={() =>
            navigate(isAdminView ? "/projects-overview" : "/projects-all-projects")
          }
        >
          {t("projectDetail.backToProjects")}
        </button>
      </div>
    );
  }

  const tabConfigFull = [
    { key: "datasets", icon: "ri-database-2-line", label: t("projectDetail.tabDatasets") },
    { key: "assign", icon: "ri-user-add-line", label: t("projectDetail.tabAssign") },
    { key: "disputes", icon: "ri-scales-3-line", label: t("projectDetail.tabDisputes") },
    { key: "review", icon: "ri-shield-check-line", label: t("projectDetail.tabReview") },
  ];
  const tabConfig = isAdminView
    ? tabConfigFull.filter((tab) => ["datasets"].includes(tab.key))
    : tabConfigFull;

  return (
    <>
      {}
      <div className="project-detail-header mb-3">
        {isAdminView && (
          <div className="alert alert-info py-2 px-3 mb-3 small" role="status">
            {t("projectDetail.adminReadOnly")}
          </div>
        )}
        <div className="project-detail-header-row d-flex align-items-center justify-content-between">
          <div className="project-detail-header-main d-flex align-items-center gap-3">
            <button
              className="btn-back"
              onClick={() =>
                navigate(
                  isAdminView ? "/projects-overview" : "/projects-all-projects",
                )
              }
              title={t("projectDetail.back")}
            >
              <i className="ri-arrow-left-line fs-5"></i>
            </button>
            <div className="project-detail-header-main-copy">
              <h4 className="project-name text-white">{project.name}</h4>
              <p className="project-desc">
                {project.description || t("projectDetail.noDescription")}
              </p>
            </div>
          </div>
          <div className="project-detail-header-meta d-flex align-items-center gap-2">
            <Badge
              className={`badge-status ${project.status !== "Expired" ? "badge-status-active" : ""}`}
              color={project.status === "Expired" ? "danger" : "success"}
            >
              {project.status === "Expired"
                ? t("statusCommon.expired")
                : t("statusCommon.active")}
            </Badge>
            {project.deadline && (
              <span className="badge-deadline">
                <i className="ri-calendar-line me-1"></i>
                {new Date(project.deadline).toLocaleDateString(localeTag)}
              </span>
            )}
          </div>
        </div>
      </div>

      {}
      <div className="project-detail-tabs-card">
        <Nav className="project-detail-tabs">
          {tabConfig.map((tab) => (
            <NavItem key={tab.key}>
              <NavLink
                className={activeTab === tab.key ? "active" : ""}
                onClick={() => toggleTab(tab.key)}
                title={tab.label}
                aria-label={tab.label}
              >
                <i className={tab.icon}></i>
                <span className="project-detail-tab-label">{tab.label}</span>
              </NavLink>
            </NavItem>
          ))}
        </Nav>
      </div>

      {}
      <div className="tab-content-area">
        <TabContent activeTab={activeTab}>
          <TabPane tabId="datasets">
            {activeTab === "datasets" && (
              <ProjectsDatasetsPage embeddedProjectId={id} readOnly={isAdminView} />
            )}
          </TabPane>
          <TabPane tabId="assign">
            {activeTab === "assign" && <ProjectAssignTask embeddedProjectId={id} />}
          </TabPane>
          <TabPane tabId="disputes">
            {activeTab === "disputes" && <DisputeTab projectId={id} />}
          </TabPane>
          <TabPane tabId="review">
            {activeTab === "review" && <ReviewAuditTab projectId={id} />}
          </TabPane>
        </TabContent>
      </div>
    </>
  );
};

export default ProjectDetailPage;
