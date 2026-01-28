import React from "react";
import { Container, Row, Col, Badge, Button } from "react-bootstrap";
import { Zap, ArrowRight } from "lucide-react";

const HeroSection = ({ onExplore }) => {
  const customStyles = {
    section: {
      position: "relative",
      overflow: "hidden",
      padding: "100px 0",
      background:
        "radial-gradient(circle at 0% 0%, rgba(65, 81, 139, 0.05) 0%, transparent 50%), radial-gradient(circle at 100% 100%, rgba(65, 81, 139, 0.05) 0%, transparent 50%)",
      backgroundColor: "#ffffff",
    },
    badge: {
      backgroundColor: "rgba(65, 81, 139, 0.1)",
      color: "#41518b",
      border: "1px solid rgba(65, 81, 139, 0.2)",
      letterSpacing: "0.05em",
    },
    btnPrimary: {
      backgroundColor: "#41518b",
      borderColor: "#41518b",
      padding: "1rem 2.5rem",
      borderRadius: "0.75rem",
      boxShadow: "0 10px 25px -5px rgba(65, 81, 139, 0.4)",
      transition: "all 0.3s ease",
    },
    imageContainer: {
      position: "relative",
      padding: "10px",
      backgroundColor: "#fff",
      borderRadius: "1.25rem",
      border: "1px solid #e2e8f0",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)",
    },
  };

  return (
    <section style={customStyles.section}>
      <div
        style={{
          position: "absolute",
          top: "-10%",
          left: "-5%",
          width: "400px",
          height: "400px",
          background: "rgba(65, 81, 139, 0.03)",
          filter: "blur(100px)",
          borderRadius: "50%",
        }}
      />

      <Container>
        <Row className="align-items-center g-5">
          <Col lg={6} className="position-relative">
            <Badge
              pill
              className="mb-4 px-3 py-2 d-inline-flex align-items-center"
              style={customStyles.badge}
            >
              <Zap size={14} className="me-2" />
              <span
                className="text-uppercase fw-bold"
                style={{ fontSize: "11px" }}
              >
                Nền tảng quản lý số hóa dữ liệu
              </span>
            </Badge>

            <h1
              className="display-4 fw-extrabold mb-4"
              style={{ lineHeight: 1.15, fontWeight: "800" }}
            >
              Số hóa dữ liệu <br />
              <span className="text-primary-custom">
                Thông minh & <br />
                Hiệu quả
              </span>
            </h1>

            <p
              className="text-muted mb-5 fs-5 fw-medium"
              style={{ maxWidth: "540px" }}
            >
              Kết nối đội ngũ chuyên gia gán nhãn, kiểm duyệt và quản lý dự án
              trên một không gian làm việc tập trung. Tối ưu hóa quy trình
              nghiệp vụ chuyên sâu.
            </p>

            <div className="d-flex flex-wrap gap-3">
              <Button
                style={customStyles.btnPrimary}
                className="d-flex align-items-center fw-bold text-white border-0"
                onClick={onExplore}
              >
                Khám phá Dashboard
                <ArrowRight size={20} className="ms-2" />
              </Button>
            </div>
          </Col>

          <Col lg={6}>
            <div style={customStyles.imageContainer}>
              <div
                style={{
                  position: "absolute",
                  inset: "-20px",
                  background:
                    "linear-gradient(45deg, rgba(65, 81, 139, 0.1), transparent)",
                  filter: "blur(30px)",
                  zIndex: -1,
                }}
              />
              <img
                src="https://res.cloudinary.com/deu3ur8w9/image/upload/v1769629522/image.png_ptrdoq.png"
                alt="AI Dashboard Preview"
                className="img-fluid rounded-4 shadow-sm"
              />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default HeroSection;
