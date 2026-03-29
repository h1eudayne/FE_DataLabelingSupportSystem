import { useTranslation } from "react-i18next";
import { Activity, ShieldCheck, Users } from "lucide-react";

const AdminHeader = ({ fullName }) => {
  const { t } = useTranslation();

  return (
    <section className="admin-page-header">
      <div className="admin-page-header__content">
        <div className="admin-page-header__eyebrow">
          {t("userMgmt.adminBoard")}
        </div>
        <h1 className="admin-page-header__title">
          {t("common.welcomeBack")} {fullName || t("userMgmt.systemAdmin")}
        </h1>
        <p className="admin-page-header__subtitle">
          {t("userMgmt.staffListDesc")}
        </p>
      </div>

      <div className="admin-page-header__meta">
        <div className="admin-page-header__chip">
          <ShieldCheck size={18} />
          <span>{t("userMgmt.admins")}</span>
        </div>
        <div className="admin-page-header__chip">
          <Users size={18} />
          <span>{t("adminNavTabs.userManagement")}</span>
        </div>
        <div className="admin-page-header__chip">
          <Activity size={18} />
          <span>{t("adminNavTabs.activityLogs")}</span>
        </div>
      </div>
    </section>
  );
};

export default AdminHeader;
