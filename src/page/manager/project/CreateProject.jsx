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

import axios from "../../../services/axios.customize";

import { uploadToCloudinary } from "../../../services/cloudinaryService";

import projectService from "../../../services/manager/project/projectService";
import { userService } from "../../../services/manager/project/userService";
import taskService from "../../../services/manager/project/taskService";

const CreateProject = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isSubmittingRef = useRef(false); // 🔥 CHẶN TUYỆT ĐỐI

  const [loading, setLoading] = useState(false);
  const [annotatorOptions, setAnnotatorOptions] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedAnnotators, setSelectedAnnotators] = useState([]);

  const [projectInfo, setProjectInfo] = useState({
    name: "",
    description: "",
    type: "Bounding Box",
    deadline: "",
  });

  const [labels, setLabels] = useState([
    { name: "", guideline: "", color: "#0ab39c" },
  ]);

  // ================= FETCH ANNOTATORS =================
  useEffect(() => {
    const fetchAnnotators = async () => {
      try {
        const res = await userService.getUsers();
        const filtered = res.data
          .filter((u) => u.role === "Annotator" || u.roleId === 2)
          .map((u) => ({
            value: u.id,
            label: `${u.fullName || u.userName} (Annotator)`,
          }));
        setAnnotatorOptions(filtered);
      } catch {
        toast.error("Không thể tải danh sách nhân viên");
      }
    };
    fetchAnnotators();
  }, []);

  // ================= LABEL =================
  const addLabel = () =>
    setLabels([...labels, { name: "", guideline: "", color: "#0ab39c" }]);

  const removeLabel = (index) => {
    if (labels.length === 1) return toast.info("Phải có ít nhất một nhãn");
    setLabels(labels.filter((_, i) => i !== index));
  };

  const updateLabel = (index, field, value) => {
    const clone = [...labels];
    clone[index][field] = value;
    setLabels(clone);
  };

  // ================= FILE =================
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmittingRef.current) return;

    if (!selectedFiles.length || !selectedAnnotators.length) {
      toast.warning("Vui lòng kiểm tra lại file và nhân viên!");
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      // 1️⃣ CREATE PROJECT
      const resProj = await projectService.createProject({
        name: projectInfo.name,
        description: projectInfo.description,
        pricePerLabel: 10,
        totalBudget: 1000,
        deadline: projectInfo.deadline
          ? new Date(projectInfo.deadline).toISOString()
          : new Date().toISOString(),
        allowGeometryTypes: projectInfo.type,
        labelClasses: labels
          .filter((l) => l.name)
          .map((l) => ({
            name: l.name,
            color: l.color,
            guideline: l.guideline,
          })),
      });

      const projectId = resProj.data?.id || resProj.data?.projectId;
      if (!projectId) throw new Error("Không lấy được projectId");

      // 2️⃣ UPLOAD CLOUDINARY
      toast.info("Đang upload ảnh lên Cloudinary...");
      const uploadedUrls = [];

      for (const file of selectedFiles) {
        const url = await uploadToCloudinary(file);
        uploadedUrls.push(url);
      }

      // 3️⃣ IMPORT DATA (GỬI URL ẢNH CHO BACKEND)
      await projectService.importData(projectId, uploadedUrls);

      // 4️⃣ ASSIGN TASK
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
          });
          remaining -= qty;
        }
      }

      toast.success("Tạo dự án thành công!");
      navigate("/projects-all-projects");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi hệ thống");
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="page-content bg-light">
      <Container fluid>
        <div className="mb-3">
          <h4 className="text-uppercase fw-bold text-primary">
            Thiết lập dự án mới
          </h4>
        </div>

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col lg={7}>
              <Card className="shadow-sm border-0 mb-4">
                <CardBody>
                  <div className="mb-3">
                    <Label className="fw-bold">Tên dự án</Label>
                    <Input
                      required
                      placeholder="VD: Nhận diện biển số xe..."
                      onChange={(e) =>
                        setProjectInfo({ ...projectInfo, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <Label className="fw-bold">Mô tả</Label>
                    <Input
                      type="textarea"
                      rows="2"
                      placeholder="Mục tiêu dự án..."
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
                      <Label className="fw-bold">Loại Tool</Label>
                      <select
                        className="form-select"
                        onChange={(e) =>
                          setProjectInfo({
                            ...projectInfo,
                            type: e.target.value,
                          })
                        }
                      >
                        <option value="Bounding Box">Bounding Box</option>
                        <option value="Polygon">Polygon</option>
                      </select>
                    </Col>
                    <Col md={6}>
                      <Label className="fw-bold">Hạn chót</Label>
                      <Input
                        type="date"
                        onChange={(e) =>
                          setProjectInfo({
                            ...projectInfo,
                            deadline: e.target.value,
                          })
                        }
                      />
                    </Col>
                  </Row>

                  <div className="mt-4">
                    <Label className="fw-bold text-dark">
                      Dữ liệu đầu vào ({selectedFiles.length} file)
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
                        Click để chọn hoặc kéo thả ảnh vào đây
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
                    DANH SÁCH NHÃN (LABELS)
                  </h6>
                </div>
                <CardBody className="p-0">
                  <div
                    className="p-3"
                    style={{ maxHeight: "300px", overflowY: "auto" }}
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
                            placeholder="Tên nhãn..."
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
                          placeholder="Hướng dẫn cho nhãn này..."
                          value={label.guideline}
                          onChange={(e) =>
                            updateLabel(index, "guideline", e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                  <div className="p-2 border-top text-center">
                    <Button color="link" size="sm" onClick={addLabel}>
                      + Thêm nhãn mới
                    </Button>
                  </div>
                </CardBody>
              </Card>

              <Card className="shadow-sm border-0 mb-3">
                <div className="card-header bg-soft-dark py-2">
                  <h6 className="card-title mb-0 fs-13 fw-bold">
                    PHÂN CÔNG NHÂN VIÊN
                  </h6>
                </div>
                <CardBody>
                  <Select
                    isMulti
                    options={annotatorOptions}
                    placeholder="Tìm kiếm Annotator..."
                    onChange={setSelectedAnnotators}
                    className="basic-multi-select"
                  />
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
                HOÀN TẤT & TẠO DỰ ÁN
              </Button>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
};

export default CreateProject;
