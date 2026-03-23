import { Card, Col } from "reactstrap";

const StatCard = ({ icon, title, value, colorClass }) => (
  <Col md={4}>
    <Card
      className="border-0 shadow-sm text-center p-3"
      style={{ borderRadius: "15px" }}
    >
      <div className={`${colorClass} mb-2`}>{icon}</div>
      <div
        className="text-muted small fw-bold text-uppercase"
        style={{ fontSize: "10px" }}
      >
        {title}
      </div>
      <h2 className="fw-bold m-0">{value}</h2>
    </Card>
  </Col>
);

export default StatCard;
