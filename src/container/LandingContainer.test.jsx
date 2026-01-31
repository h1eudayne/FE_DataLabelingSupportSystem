import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import LandingContainer from "./LandingContainer";
import "@testing-library/jest-dom";

const mockedNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  };
});

describe("LandingContainer Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("nên render đầy đủ các section chính của trang Landing", () => {
    render(
      <MemoryRouter>
        <LandingContainer />
      </MemoryRouter>,
    );

    expect(screen.getByAltText("logo")).toBeInTheDocument();

    expect(screen.getByText(/Số hóa dữ liệu/i)).toBeInTheDocument();

    expect(screen.getByText(/Giải pháp cho mọi vai trò/i)).toBeInTheDocument();

    expect(screen.getByText(/© 2024 AI LABEL SYSTEM/i)).toBeInTheDocument();
  });

  it("nên tự động chuyển hướng sang /dashboard nếu đã có access_token", () => {
    localStorage.setItem("access_token", "fake-token-123");
    render(
      <MemoryRouter>
        <LandingContainer />
      </MemoryRouter>,
    );
    expect(mockedNavigate).toHaveBeenCalledWith("/dashboard", {
      replace: true,
    });
  });

  it("không nên chuyển hướng nếu chưa có access_token", () => {
    render(
      <MemoryRouter>
        <LandingContainer />
      </MemoryRouter>,
    );
    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it("nên chuyển hướng đến trang /login khi nhấn nút Đăng nhập trên Navbar", () => {
    render(
      <MemoryRouter>
        <LandingContainer />
      </MemoryRouter>,
    );

    const loginBtn = screen.getByRole("button", { name: /Đăng nhập/i });
    fireEvent.click(loginBtn);

    expect(mockedNavigate).toHaveBeenCalledWith("/login");
  });

  it("nên chuyển hướng đến trang /login khi nhấn nút Bắt đầu ngay", () => {
    render(
      <MemoryRouter>
        <LandingContainer />
      </MemoryRouter>,
    );

    const startBtns = screen.getAllByRole("button", { name: /Bắt đầu ngay/i });
    fireEvent.click(startBtns[0]);

    expect(mockedNavigate).toHaveBeenCalledWith("/login");
  });
});
