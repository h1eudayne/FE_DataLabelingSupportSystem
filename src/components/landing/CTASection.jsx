import React from "react";
import { Button, Container } from "react-bootstrap";

const CTASection = () => (
  <Container className="py-5">
    <div className="bg-primary-custom rounded-4 p-5 text-white text-center shadow-lg position-relative overflow-hidden">
      <div className="position-relative z-1">
        <h2 className="fw-bold mb-3" style={{ color: "white" }}>
          Sẵn sàng để bắt đầu?
        </h2>
        <p className="mb-4 opacity-75" style={{ color: "white" }}>
          Trải nghiệm nền tảng quản lý gán nhãn chuyên nghiệp nhất ngay hôm nay.
        </p>
        <Button
          variant="light"
          className="fw-bold py-3 px-5 text-primary-custom w-100 w-md-auto"
          style={{ borderRadius: "12px" }}
        >
          Dùng thử miễn phí
        </Button>
      </div>
    </div>
  </Container>
);

export default CTASection;
