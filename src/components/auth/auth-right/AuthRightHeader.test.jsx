import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AuthRightHeader from "./AuthRightHeader";
import "@testing-library/jest-dom";

describe("AuthRightHeader", () => {
  it("nên hiển thị tiêu đề chính (Heading)", () => {
    render(<AuthRightHeader />);
    // Component dùng <h2>Chào mừng trở lại!</h2>
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveTextContent(/Chào mừng trở lại/i);
  });

  it("nên hiển thị sub-title phù hợp với nội dung tiếng Việt", () => {
    render(<AuthRightHeader />);
    const subTitle = screen.getByText(/Đăng nhập để tiếp tục với AILABEL/i);
    expect(subTitle).toBeInTheDocument();
  });

  it("nên có class CSS đúng (text-dark)", () => {
    render(<AuthRightHeader />);
    const title = screen.getByRole("heading");
    expect(title).toHaveClass("text-dark");
  });
});
