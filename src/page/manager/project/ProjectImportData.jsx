import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import projectService from "../../../services/manager/project/projectService";
import taskService from "../../../services/manager/project/taskService";
import { userService } from "../../../services/manager/project/userService";
import Swal from "sweetalert2";

const CreateProject = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [annotators, setAnnotators] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReviewer, setSelectedReviewer] = useState("");

  const [projectData, setProjectData] = useState({
    name: "",
    description: "Dự án mới khởi tạo",
    allowGeometryTypes: "BoundingBox",
    deadline: "",
  });
  const [labels] = useState([{ name: "", color: "#0ab39c", guideLine: "N/A" }]);
  const [urlInput, setUrlInput] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userService.getUsers();
        const rawData = res.data?.items || res.data || [];
        if (Array.isArray(rawData)) {
          setAnnotators(rawData.filter((u) => u.role === "Annotator"));
          setReviewers(rawData.filter((u) => u.role === "Reviewer"));
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const urlArray = urlInput
      .split("\n")
      .map((u) => u.trim())
      .filter((u) => u !== "");

    if (selectedUsers.length === 0)
      return Swal.fire(t("projectImport.error"), t("projectImport.errorSelectUser"), "warning");
    if (!selectedReviewer)
      return Swal.fire(t("projectImport.error"), t("projectImport.errorSelectReviewer"), "warning");
    if (urlArray.length === 0)
      return Swal.fire(t("projectImport.error"), t("projectImport.errorInputUrl"), "warning");

    setLoading(true);
    try {
      const projectPayload = {
        ...projectData,
        labelClasses: labels.filter((l) => l.name.trim() !== ""),
      };
      const projRes = await projectService.createProject(projectPayload);
      const projectId = projRes.data?.projectId;

      await projectService.importData(projectId, urlArray);

      const quantityPerPerson = Math.floor(
        urlArray.length / selectedUsers.length,
      );
      const remain = urlArray.length % selectedUsers.length;

      for (let i = 0; i < selectedUsers.length; i++) {
        const finalQuantity =
          i === selectedUsers.length - 1
            ? quantityPerPerson + remain
            : quantityPerPerson;

        await taskService.assignTask({
          projectId: projectId,
          annotatorId: selectedUsers[i],
          quantity: finalQuantity,
          reviewerId: selectedReviewer,
        });
      }

      await Swal.fire(
        t("projectImport.success"),
        t("projectImport.successMsg", { count: urlArray.length, users: selectedUsers.length }),
        "success",
      );
      navigate("/projects-all-projects");
    } catch (error) {
      console.error("Error:", error);
      Swal.fire(
        t("projectImport.error"),
        error.response?.data?.message || t("projectImport.errorProcess"),
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="row g-4 d-flex align-items-stretch">
          <div className="col-lg-7">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-header bg-primary py-3">
                <h6 className="mb-0 text-white">{t("projectImport.configTitle")}</h6>
              </div>
              <div className="card-body d-flex flex-column text-start">
                <div className="mb-3">
                  <label className="form-label fw-bold">{t("projectImport.projectName")}</label>
                  <input
                    type="text"
                    className="form-control"
                    onChange={(e) =>
                      setProjectData({ ...projectData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="row mb-3">
                  <div className="col-6">
                    <label className="form-label fw-bold">{t("projectImport.type")}</label>
                    <select
                      className="form-select"
                      onChange={(e) =>
                        setProjectData({
                          ...projectData,
                          allowGeometryTypes: e.target.value,
                        })
                      }
                    >
                      <option value="BoundingBox">Bounding Box</option>
                      <option value="Polygon">Polygon</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label fw-bold">{t("projectImport.deadline")}</label>
                    <input
                      type="date"
                      className="form-control"
                      onChange={(e) =>
                        setProjectData({
                          ...projectData,
                          deadline: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="flex-grow-1 d-flex flex-column">
                  <label className="form-label fw-bold">
                    {t("projectImport.urlList")} (
                    {urlInput.split("\n").filter((x) => x).length})
                  </label>
                  <textarea
                    className="form-control flex-grow-1"
                    style={{ minHeight: "300px" }}
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card h-100 border-0 shadow-sm d-flex flex-column">
              <div className="card-header bg-dark py-3">
                <h6 className="mb-0 text-white">{t("projectImport.assignTitle")}</h6>
              </div>
              <div className="card-body d-flex flex-column text-start">
                <div className="mb-3">
                  <label className="form-label fw-bold">{t("projectImport.reviewer")}</label>
                  <select
                    className="form-select"
                    value={selectedReviewer}
                    onChange={(e) => setSelectedReviewer(e.target.value)}
                  >
                    <option value="">
                      {t("projectImport.selectReviewer")} ({reviewers.length}) --
                    </option>
                    {reviewers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName || u.userName} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
                <input
                  type="text"
                  className="form-control mb-3"
                  placeholder={t("projectImport.searchAnnotator")}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div
                  className="flex-grow-1 overflow-auto border rounded bg-light p-2"
                  style={{ maxHeight: "400px" }}
                >
                  {annotators
                    .filter((u) =>
                      (u.fullName || u.userName || "")
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
                    )
                    .map((user) => (
                      <div
                        key={user.id}
                        className={`p-3 mb-2 rounded border d-flex align-items-center ${selectedUsers.includes(user.id) ? "bg-soft-primary border-primary" : "bg-white"}`}
                        onClick={() =>
                          setSelectedUsers((prev) =>
                            prev.includes(user.id)
                              ? prev.filter((id) => id !== user.id)
                              : [...prev, user.id],
                          )
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input me-3"
                          checked={selectedUsers.includes(user.id)}
                          readOnly
                        />
                        <div>
                          <div className="fw-bold">
                            {user.fullName || user.userName}
                          </div>
                          <div className="small text-muted">{user.email}</div>
                        </div>
                      </div>
                    ))}
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-3 mt-4 fw-bold"
                  disabled={loading}
                >
                  {loading ? t("projectImport.processing") : t("projectImport.submitBtn")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </>
  );
};

export default CreateProject;
