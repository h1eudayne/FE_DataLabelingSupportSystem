import React from "react";

const DashboardLayout = ({ title, subtitle, children, style }) => {
  return (
    <div className="container-fluid" style={style}>
      <div className="row">
        <div className="col-12">
          <div className="stitch-page-title-box">
            <span className="stitch-page-label">{title}</span>
            {subtitle && <h4 className="stitch-page-heading">{subtitle}</h4>}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default DashboardLayout;
