import React, { useEffect, useState } from "react";
import NavigationTabs from "../components/admin/home/NavigationTabs";
import { Container } from "react-bootstrap";
import {
  getUsers,
  getUserProfile,
  updateUser,
  updateStatus,
  importUser,
} from "../services/admin/managementUsers/user.api";
import UserManagementView from "../components/admin/home/UserManagementView";
import AdminHeader from "../components/admin/home/AdminHeader";
import LogsView from "../components/admin/home/LogsView";
import UserModal from "../components/admin/managementUser/UserModal";
import AddUser from "../components/admin/home/AddUser";
import projectApi from "../services/admin/managementUsers/project.api";
import { Spinner } from "reactstrap";
import { useTranslation } from "react-i18next";

const AdminContainer = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [systemStats, setSystemStats] = useState({ admins: 0, workers: 0 });

  const [selectUser, setSelectUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [currentName, setCurrentName] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();

  const fetchSelf = async () => {
    try {
      const res = await getUserProfile();
      setCurrentRole(res.data.role);
      setCurrentName(res.data.fullName);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async (currentPage = page) => {
    setLoading(true);
    try {
      const res = await getUsers(currentPage, pageSize);
      const items = res.data.items || [];
      setUsers(items);
      setFilteredUsers(items);
      setTotalCount(res.data.totalCount || 0);
      if (res.data.stats) {
        setSystemStats({
          admins: res.data.stats.totalAdmins,
          workers: res.data.stats.totalWorkers,
        });
      }
      setPage(res.data.page);
    } catch (error) {
      console.error("Lỗi lấy danh sách user:", error);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const fetchProjectsUser = async (userId) => {
    try {
      const res = await projectApi.getAllProjectsUser(userId);
      if (res.data) {
        setUserProjects(res.data);
      }
    } catch (error) {
      console.error(error);
      setUserProjects([]);
    }
  };

  const handleEdit = (user) => {
    setSelectUser(user);
    setIsUserModalOpen(true);
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers(page);
      fetchSelf();
    }
  }, [activeTab, page]);

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }
    const filtered = users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredUsers(filtered);
  };

  const toggleModal = () => {
    setIsUserModalOpen(!isUserModalOpen);
    if (isUserModalOpen) setSelectUser(null);
  };

  const handleSave = async (userData) => {
    try {
      if (selectUser) {
        await updateUser(selectUser.id, userData);
        console.log("Updated Successfully");
      }
      await fetchUsers();
    } catch (error) {
      const serverMessage = error.response?.data?.message || error.message;

      if (
        serverMessage.includes("pending tasks") ||
        error.response?.status === 400
      ) {
        alert(`Không thể đổi vai trò: User này vẫn còn dự án chưa hoàn thành!`);
      } else {
        alert("Đã xảy ra lỗi: " + serverMessage);
      }

      console.error("Lỗi cập nhật:", error);
    }
  };

  const handleActive = async (userId, isActive) => {
    try {
      if (userId) {
        await updateStatus(userId, isActive);
        console.log("Updated Successfully");
      }
      await fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const onCloseCreateModal = () => {
    setFile(null);
    setIsCreateModalOpen(false);
  };

  const uploadUser = async (file) => {
    try {
      const res = await importUser(file);
      if (res.data) {
        await fetchUsers();
      }
      onCloseCreateModal();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px" }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" role="status" />
          <p className="mt-2 text-muted fw-medium">
            {t("adminSettings.loading")}
          </p>
        </div>
      </div>
    );
  }
  return (
    <Container
      fluid
      className="p-4"
      style={{ backgroundColor: "#f3f3f9", minHeight: "100vh" }}
    >
      <AdminHeader fullName={currentName} />

      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "users" && (
        <>
          <UserManagementView
            stats={systemStats}
            totalCount={totalCount}
            users={filteredUsers}
            onSearch={handleSearch}
            onActive={handleActive}
            onEdit={handleEdit}
            currentRole={currentRole}
            openCreateModal={setIsCreateModalOpen}
            getProjects={fetchProjectsUser}
            userProjects={userProjects}
            pagination={{
              totalCount,
              page,
              pageSize,
              onPageChange: (newPage) => setPage(newPage),
            }}
          />
          <UserModal
            isOpen={isUserModalOpen}
            toggle={toggleModal}
            user={selectUser}
            handleSave={handleSave}
          />
          <AddUser
            isOpen={isCreateModalOpen}
            onClose={onCloseCreateModal}
            uploadUser={uploadUser}
            file={file}
            setFile={setFile}
          />
        </>
      )}

      {activeTab === "logs" && <LogsView />}
    </Container>
  );
};

export default AdminContainer;
