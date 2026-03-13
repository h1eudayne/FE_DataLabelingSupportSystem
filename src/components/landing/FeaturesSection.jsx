import React from "react";
import { Container, Row } from "react-bootstrap";
import { Layers, ShieldCheck, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import FeatureCard from "./FeatureCard";

const FeaturesSection = () => {
  const { t } = useTranslation();
  return (
    <section className="py-5 bg-light bg-opacity-50 border-top border-bottom">
      <Container className="py-5">
        <div
          className="text-center mb-5 mx-auto px-2"
          style={{ maxWidth: "700px" }}
        >
          <h2
            className="fw-extrabold mb-3 display-6 px-3"
            style={{ color: "#0f172a" }}
          >
            {t('landingFeatures.title')}
          </h2>
          <p className="text-muted fs-6 fs-lg-5">
            {t('landingFeatures.desc')}
          </p>
        </div>

        <Row className="g-4">
          <FeatureCard
            icon={<Layers />}
            iconColor="#41518b"
            iconBg="rgba(65, 81, 139, 0.1)"
            title="Manager"
            desc={t('landingFeatures.managerDesc')}
          />
          <FeatureCard
            icon={<ShieldCheck />}
            iconColor="#10b981"
            iconBg="rgba(16, 185, 129, 0.1)"
            title="Reviewer"
            desc={t('landingFeatures.reviewerDesc')}
          />
          <FeatureCard
            icon={<Send />}
            iconColor="#f59e0b"
            iconBg="rgba(245, 158, 11, 0.1)"
            title="Annotator"
            desc={t('landingFeatures.annotatorDesc')}
          />
        </Row>
      </Container>
    </section>
  );
};

export default FeaturesSection;
