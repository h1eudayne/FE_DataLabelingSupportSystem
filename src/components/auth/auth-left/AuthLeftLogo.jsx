import { Link } from "react-router-dom";

const AuthLeftLogo = () => {
  return (
    <div className="mb-4">
      <Link to="/" className="d-block">
        <img
          src="https://res.cloudinary.com/deu3ur8w9/image/upload/v1769842054/logo-1_jc0rul.png"
          alt="logo"
          height={60}
        />
      </Link>
    </div>
  );
};

export default AuthLeftLogo;
