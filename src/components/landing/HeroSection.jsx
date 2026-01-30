import { Container, Row, Col, Badge, Button } from "react-bootstrap";
import { Zap, ArrowRight } from "lucide-react";

const HeroSection = ({ onExplore }) => {
  const customStyles = {
    section: {
      position: "relative",
      padding: "60px 0 100px",
      backgroundColor: "#ffffff",
    },
    badge: {
      backgroundColor: "rgba(65, 81, 139, 0.1)",
      color: "#41518b",
      padding: "8px 16px",
      fontSize: "12px",
    },
  };

  return (
    <section style={customStyles.section} className="hero-gradient">
      <Container>
        <Row className="align-items-center g-5 text-center text-lg-start">
          <Col lg={6}>
            <Badge
              pill
              className="mb-4 text-uppercase fw-bold"
              style={customStyles.badge}
            >
              <Zap size={14} className="me-2" /> Platform v2.0
            </Badge>

            <h1
              className="display-5 fw-extrabold mb-4"
              style={{ lineHeight: 1.1 }}
            >
              Số hóa dữ liệu <br />
              <span className="text-primary-custom">Thông minh & Hiệu quả</span>
            </h1>

            <p
              className="text-muted mb-5 fs-6 fs-lg-5 mx-auto mx-lg-0"
              style={{ maxWidth: "540px" }}
            >
              Kết nối đội ngũ chuyên gia gán nhãn, kiểm duyệt và quản lý dự án
              trên một không gian làm việc tập trung.
            </p>

            <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3 mt-4">
              <Button
                className="btn-primary-custom border-0 py-3 px-4 fw-bold shadow-lg d-flex align-items-center justify-content-center"
                style={{ borderRadius: "16px" }}
                onClick={onExplore}
              >
                Khám phá Dashboard <ArrowRight size={18} className="ms-2" />
              </Button>
              <Button
                variant="light"
                className="py-3 px-4 fw-bold"
                style={{ borderRadius: "16px", backgroundColor: "#f1f5f9" }}
              >
                Bắt đầu ngay
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
