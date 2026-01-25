const AuthSocialLogin = () => {
  return (
    <div className="mt-4 text-center">
      <div className="signin-other-title">
        <h5 className="fs-13 mb-4 title">Sign In with</h5>
      </div>
      <div>
        <button type="button" className="btn btn-primary btn-icon">
          <i className="ri-facebook-fill fs-16" />
        </button>
        <button type="button" className="btn btn-danger btn-icon">
          <i className="ri-google-fill fs-16" />
        </button>
        <button type="button" className="btn btn-dark btn-icon">
          <i className="ri-github-fill fs-16" />
        </button>
      </div>
    </div>
  );
};

export default AuthSocialLogin;
