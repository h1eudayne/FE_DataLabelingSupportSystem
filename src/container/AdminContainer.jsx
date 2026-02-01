import React, { useEffect, useState } from "react";
import NavigationTabs from "../components/admin/home/NavigationTabs";
import { Container } from "react-bootstrap";
import {
  getUsers,
  getUserProfile,
  updateUser,
  updateStatus,
} from "../services/admin/managementUsers/user.api";
import UserManagementView from "../components/admin/home/UserManagementView";
import AdminHeader from "../components/admin/home/AdminHeader";
import LogsView from "../components/admin/home/LogsView";
import UserModal from "../components/admin/managementUser/UserModal";

const AdminContainer = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [selectUser, setSelectUser] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);

  const fetchSelf = async () => {
    try {
      const res = await getUserProfile();
      setCurrentRole(res.data.role);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (user) => {
    setSelectUser(user);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers();
      fetchSelf();
    }
  }, [activeTab]);

  const stats = {
    total: users.length,
    admins: users.filter((user) => user.role === "Admin").length,
    workers: users.filter(
      (user) =>
        user.role === "Annotator" ||
        user.role === "Reviewer" ||
        user.role === "Manager",
    ).length,
  };

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
    setIsModalOpen(!isModalOpen);
    if (isModalOpen) setSelectUser(null);
  };

  const handleSave = async (userData) => {
    try {
      if (selectUser) {
        await updateUser(selectUser.id, userData);
        console.log("Updated Successfully");
      }
      await fetchUsers();
    } catch (error) {
      console.error(error);
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

  return (
    <Container
      fluid
      className="p-4"
      style={{ backgroundColor: "#f3f3f9", minHeight: "100vh" }}
    >
      <AdminHeader email="Admin@gmail.com" />

      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "users" && (
        <>
          <UserManagementView
            stats={stats}
            users={filteredUsers}
            onSearch={handleSearch}
            onActive={handleActive}
            onEdit={handleEdit}
            currentRole={currentRole}
          />
          <UserModal
            isOpen={isModalOpen}
            toggle={toggleModal}
            user={selectUser}
            handleSave={handleSave}
          />
        </>
      )}

      {activeTab === "settings" && <SettingsView />}
      {activeTab === "logs" && <LogsView />}
    </Container>
  );
};

export default AdminContainer;
