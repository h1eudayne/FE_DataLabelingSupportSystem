import AuthLeft from "../../../components/auth/auth-left/AuthLeft";
import AuthRight from "../../../components/auth/auth-right/AuthRight";

const LoginPage = () => {
  return (
    <div className="auth-page-wrapper bg-light d-flex align-items-center justify-content-center min-vh-100 py-4">
      <div className="container p-0">
        <div className="row justify-content-center g-0">
          <div className="col-xl-9 col-lg-10 col-md-11 p-0">
            {/* mx-3 giúp card có khoảng cách với 2 mép điện thoại */}
            <div className="auth-card d-flex flex-column flex-lg-row overflow-hidden border-0 shadow-lg rounded-4 mx-3 mx-lg-2">
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
