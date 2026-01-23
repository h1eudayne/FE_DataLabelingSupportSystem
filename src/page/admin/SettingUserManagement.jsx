import React, { useEffect, useState } from "react";
import { getUsers, deleteUser, getUserProfile, updateUser } from "../../services/admin/managementUsers/user.api";
import UserTable from "../../components/admin/managementUser/UserTable";
import { Card, CardBody, CardHeader } from "reactstrap";
import UserFilter from "../../components/admin/managementUser/UserFilter";
import UserModal from "../../components/admin/managementUser/UserModal";

const SettingUserManagement = () => {

  const [users, setUsers] = useState([]);
  const [selectUser, setSelectUser] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchSelf();
  }, []);

  const fetchSelf = async () => {
    try {
      const res = await getUserProfile();
      setCurrentRole(res.data.role);

    } catch (error) {
      console.error(error);
    }
  }

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
    setSelectUser(user)
    setIsModalOpen(true);
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure to delete this user?')) {
      try {
        await deleteUser(id);
        console.log('Deleted Successfully');
        await fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  }

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredUsers(users);
      return;
    }
    const filtered = users.filter(user =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredUsers(filtered);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (isModalOpen) setSelectUser(null);
  }

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
  }

  return (
    <>
      <Card>
        <CardHeader className="d-flex align-items-center">
          <h4 className="card-title mb-0 flex-grow-1">User Management</h4>
        </CardHeader>
        <CardBody>
          <UserFilter onSearch={handleSearch} />
          <UserTable
            users={filteredUsers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            currentRole={currentRole}
          />
        </CardBody>
      </Card>

      <UserModal
        isOpen={isModalOpen}
        toggle={toggleModal}
        user={selectUser}
        handleSave={handleSave}
      />

    </>
  );
};

export default SettingUserManagement;
