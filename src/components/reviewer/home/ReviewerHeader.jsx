import React from "react";
import { Row, Col, Button } from "react-bootstrap";
import { LayoutGrid } from "lucide-react";
import { useTranslation } from "react-i18next";

const ReviewerHeader = () => {
  const { t } = useTranslation();
  return (
    <Row className="mb-4 align-items-end">
      <Col md={8}>
        <div className="text-muted small mb-1">
          Dashboard / <span className="text-primary fw-bold">Reviewer</span>
        </div>
        <h3 className="fw-bold">{t('reviewerHeaderComp.title')}</h3>
        <p className="text-muted mb-0">
          {t('reviewerHeaderComp.subtitle')}
        </p>
      </Col>
      <Col md={4} className="text-md-end mt-3">
        <Button
          variant="primary"
          className="shadow-sm d-inline-flex align-items-center gap-2 px-4 rounded-3"
        >
          <LayoutGrid size={18} /> {t('reviewerHeaderComp.viewReport')}
        </Button>
      </Col>
    </Row>
  );
};

export default ReviewerHeader;
