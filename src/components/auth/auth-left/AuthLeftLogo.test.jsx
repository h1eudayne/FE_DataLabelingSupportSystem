import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthLeftLogo from "./AuthLeftLogo";

describe("AuthLeftLogo", () => {
  it("render logo image", () => {
    render(
      <MemoryRouter>
        <AuthLeftLogo />
      </MemoryRouter>,
    );

    const logoImg = screen.getByAltText(/logo/i);
    expect(logoImg).toBeInTheDocument();
  });

  it("logo links to home page", () => {
    render(
      <MemoryRouter>
        <AuthLeftLogo />
      </MemoryRouter>,
    );

    const logoImg = screen.getByAltText(/logo/i);
    const link = logoImg.closest("a");

    expect(link).toHaveAttribute("href", "/");
  });
});
