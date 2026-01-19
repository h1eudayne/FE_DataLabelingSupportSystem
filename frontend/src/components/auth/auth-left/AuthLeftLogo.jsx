import { Link } from "react-router-dom";
import logoLight from "../../../assets/images/logo-light.png";

const AuthLeftLogo = () => {
  return (
    <div className="mb-4">
      <Link to="/" className="d-block">
        <img src={logoLight} alt="logo" height={18} />
      </Link>
    </div>
  );
};

export default AuthLeftLogo;
