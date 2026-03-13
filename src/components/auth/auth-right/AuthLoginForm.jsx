import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "@/store/auth/auth.thunk";
import AuthSocialLogin from "./AuthSocialLogin";
import { useTranslation } from "react-i18next";

const AuthLoginForm = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user, loading, error } = useSelector(
    (state) => state.auth,
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow || "auto";
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(
      loginThunk({
        email,
        password,
      }),
    );
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  if (isAuthenticated && user) return null;

  return (
    <div>
      {error && (
        <div className="alert alert-danger py-2 small">
          {typeof error === "string" ? error : error?.title || t("auth.loginFailed")}
        </div>
      )}

      <form onSubmit={handleSubmit} className="text-start">
        <div className="mb-3">
          <label className="form-label fw-bold text-muted small">
            {t("auth.email")}
          </label>
          <div className="input-group auth-input rounded-3">
            <span className="input-group-text bg-transparent border-0">
              <i className="ri-mail-line"></i>
            </span>
            <input
              type="email"
              className="form-control bg-transparent border-0 py-2"
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between">
            <label className="form-label fw-bold text-muted small">
              {t("auth.password")}
            </label>
            <Link
              to="/forgot-password"
              className="text-decoration-none small fw-bold"
              style={{ color: "#0ab39c" }}
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>

          <div className="input-group bg-light rounded-3">
            <span className="input-group-text bg-transparent border-0">
              <i className="ri-lock-line"></i>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              className="form-control bg-transparent border-0 py-2"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="btn border-0"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="toggle password visibility"
            >
              <i
                className={showPassword ? "ri-eye-off-fill" : "ri-eye-fill"}
              ></i>
            </button>
          </div>
        </div>

        <div className="form-check mb-4">
          <input className="form-check-input" type="checkbox" />
          <label className="form-check-label text-muted small">
            {t("auth.rememberMe")}
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn w-100 py-3 fw-bold text-white rounded-3 shadow-none"
          style={{
            background: "linear-gradient(135deg, #0ab39c 0%, #405189 100%)",
          }}
        >
          {loading ? t("auth.loginProcessing") : t("auth.login")}
        </button>
      </form>
    </div>
  );
};

export default AuthLoginForm;
