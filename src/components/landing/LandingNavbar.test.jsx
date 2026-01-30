import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LandingNavbar from "./LandingNavbar";

describe("LandingNavbar Component", () => {
  it("nên hiển thị tên thương hiệu AILABEL", () => {
    render(<LandingNavbar onLogin={() => {}} />);
    expect(screen.getByText("AI")).toBeInTheDocument();
    expect(screen.getByText("LABEL")).toBeInTheDocument();
  });

  it("nên kích hoạt hàm onLogin khi nhấn nút Đăng nhập", () => {
    const onLoginMock = vi.fn();
    render(<LandingNavbar onLogin={onLoginMock} />);

    const loginBtn = screen.getByRole("button", { name: /Đăng nhập/i });
    fireEvent.click(loginBtn);

    expect(onLoginMock).toHaveBeenCalled();
  });
});
