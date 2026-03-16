import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FeaturesSection from "./FeaturesSection";
import "@testing-library/jest-dom";

describe("FeaturesSection Component", () => {
  it("nên hiển thị tiêu đề chính của phần giới thiệu giải pháp", () => {
    render(<FeaturesSection />);
    expect(screen.getByText("landingFeatures.title")).toBeInTheDocument();
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
      screen.getByText("landingFeatures.managerDesc"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("landingFeatures.reviewerDesc"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("landingFeatures.annotatorDesc"),
    ).toBeInTheDocument();
  });
});
