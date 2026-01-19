import React from "react";

const AuthWrapper = ({ children }) => {
  return (
    <div className="auth-page-wrapper auth-bg-cover py-5 d-flex justify-content-center align-items-center min-vh-100">
      <div className="bg-overlay" />
      {children}
    </div>
  );
};

export default AuthWrapper;
