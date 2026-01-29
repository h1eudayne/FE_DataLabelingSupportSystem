import AuthLeftQuotes from "../auth-left/AuthLeftQuotes";
import AuthLoginForm from "./AuthLoginForm";
import AuthRegisterLink from "./AuthRegisterLink";
import "../../../assets/css/AuthRight.css";

const AuthRight = () => {
  return (
    <div className="col-lg-6 auth-right bg-white p-0 d-flex flex-column">
      {/* BANNER MOBILE */}
      <div className="auth-banner-mobile d-lg-none">
        <img
          alt="Banner"
          className="auth-banner-img"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBeItZ62kfSUg1zYALne-800k4zTmtIU23M8RgPaZdyr_gp4E4wdis7JpuanRWAca9DRwANX3E0gQ5oblKZDDsjjqgsr05cSOHA34YvcjaKOQwGPqc9XcZ03Or--PAzU_Xh-IWxXMMkcSrQfCUutunKNN81UXhlcTJvcBS9x2uvIBX7TTf_BTfgD1MGd36BZwoKkH1JiTvvkH3sOyj7Gg3MeEHyz2W-6S3-4hU44SgehHv-mwJd7TEdf8admcV88v0FfoITPZmuPgo"
        />

        <div className="auth-banner-overlay">
          {/* 1. LOGO */}
          <div className="auth-logo-text">VELZON</div>

          {/* 2. TIÊU ĐỀ */}
          <div className="auth-title-container">
            <h1 className="auth-main-title" style={{ color: "white" }}>
              Label data with <br />
              <span className="text-precision">precision.</span>
            </h1>
          </div>

          {/* 3. ANNOTATION BOX */}
          <div className="auth-annotation-box">
            <span className="auth-annotation-tag">
              <i className="ri-focus-3-line me-1"></i>
              Label data with
            </span>

            {/* Các điểm neo 4 góc */}
            <div className="anchor anchor-tl" />
            <div className="anchor anchor-tr" />
            <div className="anchor anchor-bl" />
            <div className="anchor anchor-br" />
          </div>

          {/* 4. QUOTES */}
          <div className="auth-quotes-wrapper">
            <AuthLeftQuotes isMobile={true} />
          </div>
        </div>
      </div>

      {/* FORM SECTION */}
      <div className="auth-form-container">
        <div className="text-start mb-4">
          <h2 className="auth-welcome-text">Chào mừng trở lại!</h2>
          <p className="text-muted fw-medium">
            Đăng nhập để tiếp tục với AILABEL
          </p>
        </div>

        <AuthLoginForm />
        <AuthRegisterLink />

        <footer className="auth-footer d-lg-none">
          <p className="mb-0">
            © 2026 Velzon. Crafted with <span className="text-danger">❤️</span>{" "}
            by Themesbrand
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AuthRight;
