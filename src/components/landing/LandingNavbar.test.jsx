import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import LandingNavbar from "./LandingNavbar";

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("LandingNavbar Component", () => {
  it("nên hiển thị logo", () => {
    renderWithRouter(<LandingNavbar onLogin={() => {}} />);

    const logo = screen.getByAltText(/logo/i);
    expect(logo).toBeInTheDocument();
  });

  it("nên hiển thị nút Đăng nhập", () => {
    renderWithRouter(<LandingNavbar onLogin={() => {}} />);

    const loginBtn = screen.getByRole("button", { name: /Đăng nhập/i });
    expect(loginBtn).toBeInTheDocument();
  });

  it("nên hiển thị nút Bắt đầu ngay", () => {
    renderWithRouter(<LandingNavbar onLogin={() => {}} />);

    const startBtn = screen.getByRole("button", { name: /Bắt đầu ngay/i });
    expect(startBtn).toBeInTheDocument();
  });

  it("nên gọi onLogin khi click Đăng nhập", () => {
    const onLoginMock = vi.fn();
    renderWithRouter(<LandingNavbar onLogin={onLoginMock} />);

    fireEvent.click(screen.getByRole("button", { name: /Đăng nhập/i }));

    expect(onLoginMock).toHaveBeenCalledTimes(1);
  });

  it("nên gọi onLogin khi click Bắt đầu ngay", () => {
    const onLoginMock = vi.fn();
    renderWithRouter(<LandingNavbar onLogin={onLoginMock} />);

    fireEvent.click(screen.getByRole("button", { name: /Bắt đầu ngay/i }));

    expect(onLoginMock).toHaveBeenCalledTimes(1);
  });
});
