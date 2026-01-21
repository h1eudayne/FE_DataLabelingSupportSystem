import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchProjects } from "../../../store/manager/project/projectSlice";
import projectService from "../../../services/manager/project/projectService";
import Swal from "sweetalert2";
import ProjectCard from "../../../components/manager/project/ProjectCard";

const ProjectsAllProjectsPage = () => {
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
      (filterStatus === "Active" && !project.isCompleted);
    return matchesSearch && matchesStatus;
  });

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: "Dự án và toàn bộ nhãn, dữ liệu liên quan sẽ bị xóa vĩnh viễn!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#f06548",
      confirmButtonText: "Đồng ý xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await projectService.deleteProject(id);
        Swal.fire("Đã xóa!", "Dự án đã được loại bỏ.", "success");
        dispatch(fetchProjects());
      } catch (error) {
        Swal.fire("Lỗi!", "Không thể xóa dự án này.", error);
      }
    }
  };

  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 className="mb-sm-0">Quản lý dự án</h4>
            <div className="page-title-right">
              <ol className="breadcrumb m-0">
                <li className="breadcrumb-item">
                  <Link to="#">Dự án</Link>
                </li>
                <li className="breadcrumb-item active">Danh sách</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card card-animate border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                    Tổng số dự án
                  </p>
                </div>
              </div>
              <div className="d-flex align-items-end justify-content-between mt-4">
                <div>
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    {items?.length || 0}
                  </h4>
                  <span className="badge bg-soft-info text-info">
                    Manager View
                  </span>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span className="avatar-title bg-soft-primary rounded fs-3">
                    <i className="ri-folder-2-line text-primary"></i>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-sm-auto">
          <Link to="/projects-create" className="btn btn-success">
            <i className="ri-add-line align-bottom me-1"></i> Tạo dự án mới
          </Link>
        </div>
        <div className="col-sm">
          <div className="d-flex justify-content-sm-end gap-2">
            <div className="search-box">
              <input
                type="text"
                className="form-control"
                placeholder="Tìm tên dự án..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="ri-search-line search-icon"></i>
            </div>
            <select
              className="form-select w-md"
              style={{ width: "180px" }}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="Active">Đang hoạt động</option>
              <option value="Completed">Đã hoàn thành</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row">
        {loading ? (
          <div className="col-12 text-center p-5">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="mt-2 text-muted">Đang tải danh sách...</div>
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
                <h5 className="mt-3">Không tìm thấy dự án</h5>
                <p className="text-muted">
                  Bạn chưa có dự án nào hoặc từ khóa tìm kiếm không khớp.
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
