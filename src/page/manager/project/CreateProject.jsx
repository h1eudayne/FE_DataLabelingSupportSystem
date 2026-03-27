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
import Select from "react-select";
import { useTranslation } from "react-i18next";

import { uploadToCloudinary } from "../../../services/cloudinary/cloudinaryService";

import projectService from "../../../services/manager/project/projectService";
import { userService } from "../../../services/manager/project/userService";
import taskService from "../../../services/manager/project/taskService";

const CreateProject = () => {
  const { t } = useTranslation();
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

  const [defaultLabels, setDefaultLabels] = useState([
    { name: "Ảnh bị lỗi", color: "#EF4444", guideLine: "", checklist: [""], exampleImage: null, exampleImagePreview: null },
    { name: "Task không đạt yêu cầu", color: "#F59E0B", guideLine: "", checklist: [""], exampleImage: null, exampleImagePreview: null },
  ]);

  const addDefaultLabel = () =>
    setDefaultLabels([...defaultLabels, { name: "", color: "#6B7280", guideLine: "", checklist: [""], exampleImage: null, exampleImagePreview: null }]);

  const removeDefaultLabel = (index) => {
    if (defaultLabels.length === 0) return;
    const clone = [...defaultLabels];
    if (clone[index].exampleImagePreview) URL.revokeObjectURL(clone[index].exampleImagePreview);
    setDefaultLabels(clone.filter((_, i) => i !== index));
  };

  const updateDefaultLabel = (index, field, value) => {
    const clone = [...defaultLabels];
    clone[index][field] = value;
    setDefaultLabels(clone);
  };

  const addDefaultChecklistItem = (labelIndex) => {
    const clone = [...defaultLabels];
    clone[labelIndex].checklist.push("");
    setDefaultLabels(clone);
  };

  const removeDefaultChecklistItem = (labelIndex, itemIndex) => {
    const clone = [...defaultLabels];
    clone[labelIndex].checklist = clone[labelIndex].checklist.filter((_, i) => i !== itemIndex);
    setDefaultLabels(clone);
  };

  const updateDefaultChecklistItem = (labelIndex, itemIndex, value) => {
    const clone = [...defaultLabels];
    clone[labelIndex].checklist[itemIndex] = value;
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
    if (clone[index].exampleImagePreview) URL.revokeObjectURL(clone[index].exampleImagePreview);
    clone[index].exampleImage = null;
    clone[index].exampleImagePreview = null;
    setDefaultLabels(clone);
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userService.getUsers();
        const userList = res.data.items || res.data;
        const annotators = userList
          .filter((u) => u.role === "Annotator")
          .map((u) => ({
            value: u.id,
            label: `${u.fullName || u.userName} (Annotator)`,
          }));
        const reviewers = userList
          .filter((u) => u.role === "Reviewer")
          .map((u) => ({
            value: u.id,
            label: `${u.fullName || u.userName} (Reviewer)`,
          }));
        setAnnotatorOptions(annotators);
        setReviewerOptions(reviewers);
        if (annotators.length === 0 && reviewers.length === 0) {
          toast.warning(
            t("createProject.noManagedUsers") ||
              "No annotators or reviewers are assigned to you. Please contact Admin to assign team members."
          );
        }
      } catch (err) {
        console.error("Failed to fetch managed users:", err);
        toast.error(t("createProject.loadingUsers"));
      }
    };
    fetchUsers();
  }, []);

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
    const validLabels = labels.filter((l) => l.name.trim());
    if (validLabels.length === 0) {
      toast.warning(t("createProject.warnLabel"));
      return false;
    }
    for (let i = 0; i < validLabels.length; i++) {
      const filledChecklist = validLabels[i].checklist.filter((c) => c.trim());
      if (filledChecklist.length === 0) {
        toast.warning(
          t("createProject.warnChecklist", { name: validLabels[i].name }),
        );
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
        defaultLabelClassesPayload.push({
          name: l.name?.trim() || "",
          color: l.color || "#EF4444",
          guideLine: l.guideLine?.trim() || "",
          checklist: l.checklist?.filter((c) => c.trim()) || [],
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

      const labelClassesPayload = [...defaultLabelClassesPayload, ...customLabelClassesPayload];

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
      console.log("=== CREATE PROJECT PAYLOAD ===", JSON.stringify(createPayload, null, 2));
      const resProj = await projectService.createProject(createPayload);

      const projectId = resProj.data?.id || resProj.data?.projectId;
      if (!projectId) throw new Error(t("createProject.noProjectId"));

      toast.info(t("createProject.uploadingImages"));
      const uploadedUrls = [];

      for (const file of selectedFiles) {
        const url = await uploadToCloudinary(file);
        uploadedUrls.push(url);
      }

      await projectService.importData(projectId, uploadedUrls);

      if (selectedAnnotators.length > 0 && selectedReviewers.length > 0) {
        try {
          const assignPayload = {
            projectId: Number(projectId),
            annotatorIds: selectedAnnotators.map(ann => String(ann.value || ann.id || ann)),
            totalQuantity: uploadedUrls.length,
            reviewerIds: selectedReviewers.map(rev => String(rev.value || rev.id || rev)),
          };
          
          if (!Array.isArray(assignPayload.annotatorIds)) {
            throw new Error("annotatorIds must be an array");
          }
          if (!Array.isArray(assignPayload.reviewerIds)) {
            throw new Error("reviewerIds must be an array");
          }
          if (typeof assignPayload.totalQuantity !== 'number') {
            throw new Error("totalQuantity must be a number");
          }
          
          console.log("=== TASK ASSIGNMENT PAYLOAD ===", new Date().toISOString());
          console.log("Payload:", JSON.stringify(assignPayload, null, 2));
          console.log("Selected Annotators:", selectedAnnotators);
          console.log("Selected Reviewers:", selectedReviewers);
          
          await taskService.assignTask(assignPayload);
          console.log("=== TASK ASSIGNMENT SUCCESS ===");
        } catch (assignErr) {
          console.error("=== TASK ASSIGNMENT ERROR ===", assignErr);
          console.error("Assignment error data:", assignErr.response?.data);
          toast.warning(
            `Project created but task assignment failed: ${assignErr.response?.data?.message || assignErr.message}. You can assign tasks manually from project settings.`
          );
        }
      }

      toast.success(t("createProject.createSuccess"));
      navigate("/projects-all-projects");
    } catch (err) {
      console.error("=== CREATE PROJECT ERROR ===", err);
      console.error("Error response data:", JSON.stringify(err.response?.data, null, 2));
      console.error("Error response status:", err.response?.status);
      toast.error(
        err.response?.data?.message || t("createProject.createError"),
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

      <Form onSubmit={handleSubmit}>
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
                    {t("createProject.defaultLabelsTitle") || "Nhãn mặc định (Flag)"}
                    <span className="badge bg-warning text-dark ms-2">
                      {defaultLabels.length}
                    </span>
                  </h6>
                  {!showDefaultLabels && defaultLabels.length > 0 && (
                    <small className="text-muted">
                      {defaultLabels.map((dl) => dl.name).filter(Boolean).join(", ") || "(chưa đặt tên)"}
                    </small>
                  )}
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-warning"
                  style={{ padding: "2px 8px", fontSize: "0.75rem" }}
                >
                  <i className={`ri-${showDefaultLabels ? "arrow-up-s" : "pencil"}-line me-1`}></i>
                  {showDefaultLabels
                    ? (t("createProject.collapseDefaultLabels") || "Thu gọn")
                    : (t("createProject.editDefaultLabels") || "Chỉnh sửa")}
                </button>
              </div>
              {showDefaultLabels && (
                <CardBody className="p-3">
                  <small className="text-muted d-block mb-2">
                    {t("createProject.defaultLabelsHint") || "Các nhãn dùng để đánh dấu ảnh lỗi / task không đạt yêu cầu. Annotator có thể chọn mà không cần vẽ annotation."}
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
                          placeholder={t("createProject.defaultLabelName") || "Tên nhãn flag..."}
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

                      {}
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
                                handleDefaultLabelImageSelect(index, e.target.files[0])
                              }
                            />
                          </label>
                        )}
                      </div>

                      {}
                      <div className="mt-2 ps-2 border-start border-2 border-warning">
                        <small className="text-muted fw-semibold d-block mb-1">
                          <i className="ri-checkbox-multiple-line me-1"></i>
                          Checklist
                        </small>
                        {dl.checklist.map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            className="d-flex gap-1 mb-1 align-items-center"
                          >
                            <Input
                              bsSize="sm"
                              placeholder={`${t("createProject.conditionPlaceholder")} ${itemIdx + 1}...`}
                              value={item}
                              onChange={(e) =>
                                updateDefaultChecklistItem(index, itemIdx, e.target.value)
                              }
                            />
                            {dl.checklist.length > 1 && (
                              <i
                                className="ri-close-line text-danger"
                                style={{ cursor: "pointer", fontSize: "16px" }}
                                onClick={() => removeDefaultChecklistItem(index, itemIdx)}
                              ></i>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          className="btn btn-link btn-sm p-0 text-warning"
                          onClick={() => addDefaultChecklistItem(index)}
                        >
                          {t("createProject.addCondition")}
                        </button>
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
                    {t("createProject.addDefaultLabel") || "Thêm nhãn mặc định"}
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
                        <small className="text-danger fw-bold d-block mb-1">
                          <i className="ri-checkbox-multiple-line me-1"></i>
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
                    options={annotatorOptions}
                    placeholder={t("createProject.annotatorPlaceholder")}
                    onChange={setSelectedAnnotators}
                    className="basic-multi-select"
                  />
                </div>
                <div>
                  <Label className="fw-bold small">
                    {t("createProject.reviewerLabel")}
                  </Label>
                  <Select
                    isMulti
                    options={reviewerOptions}
                    placeholder={t("createProject.reviewerPlaceholder")}
                    onChange={setSelectedReviewers}
                    className="basic-multi-select"
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
