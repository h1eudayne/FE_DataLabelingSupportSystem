import React from "react";
import { Button, Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const CTASection = ({ onExplore }) => {
  const { t } = useTranslation();
  return (
    <Container className="py-5">
      <div className="bg-primary-custom rounded-4 p-5 text-white text-center shadow-lg position-relative overflow-hidden">
        <div className="position-relative z-1">
          <h2 className="fw-bold mb-3" style={{ color: "white" }}>
            {t('landingCTA.title')}
          </h2>
          <p className="mb-4 opacity-75" style={{ color: "white" }}>
            {t('landingCTA.desc')}
          </p>
          <Button
            variant="light"
            className="fw-bold py-3 px-5 text-primary-custom w-100 w-md-auto"
            style={{ borderRadius: "12px" }}
            onClick={onExplore}
          >
            {t('landingCTA.tryFree')}
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default CTASection;
