import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AuthRightHeader from "./AuthRightHeader";

describe("AuthRightHeader", () => {
  it("nên hiển thị tiêu đề chính (Heading)", () => {
    render(<AuthRightHeader />);
    const heading =
      screen.getByRole("heading", { level: 5 }) || screen.getByRole("heading");
    expect(heading).toBeInTheDocument();
  });

  it("nên hiển thị sub-title phù hợp với nội dung", () => {
    render(<AuthRightHeader />);

    const subTitle =
      screen.queryByText(/get your free account now/i) ||
      screen.queryByText(/sign in to continue/i) ||
      screen.queryByText(/welcome back/i);

    expect(subTitle).not.toBeNull();
    expect(subTitle).toBeInTheDocument();
  });

  it("nên có class CSS đúng để hiển thị màu sắc thương hiệu", () => {
    render(<AuthRightHeader />);
    const title = screen.getByRole("heading");
    expect(title).toHaveClass("text-primary");
  });
});
