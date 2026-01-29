import React from "react";
import { Container, Row } from "react-bootstrap";
import { Layers, ShieldCheck, Send } from "lucide-react";
import FeatureCard from "./FeatureCard";

const FeaturesSection = () => {
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
            Giải pháp cho mọi vai trò
          </h2>
          <p className="text-muted fs-6 fs-lg-5">
            Hệ thống phân quyền thông minh giúp tối ưu quy trình làm việc từ
            khâu thu thập đến khi hoàn thiện dữ liệu.
          </p>
        </div>

        <Row className="g-4">
          <FeatureCard
            icon={<Layers />}
            iconColor="#41518b"
            iconBg="rgba(65, 81, 139, 0.1)"
            title="Manager"
            desc="Quản trị dự án, theo dõi KPI và tiến độ gán nhãn tổng quát. Quản lý nguồn lực và báo cáo hiệu suất tức thời."
          />
          <FeatureCard
            icon={<ShieldCheck />}
            iconColor="#10b981"
            iconBg="rgba(16, 185, 129, 0.1)"
            title="Reviewer"
            desc="Kiểm soát chất lượng dữ liệu với các công cụ Approve/Reject mạnh mẽ. Đảm bảo độ chính xác cao nhất cho dữ liệu số."
          />
          <FeatureCard
            icon={<Send />}
            iconColor="#f59e0b"
            iconBg="rgba(245, 158, 11, 0.1)"
            title="Annotator"
            desc="Giao diện làm việc tập trung, tối ưu năng suất cho nhân viên gán nhãn với các công cụ hỗ trợ thông minh."
          />
        </Row>
      </Container>
    </section>
  );
};

export default FeaturesSection;
