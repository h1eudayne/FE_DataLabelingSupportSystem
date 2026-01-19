import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthSocialLogin from "./AuthSocialLogin";
import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "@/store/auth/auth.thunk";

const AuthLoginForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user, loading, error } = useSelector(
    (state) => state.auth,
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(
      loginThunk({
        email: email,
        password: password,
      }),
    );
  };

  // Redirect theo role
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "Admin") {
        navigate("/dashboard-analytics", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Khong render lai khi da login
  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="mt-4">
      {error && (
        <div className="alert alert-danger">
          {typeof error === "string" ? error : error?.title || "Login failed"}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Email / Username
          </label>
          <input
            type="email"
            className="form-control"
            id="username"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        <div className="mb-3">
          <div className="float-end">
            <Link to="/forgot-password" className="text-muted">
              Forgot password?
            </Link>
          </div>

          <label className="form-label" htmlFor="password-input">
            Password
          </label>

          <div className="position-relative auth-pass-inputgroup mb-3">
            <input
              type={showPassword ? "text" : "password"}
              className="form-control pe-5 password-input"
              placeholder="Enter password"
              id="password-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              className="btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i
                className={`${
                  showPassword ? "ri-eye-off-fill" : "ri-eye-fill"
                } align-middle`}
              />
            </button>
          </div>
        </div>

        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            id="auth-remember-check"
          />
          <label className="form-check-label" htmlFor="auth-remember-check">
            Remember me
          </label>
        </div>

        <div className="mt-4">
          <button
            className="btn btn-success w-100"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </div>

        <AuthSocialLogin />
      </form>
    </div>
  );
};

export default AuthLoginForm;
