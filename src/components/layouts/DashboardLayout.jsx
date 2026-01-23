import React from "react";

const DashboardLayout = ({ title, children }) => {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="page-title-box d-flex align-items-center justify-content-between">
            <h4 className="mb-0">{title}</h4>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default DashboardLayout;
