import { useEffect, useState } from "react";
import ProfileTable from "../components/home/ProfileTable";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
} from "../services/admin/managementUsers/user.api";
import ProfileModal from "../components/home/ProfileModal";
const ProfileContainer = () => {
  const [userSelf, setUserSelf] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSelf = async () => {
    try {
      const res = await getUserProfile();
      setUserSelf(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditProfile = () => {
    setIsModalOpen(true);
  };
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  useEffect(() => {
    fetchSelf();
  }, []);

  const handleSave = async (fullName, avatarUrl) => {
    try {
      await updateUserProfile(fullName, avatarUrl);
      console.log("Update Successfully");
      await fetchSelf();
    } catch (error) {
      console.error(error);
    }
  };

  const handleChangePassword = async (oldPassword, newPassword) => {
    try {
      await changePassword(oldPassword, newPassword);
      console.log("Change Password Successfully");
      await fetchSelf();
    } catch (error) {
      console.error(error);
      alert("Mật khẩu cũ không chính xác hoặc có lỗi xảy ra");
    }
  };
  return (
    <>
      <ProfileTable
        userSelf={userSelf}
        onEditProfile={handleEditProfile}
        onChangePass={handleChangePassword}
      />
      <ProfileModal
        userSelf={userSelf}
        toggleModal={toggleModal}
        isOpen={isModalOpen}
        handleSave={handleSave}
      />
    </>
  );
};

export default ProfileContainer;
