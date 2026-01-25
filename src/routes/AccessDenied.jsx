import errorImg from "../assets/images/error.svg";

const AccessDenied = () => (
  <div class="auth-page-wrapper pt-5">
    <div>
      <div className="auth-one-bg-position auth-one-bg" id="auth-particles">
        <div className="bg-overlay" />
        <div className="shape">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            version="1.1"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            viewBox="0 0 1440 120"
          >
            <path d="M 0,36 C 144,53.6 432,123.2 720,124 C 1008,124.8 1296,56.8 1440,40L1440 140L0 140z" />
          </svg>
        </div>
      </div>
      <div className="auth-page-content">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="text-center pt-4">
                <div className>
                  <img
                    src={errorImg}
                    className="error-basic-img move-animation"
                    alt="Error"
                  />
                </div>
                <div className="mt-n4">
                  <h1 className="display-1 fw-medium">404</h1>
                  <h3 className="text-uppercase">Sorry, Page not Found 😭</h3>
                  <p className="text-muted mb-4">
                    The page you are looking for not available!
                  </p>
                  <a href="/" className="btn btn-success">
                    <i className="mdi mdi-home me-1" />
                    Back to home
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <footer className="footer">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="text-center">
                <p className="mb-0 text-muted">
                  © Velzon. Crafted with
                  <i className="mdi mdi-heart text-danger" /> by Themesbrand
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </div>
);

export default AccessDenied;
