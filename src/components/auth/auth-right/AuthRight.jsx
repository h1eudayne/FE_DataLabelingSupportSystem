import AuthLoginForm from "./AuthLoginForm";
import AuthRegisterLink from "./AuthRegisterLink";
import "../../../assets/css/AuthRight.css";

const AuthRight = () => {
  return (
    <div className="col-lg-6 auth-right bg-white p-0 d-flex flex-column h-100">
      <div className="auth-banner-mobile d-lg-none">
        <img
          alt="Banner"
          className="auth-banner-img"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeItZ62kfSUg1zYALne-800k4zTmtIU23M8RgPaZdyr_gp4E4wdis7JpuanRWAca9DRwANX3E0gQ5oblKZDDsjjqgsr05cSOHA34YvcjaKOQwGPqc9XcZ03Or--PAzU_Xh-IWxXMMkcSrQfCUutunKNN81UXhlcTJvcBS9x2uvIBX7TTf_BTfgD1MGd36BZwoKkH1JiTvvkH3sOyj7Gg3MeEHyz2W-6S3-4hU44SgehHv-mwJd7TEdf8admcV88v0FfoITPZmuPgo"
        />
        <div className="auth-banner-overlay">
          <div className="auth-logo-text" style={{ fontSize: "24px" }}>
            VELZON
          </div>
          <div
            className="auth-title-container"
            style={{ marginBottom: "35px" }}
          >
            <h1 className="auth-main-title">
              Label data with <br />
              <span className="text-precision">precision.</span>
            </h1>
          </div>
          <div
            className="annotation-box"
            style={{
              top: "25%",
              left: "5%",
              width: "90%",
              height: "25%",
            }}
          >
            <span className="annotation-tag" style={{ fontSize: "7px" }}>
              <i className="ri-focus-3-line me-1"></i>
              Label data with
            </span>

            <div className="anchor-point" style={{ top: 0, left: 0 }} />
            <div className="anchor-point" style={{ top: 0, left: "100%" }} />
            <div className="anchor-point" style={{ top: "100%", left: 0 }} />
            <div
              className="anchor-point"
              style={{ top: "100%", left: "100%" }}
            />
          </div>
        </div>
      </div>

      <div className="auth-form-container d-flex flex-column justify-content-center h-100">
        <div className="auth-form-content">
          <h2 className="mb-1">Chào mừng trở lại!</h2>
          <p className="text-muted mb-4">
            Đăng nhập để tiếp tục với
            <span className="text-primary">AILABEL</span>
          </p>
          <AuthLoginForm />
          <div className="mt-3 text-center text-md-start">
            <AuthRegisterLink />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthRight;
