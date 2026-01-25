import AuthLeftLogo from "./AuthLeftLogo";
import AuthLeftQuotes from "./AuthLeftQuotes";

const AuthLeft = () => {
  return (
    <div className="col-lg-6">
      <div className="p-lg-5 p-4 auth-one-bg h-100">
        <div className="bg-overlay" />
        <div className="position-relative h-100 d-flex flex-column">
          <AuthLeftLogo />
          <AuthLeftQuotes />
        </div>
      </div>
    </div>
  );
};

export default AuthLeft;
