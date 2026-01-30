import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FeaturesSection from "./FeaturesSection";
import "@testing-library/jest-dom";

describe("FeaturesSection Component", () => {
  it("nên hiển thị tiêu đề chính của phần giới thiệu giải pháp", () => {
    render(<FeaturesSection />);
    expect(screen.getByText(/Giải pháp cho mọi vai trò/i)).toBeInTheDocument();
  });

  it("nên hiển thị đủ 3 vai trò chính: Manager, Reviewer và Annotator", () => {
    render(<FeaturesSection />);

    const managerCard = screen.getByText("Manager");
    const reviewerCard = screen.getByText("Reviewer");
    const annotatorCard = screen.getByText("Annotator");

    expect(managerCard).toBeInTheDocument();
    expect(reviewerCard).toBeInTheDocument();
    expect(annotatorCard).toBeInTheDocument();
  });

  it("nên hiển thị mô tả ngắn gọn cho từng vai trò", () => {
    render(<FeaturesSection />);

    expect(
      screen.getByText(/Quản lý nguồn lực và báo cáo hiệu suất/i),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Kiểm soát chất lượng dữ liệu với các công cụ Approve\/Reject/i,
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Giao diện làm việc tập trung, tối ưu năng suất/i),
    ).toBeInTheDocument();
  });
});
