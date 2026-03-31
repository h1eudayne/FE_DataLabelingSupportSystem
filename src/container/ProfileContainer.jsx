import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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

const ProfileContainer = () => {
  const { t } = useTranslation();
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
        finalAvatarUrl = uploadRes.data?.avatarUrl || uploadRes.avatarUrl;
      } else {
        finalAvatarUrl = avatarData;
      }

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
      console.error("Error:", error);
    }
  };

  const handleChangePassword = async (oldPassword, newPassword) => {
    try {
      await changePassword(oldPassword, newPassword);
      console.log("Change Password Successfully");
      await fetchSelf();
    } catch (error) {
      console.error(error);
      alert(t("profileContainer.oldPasswordError"));
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
