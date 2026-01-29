import AuthLeft from "../../../components/auth/auth-left/AuthLeft";
import AuthRight from "../../../components/auth/auth-right/AuthRight";

const LoginPage = () => {
  return (
    /* SỬA: d-block trên mobile để bám đỉnh, d-lg-flex và align-items-lg-center để căn giữa trên Laptop */
    <div className="auth-page-wrapper bg-light d-block d-lg-flex align-items-lg-center justify-content-center min-vh-100 py-0 py-lg-4">
      <div className="container p-0 p-lg-3">
        <div className="row justify-content-center g-0">
          <div className="col-xl-9 col-lg-10 col-md-11 p-0">
            {/* Mobile: rounded-0 để khít mép, Desktop: rounded-4 như cũ */}
            <div className="auth-card d-flex flex-column flex-lg-row overflow-hidden border-0 shadow-lg rounded-0 rounded-lg-4 mx-0 mx-lg-2">
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
