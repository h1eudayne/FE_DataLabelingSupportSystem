import AuthLeftLogo from "./AuthLeftLogo";
import AuthLeftQuotes from "./AuthLeftQuotes";

const AuthLeft = () => {
  return (
    <div className="col-lg-6 d-none d-lg-block p-0">
      <div className="auth-one-bg auth-left h-100 position-relative">
        <div className="bg-overlay" />

        <div className="auth-left-inner">
          <div className="auth-left-content">
            <div>
              <AuthLeftLogo />

              <div className="mt-4 text-white" style={{ paddingLeft: "5px" }}>
                <h1 className="display-6 fw-bold mb-3 text-white">
                  Label data with <br />
                  <span className="text-primary">precision.</span>
                </h1>

                <p className="text-white-50 fs-16 fw-light max-w-text">
                  Nền tảng gán nhãn dữ liệu thông minh, chuyển hóa hình ảnh
                  thành trí tuệ nhân tạo.
                </p>
              </div>
            </div>

            <div
              className="annotation-box"
              style={{
                top: "60%",
                left: "15%",
                width: "62%",
                height: "18%",
              }}
            >
              <span className="annotation-tag">
                <i className="ri-focus-3-line me-1"></i>
                Laptop: Object 99.2%
              </span>

              <div className="anchor-point" style={{ top: 0, left: 0 }} />
              <div className="anchor-point" style={{ top: 0, left: "100%" }} />
              <div className="anchor-point" style={{ top: "100%", left: 0 }} />
              <div
                className="anchor-point"
                style={{ top: "100%", left: "100%" }}
              />
            </div>

            <div
              className="quotes-wrapper"
              style={{ paddingLeft: "5px", paddingTop: "30px" }}
            >
              <AuthLeftQuotes />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLeft;
