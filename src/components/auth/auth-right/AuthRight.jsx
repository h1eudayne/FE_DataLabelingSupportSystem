import AuthLoginForm from "./AuthLoginForm";
import "../../../assets/css/AuthRight.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Dropdown } from "react-bootstrap";
import { ChevronDown, Globe } from "lucide-react";
import { useState } from "react";

const AuthRight = () => {
  const { t, i18n } = useTranslation();

  const [currentLang, setCurrentLang] = useState(() => {
    const saved = localStorage.getItem("i18nLang") || "vi";
    return saved === "en"
      ? {
          code: "en",
          flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/us.svg",
          name: "English",
        }
      : {
          code: "vi",
          flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/vn.svg",
          name: "Tiếng Việt",
        };
  });

  const popperConfig = {
    modifiers: [{ name: "offset", options: { offset: [0, 10] } }],
  };

  return (
    <div className="col-lg-6 auth-right bg-white p-0 d-flex flex-column h-100">
      {/* Banner Mobile */}
      <div className="auth-banner-mobile d-lg-none">
        <img
          alt="Banner"
          className="auth-banner-img"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeItZ62kfSUg1zYALne-800k4zTmtIU23M8RgPaZdyr_gp4E4wdis7JpuanRWAca9DRwANX3E0gQ5oblKZDDsjjqgsr05cSOHA34YvcjaKOQwGPqc9XcZ03Or--PAzU_Xh-IWxXMMkcSrQfCUutunKNN81UXhlcTJvcBS9x2uvIBX7TTf_BTfgD1MGd36BZwoKkH1JiTvvkH3sOyj7Gg3MeEHyz2W-6S3-4hU44SgehHv-mwJd7TEdf8admcV88v0FfoITPZmuPgo"
        />
        <div className="auth-banner-overlay">
          <Link to="/" className="d-block">
            <img
              src="https://res.cloudinary.com/deu3ur8w9/image/upload/v1769842054/logo-1_jc0rul.png"
              alt="logo"
              height={35}
            />
          </Link>
          <div
            className="auth-title-container"
            style={{ marginBottom: "35px" }}
          >
            <h1 className="auth-main-title">
              {t("auth.labelDataWith")} <br />
              <span className="text-precision">{t("auth.precision")}</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="auth-form-container flex-grow-1 position-relative">
        <div className="position-absolute top-0 end-0 p-4">
          <Dropdown>
            <Dropdown.Toggle
              variant="light"
              className="d-flex align-items-center gap-1 p-1 border-0 bg-transparent shadow-none hide-extra-icon"
            >
              <img
                src={currentLang.flag}
                width="22"
                className="rounded-1 shadow-sm"
                alt="flag"
              />
              <ChevronDown size={12} className="text-muted" strokeWidth={2} />
            </Dropdown.Toggle>
            <Dropdown.Menu
              align="end"
              className="shadow-lg border-0 dropdown-menu-animated"
              popperConfig={popperConfig}
            >
              <Dropdown.Item
                onClick={() => {
                  i18n.changeLanguage("vi");
                  setCurrentLang({
                    code: "vi",
                    name: "Tiếng Việt",
                    flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/vn.svg",
                  });
                }}
                className="d-flex align-items-center gap-2 py-2"
              >
                <img
                  src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/vn.svg"
                  width="20"
                  alt="VN"
                />{" "}
                Tiếng Việt
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => {
                  i18n.changeLanguage("en");
                  setCurrentLang({
                    code: "en",
                    name: "English",
                    flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/us.svg",
                  });
                }}
                className="d-flex align-items-center gap-2 py-2"
              >
                <img
                  src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.4.3/flags/4x3/us.svg"
                  width="20"
                  alt="US"
                />{" "}
                English
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <div className="auth-form-content">
          <h2 className="mb-1">{t("auth.welcomeBack")}</h2>
          <p className="text-muted mb-4">
            {t("auth.loginToContinue")}{" "}
            <span className="text-primary fw-bold">AILABEL</span>
          </p>

          <AuthLoginForm />
          <div className="mt-4 text-center text-muted small">
            <p className="mb-0">
              <i className="ri-information-line me-1"></i>
              {t("auth.contactAdminForAccount") ||
                "Liên hệ Admin để được tạo tài khoản"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthRight;
