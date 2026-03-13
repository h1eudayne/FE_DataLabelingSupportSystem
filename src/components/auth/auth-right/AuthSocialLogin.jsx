import { useTranslation } from "react-i18next";

const AuthSocialLogin = () => {
  const { t } = useTranslation();
  return (
    <div className="mt-4 text-center">
      <div className="position-relative mb-4">
        <hr className="text-muted opacity-25" />
        <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted small fw-bold uppercase">
          {t('authSocial.or')}
        </span>
      </div>
      <div className="d-flex justify-content-center gap-2">
        <button
          type="button"
          className="btn btn-outline-light border shadow-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
          style={{ width: 40, height: 40 }}
        >
          <i className="ri-facebook-fill text-primary" />
        </button>
        <button
          type="button"
          className="btn btn-outline-light border shadow-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
          style={{ width: 40, height: 40 }}
        >
          <i className="ri-google-fill text-danger" />
        </button>
        <button
          type="button"
          className="btn btn-outline-light border shadow-sm rounded-circle p-0 d-flex align-items-center justify-content-center"
          style={{ width: 40, height: 40 }}
        >
          <i className="ri-github-fill text-dark" />
        </button>
      </div>
    </div>
  );
};

export default AuthSocialLogin;
