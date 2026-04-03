import { Container, Row, Col, Button } from "react-bootstrap";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";

const HeroSection = ({ onExplore }) => {
  const { t } = useTranslation();
  const customStyles = {
    section: {
      position: "relative",
      padding: "60px 0 100px",
      backgroundColor: "#ffffff",
    },
  };

  return (
    <section style={customStyles.section} className="hero-gradient">
      <Container>
        <Row className="align-items-center g-5 text-center text-lg-start">
          <Col lg={6}>
            <h1
              className="display-5 fw-extrabold mb-4"
              style={{ lineHeight: 1.1 }}
            >
              {t('landingHero.title1')} <br />
              <span className="text-primary-custom">{t('landingHero.title2')}</span>
            </h1>

            <p
              className="text-muted mb-5 fs-6 fs-lg-5 mx-auto mx-lg-0"
              style={{ maxWidth: "540px" }}
            >
              {t('landingHero.desc')}
            </p>

            <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3 mt-4">
              <Button
                className="btn-primary-custom border-0 py-3 px-4 fw-bold shadow-lg d-flex align-items-center justify-content-center"
                style={{ borderRadius: "16px" }}
                onClick={onExplore}
              >
                {t('landingHero.exploreDashboard')} <ArrowRight size={18} className="ms-2" />
              </Button>
              <Button
                variant="light"
                className="py-3 px-4 fw-bold"
                style={{ borderRadius: "16px", backgroundColor: "#f1f5f9" }}
                onClick={onExplore}
              >
                {t('landingHero.getStartedNow')}
              </Button>
            </div>
          </Col>

          <Col lg={6} className="mt-5 mt-lg-0">
            <div className="position-relative p-2 bg-white rounded-4 shadow-2xl border">
              <img
                src="https://res.cloudinary.com/deu3ur8w9/image/upload/v1769629522/image.png_ptrdoq.png"
                className="img-fluid rounded-4"
                alt="Preview"
              />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HeroSection;
