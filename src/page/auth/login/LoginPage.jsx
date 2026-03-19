import { useEffect } from "react";
import AuthLeft from "../../../components/auth/auth-left/AuthLeft";
import AuthRight from "../../../components/auth/auth-right/AuthRight";

const LoginPage = () => {
  // Force light theme on login page — restore user's saved theme on unmount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-bs-theme", "light");

    return () => {
      // Restore the user's preferred theme when leaving login page
      const themeToRestore = localStorage.getItem("theme") || savedTheme;
      document.documentElement.setAttribute("data-bs-theme", themeToRestore);
    };
  }, []);

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
              <AuthRight />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
