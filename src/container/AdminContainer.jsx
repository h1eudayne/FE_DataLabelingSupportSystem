import React, { useCallback, useEffect, useState } from "react";
import NavigationTabs from "../components/admin/home/NavigationTabs";
import { Container, Spinner } from "react-bootstrap";
import {
  getUsers,
  getUserProfile,
  updateUser,
  updateStatus,
  importUser,
  getAdmins,
} from "../services/admin/managementUsers/user.api";
import UserManagementView from "../components/admin/home/UserManagementView";
import AdminHeader from "../components/admin/home/AdminHeader";
import LogsView from "../components/admin/home/LogsView";
import UserModal from "../components/admin/managementUser/UserModal";
import AddUser from "../components/admin/home/AddUser";
import projectApi from "../services/admin/managementUsers/project.api";
import { useTranslation } from "react-i18next";

const AdminContainer = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [managers, setManagers] = useState([]);

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [systemStats, setSystemStats] = useState({ admins: 0, workers: 0 });

  const [selectUser, setSelectUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [currentName, setCurrentName] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  const { t } = useTranslation();

  const fetchSelf = useCallback(async () => {
    try {
      const res = await getUserProfile();
      setCurrentRole(res.data.role);
      setCurrentName(res.data.fullName);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const fetchUsers = useCallback(
    async (currentPage = page) => {
      setLoading(true);
      try {
        const resAdmins = await getAdmins();
        const adminUsers = resAdmins.data.filter(
          (user) => user.role === "Admin",
        );
        const managerUsers = resAdmins.data.filter(
          (user) => user.role === "Manager",
        );

        const resUser = await getUsers(currentPage, pageSize);
        const items = resUser.data.items || [];
        setAdmins(adminUsers);
        setManagers(managerUsers);
        setUsers(items);
        setFilteredUsers(items);
        setTotalCount(resUser.data.totalCount || 0);
        if (resUser.data.stats) {
          setSystemStats({
            admins: resUser.data.stats.totalAdmins,
            workers: resUser.data.stats.totalWorkers,
          });
        }
        setPage(resUser.data.page);
      } catch (error) {
        console.error("Error fetching user list:", error);
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    },
    [page, pageSize],
  );

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
  }, [activeTab, page, fetchSelf, fetchUsers]);

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
        alert(t("admin.cannotChangeRole"));
      } else {
        alert(t("admin.errorOccurred") + ": " + serverMessage);
      }

      console.error("Error updating:", error);
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
      if (error.response && error.response.status === 400) {
        alert(t("admin.errorStatus"));
      } else {
        console.error(error);
      }
    }
  };

  const onCloseCreateModal = () => {
    setFile(null);
    setIsCreateModalOpen(false);
  };

  const uploadUser = async (file) => {
    setIsImporting(true);
    try {
      const res = await importUser(file);
      if (res.data) {
        if (res.data.successCount > 0) {
          await fetchUsers();
          alert("Import successfully");
        }
      }
      onCloseCreateModal();
    } catch (error) {
      alert(`Import fail: `, error);
    } finally {
      setIsImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-shell">
        <div className="admin-shell__inner">
          <div className="admin-loading-state">
            <div className="text-center">
              <Spinner animation="border" variant="primary" role="status" />
              <p className="mt-2 text-muted fw-medium">
                {t("adminSettings.loading")}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <Container fluid className="admin-shell">
      <div className="admin-shell__inner">
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
              admins={admins}
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
              managers={managers}
            />
            <AddUser
              isOpen={isCreateModalOpen}
              onClose={onCloseCreateModal}
              uploadUser={uploadUser}
              file={file}
              setFile={setFile}
              isImporting={isImporting}
            />
          </>
        )}

        {activeTab === "logs" && <LogsView embedded />}
      </div>
    </Container>
  );
};

export default AdminContainer;
