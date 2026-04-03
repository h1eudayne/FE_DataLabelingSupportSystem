import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Row,
  Col,
  Card,
  CardBody,
  Label,
  Input,
  Button,
  Container,
  Form,
} from "reactstrap";
import Select, { components as selectComponents } from "react-select";
import { useTranslation } from "react-i18next";

import { uploadToCloudinary } from "../../../services/cloudinary/cloudinaryService";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "../../../config/runtime";

import projectService from "../../../services/manager/project/projectService";
import { userService } from "../../../services/manager/project/userService";
import taskService from "../../../services/manager/project/taskService";
import { sortByNaturalName } from "../../../utils/naturalSort";

const DEFAULT_LABEL_PRESETS = [
  { name: "Ảnh bị lỗi", color: "#EF4444" },
  { name: "Ảnh không đúng chủ đề", color: "#F59E0B" },
  { name: "Ảnh mờ / mất nét", color: "#F97316" },
  { name: "Ảnh quá tối / quá sáng", color: "#EAB308" },
  { name: "Ảnh trùng lặp", color: "#8B5CF6" },
  { name: "Ảnh bị che khuất", color: "#06B6D4" },
  { name: "Không có đối tượng cần gán nhãn", color: "#10B981" },
  { name: "Ảnh bị cắt / không đầy đủ", color: "#64748B" },
];

const createDefaultLabelPreset = (t, preset) => ({
  translationKey: preset.translationKey ?? null,
  isNameCustomized: false,
  name: preset.translationKey
    ? t(`createProject.${preset.translationKey}`)
    : preset.name || "",
  color: preset.color,
  guideLine: "",
  checklist: [],
  exampleImage: null,
  exampleImagePreview: null,
});

const createInitialDefaultLabels = (t) =>
  DEFAULT_LABEL_PRESETS.map((label) => createDefaultLabelPreset(t, label));

const getDefaultLabelsSummary = (labels) => {
  const names = labels.map((label) => label.name).filter(Boolean);
  if (names.length === 0) return "(unnamed)";
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 3).join(", ")} +${names.length - 3}`;
};

const getCreatedProjectId = (response) => {
  const payload = response?.data ?? response ?? {};
  return (
    payload.id ?? payload.projectId ?? payload.Id ?? payload.ProjectId ?? null
  );
};

const shouldUseCloudinaryForDataset =
  Boolean(CLOUDINARY_CLOUD_NAME) && Boolean(CLOUDINARY_UPLOAD_PRESET);

const getManagedUserName = (user) =>
  user?.fullName || user?.userName || user?.email || String(user?.id || "");

const buildManagedUserOption = (user, roleLabel) => ({
  value: user.id,
  displayName: getManagedUserName(user),
  label: `${getManagedUserName(user)} (${roleLabel})`,
});

const MultiSelectOption = (props) => (
  <selectComponents.Option {...props}>
    <div className="d-flex align-items-center gap-2">
      <input
        type="checkbox"
        checked={props.isSelected}
        readOnly
        aria-hidden="true"
      />
      <span>{props.label}</span>
    </div>
  </selectComponents.Option>
);

const multiSelectComponents = {
  Option: MultiSelectOption,
};

const CreateProject = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isSubmittingRef = useRef(false);

  const [loading, setLoading] = useState(false);
  const [annotatorOptions, setAnnotatorOptions] = useState([]);
  const [reviewerOptions, setReviewerOptions] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedAnnotators, setSelectedAnnotators] = useState([]);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const [showDefaultLabels, setShowDefaultLabels] = useState(false);

  const [projectInfo, setProjectInfo] = useState({
    name: "",
    description: "",
    type: "Rectangle",
    deadline: "",
    maxTaskDurationHours: 24,
    penaltyUnit: 10,
    annotationGuide: "",
  });

  const [labels, setLabels] = useState([
    {
      name: "",
      guideLine: "",
      color: "#0ab39c",
      checklist: [""],
      exampleImage: null,
      exampleImagePreview: null,
    },
  ]);

  const [defaultLabels, setDefaultLabels] = useState(() =>
    createInitialDefaultLabels(t),
  );

  const addDefaultLabel = () =>
    setDefaultLabels([
      ...defaultLabels,
      {
        translationKey: null,
        isNameCustomized: false,
        name: "",
        color: "#6B7280",
        guideLine: "",
        checklist: [],
        exampleImage: null,
        exampleImagePreview: null,
      },
    ]);

  const removeDefaultLabel = (index) => {
    if (defaultLabels.length === 0) return;
    const clone = [...defaultLabels];
    if (clone[index].exampleImagePreview)
      URL.revokeObjectURL(clone[index].exampleImagePreview);
    setDefaultLabels(clone.filter((_, i) => i !== index));
  };

  const updateDefaultLabel = (index, field, value) => {
    const clone = [...defaultLabels];
    clone[index][field] = value;
    if (field === "name") {
      clone[index].isNameCustomized = true;
    }
    setDefaultLabels(clone);
  };

  const handleDefaultLabelImageSelect = (index, file) => {
    if (!file) return;
    const clone = [...defaultLabels];
    clone[index].exampleImage = file;
    clone[index].exampleImagePreview = URL.createObjectURL(file);
    setDefaultLabels(clone);
  };

  const removeDefaultLabelImage = (index) => {
    const clone = [...defaultLabels];
    if (clone[index].exampleImagePreview)
      URL.revokeObjectURL(clone[index].exampleImagePreview);
    clone[index].exampleImage = null;
    clone[index].exampleImagePreview = null;
    setDefaultLabels(clone);
  };

  useEffect(() => {
    setDefaultLabels((prev) =>
      prev.map((label) => ({
        ...label,
        name:
          label.translationKey && !label.isNameCustomized
            ? t(`createProject.${label.translationKey}`)
            : label.name,
      })),
    );
  }, [i18n.resolvedLanguage, t]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userService.getUsers();
        const userList = Array.isArray(res.data?.items)
          ? res.data.items
          : Array.isArray(res.data)
            ? res.data
            : [];
        const annotators = sortByNaturalName(
          userList.filter((u) => u.role === "Annotator"),
          getManagedUserName,
        ).map((u) => buildManagedUserOption(u, "Annotator"));
        const reviewers = sortByNaturalName(
          userList.filter((u) => u.role === "Reviewer"),
          getManagedUserName,
        ).map((u) => buildManagedUserOption(u, "Reviewer"));
        setAnnotatorOptions(annotators);
        setReviewerOptions(reviewers);
        if (annotators.length === 0 && reviewers.length === 0) {
          toast.warning(
            t("createProject.noManagedUsers") ||
              "No annotators or reviewers are assigned to you. Please contact Admin to assign team members.",
          );
        }
      } catch (err) {
        console.error("Failed to fetch managed users:", err);
        toast.error(t("createProject.loadingUsers"));
      }
    };
    fetchUsers();
  }, [t]);

  const addLabel = () =>
    setLabels([
      ...labels,
      {
        name: "",
        guideLine: "",
        color: "#0ab39c",
        checklist: [""],
        exampleImage: null,
        exampleImagePreview: null,
      },
    ]);

  const handleLabelImageSelect = (index, file) => {
    if (!file) return;
    const clone = [...labels];
    clone[index].exampleImage = file;
    clone[index].exampleImagePreview = URL.createObjectURL(file);
    setLabels(clone);
  };

  const removeLabelImage = (index) => {
    const clone = [...labels];
    if (clone[index].exampleImagePreview) {
      URL.revokeObjectURL(clone[index].exampleImagePreview);
    }
    clone[index].exampleImage = null;
    clone[index].exampleImagePreview = null;
    setLabels(clone);
  };

  const removeLabel = (index) => {
    if (labels.length === 1) return toast.info(t("createProject.minOneLabel"));
    setLabels(labels.filter((_, i) => i !== index));
  };

  const updateLabel = (index, field, value) => {
    const clone = [...labels];
    clone[index][field] = value;
    setLabels(clone);
  };

  const addChecklistItem = (labelIndex) => {
    const clone = [...labels];
    clone[labelIndex].checklist.push("");
    setLabels(clone);
  };

  const removeChecklistItem = (labelIndex, itemIndex) => {
    const clone = [...labels];
    clone[labelIndex].checklist = clone[labelIndex].checklist.filter(
      (_, i) => i !== itemIndex,
    );
    setLabels(clone);
  };

  const updateChecklistItem = (labelIndex, itemIndex, value) => {
    const clone = [...labels];
    clone[labelIndex].checklist[itemIndex] = value;
    setLabels(clone);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const validateForm = () => {
    if (!projectInfo.name.trim()) {
      toast.warning(t("createProject.warnName"));
      return false;
    }
    if (!projectInfo.deadline) {
      toast.warning(t("createProject.warnDeadline"));
      return false;
    }
    const deadlineDate = new Date(projectInfo.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deadlineDate <= today) {
      toast.warning(t("createProject.warnDeadlineFuture"));
      return false;
    }
    const validDefaultLabels = defaultLabels.filter((l) => l.name.trim());
    const validCustomLabels = labels.filter((l) => l.name.trim());
    if (validDefaultLabels.length === 0 && validCustomLabels.length === 0) {
      toast.warning(t("createProject.warnLabel"));
      return false;
    }
    for (const lbl of validCustomLabels) {
      const filledChecklist = (lbl.checklist || []).filter((c) => c.trim());
      if (filledChecklist.length === 0) {
        toast.warning(t("createProject.warnChecklist", { name: lbl.name }));
        return false;
      }
    }
    if (!selectedFiles.length) {
      toast.warning(t("createProject.warnFiles"));
      return false;
    }
    if (!selectedAnnotators.length) {
      toast.warning(t("createProject.warnAnnotator"));
      return false;
    }
    if (!selectedReviewers.length) {
      toast.warning(t("createProject.warnReviewer"));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    if (!validateForm()) return;

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      const hasLocalImageUpload =
        selectedFiles.length > 0 ||
        defaultLabels.some((label) => label.exampleImage instanceof File) ||
        labels.some((label) => label.exampleImage instanceof File);

      if (hasLocalImageUpload && !shouldUseCloudinaryForDataset) {
        throw new Error(
          "Cloudinary configuration is missing. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.",
        );
      }

      let projectId = null;
      const deadlineISO = new Date(projectInfo.deadline).toISOString();

      const validDefaultLabels = defaultLabels.filter((l) => l.name.trim());
      const defaultLabelClassesPayload = [];
      for (const l of validDefaultLabels) {
        let exampleImageUrl = null;
        if (l.exampleImage) {
          try {
            exampleImageUrl = await uploadToCloudinary(l.exampleImage);
          } catch (err) {
            console.error("Failed to upload default label sample image:", err);
          }
        }
        const resolvedDefaultName =
          l.translationKey && !l.isNameCustomized
            ? t(`createProject.${l.translationKey}`)
            : l.name;

        defaultLabelClassesPayload.push({
          name: resolvedDefaultName?.trim() || "",
          color: l.color || "#EF4444",
          guideLine: l.guideLine?.trim() || "",
          checklist: [],
          exampleImageUrl,
          isDefault: true,
        });
      }

      const validLabels = labels.filter((l) => l.name.trim());
      const customLabelClassesPayload = [];
      for (const l of validLabels) {
        let exampleImageUrl = null;
        if (l.exampleImage) {
          try {
            exampleImageUrl = await uploadToCloudinary(l.exampleImage);
          } catch (err) {
            console.error("Failed to upload label sample image:", err);
          }
        }
        customLabelClassesPayload.push({
          name: l.name?.trim() || "",
          color: l.color || "#0ab39c",
          guideLine: l.guideLine?.trim() || "",
          checklist: l.checklist?.filter((c) => c.trim()) || [],
          exampleImageUrl,
          isDefault: false,
        });
      }

      const labelClassesPayload = [
        ...defaultLabelClassesPayload,
        ...customLabelClassesPayload,
      ];

      const createPayload = {
        name: projectInfo.name?.trim() || "",
        description: projectInfo.description?.trim() || "",
        deadline: deadlineISO,
        startDate: new Date().toISOString(),
        endDate: deadlineISO,
        allowGeometryTypes: projectInfo.type || "Rectangle",
        maxTaskDurationHours: Number(projectInfo.maxTaskDurationHours) || 24,
        penaltyUnit: Number(projectInfo.penaltyUnit) || 10,
        annotationGuide: projectInfo.annotationGuide?.trim() || "",
        labelClasses: labelClassesPayload,
      };
      const resProj = await projectService.createProject(createPayload);

      projectId = getCreatedProjectId(resProj);
      if (!projectId) throw new Error(t("createProject.noProjectId"));

      const postCreateWarnings = [];
      let importedFileCount = 0;

      if (selectedFiles.length > 0) {
        toast.info(t("createProject.uploadingImages"));

        try {
          const storageUrls = await Promise.all(
            selectedFiles.map((file) => uploadToCloudinary(file)),
          );

          await projectService.importData(projectId, storageUrls);
          importedFileCount = storageUrls.length;
        } catch (uploadErr) {
          console.error("=== PROJECT DATA UPLOAD ERROR ===", uploadErr);
          postCreateWarnings.push(
            uploadErr.response?.data?.message ||
              t("createProject.uploadFailedAfterCreate"),
          );
        }
      }

      if (selectedAnnotators.length > 0 && importedFileCount > 0) {
        try {
          const assignPayload = {
            projectId: Number(projectId),
            annotatorIds: selectedAnnotators.map((ann) =>
              String(ann.value || ann.id || ann),
            ),
            totalQuantity: importedFileCount,
            reviewerIds: selectedReviewers.map((rev) =>
              String(rev.value || rev.id || rev),
            ),
          };

          if (!Array.isArray(assignPayload.annotatorIds)) {
            throw new Error("annotatorIds must be an array");
          }
          if (!Array.isArray(assignPayload.reviewerIds)) {
            throw new Error("reviewerIds must be an array");
          }
          if (typeof assignPayload.totalQuantity !== "number") {
            throw new Error("totalQuantity must be a number");
          }

          await taskService.assignTask(assignPayload);
        } catch (assignErr) {
          console.error("=== TASK ASSIGNMENT ERROR ===", assignErr);
          postCreateWarnings.push(
            assignErr.response?.data?.message ||
              t("createProject.assignFailedAfterCreate"),
          );
        }
      } else if (selectedAnnotators.length > 0 && importedFileCount === 0) {
        postCreateWarnings.push(t("createProject.assignSkippedNoData"));
      }

      toast.success(t("createProject.createSuccess"));
      if (postCreateWarnings.length > 0) {
        postCreateWarnings.forEach((message) => toast.warning(message));
        navigate(`/project-detail/${projectId}`);
      } else {
        navigate("/projects-all-projects");
      }
    } catch (err) {
      console.error("=== CREATE PROJECT ERROR ===", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          t("createProject.createError"),
      );
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-3">
        <h4 className="text-uppercase fw-bold text-primary">
          {t("createProject.title")}
        </h4>
      </div>

      <Form onSubmit={handleSubmit} noValidate>
        <Row>
          <Col lg={7}>
            <Card className="shadow-sm border-0 mb-4">
              <CardBody>
                <div className="mb-3">
                  <Label className="fw-bold">
                    {t("createProject.projectName")}
                  </Label>
                  <Input
                    required
                    placeholder={t("createProject.projectNamePlaceholder")}
                    value={projectInfo.name}
                    onChange={(e) =>
                      setProjectInfo({ ...projectInfo, name: e.target.value })
                    }
                  />
                </div>
                <div className="mb-3">
                  <Label className="fw-bold">
                    {t("createProject.description")}
                  </Label>
                  <Input
                    type="textarea"
                    rows="2"
                    placeholder={t("createProject.descriptionPlaceholder")}
                    value={projectInfo.description}
                    onChange={(e) =>
                      setProjectInfo({
                        ...projectInfo,
                        description: e.target.value,
                      })
                    }
                  />
                </div>
                <Row>
                  <Col md={6}>
                    <Label className="fw-bold">
                      {t("createProject.toolType")}
                    </Label>
                    <select
                      className="form-select"
                      value={projectInfo.type}
                      onChange={(e) =>
                        setProjectInfo({
                          ...projectInfo,
                          type: e.target.value,
                        })
                      }
                    >
                      <option value="Rectangle">Bounding Box</option>
                      <option value="Polygon">Polygon</option>
                    </select>
                  </Col>
                  <Col md={6}>
                    <Label className="fw-bold">
                      {t("createProject.deadline")}
                    </Label>
                    <Input
                      type="date"
                      value={projectInfo.deadline}
                      min={(() => {
                        const tomorrow = new Date();
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        return tomorrow.toISOString().split("T")[0];
                      })()}
                      onChange={(e) =>
                        setProjectInfo({
                          ...projectInfo,
                          deadline: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Row>

                <Row className="mt-3">
                  <Col md={6}>
                    <Label className="fw-bold">
                      {t("createProject.taskDuration")}
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      value={projectInfo.maxTaskDurationHours}
                      onChange={(e) =>
                        setProjectInfo({
                          ...projectInfo,
                          maxTaskDurationHours: e.target.value,
                        })
                      }
                    />
                  </Col>
                  <Col md={6}>
                    <Label className="fw-bold">
                      {t("createProject.penaltyUnit")}
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={projectInfo.penaltyUnit}
                      onChange={(e) =>
                        setProjectInfo({
                          ...projectInfo,
                          penaltyUnit: e.target.value,
                        })
                      }
                    />
                  </Col>
                </Row>

                <div className="mt-3">
                  <Label className="fw-bold">
                    {t("createProject.generalGuide")}
                  </Label>
                  <Input
                    type="textarea"
                    rows="2"
                    placeholder={t("createProject.generalGuidePlaceholder")}
                    value={projectInfo.annotationGuide}
                    onChange={(e) =>
                      setProjectInfo({
                        ...projectInfo,
                        annotationGuide: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="mt-4">
                  <Label className="fw-bold text-dark">
                    {t("createProject.inputData")} ({selectedFiles.length}{" "}
                    {t("createProject.file")}) *
                  </Label>
                  <div
                    className="dropzone border-2 border-dashed rounded-3 p-4 text-center bg-light"
                    onClick={() => fileInputRef.current.click()}
                    style={{ cursor: "pointer" }}
                  >
                    <input
                      type="file"
                      multiple
                      className="d-none"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      accept="image/*"
                    />
                    <i className="ri-upload-cloud-2-line display-6 text-muted"></i>
                    <p className="mt-2 small">
                      {t("createProject.dropzoneText")}
                    </p>
                  </div>

                  {selectedFiles.length > 0 && (
                    <div
                      className="mt-2 border rounded p-2 bg-white"
                      style={{ maxHeight: "150px", overflowY: "auto" }}
                    >
                      {selectedFiles.map((f, i) => (
                        <div
                          key={i}
                          className="d-flex justify-content-between align-items-center mb-1 pb-1 border-bottom small"
                        >
                          <span className="text-truncate">
                            <i className="ri-image-line me-2 text-primary"></i>
                            {f.name}
                          </span>
                          <i
                            className="ri-delete-bin-line text-danger"
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              setSelectedFiles(
                                selectedFiles.filter((_, idx) => idx !== i),
                              )
                            }
                          ></i>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </Col>

          <Col lg={5}>
            {}
            <Card className="shadow-sm border-0 mb-3">
              <div
                className="card-header bg-soft-warning py-2 d-flex justify-content-between align-items-center"
                style={{ cursor: "pointer" }}
                onClick={() => setShowDefaultLabels(!showDefaultLabels)}
              >
                <div>
                  <h6 className="card-title mb-0 fs-13 fw-bold">
                    <i className="ri-flag-line me-1"></i>
                    {t("createProject.defaultLabelsTitle")}
                    <span className="badge bg-warning text-dark ms-2">
                      {defaultLabels.length}
                    </span>
                  </h6>
                  {!showDefaultLabels && defaultLabels.length > 0 && (
                    <small className="text-muted">
                      {getDefaultLabelsSummary(defaultLabels)}
                    </small>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning"
                  style={{ padding: "2px 8px", fontSize: "0.75rem" }}
                >
                  <i
                    className={`ri-${showDefaultLabels ? "arrow-up-s" : "pencil"}-line me-1`}
                  ></i>
                  {showDefaultLabels
                    ? t("createProject.collapseDefaultLabels")
                    : t("createProject.editDefaultLabels")}
                </button>
              </div>
              {showDefaultLabels && (
                <CardBody className="p-3">
                  <small className="text-muted d-block mb-2">
                    {t("createProject.defaultLabelsHint")}
                  </small>
                  {defaultLabels.map((dl, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded mb-2 bg-light position-relative"
                    >
                      <button
                        type="button"
                        className="btn-close position-absolute top-0 end-0 m-2"
                        onClick={() => removeDefaultLabel(index)}
                        style={{ fontSize: "10px" }}
                      ></button>
                      <div className="d-flex gap-2 mb-2">
                        <Input
                          placeholder={t("createProject.defaultLabelName")}
                          value={dl.name}
                          onChange={(e) =>
                            updateDefaultLabel(index, "name", e.target.value)
                          }
                        />
                        <Input
                          type="color"
                          className="form-control-color"
                          style={{ width: "60px" }}
                          value={dl.color}
                          onChange={(e) =>
                            updateDefaultLabel(index, "color", e.target.value)
                          }
                        />
                      </div>
                      <Input
                        size="sm"
                        placeholder={t("createProject.labelGuide")}
                        value={dl.guideLine}
                        onChange={(e) =>
                          updateDefaultLabel(index, "guideLine", e.target.value)
                        }
                        className="mb-2"
                      />
                      <small className="text-muted d-block mb-2">
                        <i className="ri-information-line me-1"></i>
                        {t("createProject.defaultLabelNoChecklist")}
                      </small>

                      <div className="mb-2">
                        <small className="text-muted fw-semibold d-block mb-1">
                          <i className="ri-image-add-line me-1"></i>
                          {t("createProject.sampleImage")}
                        </small>
                        {dl.exampleImagePreview ? (
                          <div className="position-relative d-inline-block">
                            <img
                              src={dl.exampleImagePreview}
                              alt="Sample"
                              className="rounded border"
                              style={{
                                maxWidth: "120px",
                                maxHeight: "80px",
                                objectFit: "cover",
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0"
                              style={{
                                padding: "1px 5px",
                                fontSize: "10px",
                                transform: "translate(30%, -30%)",
                              }}
                              onClick={() => removeDefaultLabelImage(index)}
                            >
                              <i className="ri-close-line"></i>
                            </button>
                          </div>
                        ) : (
                          <label
                            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                            style={{ cursor: "pointer" }}
                          >
                            <i className="ri-upload-2-line"></i>
                            {t("createProject.uploadSampleImage")}
                            <input
                              type="file"
                              accept="image/*"
                              className="d-none"
                              onChange={(e) =>
                                handleDefaultLabelImageSelect(
                                  index,
                                  e.target.files[0],
                                )
                              }
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                  <Button
                    color="link"
                    size="sm"
                    className="p-0 text-warning"
                    onClick={addDefaultLabel}
                  >
                    <i className="ri-add-line me-1"></i>
                    {t("createProject.addDefaultLabel")}
                  </Button>
                </CardBody>
              )}
            </Card>

            <Card className="shadow-sm border-0 mb-3">
              <div className="card-header bg-soft-info py-2">
                <h6 className="card-title mb-0 fs-13 fw-bold">
                  {t("createProject.labelListTitle")}
                </h6>
                <small className="text-muted">
                  {t("createProject.labelListHint")}
                </small>
              </div>
              <CardBody className="p-0">
                <div
                  className="p-3"
                  style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                  {labels.map((label, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded mb-2 bg-light position-relative"
                    >
                      <button
                        type="button"
                        className="btn-close position-absolute top-0 end-0 m-2"
                        onClick={() => removeLabel(index)}
                        style={{ fontSize: "10px" }}
                      ></button>
                      <div className="d-flex gap-2 mb-2">
                        <Input
                          placeholder={t("createProject.labelName")}
                          value={label.name}
                          onChange={(e) =>
                            updateLabel(index, "name", e.target.value)
                          }
                        />
                        <Input
                          type="color"
                          className="form-control-color"
                          style={{ width: "60px" }}
                          value={label.color}
                          onChange={(e) =>
                            updateLabel(index, "color", e.target.value)
                          }
                        />
                      </div>
                      <Input
                        size="sm"
                        placeholder={t("createProject.labelGuide")}
                        value={label.guideLine}
                        onChange={(e) =>
                          updateLabel(index, "guideLine", e.target.value)
                        }
                        className="mb-2"
                      />

                      {}
                      <div className="mb-2">
                        <small className="text-muted fw-semibold d-block mb-1">
                          <i className="ri-image-add-line me-1"></i>
                          {t("createProject.sampleImage")}
                        </small>
                        {label.exampleImagePreview ? (
                          <div className="position-relative d-inline-block">
                            <img
                              src={label.exampleImagePreview}
                              alt="Sample"
                              className="rounded border"
                              style={{
                                maxWidth: "120px",
                                maxHeight: "80px",
                                objectFit: "cover",
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger position-absolute top-0 end-0"
                              style={{
                                padding: "1px 5px",
                                fontSize: "10px",
                                transform: "translate(30%, -30%)",
                              }}
                              onClick={() => removeLabelImage(index)}
                            >
                              <i className="ri-close-line"></i>
                            </button>
                          </div>
                        ) : (
                          <label
                            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1"
                            style={{ cursor: "pointer" }}
                          >
                            <i className="ri-upload-2-line"></i>
                            {t("createProject.uploadSampleImage")}
                            <input
                              type="file"
                              accept="image/*"
                              className="d-none"
                              onChange={(e) =>
                                handleLabelImageSelect(index, e.target.files[0])
                              }
                            />
                          </label>
                        )}
                      </div>

                      <div className="mt-2 ps-2 border-start border-2 border-info">
                        <small className="text-body fw-semibold d-block mb-1">
                          <i className="ri-checkbox-multiple-line me-1 text-info"></i>
                          {t("createProject.checklistRequired")}
                        </small>
                        {label.checklist.map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            className="d-flex gap-1 mb-1 align-items-center"
                          >
                            <Input
                              bsSize="sm"
                              placeholder={`${t("createProject.conditionPlaceholder")} ${itemIdx + 1}...`}
                              value={item}
                              onChange={(e) =>
                                updateChecklistItem(
                                  index,
                                  itemIdx,
                                  e.target.value,
                                )
                              }
                            />
                            {label.checklist.length > 1 && (
                              <i
                                className="ri-close-line text-danger"
                                style={{
                                  cursor: "pointer",
                                  fontSize: "16px",
                                }}
                                onClick={() =>
                                  removeChecklistItem(index, itemIdx)
                                }
                              ></i>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 text-info"
                          onClick={() => addChecklistItem(index)}
                        >
                          {t("createProject.addCondition")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-top text-center">
                  <Button color="link" size="sm" onClick={addLabel}>
                    {t("createProject.addLabel")}
                  </Button>
                </div>
              </CardBody>
            </Card>

            <Card className="shadow-sm border-0 mb-3">
              <div className="card-header bg-soft-dark py-2">
                <h6 className="card-title mb-0 fs-13 fw-bold">
                  {t("createProject.assignTitle")}
                </h6>
              </div>
              <CardBody>
                <div className="mb-3">
                  <Label className="fw-bold small">
                    {t("createProject.annotatorLabel")}
                  </Label>
                  <Select
                    isMulti
                    value={selectedAnnotators}
                    options={annotatorOptions}
                    placeholder={t("createProject.annotatorPlaceholder")}
                    onChange={(value) => setSelectedAnnotators(value ?? [])}
                    className="basic-multi-select"
                    classNamePrefix="basic-multi-select"
                    closeMenuOnSelect={false}
                    blurInputOnSelect={false}
                    hideSelectedOptions={false}
                    isClearable
                    components={multiSelectComponents}
                  />
                </div>
                <div>
                  <Label className="fw-bold small">
                    {t("createProject.reviewerLabel")}
                  </Label>
                  <Select
                    isMulti
                    value={selectedReviewers}
                    options={reviewerOptions}
                    placeholder={t("createProject.reviewerPlaceholder")}
                    onChange={(value) => setSelectedReviewers(value ?? [])}
                    className="basic-multi-select"
                    classNamePrefix="basic-multi-select"
                    closeMenuOnSelect={false}
                    blurInputOnSelect={false}
                    hideSelectedOptions={false}
                    isClearable
                    components={multiSelectComponents}
                  />
                </div>
              </CardBody>
            </Card>

            <Button
              type="submit"
              color="primary"
              className="w-100 py-3 fw-bold shadow"
              disabled={loading}
              onClick={(e) => {
                if (loading) e.preventDefault();
              }}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <i className="ri-check-double-line me-2"></i>
              )}
              {t("createProject.submitBtn")}
            </Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

export default CreateProject;
