import React, { useEffect, useState } from "react";
import NavigationTabs from "../components/admin/home/NavigationTabs";
import { Container } from "react-bootstrap";
import {
  getUsers,
  createUser,
  deleteUser,
} from "../services/admin/managementUsers/user.api";
import UserManagementView from "../components/admin/home/UserManagementView";
import UserModal from "../components/admin/managementUser/UserModal";
import AdminHeader from "../components/admin/home/AdminHeader";
import LogsView from "../components/admin/home/LogsView";
import SettingsView from "../components/admin/home/SettingsView";

const AdminContainer = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data || []);
    } catch (err) {
      console.error("Lỗi fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa?")) {
      try {
        await deleteUser(id);
        fetchUsers();
      } catch (err) {
        console.error("Lỗi xóa:", err);
      }
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      await createUser(userData);
      fetchUsers();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Lỗi tạo user:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
  }, [activeTab]);

  const stats = {
    total: users.length,
    admins: users.filter((u) => u.role === "Admin").length,
    workers: users.filter(
      (u) => u.role === "Annotator" || u.role === "Reviewer",
    ).length,
  };

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Container
      fluid
      className="p-4"
      style={{ backgroundColor: "#f3f3f9", minHeight: "100vh" }}
    >
      <AdminHeader email="Admin@gmail.com" />

      <NavigationTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {activeTab === "users" && (
        <UserManagementView
          stats={stats}
          users={filteredUsers}
          loading={loading}
          onSearch={setSearchTerm}
          onAddClick={() => setIsModalOpen(true)}
          onDelete={handleDeleteUser}
        />
      )}

      {activeTab === "settings" && <SettingsView />}
      {activeTab === "logs" && <LogsView />}

      <UserModal
        isOpen={isModalOpen}
        toggle={() => setIsModalOpen(!isModalOpen)}
        handleSave={handleSaveUser}
      />
    </Container>
  );
};

export default AdminContainer;
