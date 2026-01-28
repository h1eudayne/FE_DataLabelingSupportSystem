import React, { useEffect, useState } from "react";
import NavigationTabs from "../components/admin/home/NavigationTabs";
import { Container } from "react-bootstrap";
import { userService } from "../services/manager/project/userService";
import UserManagementView from "../components/admin/home/UserManagementView";
import AdminHeader from "../components/admin/home/AdminHeader";
import LogsView from "../components/admin/home/LogsView";

const AdminContainer = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers();
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
        await userService.deleteUser(id);
        fetchUsers();
      } catch (err) {
        console.error("Lỗi xóa:", err);
      }
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
    </Container>
  );
};

export default AdminContainer;
