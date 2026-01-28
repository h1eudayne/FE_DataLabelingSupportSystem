import React from "react";
import { Card, Badge } from "react-bootstrap";
import * as Icons from "lucide-react";

const KpiCard = ({ iconName, label, value, color }) => {
  const Icon = Icons[iconName] || Icons.HelpCircle;

  return (
    <Card className="border-0 shadow-sm rounded-4 h-100 position-relative overflow-hidden">
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div
            className={`p-3 bg-${color} bg-opacity-10 text-${color} rounded-3`}
          >
            <Icon size={20} />
          </div>
          <Badge bg="light" className="text-muted fw-normal border">
            Tháng này
          </Badge>
        </div>
        <p className="text-muted small fw-bold text-uppercase mb-1">{label}</p>
        <h3 className="fw-black mb-0 text-dark">
          {value?.toLocaleString() || 0}
        </h3>
      </Card.Body>
      <Icon
        size={80}
        className={`position-absolute end-0 bottom-0 opacity-10 p-3 text-${color}`}
        style={{ transform: "translate(10%, 10%)" }}
      />
    </Card>
  );
};
export default KpiCard;
