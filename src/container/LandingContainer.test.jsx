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

const renderLanding = () =>
  render(
    <MemoryRouter>
      <LandingContainer />
    </MemoryRouter>,
  );

describe("LandingContainer Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("nên render đầy đủ các section chính của trang Landing", () => {
    renderLanding();

    const logos = screen.getAllByAltText(/logo/i);
    expect(logos.length).toBeGreaterThan(0);

    expect(screen.getByText("landingHero.title1")).toBeInTheDocument();
    expect(screen.getByText("landingHero.title2")).toBeInTheDocument();

    expect(screen.getByText("landingFeatures.title")).toBeInTheDocument();
  });

  it("nên tự động chuyển hướng sang /dashboard nếu đã có access_token", () => {
    localStorage.setItem("access_token", "fake-token");

    renderLanding();

    expect(mockedNavigate).toHaveBeenCalledWith("/dashboard", {
      replace: true,
    });
  });

  it("không nên chuyển hướng nếu chưa có access_token", () => {
    renderLanding();

    expect(mockedNavigate).not.toHaveBeenCalled();
  });

  it("nên chuyển hướng đến trang /login khi nhấn nút Đăng nhập trên Navbar", () => {
    renderLanding();

    fireEvent.click(screen.getByRole("button", { name: "landing.login" }));

    expect(mockedNavigate).toHaveBeenCalledWith("/login");
  });

  it("nên chuyển hướng đến trang /login khi nhấn nút Bắt đầu ngay", () => {
    renderLanding();

    const startBtns = screen.getAllByRole("button", {
      name: "landing.getStarted",
    });

    fireEvent.click(startBtns[0]);

    expect(mockedNavigate).toHaveBeenCalledWith("/login");
  });
});
