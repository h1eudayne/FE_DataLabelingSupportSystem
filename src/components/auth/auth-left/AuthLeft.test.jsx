import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthLeft from "./AuthLeft";
import "@testing-library/jest-dom";

describe("AuthLeft", () => {
  const renderWithRouter = () => {
    return render(
      <MemoryRouter>
        <AuthLeft />
      </MemoryRouter>,
    );
  };

  it("render logo và kiểm tra liên kết về trang chủ", () => {
    renderWithRouter();
    const logo = screen.getByAltText(/logo/i);
    expect(logo).toBeInTheDocument();

    const link = logo.closest("a");
    expect(link).toHaveAttribute("href", "/");
  });

  it("hiển thị đúng tiêu đề tiếng Việt và mô tả", () => {
    renderWithRouter();
    expect(screen.getByText(/Label data with/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Nền tảng gán nhãn dữ liệu thông minh/i),
    ).toBeInTheDocument();
  });

  it("render sub-component Quotes", () => {
    renderWithRouter();
    expect(
      screen.getByText(/Great things never come from comfort zones/i),
    ).toBeInTheDocument();
  });
});
