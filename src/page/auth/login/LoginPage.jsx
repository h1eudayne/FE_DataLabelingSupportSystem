import AuthLeft from "../../../components/auth/auth-left/AuthLeft";
import AuthRight from "../../../components/auth/auth-right/AuthRight";

const LoginPage = () => {
  return (
    <div className="auth-page-wrapper d-flex justify-content-center align-items-center min-vh-100 bg-light py-4 py-lg-0">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-9 col-lg-10 col-md-11 p-0">
            {/* flex-column giúp banner nhảy lên đầu trên mobile */}
            <div className="auth-card d-flex flex-column flex-lg-row overflow-hidden border-0 shadow-lg rounded-4 mx-2">
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
