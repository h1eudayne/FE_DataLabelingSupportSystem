import React from "react";
import { Row, Col } from "react-bootstrap";
import KpiCard from "../../home/KpiCard";

const StatsRow = ({ stats }) => (
  <Row className="g-3 mb-4">
    <Col md={4}>
      <KpiCard
        label="Tổng ảnh được giao"
        value={stats?.totalAssigned || 0}
        color="primary"
        iconName="Layout"
        badgeText="Được giao"
      />
    </Col>
    <Col md={4}>
      <KpiCard
        label="Đã hoàn thành"
        value={stats?.submitted || 0}
        color="success"
        iconName="CheckCircle"
        badgeText="Đã nộp"
      />
    </Col>
    <Col md={4}>
      <KpiCard
        label="Đang thực hiện"
        value={stats?.inProgress || 0}
        color="warning"
        iconName="Clock"
        badgeText="Chưa xong"
      />
    </Col>
  </Row>
);

export default StatsRow;
