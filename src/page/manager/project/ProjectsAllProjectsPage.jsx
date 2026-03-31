import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FolderKanban,
  FolderCheck,
  FolderClock,
  ScanSearch,
  Plus,
  Search,
} from "lucide-react";
import { fetchProjects } from "../../../store/manager/project/projectSlice";
import projectService from "../../../services/manager/project/projectService";
import Swal from "sweetalert2";
import ProjectCard from "../../../components/manager/project/ProjectCard";
import StatCard from "../../../components/manager/analytics/StatCard";

const ProjectsAllProjectsPage = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { items, loading } = useSelector((state) => state.projects);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  const filteredProjects = items?.filter((project) => {
    const matchesSearch = project.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "All" ||
      (filterStatus === "Active" && project.status === "Active") ||
      (filterStatus === "Expired" && project.status === "Expired");
    return matchesSearch && matchesStatus;
  });
  const totalProjects = items?.length || 0;
  const activeProjects =
    items?.filter((project) => project.status === "Active").length || 0;
  const expiredProjects =
    items?.filter((project) => project.status === "Expired").length || 0;
  const visibleProjects = filteredProjects?.length || 0;

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: t("allProjects.confirmDelete"),
      text: t("allProjects.deleteWarning"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f06548",
      confirmButtonText: t("allProjects.confirmBtn"),
      cancelButtonText: t("allProjects.cancelBtn"),
    });

    if (result.isConfirmed) {
      try {
        await projectService.deleteProject(id);
        Swal.fire(t("allProjects.deleted"), t("allProjects.deletedMsg"), "success");
        dispatch(fetchProjects());
      } catch (error) {
        Swal.fire(t("allProjects.deleteError"), t("allProjects.deleteErrorMsg"), error);
      }
    }
  };

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">{t("allProjects.title")}</h4>
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <Link to="#">{t("allProjects.breadcrumbProjects")}</Link>
                </li>
                <li className="breadcrumb-item active">{t("allProjects.breadcrumbList")}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm overflow-hidden">
            <div className="card-body">
              <div className="row g-4 align-items-center">
                <div className="col-xl-4">
                  <div className="d-flex align-items-start gap-3">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-4 shadow-sm flex-shrink-0"
                      style={{
                        width: "4rem",
                        height: "4rem",
                        background:
                          "linear-gradient(135deg, rgba(64,81,137,0.14), rgba(41,156,219,0.2))",
                      }}
                    >
                      <FolderKanban size={24} className="text-primary" strokeWidth={2.2} />
                    </div>
                    <div>
                      <span className="badge bg-soft-primary text-primary mb-2 small">
                        {t("allProjects.managerView")}
                      </span>
                      <h5 className="mb-2 fw-semibold">{t("allProjects.totalProjects")}</h5>
                      <p className="text-muted mb-0 small">
                        {t("allProjects.pageDescription")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-xl-8">
                  <div className="row g-3">
                    <div className="col-sm-6 col-xl-3">
                      <StatCard
                        title={t("allProjects.totalProjects")}
                        value={totalProjects}
                        icon={FolderKanban}
                        color="primary"
                      />
                    </div>
                    <div className="col-sm-6 col-xl-3">
                      <StatCard
                        title={t("allProjects.active")}
                        value={activeProjects}
                        icon={FolderCheck}
                        color="success"
                      />
                    </div>
                    <div className="col-sm-6 col-xl-3">
                      <StatCard
                        title={t("allProjects.expired")}
                        value={expiredProjects}
                        icon={FolderClock}
                        color="warning"
                      />
                    </div>
                    <div className="col-sm-6 col-xl-3">
                      <StatCard
                        title={t("allProjects.visibleResults")}
                        value={visibleProjects}
                        icon={ScanSearch}
                        color="info"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-lg-5">
              <label className="form-label text-muted small fw-semibold mb-2">
                {t("allProjects.searchPlaceholder")}
              </label>
              <div className="position-relative">
                <Search
                  size={18}
                  className="text-muted position-absolute top-50 start-0 translate-middle-y ms-3"
                />
                <input
                  type="text"
                  className="form-control ps-5"
                  placeholder={t("allProjects.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-sm-6 col-lg-3">
              <label className="form-label text-muted small fw-semibold mb-2">
                {t("allProjects.allStatus")}
              </label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">{t("allProjects.allStatus")}</option>
                <option value="Active">{t("allProjects.active")}</option>
                <option value="Expired">{t("allProjects.expired")}</option>
              </select>
            </div>
            <div className="col-sm-6 col-lg-4 d-flex justify-content-lg-end">
              <Link
                to="/projects-create"
                className="btn btn-primary d-inline-flex align-items-center gap-2 px-3"
              >
                <Plus size={16} />
                {t("allProjects.createNew")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {loading ? (
          <div className="col-12 text-center p-5">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="mt-2 text-muted">{t("allProjects.loadingList")}</div>
          </div>
        ) : filteredProjects && filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="col-12">
            <div className="card py-5 text-center">
              <div className="card-body">
                <i className="ri-folder-open-line display-4 text-muted"></i>
                <h5 className="mt-3">{t("allProjects.noProjects")}</h5>
                <p className="text-muted">
                  {t("allProjects.noProjectsHint")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectsAllProjectsPage;
