import AuthLoginForm from "./AuthLoginForm";
import AuthRegisterLink from "./AuthRegisterLink";
import "../../../assets/css/AuthRight.css";

const AuthRight = () => {
  return (
    <div className="col-lg-6 auth-right bg-white p-0 d-flex flex-column h-100">
      {/* BANNER MOBILE - Chỉ hiển thị trên thiết bị nhỏ */}
      <div className="auth-banner-mobile d-lg-none">
        <img
          alt="Banner"
          className="auth-banner-img"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeItZ62kfSUg1zYALne-800k4zTmtIU23M8RgPaZdyr_gp4E4wdis7JpuanRWAca9DRwANX3E0gQ5oblKZDDsjjqgsr05cSOHA34YvcjaKOQwGPqc9XcZ03Or--PAzU_Xh-IWxXMMkcSrQfCUutunKNN81UXhlcTJvcBS9x2uvIBX7TTf_BTfgD1MGd36BZwoKkH1JiTvvkH3sOyj7Gg3MeEHyz2W-6S3-4hU44SgehHv-mwJd7TEdf8admcV88v0FfoITPZmuPgo"
        />

        <div className="auth-banner-overlay">
          <div className="auth-logo-text" style={{ fontSize: "30px" }}>
            VELZON
          </div>
          <div
            className="auth-title-container"
            style={{ paddingBottom: "20px" }}
          >
            <h1 className="auth-main-title" style={{ color: "white" }}>
              Label data with <br />
              <span className="text-precision">precision.</span>
            </h1>
          </div>

          <div
            className="annotation-box-min"
            style={{
              top: "60%",
              left: "15%",
              width: "62%",
              height: "18%",
            }}
          >
            <span className="annotation-tag">
              <i className="ri-focus-3-line me-1"></i>
              Label data with 99.2%
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

      {/* FORM SECTION - Tự động giãn để căn giữa nội dung */}
      <div className="auth-form-container flex-grow-1 d-flex flex-column justify-content-center">
        <div className="auth-form-content">
          <div className="text-start mb-4">
            <h2 className="auth-welcome-text">Chào mừng trở lại!</h2>
            <p className="text-muted small fw-medium">
              Đăng nhập để tiếp tục với{" "}
              <span className="text-primary">AILABEL</span>
            </p>
          </div>
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
