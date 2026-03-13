import React from "react";
import { Row, Col } from "react-bootstrap";
import KpiCard from "../../home/KpiCard";
import { useTranslation } from "react-i18next";

const StatsRow = ({ stats }) => {
  const { t } = useTranslation();
  return (
  <Row className="g-3 mb-4">
    <Col md={4}>
      <KpiCard
        label={t('annotatorDashboardComp.totalAssigned')}
        value={stats?.totalAssigned || 0}
        color="primary"
        iconName="Layout"
        badgeText={t('annotatorDashboardComp.assigned')}
      />
    </Col>
    <Col md={4}>
      <KpiCard
        label={t('annotatorDashboardComp.completed')}
        value={stats?.submitted || 0}
        color="success"
        iconName="CheckCircle"
        badgeText={t('annotatorDashboardComp.submitted')}
      />
    </Col>
    <Col md={4}>
      <KpiCard
        label={t('annotatorDashboardComp.inProgress')}
        value={stats?.inProgress || 0}
        color="warning"
        iconName="Clock"
        badgeText={t('annotatorDashboardComp.notFinished')}
      />
    </Col>
  </Row>);
};

export default StatsRow;
