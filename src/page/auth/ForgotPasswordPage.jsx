import { useState } from "react";
import AuthLeft from "../../components/auth/auth-left/AuthLeft";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import forgotPasswordApi from "../../services/auth/forgotPassword/forgotPassword.api";
import { toast } from "react-toastify";

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError(t("forgotPassword.emailRequired"));
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError(t("forgotPassword.emailInvalid"));
      return;
    }

    setIsLoading(true);
    try {
      const response = await forgotPasswordApi(email);
      setIsSuccess(true);
      toast.success(t("forgotPassword.success"));
    } catch (err) {
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        t("forgotPassword.error");
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div
      className="auth-page-wrapper bg-light d-flex align-items-center justify-content-center min-vh-100 py-4"
      style={{ overflowY: "auto" }}
    >
      <div className="container p-0">
        <div className="row justify-content-center g-0">
          <div className="col-xl-9 col-lg-10 col-md-11 p-0">
            <div className="auth-card d-flex flex-column flex-lg-row border-0 shadow-lg mx-3 mx-lg-auto bg-white">
              <AuthLeft />
              <div className="col-lg-6 auth-right bg-white p-0 d-flex flex-column h-100">
                <div className="auth-form-container flex-grow-1">
                  <div className="auth-form-content p-4 p-lg-5">
                    {!isSuccess ? (
                      <>
                        <div className="text-center mb-4">
                          <Link to="/" className="d-block mb-3">
                            <img
                              src="https://res.cloudinary.com/deu3ur8w9/image/upload/v1769842054/logo-1_jc0rul.png"
                              alt="logo"
                              height="40"
                            />
                          </Link>
                          <h2 className="mb-1">{t("forgotPassword.title")}</h2>
                          <p className="text-muted">
                            {t("forgotPassword.subtitle")}
                          </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                          <div className="mb-4">
                            <label
                              htmlFor="email"
                              className="form-label fw-bold text-muted small"
                            >
                              {t("auth.email")}
                            </label>
                            <div className="input-group bg-light rounded-3">
                              <span className="input-group-text bg-transparent border-0">
                                <i className="ri-mail-line"></i>
                              </span>
                              <input
                                type="email"
                                id="email"
                                className={`form-control bg-transparent border-0 py-2 ${
                                  error ? "is-invalid" : ""
                                }`}
                                placeholder={t("forgotPassword.enterEmail")}
                                value={email}
                                onChange={(e) => {
                                  setEmail(e.target.value);
                                  setError("");
                                }}
                                disabled={isLoading}
                              />
                            </div>
                            {error && (
                              <div className="text-danger small mt-2">
                                {error}
                              </div>
                            )}
                          </div>

                          <div className="d-grid mb-3">
                            <button
                              type="submit"
                              className="btn btn-primary"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2" />
                                  {t("forgotPassword.sending")}
                                </>
                              ) : (
                                t("forgotPassword.resetButton")
                              )}
                            </button>
                          </div>
                        </form>

                        <div className="text-center mt-3">
                          <p className="text-muted mb-0">
                            {t("forgotPassword.rememberPassword")}{" "}
                            <Link
                              to="/login"
                              className="text-primary fw-medium"
                            >
                              {t("auth.signIn")}
                            </Link>
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-center py-5">
                          <div className="mb-4">
                            <i
                              className="ri-mail-send-line text-success"
                              style={{ fontSize: "4rem" }}
                            ></i>
                          </div>
                          <h3 className="mb-3">{t("forgotPassword.emailSent")}</h3>
                          <p className="text-muted mb-4">
                            {t("forgotPassword.emailSentDesc")}
                          </p>
                          <button
                            onClick={handleBackToLogin}
                            className="btn btn-primary"
                          >
                            {t("forgotPassword.backToLogin")}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
