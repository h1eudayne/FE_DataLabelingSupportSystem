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
      } catch {
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
      const deadlineISO = projectInfo.deadline
        ? new Date(projectInfo.deadline).toISOString()
        : new Date().toISOString();

      // Upload sample images for labels to Cloudinary
      const validLabels = labels.filter((l) => l.name.trim());
      const labelClassesPayload = [];
      for (const l of validLabels) {
        let exampleImageUrl = null;
        if (l.exampleImage) {
          try {
            exampleImageUrl = await uploadToCloudinary(l.exampleImage);
          } catch (err) {
            console.error("Failed to upload label sample image:", err);
          }
        }
        labelClassesPayload.push({
          name: l.name,
          color: l.color,
          guideLine: l.guideLine,
          checklist: l.checklist.filter((c) => c.trim()),
          exampleImageUrl,
        });
      }

      const resProj = await projectService.createProject({
        name: projectInfo.name,
        description: projectInfo.description,
        deadline: deadlineISO,
        startDate: new Date().toISOString(),
        endDate: deadlineISO,
        allowGeometryTypes: projectInfo.type,
        maxTaskDurationHours: Number(projectInfo.maxTaskDurationHours) || 24,
        penaltyUnit: Number(projectInfo.penaltyUnit) || 10,
        annotationGuide: projectInfo.annotationGuide || null,
        labelClasses: labelClassesPayload,
      });

      const projectId = resProj.data?.id || resProj.data?.projectId;
      if (!projectId) throw new Error(t("createProject.noProjectId"));

      toast.info(t("createProject.uploadingImages"));
      const uploadedUrls = [];

      for (const file of selectedFiles) {
        const url = await uploadToCloudinary(file);
        uploadedUrls.push(url);
      }

      await projectService.importData(projectId, uploadedUrls);

      const total = uploadedUrls.length;
      let remaining = total;

      for (let i = 0; i < selectedAnnotators.length; i++) {
        let qty = Math.floor(total / selectedAnnotators.length);
        if (i === selectedAnnotators.length - 1) qty = remaining;

        if (qty > 0) {
          await taskService.assignTask({
            projectId: Number(projectId),
            annotatorId: String(selectedAnnotators[i].value),
            quantity: Number(qty),
            reviewerId: String(
              selectedReviewers[i % selectedReviewers.length].value,
            ),
          });
          remaining -= qty;
        }
      }

      toast.success(t("createProject.createSuccess"));
      navigate("/projects-all-projects");
    } catch (err) {
      console.error(err);
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

                      {/* Sample image upload */}
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
