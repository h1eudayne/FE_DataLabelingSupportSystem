import { useTranslation } from "react-i18next";

const AdminHeader = ({ fullName }) => {
  const { t } = useTranslation();

  return (
    <div className="mb-4 d-flex align-items-center gap-2">
      <div>
        <h3 className="fw-bold mb-0">
          {t("common.welcomeBack")}, {fullName}
        </h3>
      </div>
    </div>
  );
};

export default AdminHeader;
