import React from "react";
import { Col, Card } from "react-bootstrap";

const FeatureCard = ({ icon, title, desc, iconBg, iconColor }) => (
  <Col xs={12} md={4}>
    <Card className="h-100 border-0 p-4 rounded-4 shadow-sm border border-light">
      <Card.Body>
        <div
          className="rounded-3 d-flex align-items-center justify-content-center mb-4"
          style={{
            width: "56px",
            height: "56px",
            backgroundColor: iconBg,
            color: iconColor,
          }}
        >
          {icon}
        </div>
        <h3 className="fw-bold mb-3 fs-4">{title}</h3>
        <p className="text-muted mb-0" style={{ fontSize: "14px" }}>
          {desc}
        </p>
      </Card.Body>
    </Card>
  </Col>
);

export default FeatureCard;
