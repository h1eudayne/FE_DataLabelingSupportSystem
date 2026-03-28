import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import ExportTab from "./tabs/ExportTab";


import "../../../assets/css/project-detail.css";

const ProjectDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const isAdminView = user?.role === "Admin";
  const [activeTab, setActiveTab] = useState("datasets");
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdminView) setActiveTab("datasets");
  }, [isAdminView, id]);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await projectService.getProjectById(id);
        setProject(res.data || null);
      } catch {
        toast.error(t("projectDetail.loadError", "Không thể tải dự án"));
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const toggleTab = (tab) => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner color="primary" />
        <p className="mt-2" style={{ color: "var(--pd-text-secondary)" }}>
          {t("projectDetail.loading", "Đang tải dự án...")}
        </p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center p-5" style={{ color: "var(--pd-text-muted)" }}>
        <i className="ri-folder-warning-line display-1 opacity-25"></i>
        <h5 className="mt-3">{t("projectDetail.notFound", "Không tìm thấy dự án")}</h5>
        <button
          className="btn btn-primary mt-2"
          onClick={() =>
            navigate(isAdminView ? "/projects-overview" : "/projects-all-projects")
          }
        >
          {t("projectDetail.backToProjects", "← Quay lại danh sách dự án")}
        </button>
      </div>
    );
  }

  const tabConfigFull = [
    { key: "datasets", icon: "ri-database-2-line", label: t("projectDetail.tabDatasets", "Datasets & Labels") },
    { key: "assign", icon: "ri-user-add-line", label: t("projectDetail.tabAssign", "Giao việc") },
    { key: "disputes", icon: "ri-scales-3-line", label: t("projectDetail.tabDisputes", "Tranh chấp") },
    { key: "review", icon: "ri-shield-check-line", label: t("projectDetail.tabReview", "Review Audit") },
    { key: "export", icon: "ri-file-download-line", label: t("projectDetail.tabExport", "Export") },
  ];
  const tabConfig = isAdminView
    ? tabConfigFull.filter((tab) => ["datasets", "export"].includes(tab.key))
    : tabConfigFull;

  return (
    <>
      {}
      <div className="project-detail-header mb-3">
        {isAdminView && (
          <div className="alert alert-info py-2 px-3 mb-3 small" role="status">
            {t(
              "projectDetail.adminReadOnly",
              "Chế độ xem dành cho Admin (BR-ADM-17). Không chỉnh sửa dự án (BR-ADM-18).",
            )}
          </div>
        )}
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
        <button
          className="btn-back"
          onClick={() =>
            navigate(isAdminView ? "/projects-overview" : "/projects-all-projects")
          }
              title={t("projectDetail.back", "Quay lại")}
            >
              <i className="ri-arrow-left-line fs-5"></i>
            </button>
            <div>
              <h4 className="project-name text-white">{project.name}</h4>
              <p className="project-desc">
                {project.description || t("projectDetail.noDescription", "Không có mô tả")}
              </p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <Badge
              className={`badge-status ${project.status !== "Expired" ? "badge-status-active" : ""}`}
              color={project.status === "Expired" ? "danger" : "success"}
            >
              {project.status === "Expired"
                ? t("statusCommon.expired", "Hết hạn")
                : t("statusCommon.active", "Đang hoạt động")}
            </Badge>
            {project.deadline && (
              <span className="badge-deadline">
                <i className="ri-calendar-line me-1"></i>
                {new Date(project.deadline).toLocaleDateString("vi-VN")}
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
              >
                <i className={tab.icon}></i>
                <span>{tab.label}</span>
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
          <TabPane tabId="export">
            {activeTab === "export" && <ExportTab projectId={id} project={project} />}
          </TabPane>
        </TabContent>
      </div>
    </>
  );
};

export default ProjectDetailPage;
