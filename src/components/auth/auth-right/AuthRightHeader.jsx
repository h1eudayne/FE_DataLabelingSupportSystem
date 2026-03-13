import { useTranslation } from "react-i18next";

const AuthRightHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="text-center text-lg-start">
      <h2 className="fw-bold text-dark">{t("auth.welcomeBack")}</h2>
      <p className="text-muted fw-medium">
        {t("auth.loginToContinue")} AILABEL
      </p>
    </div>
  );
};

export default AuthRightHeader;
