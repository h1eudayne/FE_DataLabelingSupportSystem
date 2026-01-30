import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthLeftLogo from "./AuthLeftLogo";
import "@testing-library/jest-dom";

describe("AuthLeftLogo", () => {
  it("render logo image với alt text chính xác", () => {
    render(
      <MemoryRouter>
        <AuthLeftLogo />
      </MemoryRouter>,
    );

    const logoImg = screen.getByAltText("logo");
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute("src");
  });

  it("logo phải nằm trong thẻ Link trỏ về trang chủ", () => {
    render(
      <MemoryRouter>
        <AuthLeftLogo />
      </MemoryRouter>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/");
    expect(link).toContainElement(screen.getByAltText("logo"));
  });
});
