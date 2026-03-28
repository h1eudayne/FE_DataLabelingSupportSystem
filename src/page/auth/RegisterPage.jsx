import { useEffect, useState } from "react";
import AuthLeft from "../../components/auth/auth-left/AuthLeft";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const RegisterPage = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", "light");
    return () => {
      const themeToRestore = localStorage.getItem("theme") || "light";
      document.documentElement.setAttribute("data-bs-theme", themeToRestore);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = t("register.errors.fullNameRequired");
    }
    if (!formData.email.trim()) {
      newErrors.email = t("register.errors.emailRequired");
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t("register.errors.emailInvalid");
    }
    if (!formData.password) {
      newErrors.password = t("register.errors.passwordRequired");
    } else if (formData.password.length < 6) {
      newErrors.password = t("register.errors.passwordTooShort");
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t("register.errors.passwordMismatch");
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Registration submitted:", formData);
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setIsSubmitting(false);
    }
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
                    <div className="text-center mb-4">
                      <Link to="/" className="d-block mb-3">
                        <img
                          src="https://res.cloudinary.com/deu3ur8w9/image/upload/v1769842054/logo-1_jc0rul.png"
                          alt="logo"
                          height="40"
                        />
                      </Link>
                      <h2 className="mb-1">{t("register.createAccount")}</h2>
                      <p className="text-muted mb-0">
                        {t("register.joinToStart")}
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                      <div className="mb-3">
                        <label htmlFor="fullName" className="form-label">
                          {t("register.fullName")}
                        </label>
                        <input
                          type="text"
                          className={`form-control ${errors.fullName ? "is-invalid" : ""}`}
                          id="fullName"
                          name="fullName"
                          placeholder={t("register.enterFullName")}
                          value={formData.fullName}
                          onChange={handleChange}
                        />
                        {errors.fullName && (
                          <div className="invalid-feedback">{errors.fullName}</div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                          {t("register.email")}
                        </label>
                        <input
                          type="email"
                          className={`form-control ${errors.email ? "is-invalid" : ""}`}
                          id="email"
                          name="email"
                          placeholder={t("register.enterEmail")}
                          value={formData.email}
                          onChange={handleChange}
                        />
                        {errors.email && (
                          <div className="invalid-feedback">{errors.email}</div>
                        )}
                      </div>

                      <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                          {t("register.password")}
                        </label>
                        <input
                          type="password"
                          className={`form-control ${errors.password ? "is-invalid" : ""}`}
                          id="password"
                          name="password"
                          placeholder={t("register.enterPassword")}
                          value={formData.password}
                          onChange={handleChange}
                        />
                        {errors.password && (
                          <div className="invalid-feedback">{errors.password}</div>
                        )}
                      </div>

                      <div className="mb-4">
                        <label htmlFor="confirmPassword" className="form-label">
                          {t("register.confirmPassword")}
                        </label>
                        <input
                          type="password"
                          className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                          id="confirmPassword"
                          name="confirmPassword"
                          placeholder={t("register.confirmPasswordPlaceholder")}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                        />
                        {errors.confirmPassword && (
                          <div className="invalid-feedback">{errors.confirmPassword}</div>
                        )}
                      </div>

                      <div className="mb-4">
                        <div className="form-check">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            id="agreeTerms"
                            required
                          />
                          <label className="form-check-label" htmlFor="agreeTerms">
                            {t("register.agreeTo")}{" "}
                            <a href="#" className="text-primary">
                              {t("register.termsOfService")}
                            </a>
                          </label>
                        </div>
                      </div>

                      <div className="d-grid mb-3">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              {t("register.registering")}
                            </>
                          ) : (
                            t("register.createAccountBtn")
                          )}
                        </button>
                      </div>

                      <div className="text-center mt-3">
                        <p className="text-muted mb-0">
                          {t("register.alreadyHaveAccount")}{" "}
                          <Link to="/login" className="text-primary fw-medium">
                            {t("register.signIn")}
                          </Link>
                        </p>
                      </div>
                    </form>
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

export default RegisterPage;
