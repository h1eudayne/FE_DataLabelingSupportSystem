import { Card, Col } from "react-bootstrap";

const StatCard = ({ icon, title, value, colorClass }) => (
  <Col xs={12} sm={6} xl={4}>
    <Card className="admin-metric-card">
      <Card.Body>
        <div className={`admin-metric-card__icon ${colorClass}`}>{icon}</div>
        <div className="admin-metric-card__label">{title}</div>
        <h2 className="admin-metric-card__value">{value}</h2>
      </Card.Body>
    </Card>
  </Col>
);

export default StatCard;
