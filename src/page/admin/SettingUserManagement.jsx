import React, { useEffect, useState } from "react";
import {
  getUsers,
  getUserProfile,
  updateUser,
  updateStatus,
  importUser,
} from "../../services/admin/managementUsers/user.api";
import UserTable from "../../components/admin/managementUser/UserTable";
import { Card, CardBody, CardHeader } from "reactstrap";
import UserFilter from "../../components/admin/managementUser/UserFilter";
import UserModal from "../../components/admin/managementUser/UserModal";
import AddUser from "../../components/admin/home/AddUser";
import { Button } from "react-bootstrap";
import { UserPlus } from "lucide-react";

const SettingUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectUser, setSelectUser] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [file, setFile] = useState(null);

  const fetchSelf = async () => {
    try {
      const res = await getUserProfile();
      setCurrentRole(res.data.role);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUsers = async (currentPage = page) => {
    try {
      const res = await getUsers(currentPage, pageSize);
      const data = res.data;
      setUsers(data.items || []);
      setFilteredUsers(data.items || []);
      setTotalCount(data.totalCount || 0);
      setPage(data.page || currentPage);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  useEffect(() => {
    fetchSelf();
  }, []);

  const handleEdit = (user) => {
    setSelectUser(user);
    setIsModalOpen(true);
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

  return (
    <>
      <Card>
        <CardHeader className="bg-white border-bottom py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h4 className="card-title mb-1 fw-bold">User Management</h4>
              <p className="text-muted small mb-0">
                Quản lý danh sách thành viên và phân quyền hệ thống
              </p>
            </div>

            <Button
              variant="primary"
              className="d-flex align-items-center gap-2 shadow-sm px-3 py-2"
              style={{ borderRadius: "10px" }}
              onClick={() => setIsCreateModalOpen(true)}
            >
              <UserPlus size={18} />
              <span className="fw-semibold">Thêm nhân viên</span>
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <UserFilter onSearch={handleSearch} />
          <UserTable
            users={filteredUsers}
            onEdit={handleEdit}
            onActive={handleActive}
            currentRole={currentRole}
            totalCount={totalCount}
            pagination={{
              page,
              pageSize,
              onPageChange: (newPage) => setPage(newPage),
            }}
          />
        </CardBody>
      </Card>

      <UserModal
        isOpen={isModalOpen}
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
  );
};

export default SettingUserManagement;
