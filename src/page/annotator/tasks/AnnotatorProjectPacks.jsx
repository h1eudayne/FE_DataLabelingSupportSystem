import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import taskService from "../../../services/annotator/labeling/taskService";
import projectService from "../../../services/annotator/labeling/projectService";
import { toast } from "react-toastify";
import useSignalRRefresh from "../../../hooks/useSignalRRefresh";
import { useTranslation } from "react-i18next";

const PACK_SIZE = 50;

const AnnotatorProjectPacks = () => {
  const { t } = useTranslation();
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [projectInfo, setProjectInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [projectRes, imgRes] = await Promise.all([
        projectService.getById(assignmentId),
        taskService.getProjectImages(assignmentId),
      ]);

      const projectData = projectRes.data || projectRes;
      setProjectInfo(projectData);

      const allImages = imgRes.data || imgRes || [];
      setImages(allImages);
    } catch (err) {
      console.error(err);
      toast.error(t("annotatorPacks.loadError"));
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  
  useSignalRRefresh(fetchData);

  const packs = useMemo(() => {
    const result = [];
    for (let i = 0; i < images.length; i += PACK_SIZE) {
      const packImages = images.slice(i, i + PACK_SIZE);
      const completed = packImages.filter(
        (img) => img.status === "Submitted" || img.status === "Approved",
      ).length;
      const inProgress = packImages.filter(
        (img) => img.status === "InProgress",
      ).length;
      result.push({
        index: result.length,
        startIdx: i,
        endIdx: Math.min(i + PACK_SIZE, images.length),
        total: packImages.length,
        completed,
        inProgress,
        progress:
          packImages.length > 0
            ? Math.round((completed / packImages.length) * 100)
            : 0,
      });
    }
    return result;
  }, [images]);

  const totalCompleted = images.filter(
    (img) => img.status === "Submitted" || img.status === "Approved",
  ).length;
  const totalProgress =
    images.length > 0 ? Math.round((totalCompleted / images.length) * 100) : 0;

  const getPackStatusColor = (pack) => {
    if (pack.progress === 100) return "success";
    if (pack.inProgress > 0 || pack.completed > 0) return "warning";
    return "info";
  };

  const getPackStatusLabel = (pack) => {
    if (pack.progress === 100) return t("annotatorPacks.statusDone");
    if (pack.inProgress > 0 || pack.completed > 0) return t("annotatorPacks.statusInProgress");
    return t("annotatorPacks.statusNotStarted");
  };

  const handleOpenPack = (pack) => {
    navigate(
      `/workplace-labeling-task/${assignmentId}?packStart=${pack.startIdx}&packEnd=${pack.endIdx}`,
    );
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: 400 }}
      >
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  return (
    <div className="container-fluid">
      {}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <button
            className="btn btn-sm btn-outline-secondary me-3"
            onClick={() => navigate("/annotator-my-tasks")}
          >
            <i className="ri-arrow-left-line me-1"></i> {t("annotatorPacks.back")}
          </button>
        </div>
      </div>

      {}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-md-6">
              <h4 className="fw-bold mb-1">
                <i className="ri-folder-3-line me-2 text-primary"></i>
                {projectInfo?.projectName || t("annotatorPacks.project")}
              </h4>
              {projectInfo?.description && (
                <p className="text-muted mb-0 small">
                  {projectInfo.description}
                </p>
              )}
            </div>
            <div className="col-md-6">
              <div className="d-flex align-items-center gap-4 justify-content-md-end">
                <div className="text-center">
                  <h3 className="fw-bold text-primary mb-0">{images.length}</h3>
                  <small className="text-muted">{t("annotatorPacks.totalImages")}</small>
                </div>
                <div className="text-center">
                  <h3 className="fw-bold text-success mb-0">
                    {totalCompleted}
                  </h3>
                  <small className="text-muted">{t("annotatorPacks.completed")}</small>
                </div>
                <div className="text-center">
                  <h3 className="fw-bold text-warning mb-0">{packs.length}</h3>
                  <small className="text-muted">{t("annotatorPacks.totalPacks")}</small>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="d-flex justify-content-between small mb-1">
              <span className="fw-semibold">{t("annotatorPacks.overallProgress")}</span>
              <span className="fw-bold text-primary">
                {totalProgress}% ({totalCompleted}/{images.length} {t("annotatorPacks.images")})
              </span>
            </div>
            <div className="progress" style={{ height: 10 }}>
              <div
                className={`progress-bar bg-${totalProgress === 100 ? "success" : "primary"}`}
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {}
      <h5 className="fw-bold mb-3">
        <i className="ri-stack-line me-2"></i>{t("annotatorPacks.packList")} ({packs.length}{" "}
        {t("annotatorPacks.pack")})
      </h5>

      {packs.length === 0 ? (
        <div className="alert alert-info">
          <i className="ri-information-line me-2"></i>
          {t("annotatorPacks.noImages")}
        </div>
      ) : (
        <div className="row">
          {packs.map((pack) => (
            <div className="col-xl-3 col-lg-4 col-md-6 mb-4" key={pack.index}>
              <div
                className="card h-100 shadow-sm border-0"
                style={{
                  transition: "transform 0.2s, box-shadow 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 25px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }}
                onClick={() => handleOpenPack(pack)}
              >
                <div
                  className={`card-header bg-${getPackStatusColor(pack)} bg-opacity-10 border-0`}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="fw-bold mb-0">
                      <i className="ri-image-2-line me-2"></i>
                      Pack {pack.index + 1}
                    </h6>
                    <span className={`badge bg-${getPackStatusColor(pack)}`}>
                      {getPackStatusLabel(pack)}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3">
                    <div>
                      <small className="text-muted d-block">{t("annotatorPacks.imageLabel")}</small>
                      <span className="fw-bold">
                        {pack.startIdx + 1} – {pack.endIdx}
                      </span>
                    </div>
                    <div className="text-end">
                      <small className="text-muted d-block">{t("annotatorPacks.total")}</small>
                      <span className="fw-bold">{pack.total} {t("annotatorPacks.images")}</span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span>{t("annotatorTasks.progress")}</span>
                      <span className="fw-semibold">
                        {pack.completed}/{pack.total} ({pack.progress}%)
                      </span>
                    </div>
                    <div className="progress" style={{ height: 6 }}>
                      <div
                        className={`progress-bar bg-${getPackStatusColor(pack)}`}
                        style={{ width: `${pack.progress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    className={`btn w-100 btn-${pack.progress === 100 ? "outline-success" : "primary"}`}
                  >
                    {pack.progress === 100 ? (
                      <>
                        <i className="ri-eye-line me-1"></i> {t("annotatorPacks.reviewBtn")}
                      </>
                    ) : pack.inProgress > 0 || pack.completed > 0 ? (
                      <>
                        <i className="ri-play-line me-1"></i> {t("annotatorPacks.continueBtn")}
                      </>
                    ) : (
                      <>
                        <i className="ri-play-circle-line me-1"></i> {t("annotatorPacks.startBtn")}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnnotatorProjectPacks;
