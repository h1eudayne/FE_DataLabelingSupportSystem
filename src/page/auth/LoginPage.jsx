import { AuthLeft, AuthRight, AuthFooter } from "../../components/auth";

const LoginPage = () => {
  return (
    <div className="auth-page-wrapper auth-bg-cover py-5 d-flex justify-content-center align-items-center min-vh-100">
      <div className="bg-overlay" />

      <div className="auth-page-content overflow-hidden pt-lg-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="card overflow-hidden card-bg-fill border-0 card-border-effect-none">
                <div className="row g-0">
                  <AuthLeft />
                  <AuthRight />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthFooter />
    </div>
  );
};

export default LoginPage;
