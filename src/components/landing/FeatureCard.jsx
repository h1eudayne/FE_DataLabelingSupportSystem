import React from "react";
import { Col, Card } from "react-bootstrap";

const FeatureCard = ({ icon, title, desc, iconBg, iconColor }) => (
  <Col md={4}>
    <Card
      className="h-100 border-0 p-4 rounded-4 shadow-sm hover-shadow-transition"
      style={{ transition: "all 0.3s ease" }}
    >
      <Card.Body className="p-2">
        <div
          className="rounded-3 d-flex align-items-center justify-content-center mb-4"
          style={{
            width: "56px",
            height: "56px",
            backgroundColor: iconBg,
            color: iconColor,
            transition: "transform 0.3s ease",
          }}
        >
          {React.cloneElement(icon, { size: 28, strokeWidth: 2.5 })}
        </div>

        <h3 className="fw-bold mb-3 fs-4" style={{ color: "#0f172a" }}>
          {title}
        </h3>

        <p
          className="text-muted leading-relaxed mb-0"
          style={{ fontSize: "15px", fontWeight: "400" }}
        >
          {desc}
        </p>
      </Card.Body>
    </Card>
  </Col>
);

export default FeatureCard;
