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

  it("nên hiển thị nút landing.login", () => {
    renderWithRouter(<LandingNavbar onLogin={() => {}} />);

    const loginBtn = screen.getByRole("button", { name: /landing.login/i });
    expect(loginBtn).toBeInTheDocument();
  });

  it("nên hiển thị nút landing.getStarted", () => {
    renderWithRouter(<LandingNavbar onLogin={() => {}} />);

    const startBtn = screen.getByRole("button", { name: /landing.getStarted/i });
    expect(startBtn).toBeInTheDocument();
  });

  it("nên gọi onLogin khi click landing.login", () => {
    const onLoginMock = vi.fn();
    renderWithRouter(<LandingNavbar onLogin={onLoginMock} />);

    fireEvent.click(screen.getByRole("button", { name: /landing.login/i }));

    expect(onLoginMock).toHaveBeenCalledTimes(1);
  });

  it("nên gọi onLogin khi click landing.getStarted", () => {
    const onLoginMock = vi.fn();
    renderWithRouter(<LandingNavbar onLogin={onLoginMock} />);

    fireEvent.click(screen.getByRole("button", { name: /landing.getStarted/i }));

    expect(onLoginMock).toHaveBeenCalledTimes(1);
  });
});
