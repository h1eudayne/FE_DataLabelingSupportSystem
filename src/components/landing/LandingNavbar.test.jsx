import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LandingNavbar from "./LandingNavbar";

describe("LandingNavbar Component", () => {
  it("nên hiển thị tên thương hiệu (Logo)", () => {
    render(
      <MemoryRouter>
        <LandingNavbar onLogin={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getByAltText("logo")).toBeInTheDocument();
  });

  it("nên kích hoạt hàm onLogin khi nhấn nút Đăng nhập", () => {
    const onLoginMock = vi.fn();
    render(
      <MemoryRouter>
        <LandingNavbar onLogin={onLoginMock} />
      </MemoryRouter>,
    );

    const loginBtn = screen.getByRole("button", { name: /Đăng nhập/i });
    fireEvent.click(loginBtn);

    expect(onLoginMock).toHaveBeenCalled();
  });
});
