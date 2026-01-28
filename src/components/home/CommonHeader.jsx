import React from "react";
import { Row, Col, Badge } from "react-bootstrap";
import { User } from "lucide-react";

const CommonHeader = ({ title, subtitle, role, email }) => (
  <div className="mb-4 d-flex justify-content-between align-items-end">
    <div>
      <div className="text-muted small mb-1">
        Dashboard /{" "}
        <span className="text-primary fw-bold text-capitalize">{role}</span>
      </div>
      <h3 className="fw-bold mb-1">
        {title}{" "}
        {email && (
          <span className="text-muted fw-normal fs-5">
            | {email.split("@")[0]}
          </span>
        )}
      </h3>
      <p className="text-muted mb-0 small">{subtitle}</p>
    </div>
    <div className="d-none d-md-block">
      <Badge
        className="p-2 px-3 rounded-3 shadow-sm border-0"
        style={{ backgroundColor: "#405189" }}
      >
        <User size={14} className="me-2" /> Vai trò: {role}
      </Badge>
    </div>
  </div>
);

export default CommonHeader;
