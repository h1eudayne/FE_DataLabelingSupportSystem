import { useEffect, useState } from "react";
import ProfileTable from "../components/home/ProfileTable";
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  uploadAvatar,
} from "../services/admin/managementUsers/user.api";
import ProfileModal from "../components/home/ProfileModal";
import { useDispatch } from "react-redux";
import { updateUser } from "@/store/auth/auth.slice";
import { BACKEND_URL } from "../services/axios.customize";

const ProfileContainer = () => {
  const [userSelf, setUserSelf] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dispatch = useDispatch();

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

  const handleSave = async (fullName, avatarData) => {
    try {
      let finalAvatarUrl = userSelf.avatarUrl;

      if (avatarData instanceof File) {
        const uploadRes = await uploadAvatar(avatarData);
        const relativePath = uploadRes.data?.avatarUrl || uploadRes.avatarUrl;

        // Nối URL động: lấy từ cấu hình Axios
        // Xử lý dấu "/" dư thừa nếu có để tránh lỗi link dạng //avatars/...
        const cleanPath = relativePath.startsWith("/")
          ? relativePath
          : `/${relativePath}`;
        const cleanBase = BACKEND_URL.endsWith("/")
          ? BACKEND_URL.slice(0, -1)
          : BACKEND_URL;

        finalAvatarUrl = `${cleanBase}${cleanPath}`;
      } else {
        finalAvatarUrl = avatarData;
      }

      // Sau đó gọi API lưu profile bình thường
      await updateUserProfile(fullName, finalAvatarUrl);

      dispatch(
        updateUser({
          fullName: fullName,
          avatarUrl: finalAvatarUrl,
        }),
      );

      await fetchSelf();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Lỗi:", error);
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
