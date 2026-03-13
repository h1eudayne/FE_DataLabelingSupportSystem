import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AuthRegisterLink = () => {
  const { t } = useTranslation();

  return (
    <div className="mt-5 text-center">
      <p className="mb-0">
        {t("auth.noAccount")}{" "}
        <Link
          to="/register"
          className="fw-semibold text-primary text-decoration-underline"
        >
          {t("auth.register")}
        </Link>
      </p>
    </div>
  );
};

export default AuthRegisterLink;
