import { Link } from "react-router-dom";

const AuthRegisterLink = () => {
  return (
    <div className="mt-5 text-center">
      <p className="mb-0">
        Don't have an account ?
        <Link
          to="/register"
          className="fw-semibold text-primary text-decoration-underline"
        >
          Signup
        </Link>
      </p>
    </div>
  );
};

export default AuthRegisterLink;
