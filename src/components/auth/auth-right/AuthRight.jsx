import AuthRightHeader from "./AuthRightHeader";
import AuthLoginForm from "./AuthLoginForm";
import AuthRegisterLink from "./AuthRegisterLink";

const AuthRight = () => {
  return (
    <div className="col-lg-6">
      <div className="p-lg-5 p-4">
        <AuthRightHeader />
        <AuthLoginForm />
        <AuthRegisterLink />
      </div>
    </div>
  );
};

export default AuthRight;
